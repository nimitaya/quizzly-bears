import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Gaps, FontSizes, FontWeights } from '@/styles/theme';
import IconArrowBack from '@/assets/icons/IconArrowBack';

interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  maxScore: number;
  gameMode: 'standard' | 'survival';
}

const SnakeStartScreen = () => {
  const router = useRouter();
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    difficulty: 'medium',
    maxScore: 50,
    gameMode: 'standard',
  });

  const updateGameSettings = (setting: keyof GameSettings, value: any) => {
    setGameSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleBackPress = () => {
    router.push("/(tabs)/play/MiniGamesScreen");
  };

  const startGame = () => {
    router.push({
      pathname: "/(tabs)/play/SnakeGameScreen",
      params: {
        settings: JSON.stringify(gameSettings),
        soundOn: 'true',
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <IconArrowBack color={Colors.primaryLimo} />
      </TouchableOpacity>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Snake</Text>
        
        {/* Difficulty */}
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

        {/* Max Score */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Score Limit (0 = Endless):</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.numberInput}
              value={gameSettings.maxScore.toString()}
              onChangeText={(text) => updateGameSettings('maxScore', parseInt(text) || 0)}
              keyboardType="numeric"
              editable={gameSettings.gameMode === 'standard'}
            />
          </View>
        </View>

        {/* Game Mode */}
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
              ? 'Standard: Win by reaching the score limit.'
              : 'Survival: Survive as long as possible. Speed increases over time.'
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
  menuContainer: {
    flex: 1,
    padding: Gaps.g32,
  },
  menuTitle: {
    fontSize: FontSizes.H1Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.primaryLimo,
    marginBottom: Gaps.g24,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: Gaps.g16,
  },
  settingLabel: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.SubtitleFw as any,
    color: Colors.primaryLimo,
    marginBottom: Gaps.g8,
  },
  selectContainer: {
    flexDirection: 'row',
    gap: Gaps.g8,
  },
  selectOption: {
    backgroundColor: "rgba(205, 245, 70, 0.7)",
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g16,
    borderRadius: 50,
  },
  selectOptionActive: {
    backgroundColor: "#CDF546",
  },
  selectOptionText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: FontWeights.TextMediumFw as any,
    color: Colors.primaryLimo,
  },
  selectOptionTextActive: {
    color: Colors.black,
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
    color: Colors.primaryLimo,
    textAlign: 'center',
  },
  modeDescription: {
    fontSize: FontSizes.TextSmallFs,
    fontWeight: FontWeights.TextMediumFw as any,
    color: Colors.primaryLimo,
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
    color: Colors.black,
    textAlign: 'center',
  },
});

export default SnakeStartScreen; 