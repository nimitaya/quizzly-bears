import { Colors } from "@/styles/theme";
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

interface TimerBarProps {
  duration?: number; // Total duration in seconds
  delay?: number; // Delay before start in seconds
  onTimeUp?: () => void; // Callback when time is up
  width?: number; // Width of the bar
  height?: number; // Height of the bar
  isPaused?: boolean; // Pauses the animation
}

const TimerBar: React.FC<TimerBarProps> = ({
  duration = 30,
  delay = 0,
  onTimeUp,
  width = 300,
  height = 10,
  isPaused = false,
}) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animation values
    progressAnimation.setValue(0);

    // Start animation immediately - no delay
    const animation = Animated.timing(progressAnimation, {
      toValue: 1,
      duration: duration * 1000, // Use the duration parameter
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished && onTimeUp) {
        onTimeUp();
      }
    });

    return () => {
      progressAnimation.stopAnimation();
    };
  }, [duration, onTimeUp]); // Re-run when props change

  useEffect(() => {
    if (isPaused) {
      progressAnimation.stopAnimation();
    }
  }, [isPaused]);

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
  progressBar: {
    // Inherits barBase styles
  },
});

export default TimerBar;
