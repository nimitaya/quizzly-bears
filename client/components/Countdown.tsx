import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Colors, FontSizes, FontWeights } from "@/styles/theme";
import { Audio } from "expo-av";
import { useSound } from "@/providers/SoundProvider";

interface CountdownProps {
  onComplete: () => void;
  startNumber?: number;
  duration?: number;
}

const Countdown: React.FC<CountdownProps> = ({
  onComplete,
  startNumber = 3,
  duration = 1200,
}) => {
  const [countdownNumber, setCountdownNumber] = useState(startNumber);
  const countdownAnimation = useRef(new Animated.Value(0)).current;
  const hasStartedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { soundEnabled } = useSound();

  // Audio refs
  const threeTwoSoundRef = useRef<Audio.Sound | null>(null);
  const oneStartSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      loadSounds();
      startCountdown();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Cleanup sounds
      if (threeTwoSoundRef.current) threeTwoSoundRef.current.unloadAsync();
      if (oneStartSoundRef.current) oneStartSoundRef.current.unloadAsync();
    };
  }, []);

  const loadSounds = async () => {
    try {
      const { sound: threeTwoSound } = await Audio.Sound.createAsync(
        require("@/assets/Sounds/3-2.mp3")
      );
      threeTwoSoundRef.current = threeTwoSound;

      const { sound: oneStartSound } = await Audio.Sound.createAsync(
        require("@/assets/Sounds/1-start.mp3")
      );
      oneStartSoundRef.current = oneStartSound;
    } catch (error) {
      console.log("Error loading countdown sounds:", error);
    }
  };

  const playSound = async (soundType: "threeTwo" | "oneStart") => {
    if (!soundEnabled) return;

    try {
      let soundRef: Audio.Sound | null = null;

      switch (soundType) {
        case "threeTwo":
          soundRef = threeTwoSoundRef.current;
          break;
        case "oneStart":
          soundRef = oneStartSoundRef.current;
          break;
      }

      if (soundRef) {
        await soundRef.setPositionAsync(0);
        await soundRef.playAsync();
      }
    } catch (error) {
      console.log("Error playing countdown sound:", error);
    }
  };

  const startCountdown = () => {
    // Start sound when countdown starts
    countdownAnimation.setValue(0);

    // start number animation
    setTimeout(() => {
      Animated.timing(countdownAnimation, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start();

      // Play sound for initial number (3)
      if (startNumber === 3) {
        playSound("threeTwo");
      }
    }, 100);

    intervalRef.current = setInterval(() => {
      setCountdownNumber((prev) => {
        const newNumber = prev - 1;

        if (newNumber <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          // Play sound for 1 immediately
          playSound("oneStart");
          setTimeout(() => {
            onComplete();
          }, 0);
          return 1;
        }

        // Play sound for 2 immediately when we're about to show 2
        if (newNumber === 2) {
          playSound("threeTwo");
          // Play sound for 1 ultra early - when we're about to show 2
          setTimeout(() => {
            playSound("oneStart");
          }, 700);
        }

        return newNumber;
      });

      // Countdown-Animation for each number
      countdownAnimation.setValue(0);
      Animated.timing(countdownAnimation, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }, duration);
  };

  return (
    <View style={styles.countdownContainer}>
      <Animated.Text
        style={[
          styles.countdownText,
          {
            opacity: countdownAnimation,
            transform: [
              {
                scale: countdownAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1.2],
                }),
              },
            ],
          },
        ]}
      >
        {countdownNumber}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  countdownContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bgGray,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.primaryLimo,
  },
});

export default Countdown;
