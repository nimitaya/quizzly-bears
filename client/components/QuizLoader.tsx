import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet, Image } from "react-native";
import { Colors } from "@/styles/theme";

interface QuizLoaderProps {
  onComplete: () => void; // Callback wenn Loader fertig ist
  minDuration?: number; // Minimale Anzeigedauer in Millisekunden
}

const QuizLoader: React.FC<QuizLoaderProps> = ({
  onComplete,
  minDuration = 10000, // 10 Sekunden für Test
}) => {
  // Separate Animationen für jedes Fragezeichen
  const rotationAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Startet eine kontinuierliche Rotation für ein einzelnes Fragezeichen
  const startContinuousRotation = (anim: Animated.Value) => {
    const spin = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 6000, // Eine Umdrehung in 6 Sekunden
        useNativeDriver: true,
        easing: undefined, // Konstante Geschwindigkeit
      }).start(({ finished }) => {
        if (finished) {
          spin(); // Starte sofort die nächste Runde
        }
      });
    };
    spin();
  };

  useEffect(() => {
    // Reset animation values
    rotationAnimations.forEach(anim => anim.setValue(0));

    // Starte kontinuierliche Rotation für alle 4 Fragezeichen
    rotationAnimations.forEach(anim => {
      startContinuousRotation(anim);
    });

    // Loader läuft für die angegebene Zeit, dann wird onComplete aufgerufen
    const minDurationTimer = setTimeout(() => {
      onComplete();
    }, minDuration);

    return () => {
      rotationAnimations.forEach(anim => anim.stopAnimation());
      clearTimeout(minDurationTimer);
    };
  }, [minDuration]);

  const orbitRadius = 100;

  // 4 Positionen: 0°, 90°, 180°, 270°
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
    backgroundColor: Colors.white,
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