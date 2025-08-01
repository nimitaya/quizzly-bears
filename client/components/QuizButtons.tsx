import React, { useEffect, useRef } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { Audio } from "expo-av";
import { Colors, Radius, FontSizes, Gaps } from "../styles/theme";
import { useSound } from "@/providers/SoundProvider";

type QuizButtonProps = {
  text: string;
  selected: boolean;
  checked: boolean;
  isCorrect: boolean;
  onPress: () => void;
};

export function QuizButton({
  text,
  selected,
  checked,
  isCorrect,
  onPress,
}: QuizButtonProps) {
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(348, width - 32);
  const auswahlSound = useRef<Audio.Sound | null>(null);
  const { soundEnabled } = useSound();

  // Load selection sound
  useEffect(() => {
    const loadAuswahlSound = async () => {
      try {
        // Initialize audio mode for mobile devices
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/Sounds/auswahl.mp3"),
          {
            volume: 0.7,
            shouldPlay: false,
          }
        );

        auswahlSound.current = sound;
      } catch {
        auswahlSound.current = null;
      }
    };

    loadAuswahlSound();

    // Cleanup function
    return () => {
      if (auswahlSound.current) {
        auswahlSound.current.unloadAsync().catch(() => {});
        auswahlSound.current = null;
      }
    };
  }, []);

  // Play selection sound
  const playAuswahlSound = async () => {
    // DEBUG: Always try to play sound regardless of settings (like TimerBar)
    if (!auswahlSound.current) {
      return;
    }

    try {
      await auswahlSound.current.setPositionAsync(0);
      await auswahlSound.current.playAsync();
    } catch {}
  };

  // Handle button press with sound
  const handlePress = async () => {
    if (checked) return;

    // Play selection sound if enabled
    if (soundEnabled && auswahlSound.current) {
      try {
        await auswahlSound.current.setPositionAsync(0);
        await auswahlSound.current.playAsync();
      } catch {}
    }

    onPress();
  };

  // Determine border style after checking the answer
  let borderColor = Colors.darkGreen;
  let borderWidth = 1;
  if (checked) {
    borderColor = isCorrect ? Colors.primaryLimo : Colors.systemRed;
    borderWidth = 8;
  }

  return (
    <Pressable onPress={handlePress} disabled={checked}>
      <View
        style={[
          styles.button,
          {
            width: buttonWidth,
            backgroundColor: selected ? Colors.disable : "transparent",
            borderColor,
            borderWidth,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: selected ? Colors.black : Colors.darkGreen },
          ]}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    alignSelf: "center",
    borderRadius: Radius.r50,
    marginVertical: 8,
    borderStyle: "solid",
  },
  text: {
    fontSize: FontSizes.TextLargeFs,
    textAlign: "center",
  },
});
