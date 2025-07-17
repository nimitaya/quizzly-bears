import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Alert, Keyboard, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Gaps, FontSizes, FontWeights } from '@/styles/theme';
import IconArrowBack from '@/assets/icons/IconArrowBack';
import IconVolume from '@/assets/icons/IconVolume';
import IconVolumeOff from '@/assets/icons/IconVolumeOff';
import IconMusic from '@/assets/icons/IconMusic';
import IconMusicOff from '@/assets/icons/IconMusicOff';
import IconPlay from '@/assets/icons/IconPlay';
import IconPause from '@/assets/icons/IconPause';
import Svg, { Rect, Circle } from 'react-native-svg';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const GAME_WIDTH = Math.min(screenWidth - 32, 350);
const GAME_HEIGHT = 420; // Increased from 400 to 420 (20 pixels longer)
const PIXEL = 3;

// Sprites
const PLAYER_SPRITE = ['0011100', '0111110', '1111111', '1111111', '0111110'];
const ENEMY_SPRITE = ['00100', '01110', '11111', '10101', '01010'];

// Game constants
const PLAYER_WIDTH = PLAYER_SPRITE[0].length * PIXEL;
const PLAYER_HEIGHT = PLAYER_SPRITE.length * PIXEL;
const ENEMY_WIDTH = ENEMY_SPRITE[0].length * PIXEL;
const ENEMY_HEIGHT = ENEMY_SPRITE.length * PIXEL;
const PLAYER_SPEED = 4;
const BULLET_WIDTH = 2 * PIXEL;
const BULLET_HEIGHT = 5 * PIXEL;
const BULLET_SPEED = 7;
const ENEMY_ROWS_BASE = 4;
const ENEMY_COLS_BASE = 8;
const ENEMY_H_SPACING = 10;
const ENEMY_V_SPACING = 20;
const ENEMY_START_Y = 10;
const ENEMY_STEP_DOWN = 20;
const ENEMY_BULLET_SPEED = 1.5;

// Enemy speed and shoot chance base values
const ENEMY_SPEED_X_BASE = 1;
const ENEMY_SHOOT_CHANCE_BASE = 0.002;

interface Enemy {
  x: number;
  y: number;
  alive: boolean;
}

interface Bullet {
  x: number;
  y: number;
  hit?: boolean;
}

