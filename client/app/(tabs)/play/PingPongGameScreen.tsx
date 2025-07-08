import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Gaps, FontSizes, FontWeights } from '@/styles/theme';
import IconArrowBack from '@/assets/icons/IconArrowBack';
import IconVolume from '@/assets/icons/IconVolume';
import IconVolumeOff from '@/assets/icons/IconVolumeOff';
import IconPlay from '@/assets/icons/IconPlay';
import IconPause from '@/assets/icons/IconPause';
import Svg, { Rect, Circle } from 'react-native-svg';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
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
  side: 'left' | 'right';
  difficulty: 'easy' | 'medium' | 'hard';
  maxPoints: number;
  gameMode: 'standard' | 'survival';
}

const PingPongGameScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Parse settings from params
  const gameSettings: GameSettings = params.settings ? JSON.parse(params.settings as string) : {
    side: 'left',
    difficulty: 'medium',
    maxPoints: 10,
    gameMode: 'standard',
  };
  const soundOn = params.soundOn === 'true';

  const [gameState, setGameState] = useState({
    playerPaddle: { x: 20, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
    aiPaddle: { x: GAME_WIDTH - 30, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
    ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: BALL_SPEED, dy: BALL_SPEED, size: BALL_SIZE },
    playerScore: 0,
    aiScore: 0,
    gameOver: false,
    paused: false,
    highscore: 0,
    keys: {} as { [key: string]: boolean },
    gameStarted: false,
  });

  const [soundEnabled, setSoundEnabled] = useState(soundOn);
  const [sounds, setSounds] = useState<{[key: string]: Audio.Sound | null}>({});
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
      Object.values(sounds).forEach(sound => {
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
      const highscoreKey = gameSettings.gameMode === 'standard' ? 'pingpong_highscore' : 'pingpong_survival_highscore';
      const highscore = await AsyncStorage.getItem(highscoreKey);
      if (highscore) {
        setGameState(prev => ({ ...prev, highscore: parseInt(highscore) }));
      }
    } catch (error) {
      console.log('Error loading highscore:', error);
    }
  };

  const saveHighscore = async () => {
    try {
      const highscoreKey = gameSettings.gameMode === 'standard' ? 'pingpong_highscore' : 'pingpong_survival_highscore';
      if (gameState.playerScore > gameState.highscore) {
        await AsyncStorage.setItem(highscoreKey, gameState.playerScore.toString());
        setGameState(prev => ({ ...prev, highscore: prev.playerScore }));
      }
    } catch (error) {
      console.log('Error saving highscore:', error);
    }
  };

  const loadSounds = async () => {
    try {
      const { sound: pingSound } = await Audio.Sound.createAsync(
        require('@/assets/MiniGames/pingpong/assets/ping.mp3'),
        { volume: 0.5 }
      );
      const { sound: failSound } = await Audio.Sound.createAsync(
        require('@/assets/MiniGames/pingpong/assets/fail.mp3'),
        { volume: 0.5 }
      );
      const { sound: successSound } = await Audio.Sound.createAsync(
        require('@/assets/MiniGames/pingpong/assets/child-says-yes.mp3'),
        { volume: 0.5 }
      );

      setSounds({
        ping: pingSound,
        fail: failSound,
        success: successSound,
      });
    } catch (error) {
      console.log('Error loading sounds:', error);
    }
  };

  const playSound = async (type: string) => {
    if (!soundEnabled || !sounds[type]) return;
    
    try {
      const sound = sounds[type];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const init = () => {
    // Apply difficulty settings
    let newBallSpeed = 3;
    let newPaddleSpeed = 4;
    
    switch(gameSettings.difficulty) {
      case 'easy':
        newPaddleSpeed = 5;
        newBallSpeed = 4;
        break;
      case 'medium':
        newPaddleSpeed = 7;
        newBallSpeed = 5;
        break;
      case 'hard':
        newPaddleSpeed = 9;
        newBallSpeed = 6;
        break;
    }
    
    // Update game constants based on settings
    BALL_SPEED = newBallSpeed;
    PADDLE_SPEED = newPaddleSpeed;

    setGameState(prev => ({
      ...prev,
      playerPaddle: { x: 20, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
      aiPaddle: { x: GAME_WIDTH - 30, y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
      ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: BALL_SPEED, dy: BALL_SPEED, size: BALL_SIZE },
      playerScore: 0,
      aiScore: 0,
      gameOver: false,
      paused: false,
      keys: {},
      gameStarted: false,
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
    setGameState(prev => {
      const newY = prev.playerPaddle.y;
      
      if (prev.keys['up'] && newY > 0) {
        return {
          ...prev,
          playerPaddle: { ...prev.playerPaddle, y: Math.max(0, newY - PADDLE_SPEED) }
        };
      }
      if (prev.keys['down'] && newY < GAME_HEIGHT - PADDLE_HEIGHT) {
        return {
          ...prev,
          playerPaddle: { ...prev.playerPaddle, y: Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY + PADDLE_SPEED) }
        };
      }
      return prev;
    });
  };

  const moveAIPaddle = () => {
    setGameState(prev => {
      const ballCenterY = prev.ball.y;
      const paddleCenterY = prev.aiPaddle.y + PADDLE_HEIGHT / 2;
      const newY = prev.aiPaddle.y;
      
      if (ballCenterY < paddleCenterY - 5 && newY > 0) {
        return {
          ...prev,
          aiPaddle: { ...prev.aiPaddle, y: Math.max(0, newY - PADDLE_SPEED * 0.8) }
        };
      }
      if (ballCenterY > paddleCenterY + 5 && newY < GAME_HEIGHT - PADDLE_HEIGHT) {
        return {
          ...prev,
          aiPaddle: { ...prev.aiPaddle, y: Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY + PADDLE_SPEED * 0.8) }
        };
      }
      return prev;
    });
  };

  const moveBall = () => {
    setGameState(prev => {
      const speedMultiplier = gameSettings.gameMode === 'survival' ? survivalState.speedMultiplier : 1.0;
      let newX = prev.ball.x + prev.ball.dx * speedMultiplier;
      let newY = prev.ball.y + prev.ball.dy * speedMultiplier;
      let newDx = prev.ball.dx;
      let newDy = prev.ball.dy;

      // Ball hits top or bottom
      if (newY <= 0 || newY >= GAME_HEIGHT - BALL_SIZE) {
        newDy = -newDy;
        playSound('ping');
      }

      // Ball hits player paddle
      if (newX <= prev.playerPaddle.x + PADDLE_WIDTH && 
          newX >= prev.playerPaddle.x &&
          newY >= prev.playerPaddle.y && 
          newY <= prev.playerPaddle.y + PADDLE_HEIGHT) {
        newDx = Math.abs(newDx);
        playSound('ping');
      }

      // Ball hits AI paddle
      if (newX >= prev.aiPaddle.x - BALL_SIZE && 
          newX <= prev.aiPaddle.x + PADDLE_WIDTH &&
          newY >= prev.aiPaddle.y && 
          newY <= prev.aiPaddle.y + PADDLE_HEIGHT) {
        newDx = -Math.abs(newDx);
        playSound('ping');
      }

      // Ball goes out of bounds
      if (newX < 0) {
        // AI scores
        playSound('fail');
        if (gameSettings.gameMode === 'survival') {
          // In survival mode, player loses a life
          setSurvivalState(prev => ({ ...prev, lives: prev.lives - 1 }));
        }
        return {
          ...prev,
          aiScore: prev.aiScore + 1,
          ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: BALL_SPEED, dy: BALL_SPEED, size: BALL_SIZE }
        };
      }
      if (newX > GAME_WIDTH) {
        // Player scores
        playSound('success');
        return {
          ...prev,
          playerScore: prev.playerScore + 1,
          ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: -BALL_SPEED, dy: BALL_SPEED, size: BALL_SIZE }
        };
      }

      return {
        ...prev,
        ball: { x: newX, y: newY, dx: newDx, dy: newDy, size: BALL_SIZE }
      };
    });
  };

  const checkGameOver = () => {
    setGameState(prev => {
      if (gameSettings.gameMode === 'standard') {
        // Standard mode: check for max points
        if (prev.playerScore >= gameSettings.maxPoints || prev.aiScore >= gameSettings.maxPoints) {
          saveHighscore();
          return { ...prev, gameOver: true };
        }
      } else {
        // Survival mode: check for lives
        if (survivalState.lives <= 0) {
          // Save survival time as highscore
          const survivalTime = Math.floor(survivalState.gameTime / 1000);
          if (survivalTime > prev.highscore) {
            AsyncStorage.setItem('pingpong_survival_highscore', survivalTime.toString());
            setGameState(prev => ({ ...prev, highscore: survivalTime }));
          }
          return { ...prev, gameOver: true };
        }
      }
      return prev;
    });
  };

  const gameLoop = () => {
    if (gameState.paused || gameState.gameOver || !gameState.gameStarted) return;

    movePlayerPaddle();
    moveAIPaddle();
    moveBall();
    checkGameOver();
  };

  const togglePause = () => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  };

  const handleTouch = (direction: 'up' | 'down') => {
    setGameState(prev => ({
      ...prev,
      keys: { ...prev.keys, [direction]: true }
    }));
  };

  const handleTouchEnd = (direction: 'up' | 'down') => {
    setGameState(prev => ({
      ...prev,
      keys: { ...prev.keys, [direction]: false }
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
    setGameState(prev => ({ ...prev, gameStarted: true }));
  };

  useEffect(() => {
    if (!gameState.gameOver && !gameState.paused && gameState.gameStarted) {
      animationRef.current = setInterval(gameLoop, 16); // ~60 FPS
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
    if (gameSettings.gameMode === 'survival' && gameState.gameStarted && !gameState.paused && !gameState.gameOver) {
      const interval = setInterval(() => {
        setSurvivalState(prev => {
          const newTime = prev.gameTime + 100;
          const newSpeedMultiplier = 1.0 + Math.floor(newTime / 10000) * 0.1; // Increase speed every 10 seconds
          return {
            ...prev,
            gameTime: newTime,
            speedMultiplier: newSpeedMultiplier,
          };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameSettings.gameMode, gameState.gameStarted, gameState.paused, gameState.gameOver]);

  const renderGame = () => {
    return (
      <View style={styles.gameContainer}>
        <Svg width={GAME_WIDTH} height={GAME_HEIGHT} style={styles.gameCanvas}>
          {/* Background */}
          <Rect x={0} y={0} width={GAME_WIDTH} height={GAME_HEIGHT} fill={Colors.black} />
          
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
            <TouchableOpacity style={styles.gameStartButton} onPress={startGame}>
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
          <IconArrowBack />
        </TouchableOpacity>
        
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>
            {gameState.playerScore > gameState.aiScore ? 'Gewonnen!' : 'Verloren!'}
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
        <IconArrowBack />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Spieler: {gameState.playerScore}</Text>
          <Text style={styles.highscoreText}>Highscore: {gameState.highscore}</Text>
          <Text style={styles.scoreText}>Computer: {gameState.aiScore}</Text>
        </View>
        
        {/* Survival Mode Display */}
        {gameSettings.gameMode === 'survival' && (
          <View style={styles.survivalContainer}>
            <View style={styles.livesContainer}>
              <Text style={styles.livesText}>Leben: {survivalState.lives}/3</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                Zeit: {Math.floor(survivalState.gameTime / 1000).toString().padStart(2, '0')}:
                {Math.floor((survivalState.gameTime % 1000) / 10).toString().padStart(2, '0')}
              </Text>
            </View>
            <View style={styles.speedContainer}>
              <Text style={styles.speedText}>Geschwindigkeit: {survivalState.speedMultiplier.toFixed(1)}x</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.gameContainer}>
        {renderGame()}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPressIn={() => handleTouch('up')}
          onPressOut={() => handleTouchEnd('up')}
        >
          <Text style={styles.controlButtonText}>↑</Text>
        </TouchableOpacity>
        
        <View style={styles.centerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleSound}>
            {soundEnabled ? <IconVolume /> : <IconVolumeOff />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={togglePause}>
            {gameState.paused ? <IconPlay /> : <IconPause />}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.controlButton} 
          onPressIn={() => handleTouch('down')}
          onPressOut={() => handleTouchEnd('down')}
        >
          <Text style={styles.controlButtonText}>↓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgGray,
    alignItems: 'center',
    paddingTop: Gaps.g80,
  },
  backButton: {
    position: 'absolute',
    top: Gaps.g80,
    left: Gaps.g16,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: Gaps.g16,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: GAME_WIDTH,
    marginBottom: Gaps.g8,
  },
  scoreText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
  },
  highscoreText: {
    fontSize: FontSizes.TextSmallFs,
    fontWeight: FontWeights.TextMediumFw as any,
    color: Colors.darkGreen,
  },
  survivalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Gaps.g16,
  },
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livesText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
  },
  gameContainer: {
    marginBottom: Gaps.g24,
    position: 'relative',
  },
  gameCanvas: {
    borderWidth: 2,
    borderColor: Colors.darkGreen,
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: GAME_WIDTH,
    marginBottom: Gaps.g24,
  },
  controlButton: {
    backgroundColor: Colors.primaryLimo,
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.darkGreen,
  },
  controlButtonText: {
    fontSize: 32,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.darkGreen,
  },
  centerButtons: {
    flexDirection: 'row',
    gap: Gaps.g16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: Colors.primaryLimo,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.darkGreen,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Gaps.g32,
  },
  gameOverTitle: {
    fontSize: FontSizes.H1Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.darkGreen,
    marginBottom: Gaps.g16,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g24,
    paddingVertical: Gaps.g16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.darkGreen,
    marginTop: Gaps.g24,
  },
  restartButtonText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
  },
  startButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gameStartButton: {
    backgroundColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g24,
    paddingVertical: Gaps.g16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.darkGreen,
  },
  gameStartButtonText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
  },
});

export default PingPongGameScreen; 