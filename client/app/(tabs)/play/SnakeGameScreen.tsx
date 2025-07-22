import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Gaps, FontSizes, FontWeights } from "@/styles/theme";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import IconPlay from "@/assets/icons/IconPlay";
import IconPause from "@/assets/icons/IconPause";
import IconVolume from "@/assets/icons/IconVolume";
import IconVolumeOff from "@/assets/icons/IconVolumeOff";
import Svg, { Rect, Circle } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const GAME_WIDTH = Math.min(screenWidth - 32, 350);
const GAME_HEIGHT = Math.min(screenHeight * 0.6, 400);
const GRID_SIZE = 20;
const GRID_COLS = Math.floor(GAME_WIDTH / GRID_SIZE);
const GRID_ROWS = Math.floor(GAME_HEIGHT / GRID_SIZE);

interface GameSettings {
  difficulty: "easy" | "medium" | "hard";
  maxScore: number;
  gameMode: "standard" | "survival";
}

interface SnakeSegment {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
}

const SnakeGameScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Audio refs
  const moveSoundRef = useRef<Audio.Sound | null>(null);
  const eatSoundRef = useRef<Audio.Sound | null>(null);
  const winSoundRef = useRef<Audio.Sound | null>(null);

  // Parse settings from params
  const gameSettings: GameSettings = params.settings
    ? JSON.parse(params.settings as string)
    : {
        difficulty: "medium",
        maxScore: 50,
        gameMode: "standard",
      };
  const soundOn = params.soundOn === "true";

  const [gameState, setGameState] = useState({
    snake: [
      { x: Math.floor(GRID_COLS / 2), y: Math.floor(GRID_ROWS / 2) },
    ] as SnakeSegment[],
    food: { x: 5, y: 5 } as Food,
    direction: { x: 1, y: 0 },
    score: 0,
    highscore: 0,
    gameOver: false,
    paused: false,
    gameStarted: false,
  });

  const [survivalState, setSurvivalState] = useState({
    speedMultiplier: 1.0,
    gameTime: 0,
  });

  const [soundEnabled, setSoundEnabled] = useState(soundOn);

  // Game speed based on difficulty
  const getGameSpeed = () => {
    const baseSpeed =
      gameSettings.difficulty === "easy"
        ? 400
        : gameSettings.difficulty === "medium"
        ? 300
        : 200;
    return baseSpeed / survivalState.speedMultiplier;
  };

  useEffect(() => {
    loadSounds();
    loadHighscore();
    init();
    return () => {
      // Cleanup sounds
      if (moveSoundRef.current) moveSoundRef.current.unloadAsync();
      if (eatSoundRef.current) eatSoundRef.current.unloadAsync();
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // Sound functions
  const loadSounds = async () => {
    try {
      // Initialize audio mode for mobile devices
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound: moveSound } = await Audio.Sound.createAsync(
        require("@/assets/Sounds/moove.mp3")
      );
      moveSoundRef.current = moveSound;

      const { sound: eatSound } = await Audio.Sound.createAsync(
        require("@/assets/Sounds/eating-sound-effect.mp3")
      );
      eatSoundRef.current = eatSound;

      const { sound: winSound } = await Audio.Sound.createAsync(
        require("@/assets/Sounds/you-won.mp3")
      );
      winSoundRef.current = winSound;
    } catch {}
  };

  const playSound = async (soundType: "move" | "eat" | "win") => {
    if (!soundEnabled) return;

    try {
      let soundRef: Audio.Sound | null = null;

      switch (soundType) {
        case "move":
          soundRef = moveSoundRef.current;
          break;
        case "eat":
          soundRef = eatSoundRef.current;
          break;
        case "win":
          soundRef = winSoundRef.current;
          break;
      }

      if (soundRef) {
        await soundRef.setPositionAsync(0);
        if (soundType === "move") {
          await soundRef.setVolumeAsync(0.25);
        } else {
          await soundRef.setVolumeAsync(1.0);
        }
        await soundRef.playAsync();
      }
    } catch {}
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const loadHighscore = async () => {
    try {
      const highscoreKey =
        gameSettings.gameMode === "standard"
          ? "snake_highscore"
          : "snake_survival_highscore";
      const highscore = await AsyncStorage.getItem(highscoreKey);
      if (highscore) {
        setGameState((prev) => ({ ...prev, highscore: parseInt(highscore) }));
      }
    } catch {}
  };

  const saveHighscore = async () => {
    try {
      const highscoreKey =
        gameSettings.gameMode === "standard"
          ? "snake_highscore"
          : "snake_survival_highscore";
      if (gameState.score > gameState.highscore) {
        await AsyncStorage.setItem(highscoreKey, gameState.score.toString());
        setGameState((prev) => ({ ...prev, highscore: prev.score }));
      }
    } catch {}
  };

  const init = () => {
    setGameState((prev) => ({
      ...prev,
      snake: [{ x: Math.floor(GRID_COLS / 2), y: Math.floor(GRID_ROWS / 2) }],
      food: generateFood(),
      direction: { x: 1, y: 0 },
      score: 0,
      gameOver: false,
      paused: false,
      gameStarted: false,
    }));

    setSurvivalState({
      speedMultiplier: 1.0,
      gameTime: 0,
    });

    loadHighscore();
  };

  const generateFood = (): Food => {
    let newFood: Food;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_COLS),
        y: Math.floor(Math.random() * GRID_ROWS),
      };
    } while (
      gameState.snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );

    return newFood;
  };

  const startGame = () => {
    setGameState((prev) => ({ ...prev, gameStarted: true }));
  };

  const togglePause = () => {
    setGameState((prev) => ({ ...prev, paused: !prev.paused }));
  };

  const handleBackPress = async () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    router.push("/(tabs)/play/SnakeStartScreen");
  };

  const restartGame = () => {
    init();
  };

  const changeDirection = (newDirection: { x: number; y: number }) => {
    setGameState((prev) => {
      if (
        prev.direction.x === -newDirection.x ||
        prev.direction.y === -newDirection.y
      ) {
        return prev;
      }

      return {
        ...prev,
        direction: newDirection,
      };
    });
  };

  const gameLoop = () => {
    if (gameState.paused || gameState.gameOver || !gameState.gameStarted)
      return;

    setGameState((prev) => {
      if (prev.direction.x === 0 && prev.direction.y === 0) return prev;

      const newHead = {
        x: prev.snake[0].x + prev.direction.x,
        y: prev.snake[0].y + prev.direction.y,
      };

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_COLS ||
        newHead.y < 0 ||
        newHead.y >= GRID_ROWS
      ) {
        gameOver();
        return prev;
      }

      // Check self collision
      if (
        prev.snake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        gameOver();
        return prev;
      }

      const newSnake = [newHead, ...prev.snake];

      // Check food collision
      if (newHead.x === prev.food.x && newHead.y === prev.food.y) {
        const newScore = prev.score + 1;

        // Play eat sound
        playSound("eat");

        // Check win condition for standard mode
        if (
          gameSettings.gameMode === "standard" &&
          gameSettings.maxScore > 0 &&
          newScore >= gameSettings.maxScore
        ) {
          playSound("win");
          saveHighscore();
          return { ...prev, score: newScore, gameOver: true };
        }

        return {
          ...prev,
          snake: newSnake,
          food: generateFood(),
          score: newScore,
        };
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
        // Play move sound
        playSound("move");
        return {
          ...prev,
          snake: newSnake,
        };
      }
    });
  };

  const gameOver = () => {
    saveHighscore();
    setGameState((prev) => ({ ...prev, gameOver: true }));
  };

  useEffect(() => {
    if (!gameState.gameOver && !gameState.paused && gameState.gameStarted) {
      animationRef.current = setInterval(gameLoop, getGameSpeed());
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [
    gameState.paused,
    gameState.gameOver,
    gameState.gameStarted,
    gameState.direction,
    survivalState.speedMultiplier,
  ]);

  // Survival mode speed increase
  useEffect(() => {
    if (
      gameSettings.gameMode === "survival" &&
      gameState.gameStarted &&
      !gameState.paused &&
      !gameState.gameOver
    ) {
      const interval = setInterval(() => {
        setSurvivalState((prev) => {
          const newTime = prev.gameTime + 100;
          const newSpeedMultiplier = 1.0 + Math.floor(newTime / 20000) * 0.05; // Increase speed every 20 seconds by 0.05
          return {
            ...prev,
            gameTime: newTime,
            speedMultiplier: newSpeedMultiplier,
          };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [
    gameSettings.gameMode,
    gameState.gameStarted,
    gameState.paused,
    gameState.gameOver,
  ]);

  const renderGame = () => {
    return (
      <View style={styles.gameContainer}>
        <Svg width={GAME_WIDTH} height={GAME_HEIGHT} style={styles.gameCanvas}>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            fill={Colors.black}
          />

          {/* Border */}
          <Rect
            x={0}
            y={0}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            fill="none"
            stroke={Colors.primaryLimo}
            strokeWidth={3}
          />

          {/* Snake */}
          {gameState.snake.map((segment, index) => (
            <Rect
              key={index}
              x={segment.x * GRID_SIZE}
              y={segment.y * GRID_SIZE}
              width={GRID_SIZE - 1}
              height={GRID_SIZE - 1}
              fill={Colors.primaryLimo}
            />
          ))}

          {/* Food */}
          <Circle
            cx={gameState.food.x * GRID_SIZE + GRID_SIZE / 2}
            cy={gameState.food.y * GRID_SIZE + GRID_SIZE / 2}
            r={GRID_SIZE / 2 - 1}
            fill="#ff2600"
          />
        </Svg>

        {/* Start Button */}
        {!gameState.gameStarted && (
          <View style={styles.startButtonOverlay}>
            <TouchableOpacity
              style={styles.gameStartButton}
              onPress={startGame}
            >
              <Text style={styles.gameStartButtonText}>START</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (gameState.gameOver) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <IconArrowBack color={Colors.primaryLimo} />
        </TouchableOpacity>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverTitle}>
              {gameState.score >= gameSettings.maxScore &&
              gameSettings.maxScore > 0
                ? "You Won!"
                : "Game Over!"}
            </Text>
            <Text style={styles.scoreText}>Score: {gameState.score}</Text>
            {gameState.score > gameState.highscore && (
              <Text style={styles.highscoreText}>New Highscore!</Text>
            )}
            <TouchableOpacity
              style={styles.restartButton}
              onPress={restartGame}
            >
              <Text style={styles.restartButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <IconArrowBack color={Colors.primaryLimo} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
      >
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <View style={styles.spacer} />
            <Text style={styles.scoreText}>Score: {gameState.score}</Text>
            <Text style={styles.highscoreText}>
              Length: {gameState.snake.length}
            </Text>
          </View>

          {/* Survival Mode Display */}
          {gameSettings.gameMode === "survival" && (
            <View style={styles.survivalContainer}>
              <Text style={styles.timeText}>
                Time:{" "}
                {Math.floor(survivalState.gameTime / 1000)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor((survivalState.gameTime % 1000) / 10)
                  .toString()
                  .padStart(2, "0")}
              </Text>
              <Text style={styles.speedText}>
                Speed: {survivalState.speedMultiplier.toFixed(1)}x
              </Text>
            </View>
          )}
        </View>

        <View style={styles.gameContainer}>{renderGame()}</View>

        {/* Pause button positioned under the game field, right-aligned */}
        <View style={styles.pauseContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleSound}>
            {soundEnabled ? (
              <IconVolume color={Colors.black} size={24} />
            ) : (
              <IconVolumeOff color={Colors.black} size={24} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={togglePause}>
            {gameState.paused ? (
              <IconPlay color={Colors.black} size={24} />
            ) : (
              <IconPause color={Colors.black} size={24} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <View style={styles.directionControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection({ x: -1, y: 0 })}
            >
              <Text style={styles.controlButtonText}>◀</Text>
            </TouchableOpacity>

            <View style={styles.centerButtons}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => changeDirection({ x: 0, y: -1 })}
              >
                <Text style={styles.controlButtonText}>▲</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => changeDirection({ x: 0, y: 1 })}
              >
                <Text style={styles.controlButtonText}>▼</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => changeDirection({ x: 1, y: 0 })}
            >
              <Text style={styles.controlButtonText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: "center",
    paddingTop: Gaps.g80,
  },
  backButton: {
    position: "absolute",
    top: 72,
    left: 16,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: Gaps.g8,
    marginTop: 40,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: GAME_WIDTH,
    marginBottom: Gaps.g8,
  },
  scoreText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
  },
  highscoreText: {
    fontSize: FontSizes.TextSmallFs,
    fontWeight: FontWeights.TextMediumFw as any,
    color: Colors.primaryLimo,
  },
  survivalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Gaps.g16,
  },
  timeText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
  },
  speedText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
  },
  gameContainer: {
    marginBottom: Gaps.g4,
    position: "relative",
  },
  gameCanvas: {},
  controls: {
    marginTop: -Gaps.g16,
    marginBottom: Gaps.g4,
  },
  controlButton: {
    backgroundColor: Colors.primaryLimo,
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
  },
  controlButtonText: {
    fontSize: 32,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.black,
  },
  centerButtons: {
    flexDirection: "column",
    gap: Gaps.g16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: Colors.primaryLimo,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
  },
  directionControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Gaps.g16,
    marginBottom: Gaps.g4,
  },
  directionButton: {
    backgroundColor: Colors.primaryLimo,
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
  },
  directionButtonText: {
    fontSize: 32,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.black,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Gaps.g32,
  },
  gameOverTitle: {
    fontSize: FontSizes.H1Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.primaryLimo,
    marginBottom: Gaps.g16,
    textAlign: "center",
  },
  restartButton: {
    backgroundColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g24,
    paddingVertical: Gaps.g16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
    marginTop: Gaps.g24,
  },
  restartButtonText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.black,
  },
  startButtonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.black + "80",
  },
  gameStartButton: {
    backgroundColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g24,
    paddingVertical: Gaps.g16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primaryLimo,
  },
  gameStartButtonText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.black,
  },
  pauseContainer: {
    width: GAME_WIDTH,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
    marginTop: Gaps.g8,
  },
  spacer: {
    width: GAME_WIDTH / 2 - 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: Gaps.g80,
  },
});

export default SnakeGameScreen;
