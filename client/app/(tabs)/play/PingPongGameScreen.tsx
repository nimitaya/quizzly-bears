import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Gaps, FontSizes, FontWeights } from "@/styles/theme";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import IconVolume from "@/assets/icons/IconVolume";
import IconVolumeOff from "@/assets/icons/IconVolumeOff";
import IconPlay from "@/assets/icons/IconPlay";
import IconPause from "@/assets/icons/IconPause";
import Svg, { Rect, Circle } from "react-native-svg";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const GAME_WIDTH = Math.min(screenWidth - 32, 350);
const GAME_HEIGHT = 400;
const PIXEL = 2;

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 8;
let BALL_SPEED = 3;
let PADDLE_SPEED = 4;

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
}

interface GameSettings {
  side: "left" | "right";
  difficulty: "easy" | "medium" | "hard";
  maxPoints: number;
  gameMode: "standard" | "survival";
}

const PingPongGameScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Parse settings from params
  const gameSettings: GameSettings = params.settings
    ? JSON.parse(params.settings as string)
    : {
        side: "left",
        difficulty: "medium",
        maxPoints: 10,
        gameMode: "standard",
      };
  const soundOn = params.soundOn === "true";

  const [gameState, setGameState] = useState({
    playerPaddle: {
      x: 20,
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    aiPaddle: {
      x: GAME_WIDTH - 30,
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    ball: {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      dx: BALL_SPEED,
      dy: BALL_SPEED,
      size: BALL_SIZE,
    },
    playerScore: 0,
    aiScore: 0,
    gameOver: false,
    paused: false,
    highscore: 0,
    keys: {} as { [key: string]: boolean },
    gameStarted: false,
    playerPaddleSpeed: 0,
    aiPaddleSpeed: 0,
    lastPlayerPaddleY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    lastAiPaddleY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  });

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [sounds, setSounds] = useState<{ [key: string]: Audio.Sound | null }>(
    {}
  );
  const [soundsLoaded, setSoundsLoaded] = useState(false);
  const [highscore, setHighscore] = useState(0);

  // Survival mode specific
  const [survivalState, setSurvivalState] = useState({
    lives: 3,
    speedMultiplier: 1.0,
    gameTime: 0,
  });

  useEffect(() => {
    loadSounds();
    loadHighscore();
    init();
    return () => {
      // Cleanup - alle Sounds freigeben
      Object.values(sounds).forEach((sound) => {
        if (sound) {
          sound.stopAsync().catch(() => {});
          sound.unloadAsync().catch(() => {});
        }
      });
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const loadHighscore = async () => {
    try {
      const highscoreKey =
        gameSettings.gameMode === "standard"
          ? "pingpong_highscore"
          : "pingpong_survival_highscore";
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
          ? "pingpong_highscore"
          : "pingpong_survival_highscore";
      if (gameState.playerScore > gameState.highscore) {
        await AsyncStorage.setItem(
          highscoreKey,
          gameState.playerScore.toString()
        );
        setGameState((prev) => ({ ...prev, highscore: prev.playerScore }));
      }
    } catch {}
  };

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

      const { sound: paddleSound } = await Audio.Sound.createAsync(
        require("@/assets/Sounds/ping.mp3")
      );
      const { sound: wallSound } = await Audio.Sound.createAsync(
        require("@/assets/Sounds/ping.mp3")
      );
      const { sound: scoreSound } = await Audio.Sound.createAsync(
        require("@/assets/Sounds/child-says-yes.mp3")
      );
      const { sound: failSound } = await Audio.Sound.createAsync(
        require("@/assets/Sounds/fail.mp3")
      );

      setSounds({
        paddle: paddleSound,
        wall: wallSound,
        score: scoreSound,
        fail: failSound,
      });

      // Now enable sound after loading is complete
      setSoundsLoaded(true);
      setSoundEnabled(soundOn);
    } catch {
      setSoundsLoaded(true);
      setSoundEnabled(false);
    }
  };

  const playSound = async (type: string) => {
    if (!soundEnabled || !sounds[type] || !soundsLoaded) return;

    try {
      const sound = sounds[type];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch {}
  };

  const init = () => {
    // Apply difficulty settings
    let newBallSpeed = 3;
    let newPaddleSpeed = 4;

    switch (gameSettings.difficulty) {
      case "easy":
        newPaddleSpeed = 2;
        newBallSpeed = 2;
        break;
      case "medium":
        newPaddleSpeed = 4;
        newBallSpeed = 3;
        break;
      case "hard":
        newPaddleSpeed = 7;
        newBallSpeed = 4;
        break;
    }

    // Update game constants based on settings
    BALL_SPEED = newBallSpeed;
    PADDLE_SPEED = newPaddleSpeed;

    // Random ball start position and direction
    const randomY = Math.random() * (GAME_HEIGHT - 100) + 50;
    const randomDx = Math.random() < 0.5 ? BALL_SPEED : -BALL_SPEED;
    const randomDy = (Math.random() - 0.5) * BALL_SPEED * 1.5;
    const randomX = Math.random() < 0.5 ? 50 : GAME_WIDTH - 50;

    setGameState((prev) => ({
      ...prev,
      playerPaddle: {
        x: 20,
        y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
      },
      aiPaddle: {
        x: GAME_WIDTH - 30,
        y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
      },
      ball: {
        x: randomX,
        y: randomY,
        dx: randomDx,
        dy: randomDy,
        size: BALL_SIZE,
      },
      playerScore: 0,
      aiScore: 0,
      gameOver: false,
      paused: false,
      keys: {},
      gameStarted: false,
      playerPaddleSpeed: 0,
      aiPaddleSpeed: 0,
      lastPlayerPaddleY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      lastAiPaddleY: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    }));

    // Reset survival state
    setSurvivalState({
      lives: 3,
      speedMultiplier: 1.0,
      gameTime: 0,
    });

    // Load highscore for current mode
    loadHighscore();
  };

  const movePlayerPaddle = () => {
    setGameState((prev) => {
      const newY = prev.playerPaddle.y;
      let paddleSpeed = 0;

      if (prev.keys["ArrowUp"] && newY > 0) {
        paddleSpeed = -PADDLE_SPEED;
        return {
          ...prev,
          playerPaddle: {
            ...prev.playerPaddle,
            y: Math.max(0, newY - PADDLE_SPEED),
          },
          playerPaddleSpeed: paddleSpeed,
          lastPlayerPaddleY: newY,
        };
      }
      if (prev.keys["ArrowDown"] && newY < GAME_HEIGHT - PADDLE_HEIGHT) {
        paddleSpeed = PADDLE_SPEED;
        return {
          ...prev,
          playerPaddle: {
            ...prev.playerPaddle,
            y: Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY + PADDLE_SPEED),
          },
          playerPaddleSpeed: paddleSpeed,
          lastPlayerPaddleY: newY,
        };
      }
      return {
        ...prev,
        playerPaddleSpeed: 0,
        lastPlayerPaddleY: newY,
      };
    });
  };

  const moveAIPaddle = () => {
    setGameState((prev) => {
      const ballCenterY = prev.ball.y;
      const paddleCenterY = prev.aiPaddle.y + PADDLE_HEIGHT / 2;
      const newY = prev.aiPaddle.y;
      let paddleSpeed = 0;

      if (ballCenterY < paddleCenterY - 5 && newY > 0) {
        paddleSpeed = -PADDLE_SPEED * 0.3;
        return {
          ...prev,
          aiPaddle: {
            ...prev.aiPaddle,
            y: Math.max(0, newY - PADDLE_SPEED * 0.3),
          },
          aiPaddleSpeed: paddleSpeed,
          lastAiPaddleY: newY,
        };
      }
      if (
        ballCenterY > paddleCenterY + 5 &&
        newY < GAME_HEIGHT - PADDLE_HEIGHT
      ) {
        paddleSpeed = PADDLE_SPEED * 0.3;
        return {
          ...prev,
          aiPaddle: {
            ...prev.aiPaddle,
            y: Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY + PADDLE_SPEED * 0.3),
          },
          aiPaddleSpeed: paddleSpeed,
          lastAiPaddleY: newY,
        };
      }
      return {
        ...prev,
        aiPaddleSpeed: 0,
        lastAiPaddleY: newY,
      };
    });
  };

  const moveBall = () => {
    setGameState((prev) => {
      const speedMultiplier =
        gameSettings.gameMode === "survival"
          ? survivalState.speedMultiplier
          : 1.0;
      let newX = prev.ball.x + prev.ball.dx * speedMultiplier;
      let newY = prev.ball.y + prev.ball.dy * speedMultiplier;
      let newDx = prev.ball.dx;
      let newDy = prev.ball.dy;

      // Ball hits top or bottom
      if (newY <= 0 || newY >= GAME_HEIGHT - BALL_SIZE) {
        newDy = -newDy;
        playSound("wall");
      }

      // Ball hits player paddle
      if (
        newX <= prev.playerPaddle.x + PADDLE_WIDTH &&
        newX >= prev.playerPaddle.x &&
        newY >= prev.playerPaddle.y &&
        newY <= prev.playerPaddle.y + PADDLE_HEIGHT
      ) {
        // Calculate ball speed based on paddle speed
        const paddleSpeedFactor =
          Math.abs(prev.playerPaddleSpeed) / PADDLE_SPEED;
        const speedMultiplier = 1.0 + paddleSpeedFactor * 0.25;

        // Calculate vertical deflection based on where ball hits paddle
        const hitPosition = (newY - prev.playerPaddle.y) / PADDLE_HEIGHT;
        const verticalDeflection = (hitPosition - 0.5) * 2;

        // Add paddle speed influence to vertical direction
        const paddleSpeedInfluence =
          (prev.playerPaddleSpeed / PADDLE_SPEED) * 0.15;

        newDx = Math.abs(newDx) * speedMultiplier;
        newDy =
          verticalDeflection * BALL_SPEED * 0.4 +
          paddleSpeedInfluence * BALL_SPEED;

        playSound("paddle");
      }

      // Ball hits AI paddle
      if (
        newX >= prev.aiPaddle.x - BALL_SIZE &&
        newX <= prev.aiPaddle.x + PADDLE_WIDTH &&
        newY >= prev.aiPaddle.y &&
        newY <= prev.aiPaddle.y + PADDLE_HEIGHT
      ) {
        // Calculate ball speed based on paddle speed
        const paddleSpeedFactor =
          Math.abs(prev.aiPaddleSpeed) / (PADDLE_SPEED * 0.3);
        const speedMultiplier = 1.0 + paddleSpeedFactor * 0.15;

        // Calculate vertical deflection based on where ball hits paddle
        const hitPosition = (newY - prev.aiPaddle.y) / PADDLE_HEIGHT;
        const verticalDeflection = (hitPosition - 0.5) * 2;

        // Add paddle speed influence to vertical direction
        const paddleSpeedInfluence =
          (prev.aiPaddleSpeed / (PADDLE_SPEED * 0.3)) * 0.1;

        newDx = -Math.abs(newDx) * speedMultiplier;
        newDy =
          verticalDeflection * BALL_SPEED * 0.3 +
          paddleSpeedInfluence * BALL_SPEED;

        playSound("paddle");
      }

      // Ball goes out of bounds
      if (newX < 0) {
        // AI scores - play fail sound
        playSound("fail");
        if (gameSettings.gameMode === "survival") {
          // In survival mode, player loses a life
          setSurvivalState((prev) => ({ ...prev, lives: prev.lives - 1 }));
        }
        // Ball starts near AI paddle with random direction
        const randomY = Math.random() * (GAME_HEIGHT - 100) + 50;
        const randomDx = Math.random() < 0.5 ? -BALL_SPEED : -BALL_SPEED * 0.7;
        const randomDy = (Math.random() - 0.5) * BALL_SPEED * 2;
        return {
          ...prev,
          aiScore: prev.aiScore + 1,
          ball: {
            x: GAME_WIDTH - 50,
            y: randomY,
            dx: randomDx,
            dy: randomDy,
            size: BALL_SIZE,
          },
        };
      }
      if (newX > GAME_WIDTH) {
        // Player scores
        playSound("score");
        // Ball starts near player paddle with random direction
        const randomY = Math.random() * (GAME_HEIGHT - 100) + 50;
        const randomDx = Math.random() < 0.5 ? BALL_SPEED : BALL_SPEED * 0.7;
        const randomDy = (Math.random() - 0.5) * BALL_SPEED * 2;
        return {
          ...prev,
          playerScore: prev.playerScore + 1,
          ball: {
            x: 50,
            y: randomY,
            dx: randomDx,
            dy: randomDy,
            size: BALL_SIZE,
          },
        };
      }

      return {
        ...prev,
        ball: { x: newX, y: newY, dx: newDx, dy: newDy, size: BALL_SIZE },
      };
    });
  };

  const checkGameOver = () => {
    setGameState((prev) => {
      if (gameSettings.gameMode === "standard") {
        // Standard mode: check for max points
        if (
          prev.playerScore >= gameSettings.maxPoints ||
          prev.aiScore >= gameSettings.maxPoints
        ) {
          saveHighscore();
          return { ...prev, gameOver: true };
        }
      } else {
        // Survival mode: check for lives
        if (survivalState.lives <= 0) {
          // Save survival time as highscore
          const survivalTime = Math.floor(survivalState.gameTime / 1000);
          if (survivalTime > prev.highscore) {
            AsyncStorage.setItem(
              "pingpong_survival_highscore",
              survivalTime.toString()
            );
            setGameState((prev) => ({ ...prev, highscore: survivalTime }));
          }
          return { ...prev, gameOver: true };
        }
      }
      return prev;
    });
  };

  const gameLoop = () => {
    if (gameState.paused || gameState.gameOver || !gameState.gameStarted)
      return;

    movePlayerPaddle();
    moveAIPaddle();
    moveBall();
    checkGameOver();
  };

  const togglePause = () => {
    setGameState((prev) => ({ ...prev, paused: !prev.paused }));
  };

  const handleTouch = (direction: "up" | "down") => {
    setGameState((prev) => ({
      ...prev,
      keys: {
        ...prev.keys,
        [direction === "up" ? "ArrowUp" : "ArrowDown"]: true,
      },
    }));
  };

  const handleTouchEnd = (direction: "up" | "down") => {
    setGameState((prev) => ({
      ...prev,
      keys: {
        ...prev.keys,
        [direction === "up" ? "ArrowUp" : "ArrowDown"]: false,
      },
    }));
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const handleBackPress = async () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    router.push("/(tabs)/play/PingPongStartScreen");
  };

  const restartGame = () => {
    init();
  };

  const startGame = () => {
    setGameState((prev) => ({ ...prev, gameStarted: true }));
  };

  useEffect(() => {
    if (!gameState.gameOver && !gameState.paused && gameState.gameStarted) {
      animationRef.current = setInterval(gameLoop, 16);
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
  }, [gameState.paused, gameState.gameOver, gameState.gameStarted]);

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
          const newSpeedMultiplier = 1.0 + Math.floor(newTime / 10000) * 0.1;
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

          {/* Center line */}
          <Rect
            x={GAME_WIDTH / 2 - 1}
            y={0}
            width={2}
            height={GAME_HEIGHT}
            fill={Colors.primaryLimo}
            strokeDasharray="10,10"
          />

          {/* Player paddle */}
          <Rect
            x={gameState.playerPaddle.x}
            y={gameState.playerPaddle.y}
            width={gameState.playerPaddle.width}
            height={gameState.playerPaddle.height}
            fill={Colors.primaryLimo}
          />

          {/* AI paddle */}
          <Rect
            x={gameState.aiPaddle.x}
            y={gameState.aiPaddle.y}
            width={gameState.aiPaddle.width}
            height={gameState.aiPaddle.height}
            fill={Colors.primaryLimo}
          />

          {/* Ball */}
          <Circle
            cx={gameState.ball.x}
            cy={gameState.ball.y}
            r={gameState.ball.size / 2}
            fill={Colors.primaryLimo}
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

        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>
            {gameState.playerScore > gameState.aiScore
              ? "Gewonnen!"
              : "Verloren!"}
          </Text>
          <Text style={styles.scoreText}>
            Spieler: {gameState.playerScore} - KI: {gameState.aiScore}
          </Text>
          {gameState.playerScore > gameState.highscore && (
            <Text style={styles.highscoreText}>Neuer Highscore!</Text>
          )}
          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <Text style={styles.restartButtonText}>Nochmal spielen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <IconArrowBack color={Colors.primaryLimo} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Spieler: {gameState.playerScore}</Text>
          <Text style={styles.highscoreText}>
            Highscore: {gameState.highscore}
          </Text>
          <Text style={styles.scoreText}>Computer: {gameState.aiScore}</Text>
        </View>

        {/* Survival Mode Display */}
        {gameSettings.gameMode === "survival" && (
          <View style={styles.survivalContainer}>
            <View style={styles.livesContainer}>
              <Text style={styles.livesText}>
                Leben: {survivalState.lives}/3
              </Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                Zeit:{" "}
                {Math.floor(survivalState.gameTime / 1000)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor((survivalState.gameTime % 1000) / 10)
                  .toString()
                  .padStart(2, "0")}
              </Text>
            </View>
            <View style={styles.speedContainer}>
              <Text style={styles.speedText}>
                Geschwindigkeit: {survivalState.speedMultiplier.toFixed(1)}x
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.gameContainer}>{renderGame()}</View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPressIn={() => handleTouch("up")}
          onPressOut={() => handleTouchEnd("up")}
        >
          <Text style={styles.controlButtonText}>▲</Text>
        </TouchableOpacity>

        <View style={styles.centerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleSound}>
            {soundEnabled ? (
              <IconVolume color={Colors.black} />
            ) : (
              <IconVolumeOff color={Colors.black} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={togglePause}>
            {gameState.paused ? (
              <IconPlay color={Colors.black} />
            ) : (
              <IconPause color={Colors.black} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.controlButton}
          onPressIn={() => handleTouch("down")}
          onPressOut={() => handleTouchEnd("down")}
        >
          <Text style={styles.controlButtonText}>▼</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: Gaps.g16,
    marginTop: Gaps.g24 + 40,
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
  livesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  livesText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
  },
  speedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  speedText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
  },
  gameContainer: {
    marginBottom: Gaps.g24,
    position: "relative",
  },
  gameCanvas: {},
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: GAME_WIDTH,
    marginBottom: Gaps.g24,
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
    flexDirection: "row",
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
});

export default PingPongGameScreen;