const SpaceInvadersScreen = () => {
  const router = useRouter();
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gameState, setGameState] = useState({
    player: { x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - PLAYER_HEIGHT - 10 },
    bullets: [] as Bullet[],
    enemyBullets: [] as Bullet[],
    enemies: [] as Enemy[],
    keys: {} as { [key: string]: boolean },
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    hitFlash: 0,
    invincible: false,
    paused: false,
    highscore: 0,
    enemyCanFire: false,
    enemySpeedX: 1,
    enemyShootChance: 0.002,
    waveClearing: false,
  });

  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sounds, setSounds] = useState<{[key: string]: Audio.Sound | null}>({});
  const [bgMusic, setBgMusic] = useState<Audio.Sound | null>(null);
  const [highscore, setHighscore] = useState(0);
  const [showWaveMessage, setShowWaveMessage] = useState(false);
  const [waveMessage, setWaveMessage] = useState('');
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Load sounds and initialize
  useEffect(() => {
    loadSounds();
    loadHighscore();
    init();
    return () => {
      // Cleanup - Musik stoppen und alle Sounds freigeben
      if (bgMusic) {
        bgMusic.stopAsync().catch(() => {});
        bgMusic.unloadAsync().catch(() => {});
      }
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
      const highscore = await AsyncStorage.getItem('spaceinvaders_highscore');
      if (highscore) {
        setGameState(prev => ({ ...prev, highscore: parseInt(highscore) }));
      }
    } catch (error) {
      console.log('Error loading highscore:', error);
    }
  };

  const saveHighscore = async () => {
    try {
      if (gameState.score > gameState.highscore) {
        await AsyncStorage.setItem('spaceinvaders_highscore', gameState.score.toString());
        setGameState(prev => ({ ...prev, highscore: prev.score }));
      }
    } catch (error) {
      console.log('Error saving highscore:', error);
    }
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

      // Load sounds from the Sounds directory
      const { sound: shootSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/laser.mp3')
      );
      const { sound: explosionSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/richtig.mp3')
      );
      const { sound: playerHitSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/error.mp3')
      );
      const { sound: enemyShootSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/laser-alien.mp3')
      );

      setSounds({
        shoot: shootSound,
        explosion: explosionSound,
        playerHit: playerHitSound,
        enemyShoot: enemyShootSound,
      });

      // Load background music
      const { sound: bgMusicSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/8-bit.mp3'),
        { isLooping: true, volume: 0.3 }
      );
      setBgMusic(bgMusicSound);
    } catch (error) {
      console.log('Error loading sounds:', error);
      // Set empty sounds object to prevent further errors
      setSounds({
        shoot: null,
        explosion: null,
        playerHit: null,
        enemyShoot: null,
      });
      setBgMusic(null);
    }
  };

  const playSound = async (type: string) => {
    if (!soundOn || !sounds[type] || gameState.paused) return;
    
    try {
      const sound = sounds[type];
      if (sound) {
        // Initialize audio on first interaction if not already done
        if (!audioInitialized) {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
          setAudioInitialized(true);
        }
        
        await sound.setPositionAsync(0);
        // Set volume to 50%
        await sound.setVolumeAsync(0.5);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const init = () => {
    setGameState(prev => ({
      ...prev,
      player: { x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - PLAYER_HEIGHT - 10 },
      bullets: [],
      enemyBullets: [],
      enemies: [],
      keys: {},
      score: 0,
      lives: 3,
      level: 1,
      gameOver: false,
      hitFlash: 0,
      invincible: false,
      paused: false,
      enemyCanFire: false,
      enemySpeedX: 1,
      enemyShootChance: 0.002,
      waveClearing: false,
    }));
    spawnWave();
  };

  const spawnWave = () => {
    setGameState(prev => {
      const rows = ENEMY_ROWS_BASE + Math.floor(prev.level / 3);
      // Verlangsame die Aliens um 50% für bessere Spielbarkeit auf dem Handy
      const speed = (ENEMY_SPEED_X_BASE + (prev.level - 1) * 0.3) * 0.5;
      const shoot = ENEMY_SHOOT_CHANCE_BASE * (1 + (prev.level - 1) * 0.4);

      const newEnemies: Enemy[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < ENEMY_COLS_BASE; c++) {
          newEnemies.push({
            x: 40 + c * (ENEMY_WIDTH + ENEMY_H_SPACING),
            y: ENEMY_START_Y + r * (ENEMY_HEIGHT + ENEMY_V_SPACING),
            alive: true
          });
        }
      }

      return {
        ...prev,
        enemies: newEnemies,
        enemyCanFire: false,
        enemySpeedX: speed,
        enemyShootChance: shoot,
      };
    });

    // Wave-Ankündigung anzeigen
    setWaveMessage(`WAVE ${gameState.level}`);
    setShowWaveMessage(true);
    setTimeout(() => setShowWaveMessage(false), 1200);

    // 2-Sekunden-Schonfrist
    setTimeout(() => {
      setGameState(prev => ({ ...prev, enemyCanFire: true }));
    }, 2000);
  };

  const fireBullet = () => {
    if (gameState.bullets.length < 3) { // Limit bullets
      const newBullet: Bullet = {
        x: gameState.player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: gameState.player.y - BULLET_HEIGHT,
      };
      setGameState(prev => ({
        ...prev,
        bullets: [...prev.bullets, newBullet],
      }));
      playSound('shoot');
    }
  };

  const movePlayer = () => {
    setGameState(prev => {
      let newX = prev.player.x;
      if (prev.keys['ArrowLeft']) newX -= PLAYER_SPEED;
      if (prev.keys['ArrowRight']) newX += PLAYER_SPEED;
      newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, newX));
      
      return {
        ...prev,
        player: { ...prev.player, x: newX }
      };
    });
  };

  const moveBullets = () => {
    setGameState(prev => {
      const newBullets = prev.bullets
        .map(b => ({ ...b, y: b.y - BULLET_SPEED }))
        .filter(b => b.y + BULLET_HEIGHT > 0);

      const newEnemyBullets = prev.enemyBullets
        .map(b => ({ ...b, y: b.y + ENEMY_BULLET_SPEED }))
        .filter(b => b.y < GAME_HEIGHT);

      return {
        ...prev,
        bullets: newBullets,
        enemyBullets: newEnemyBullets
      };
    });
  };

  const moveEnemies = () => {
    setGameState(prev => {
      let edge = false;
      const newEnemies = prev.enemies.map(e => {
        if (!e.alive) return e;
        const newX = e.x + prev.enemySpeedX;
        if (newX <= 0 || newX + ENEMY_WIDTH >= GAME_WIDTH) edge = true;
        return { ...e, x: newX };
      });

      if (edge) {
        const updatedEnemies = newEnemies.map(e => {
          if (!e.alive) return e;
          const newY = e.y + ENEMY_STEP_DOWN;
          if (newY + ENEMY_HEIGHT >= prev.player.y) {
            return { ...e, y: newY, gameOver: true };
          }
          return { ...e, y: newY };
        });

        const gameOver = updatedEnemies.some(e => (e as any).gameOver);

        return {
          ...prev,
          enemies: updatedEnemies,
          enemySpeedX: -prev.enemySpeedX,
          gameOver: gameOver
        };
      }

      return {
        ...prev,
        enemies: newEnemies
      };
    });
  };

  const enemyActions = () => {
    setGameState(prev => {
      if (!prev.enemyCanFire) return prev;

      const newEnemyBullets = [...prev.enemyBullets];
      prev.enemies.forEach(e => {
        if (!e.alive) return;
        if (Math.random() < prev.enemyShootChance) {
          newEnemyBullets.push({
            x: e.x + ENEMY_WIDTH / 2 - BULLET_WIDTH / 2,
            y: e.y + ENEMY_HEIGHT
          });
          playSound('enemyShoot');
        }
      });

      return {
        ...prev,
        enemyBullets: newEnemyBullets
      };
    });
  };

  const collisions = () => {
    let shouldPlayExplosion = false;
    let shouldPlayPlayerHit = false;
    
    setGameState(prev => {
      const newBullets = [...prev.bullets];
      const newEnemyBullets = [...prev.enemyBullets];
      let newScore = prev.score;
      let newLives = prev.lives;
      let newInvincible = prev.invincible;
      let newHitFlash = prev.hitFlash;

      // Player bullets vs enemies
      newBullets.forEach(bullet => {
        prev.enemies.forEach(enemy => {
          if (enemy.alive && 
              bullet.x < enemy.x + ENEMY_WIDTH &&
              bullet.x + BULLET_WIDTH > enemy.x &&
              bullet.y < enemy.y + ENEMY_HEIGHT &&
              bullet.y + BULLET_HEIGHT > enemy.y) {
            enemy.alive = false;
            bullet.hit = true;
            newScore += 100;
            shouldPlayExplosion = true;
          }
        });
      });

      // Enemy bullets vs player
      if (!prev.invincible) {
        newEnemyBullets.forEach(bullet => {
          if (bullet.x < prev.player.x + PLAYER_WIDTH &&
              bullet.x + BULLET_WIDTH > prev.player.x &&
              bullet.y < prev.player.y + PLAYER_HEIGHT &&
              bullet.y + BULLET_HEIGHT > prev.player.y) {
            bullet.hit = true;
            newLives--;
            newInvincible = true;
            newHitFlash = 60;
            shouldPlayPlayerHit = true;
            if (newLives <= 0) {
              return {
                ...prev,
                bullets: newBullets.filter(b => !b.hit),
                enemyBullets: newEnemyBullets.filter(b => !b.hit),
                score: newScore,
                lives: newLives,
                invincible: newInvincible,
                hitFlash: newHitFlash,
                gameOver: true
              };
            }
          }
        });
      }

      return {
        ...prev,
        bullets: newBullets.filter(b => !b.hit),
        enemyBullets: newEnemyBullets.filter(b => !b.hit),
        score: newScore,
        lives: newLives,
        invincible: newInvincible,
        hitFlash: newHitFlash,
        gameOver: newLives <= 0
      };
    });
    
    // Play sounds outside of setState
    if (shouldPlayExplosion) {
      playSound('explosion');
    }
    if (shouldPlayPlayerHit) {
      playSound('playerHit');
    }
  };

  const handleBlink = () => {
    setGameState(prev => {
      if (prev.invincible && prev.hitFlash > 0) {
        const newHitFlash = prev.hitFlash - 1;
        return {
          ...prev,
          hitFlash: newHitFlash,
          invincible: newHitFlash > 0
        };
      }
      return prev;
    });
  };

  const checkWaveClear = () => {
    setGameState(prev => {
      // Verhindere mehrfache Aufrufe während einer Wave-Clear-Operation
      if (prev.waveClearing) {
        return prev;
      }
      
      if (prev.enemies.every(e => !e.alive)) {
        if (prev.level >= 26) {
          return { ...prev, gameOver: true };
        }
        const newLevel = prev.level + 1;
        // Spawn new wave immediately
        setTimeout(() => {
          setGameState(current => ({ ...current, waveClearing: false }));
          spawnWave();
        }, 1000); // 1 second delay before next wave
        return {
          ...prev,
          level: newLevel,
          gameOver: false,
          waveClearing: true // Set flag to prevent multiple calls
        };
      }
      return prev;
    });
  };

  const gameLoop = () => {
    if (gameState.paused || gameState.gameOver) {
      if (gameState.gameOver) {
        saveHighscore();
      }
      return;
    }

    movePlayer();
    moveBullets();
    checkWaveClear();
    moveEnemies();
    enemyActions();
    collisions();
    handleBlink();
  };

  useEffect(() => {
    if (!gameState.paused && !gameState.gameOver) {
      // Start game loop with 60 FPS (16.67ms interval)
      animationRef.current = setInterval(gameLoop, 16);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    }
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [gameState.paused, gameState.gameOver]);

  const togglePause = async () => {
    const newPausedState = !gameState.paused;
    setPaused(newPausedState);
    setGameState(prev => ({ ...prev, paused: newPausedState }));
    
    if (newPausedState) {
      // Stop all sounds when pausing
      if (bgMusic) {
        try {
          await bgMusic.stopAsync();
        } catch (error) {
          console.log('Error stopping background music:', error);
        }
      }
      
      // Stop all sound effects
      Object.values(sounds).forEach(sound => {
        if (sound) {
          sound.stopAsync().catch(() => {});
        }
      });
    } else {
      // Resume music if it was on before
      if (bgMusic && musicOn) {
        try {
          await bgMusic.playAsync();
        } catch (error) {
          console.log('Error resuming background music:', error);
        }
      }
    }
  };

  const renderSprite = (sprite: string[], x: number, y: number) => {
    const elements: React.ReactElement[] = [];
    sprite.forEach((row, rowIndex) => {
      [...row].forEach((pixel, colIndex) => {
        if (pixel === '1') {
          elements.push(
            <Rect
              key={`${rowIndex}-${colIndex}`}
              x={x + colIndex * PIXEL}
              y={y + rowIndex * PIXEL}
              width={PIXEL}
              height={PIXEL}
              fill={Colors.primaryLimo}
            />
          );
        }
      });
    });
    return elements;
  };

  const renderPlayer = () => {
    if (gameState.invincible && Math.floor(gameState.hitFlash / 4) % 2) {
      return null;
    }
    return renderSprite(PLAYER_SPRITE, gameState.player.x, gameState.player.y);
  };

  const renderEnemies = () => {
    return gameState.enemies
      .filter(e => e.alive)
      .map((enemy, index) => 
        renderSprite(ENEMY_SPRITE, enemy.x, enemy.y)
      );
  };

  const renderBullets = () => {
    const elements: React.ReactElement[] = [];
    
    // Player bullets
    gameState.bullets.forEach((bullet, index) => {
      elements.push(
        <Rect
          key={`player-bullet-${index}`}
          x={bullet.x}
          y={bullet.y}
          width={BULLET_WIDTH}
          height={BULLET_HEIGHT}
          fill={Colors.primaryLimo}
        />
      );
    });

    // Enemy bullets
    gameState.enemyBullets.forEach((bullet, index) => {
      elements.push(
        <Rect
          key={`enemy-bullet-${index}`}
          x={bullet.x}
          y={bullet.y}
          width={BULLET_WIDTH}
          height={BULLET_HEIGHT}
          fill={Colors.primaryLimo}
        />
      );
    });

    return elements;
  };

  const handleTouch = (direction: 'left' | 'right' | 'fire') => {
    if (gameState.paused || gameState.gameOver) return;
    
    // Initialize audio on first interaction
    if (!audioInitialized) {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      }).then(() => setAudioInitialized(true)).catch(error => {
        console.log('Error initializing audio:', error);
      });
    }
    
    if (direction === 'fire') {
      fireBullet();
      return; // Don't change movement keys when firing
    }
    
    // Setze nur die entsprechende Richtung, ohne andere zu beeinflussen
    setGameState(prev => ({
      ...prev,
      keys: {
        ...prev.keys,
        [direction === 'left' ? 'ArrowLeft' : 'ArrowRight']: true,
      }
    }));
  };

  const handleTouchEnd = (direction: 'left' | 'right') => {
    setGameState(prev => ({
      ...prev,
      keys: {
        ...prev.keys,
        [direction === 'left' ? 'ArrowLeft' : 'ArrowRight']: false,
      }
    }));
  };

  const toggleMusic = async () => {
    const newMusicOn = !musicOn;
    setMusicOn(newMusicOn);
    
    if (bgMusic) {
      try {
        if (newMusicOn && !gameState.paused) {
          await bgMusic.playAsync();
        } else {
          await bgMusic.stopAsync();
        }
      } catch (error) {
        console.log('Error toggling music:', error);
        // If there's an error, set music to off
        setMusicOn(false);
      }
    } else {
      // If no background music is available, just toggle the state
      console.log('No background music available');
    }
  };

  const stopAllAudio = async () => {
    // Musik stoppen
    if (bgMusic) {
      try {
        await bgMusic.stopAsync();
      } catch (error) {
        console.log('Error stopping background music:', error);
      }
    }
    
    // Alle Sounds stoppen
    Object.values(sounds).forEach(sound => {
      if (sound) {
        sound.stopAsync().catch(() => {});
      }
    });
  };

  const handleBackPress = async () => {
    await stopAllAudio();
    router.push("/(tabs)/play/MiniGamesScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <IconArrowBack color={Colors.primaryLimo} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
      >
        <View style={styles.content}>
          {/* HUD */}
          <View style={styles.hud}>
            <Text style={styles.hudText}>SCORE: {gameState.score}</Text>
            <Text style={styles.hudText}>LIVES: {gameState.lives}</Text>
            <Text style={styles.hudText}>HI: {gameState.highscore}</Text>
            <Text style={styles.hudText}>WAVE {gameState.level}</Text>
          </View>

          {/* Game Canvas */}
          <View style={styles.gameCanvas}>
            <Svg width={GAME_WIDTH} height={GAME_HEIGHT} style={styles.svg}>
              {renderPlayer()}
              {renderEnemies()}
              {renderBullets()}
            </Svg>
          </View>

          {/* Wave Message Overlay */}
          {showWaveMessage && (
            <View style={styles.waveOverlay}>
              <Text style={styles.waveMessage}>{waveMessage}</Text>
            </View>
          )}

          {/* Game Over Overlay */}
          {gameState.gameOver && (
            <View style={styles.overlay}>
              <View style={styles.overlayContent}>
                <Text style={styles.gameOverText}>GAME OVER</Text>
                <Text style={styles.scoreText}>Final Score: {gameState.score}</Text>
                <TouchableOpacity style={styles.restartButton} onPress={init}>
                  <Text style={styles.restartButtonText}>Restart</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Pause Overlay */}
          {gameState.paused && !gameState.gameOver && (
            <View style={styles.overlay}>
              <View style={styles.overlayContent}>
                <Text style={styles.pauseText}>PAUSED</Text>
              </View>
            </View>
          )}

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPressIn={() => handleTouch('left')}
              onPressOut={() => handleTouchEnd('left')}
            >
              <Text style={styles.controlText}>◀</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleTouch('fire')}
            >
              <Text style={styles.controlText}>⨀</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPressIn={() => handleTouch('right')}
              onPressOut={() => handleTouchEnd('right')}
            >
              <Text style={styles.controlText}>▶</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.gameButton}
              onPress={() => setSoundOn(!soundOn)}
            >
              {soundOn ? (
                <IconVolume size={24} color={Colors.primaryLimo} />
              ) : (
                <IconVolumeOff size={24} color={Colors.primaryLimo} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gameButton}
              onPress={toggleMusic}
            >
              {musicOn ? (
                <IconMusic size={24} color={Colors.primaryLimo} />
              ) : (
                <IconMusicOff size={24} color={Colors.primaryLimo} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gameButton}
              onPress={togglePause}
            >
              {gameState.paused ? (
                <IconPlay size={24} color={Colors.primaryLimo} />
              ) : (
                <IconPause size={24} color={Colors.primaryLimo} />
              )}
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
    alignItems: 'center',
    paddingTop: Gaps.g80,
  },
  backButton: {
    position: 'absolute',
    top: 72,
    left: 16,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: Gaps.g80,
    minHeight: 800, // Ensure content is tall enough to scroll
  },
  content: {
    alignItems: 'center',
    marginTop: 40, // Added 40px margin to avoid overlap with back button
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.primaryLimo,
    marginBottom: Gaps.g16,
    textAlign: 'center',
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: GAME_WIDTH,
    marginBottom: Gaps.g8,
  },
  hudText: {
    fontSize: FontSizes.TextSmallFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
  },
  gameCanvas: {
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
    backgroundColor: Colors.black,
  },
  svg: {
    backgroundColor: Colors.black,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
    padding: Gaps.g24,
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: FontSizes.H2Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.primaryLimo,
    marginBottom: Gaps.g16,
  },
  pauseText: {
    fontSize: FontSizes.H2Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.primaryLimo,
  },
  scoreText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
    marginBottom: Gaps.g16,
  },
  restartButton: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g16,
  },
  restartButtonText: {
    color: Colors.primaryLimo,
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
  },
  controls: {
    marginTop: Gaps.g8,
    width: GAME_WIDTH,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Gaps.g16,
    paddingHorizontal: Gaps.g16,
    minHeight: 60, // Reduced from 80
  },
  controlButton: {
    backgroundColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g8, // Reduced from 16
    paddingVertical: Gaps.g8, // Reduced from 16
    minWidth: 80, // Reduced from 100
    alignItems: 'center',
    borderRadius: 12,
    flex: 0,
    maxWidth: 120, // Reduced from 140
    borderWidth: 2,
    borderColor: Colors.black,
    minHeight: 50, // Reduced from 60
  },
  controlText: {
    color: Colors.black,
    fontSize: 24, // Reduced from 28
    fontWeight: 'bold' as any,
  },
  buttonContainer: {
    marginTop: Gaps.g8, // Reduced from 16
    flexDirection: 'row',
    gap: Gaps.g16,
    alignItems: 'center',
    justifyContent: 'center',
    width: GAME_WIDTH,
  },
  gameButton: {
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    maxWidth: (GAME_WIDTH - 48) / 4,
  },
  gameButtonText: {
    color: Colors.primaryLimo,
    fontSize: FontSizes.TextSmallFs,
    fontWeight: FontWeights.SubtitleFw as any,
  },
  waveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveMessage: {
    fontSize: FontSizes.H2Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.primaryLimo,
  },
});

export default SpaceInvadersScreen; 