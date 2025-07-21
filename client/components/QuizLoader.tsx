import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet, Image } from "react-native";
import { Colors } from "@/styles/theme";

interface QuizLoaderProps {
  onComplete: () => void; // Callback when loader is finished
  minDuration?: number; // Minimum display duration in milliseconds
  waitForExternal?: boolean; // If true, does not finish automatically by time
}

const QuizLoader: React.FC<QuizLoaderProps> = ({
  onComplete,
  minDuration = 10000, // 10 seconds for testing
  waitForExternal = false, // By default works as before
}) => {
  // Separate animations for each question mark
  const rotationAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Starts continuous rotation for a single question mark
  const startContinuousRotation = (anim: Animated.Value) => {
    const spin = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 6000, // One rotation in 6 seconds
        useNativeDriver: true,
        easing: undefined, // Constant speed
      }).start(({ finished }) => {
        if (finished) {
          spin(); // Start the next round immediately
        }
      });
    };
    spin();
  };

  useEffect(() => {
    // Reset animation values
    rotationAnimations.forEach((anim) => anim.setValue(0));

    // Start continuous rotation for all 4 question marks
    rotationAnimations.forEach((anim) => {
      startContinuousRotation(anim);
    });

    let minDurationTimer: ReturnType<typeof setTimeout> | null = null;

    if (!waitForExternal) {
      minDurationTimer = setTimeout(() => {
        onComplete();
      }, minDuration);
    }

    return () => {
      rotationAnimations.forEach((anim) => anim.stopAnimation());
      if (minDurationTimer) {
        clearTimeout(minDurationTimer);
      }
    };
  }, [minDuration, waitForExternal]);

  const orbitRadius = 100;

  // 4 Positions: 0°, 90°, 180°, 270°
  const positions = [0, 90, 180, 270];

  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        <Image
          source={require("@/assets/images/Logo-Bear-green-black.webp")}
          style={styles.bearLogo}
        />

        {positions.map((startPosition, index) => {
          const rotationDegrees = rotationAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [`${startPosition}deg`, `${startPosition + 360}deg`],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.questionMarkContainer,
                {
                  transform: [
                    { rotate: rotationDegrees },
                    { translateX: orbitRadius },
                  ],
                },
              ]}
            >
              <Image
                source={require("@/assets/images/question-mark.webp")}
                style={styles.questionMark}
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bgGray,
  },
  loadingContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  bearLogo: {
    width: 100,
    height: 100,
  },
  questionMarkContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  questionMark: {
    width: 30,
    height: 64,
  },
});

export default QuizLoader;
