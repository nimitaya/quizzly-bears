import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

interface TimerBarProps {
  duration?: number; // Gesamtdauer in Sekunden
  delay?: number; // Verzögerung vor Start in Sekunden
  onTimeUp?: () => void; // Callback wenn Zeit abgelaufen ist
  width?: number; // Breite des Balkens
  height?: number; // Höhe des Balkens
  isPaused?: boolean; // Pausiert die Animation
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
      <View style={[styles.backgroundBar, { backgroundColor: "#cdf546" }]} />
      
      {/* Progress bar (gray growing from left to right) */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: "#CFD0CD",
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
  backgroundBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 5,
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 5,
  },
});

export default TimerBar; 