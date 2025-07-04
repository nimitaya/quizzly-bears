import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Colors, FontSizes, FontWeights } from "@/styles/theme";

interface CountdownProps {
  onComplete: () => void;
  startNumber?: number;
  duration?: number;
}

const Countdown: React.FC<CountdownProps> = ({
  onComplete,
  startNumber = 3,
  duration = 1500,
}) => {
  const [countdownNumber, setCountdownNumber] = useState(startNumber);
  const countdownAnimation = useRef(new Animated.Value(0)).current;
  const hasStartedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startCountdown();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    // Sofort die erste Animation für die Startzahl starten
    countdownAnimation.setValue(0);

    // Sofort die Startzahl sichtbar machen
    setTimeout(() => {
      Animated.timing(countdownAnimation, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      }).start();
    }, 100);

    intervalRef.current = setInterval(() => {
      setCountdownNumber((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          // setTimeout
          setTimeout(() => {
            onComplete();
          }, 0);
          return 1;
        }
        return prev - 1;
      });

      // Countdown-Animation für jede Zahl: von klein/unsichtbar zu groß/deutlich
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
