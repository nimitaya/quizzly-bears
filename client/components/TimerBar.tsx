import { Colors } from "@/styles/theme";
import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { useSound } from "@/providers/SoundProvider";

interface TimerBarProps {
  duration?: number; // Total duration in seconds
  delay?: number; // Delay before start in seconds
  onTimeUp?: () => void; // Callback when time is up
  width?: number; // Width of the bar
  height?: number; // Height of the bar
  isPaused?: boolean; // Pauses the animation
  isGameEnded?: boolean; // Signals that the game has ended
}

const TimerBar: React.FC<TimerBarProps> = ({
  duration = 30,
  delay = 0,
  onTimeUp,
  width = 300,
  height = 10,
  isPaused = false,
  isGameEnded = false,
}) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const timerSound = useRef<Audio.Sound | null>(null);
  const { soundEnabled } = useSound();
  const [soundLoaded, setSoundLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load timer sound once when component mounts
  useEffect(() => {
    const loadTimerSound = async () => {
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
          require("@/assets/Sounds/time-01.mp3"),
          {
            isLooping: true,
            volume: 0.6,
            shouldPlay: false,
          }
        );

        timerSound.current = sound;
        setSoundLoaded(true);
      } catch (error) {
        timerSound.current = null;
        setSoundLoaded(false);
      }
    };

    loadTimerSound();

    // Cleanup function
    return () => {
      if (timerSound.current) {
        timerSound.current.stopAsync().catch(() => {});
        timerSound.current.unloadAsync().catch(() => {});
        timerSound.current = null;
      }
      setSoundLoaded(false);
      setIsPlaying(false);
    };
  }, []);

  // Start/stop timer sound based on animation state
  const startTimerSound = async () => {
    if (!soundEnabled || !timerSound.current || !soundLoaded || isPlaying) {
      return;
    }

    try {
      await timerSound.current.setPositionAsync(0);
      await timerSound.current.playAsync();
      setIsPlaying(true);
    } catch {}
  };

  const stopTimerSound = async () => {
    if (!timerSound.current || !isPlaying) {
      return;
    }

    try {
      await timerSound.current.stopAsync();
      setIsPlaying(false);
    } catch {}
  };

  useEffect(() => {
    // Reset animation values
    progressAnimation.setValue(0);

    // Start animation immediately - no delay
    const animation = Animated.timing(progressAnimation, {
      toValue: 1,
      duration: duration * 1000, // Use the duration parameter
      useNativeDriver: false,
    });

    // Start timer sound when animation starts (if sound is enabled)
    if (soundEnabled && soundLoaded) {
      startTimerSound();
    }

    animation.start(({ finished }) => {
      // Stop timer sound when animation finishes
      stopTimerSound();

      if (finished && onTimeUp) {
        onTimeUp();
      }
    });

    return () => {
      progressAnimation.stopAnimation();
      // Stop timer sound when component unmounts or animation is interrupted
      stopTimerSound();
    };
  }, [duration, onTimeUp, soundEnabled, soundLoaded]);

  useEffect(() => {
    if (isPaused) {
      progressAnimation.stopAnimation();
      // Stop timer sound when paused
      stopTimerSound();
    }
  }, [isPaused]);

  // Stop sounds when game ends
  useEffect(() => {
    if (isGameEnded) {
      progressAnimation.stopAnimation();
      // Stop timer sound when game ends
      stopTimerSound();
    }
  }, [isGameEnded]);

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
        },
      ]}
    >
      {/* Background bar (green) */}
      <View
        style={[
          styles.barBase,
          styles.backgroundBar,
          { backgroundColor: Colors.primaryLimo },
        ]}
      />

      {/* Progress bar (gray, grows from left to right) */}
      <Animated.View
        style={[
          styles.barBase,
          styles.progressBar,
          {
            backgroundColor: Colors.disable,
            width: progressAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderRadius: 5,
    overflow: "hidden",
  },
  barBase: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 5,
  },
  backgroundBar: {
    right: 0,
  },
  progressBar: {},
});

export default TimerBar;
