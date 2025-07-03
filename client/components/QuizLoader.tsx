import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, StyleSheet, Image } from "react-native";
import { Colors, FontSizes, FontWeights } from "@/styles/theme";

interface QuizLoaderProps {
  onComplete: () => void; // Callback wenn Loader fertig ist
  minDuration?: number; // Minimale Anzeigedauer in Millisekunden
}

const QuizLoader: React.FC<QuizLoaderProps> = ({
  onComplete,
  minDuration = 10000, // 10 Sekunden für Test
}) => {
  const [currentPhase, setCurrentPhase] = useState<'loading' | 'countdown'>('loading');
  const [countdownNumber, setCountdownNumber] = useState(3);
  
  // Separate Animationen für jedes Fragezeichen
  const rotationAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  
  // Animation für den Countdown
  const countdownAnimation = useRef(new Animated.Value(0)).current;

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
        if (finished && currentPhase === 'loading') {
          spin(); // Starte sofort die nächste Runde
        }
      });
    };
    spin();
  };

  useEffect(() => {
    // Reset animation values
    rotationAnimations.forEach(anim => anim.setValue(0));
    countdownAnimation.setValue(0);

    // Starte kontinuierliche Rotation für alle 4 Fragezeichen
    rotationAnimations.forEach(anim => {
      startContinuousRotation(anim);
    });

    // Loader läuft 10 Sekunden, dann verschwindet er komplett
    const minDurationTimer = setTimeout(() => {
      setCurrentPhase('countdown');
      startCountdown();
    }, minDuration);

    return () => {
      rotationAnimations.forEach(anim => anim.stopAnimation());
      clearTimeout(minDurationTimer);
    };
  }, [minDuration, currentPhase]);

  const startCountdown = () => {
    // Sofort die erste Animation für die 3 starten - SICHTBAR MACHEN
    countdownAnimation.setValue(0);
    
    // Sofort die 3 sichtbar machen
    setTimeout(() => {
      Animated.timing(countdownAnimation, {
        toValue: 1,
        duration: 1500, // Längere Dauer für bessere Sichtbarkeit
        useNativeDriver: true,
      }).start();
    }, 100); // Kleine Verzögerung für bessere Sichtbarkeit
    
    const countdownInterval = setInterval(() => {
      setCountdownNumber((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          onComplete();
          return 1;
        }
        return prev - 1;
      });
      
      // Countdown-Animation für jede Zahl: von klein/unsichtbar zu groß/deutlich
      countdownAnimation.setValue(0);
      Animated.timing(countdownAnimation, {
        toValue: 1,
        duration: 1500, // Längere Dauer für bessere Sichtbarkeit
        useNativeDriver: true,
      }).start();
    }, 1500); // Längeres Intervall zwischen den Zahlen
  };

  const orbitRadius = 100;

  // 4 Positionen: 0°, 90°, 180°, 270°
  const positions = [0, 90, 180, 270];

  return (
    <View style={styles.container}>
      {currentPhase === 'loading' ? (
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
      ) : (
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
      )}
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
  countdownContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontSize: FontSizes.H1Fs,
    fontWeight: FontWeights.H1Fw as any,
    color: Colors.black,
  },
});

export default QuizLoader; 