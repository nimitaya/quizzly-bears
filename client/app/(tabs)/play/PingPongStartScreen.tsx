import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Gaps, FontSizes, FontWeights } from '@/styles/theme';
import IconArrowBack from '@/assets/icons/IconArrowBack';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GameSettings {
  side: 'left' | 'right';
  difficulty: 'easy' | 'medium' | 'hard';
  maxPoints: number;
  gameMode: 'standard' | 'survival';
}

const PingPongStartScreen = () => {
  const router = useRouter();
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    side: 'left',
    difficulty: 'medium',
    maxPoints: 10,
    gameMode: 'standard',
  });

  const updateGameSettings = (setting: keyof GameSettings, value: any) => {
    setGameSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleBackPress = () => {
    router.push("/(tabs)/play/MiniGamesScreen");
  };

  const startGame = () => {
    // Navigate to game screen with settings
    router.push({
      pathname: "/(tabs)/play/PingPongGameScreen",
      params: {
        settings: JSON.stringify(gameSettings),
        soundOn: 'true', // Default sound on
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <IconArrowBack />
      </TouchableOpacity>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Ping Pong</Text>
        
        {/* Settings Row - Only Side Selection */}
        <View style={styles.settingsRow}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Side:</Text>
            <View style={styles.selectContainer}>
              <TouchableOpacity 
                style={[
                  styles.selectOption, 
                  gameSettings.side === 'left' && styles.selectOptionActive
                ]}
                onPress={() => updateGameSettings('side', 'left')}
              >
                <Text style={[
                  styles.selectOptionText,
                  gameSettings.side === 'left' && styles.selectOptionTextActive
                ]}>Left</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.selectOption, 
                  gameSettings.side === 'right' && styles.selectOptionActive
                ]}
                onPress={() => updateGameSettings('side', 'right')}
              >
                <Text style={[
                  styles.selectOptionText,
                  gameSettings.side === 'right' && styles.selectOptionTextActive
                ]}>Right</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Difficulty - Under the side buttons */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Difficulty:</Text>
          <View style={styles.selectContainer}>
            <TouchableOpacity 
              style={[
                styles.selectOption, 
                gameSettings.difficulty === 'easy' && styles.selectOptionActive
              ]}
              onPress={() => updateGameSettings('difficulty', 'easy')}
            >
              <Text style={[
                styles.selectOptionText,
                gameSettings.difficulty === 'easy' && styles.selectOptionTextActive
              ]}>Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.selectOption, 
                gameSettings.difficulty === 'medium' && styles.selectOptionActive
              ]}
              onPress={() => updateGameSettings('difficulty', 'medium')}
            >
              <Text style={[
                styles.selectOptionText,
                gameSettings.difficulty === 'medium' && styles.selectOptionTextActive
              ]}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.selectOption, 
                gameSettings.difficulty === 'hard' && styles.selectOptionActive
              ]}
              onPress={() => updateGameSettings('difficulty', 'hard')}
            >
              <Text style={[
                styles.selectOptionText,
                gameSettings.difficulty === 'hard' && styles.selectOptionTextActive
              ]}>Hard</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Max Points */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Point Limit (0 = Endless):</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.numberInput}
              value={gameSettings.maxPoints.toString()}
              onChangeText={(text) => updateGameSettings('maxPoints', parseInt(text) || 0)}
              keyboardType="numeric"
              editable={gameSettings.gameMode === 'standard'}
            />
          </View>
        </View>

        {/* Game Mode with spacing */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Game Mode:</Text>
          <View style={styles.selectContainer}>
            <TouchableOpacity 
              style={[
                styles.selectOption, 
                gameSettings.gameMode === 'standard' && styles.selectOptionActive
              ]}
              onPress={() => updateGameSettings('gameMode', 'standard')}
            >
              <Text style={[
                styles.selectOptionText,
                gameSettings.gameMode === 'standard' && styles.selectOptionTextActive
              ]}>Standard</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.selectOption, 
                gameSettings.gameMode === 'survival' && styles.selectOptionActive
              ]}
              onPress={() => updateGameSettings('gameMode', 'survival')}
            >
              <Text style={[
                styles.selectOptionText,
                gameSettings.gameMode === 'survival' && styles.selectOptionTextActive
              ]}>Survival</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modeDescription}>
            {gameSettings.gameMode === 'standard' 
              ? 'Standard: Win by reaching the point limit.'
              : 'Survival: Max 3 goals conceded. Ball speeds up every 10 seconds.'
            }
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.menuStartButton} onPress={startGame}>
          <Text style={styles.menuStartButtonText}>Start Game</Text>
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
  menuContainer: {
    flex: 1,
    padding: Gaps.g32,
  },
  menuTitle: {
    fontSize: FontSizes.H1Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.darkGreen,
    marginBottom: Gaps.g24,
    textAlign: 'center',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Gaps.g16,
  },
  settingItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: Gaps.g16,
  },
  settingLabel: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
    marginBottom: Gaps.g8,
  },
  selectContainer: {
    flexDirection: 'row',
    gap: Gaps.g8,
  },
  selectOption: {
    backgroundColor: "rgba(205, 245, 70, 0.7)",
    padding: Gaps.g8,
    borderRadius: 50,
  },
  selectOptionActive: {
    backgroundColor: "#CDF546",
  },
  selectOptionText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.TextMediumFw as any,
    color: Colors.darkGreen,
  },
  selectOptionTextActive: {
    color: Colors.darkGreen,
    fontWeight: FontWeights.SubtitleFw as any,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    padding: Gaps.g8,
    borderRadius: 50,
    alignSelf: 'center',
    minWidth: 60,
  },
  numberInput: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.TextMediumFw as any,
    color: Colors.darkGreen,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: FontSizes.TextSmallFs,
    fontWeight: FontWeights.TextMediumFw as any,
    color: Colors.darkGreen,
    marginTop: Gaps.g8,
    textAlign: 'center',
  },
  menuStartButton: {
    backgroundColor: Colors.primaryLimo,
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g16,
    borderRadius: 50,
    alignSelf: 'center',
    minWidth: 120,
  },
  menuStartButtonText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.darkGreen,
    textAlign: 'center',
  },
});

export default PingPongStartScreen; 