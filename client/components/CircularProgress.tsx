import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Colors, FontSizes } from "@/styles/theme";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  textColor?: string;
  animated?: boolean;
  duration?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 150,
  strokeWidth = 8,
  backgroundColor = Colors.disable,
  progressColor = Colors.primaryLimo,
  textColor = Colors.black,
  animated = true,
  duration = 1500,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      animatedValue.setValue(0);
      scaleAnimation.setValue(0);

      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: percentage,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      animatedValue.setValue(percentage);
      scaleAnimation.setValue(1);
    }
  }, [percentage, animated, duration]);

  const radius = size / 2;
  const innerRadius = radius - strokeWidth;

  // Создаем множество маленьких сегментов для имитации круга
  const createSegments = () => {
    const segments = [];
    const totalSegments = 100; // Оптимальное количество сегментов
    const segmentAngle = 360 / totalSegments;

    for (let i = 0; i < totalSegments; i++) {
      const angle = (i * segmentAngle - 90) * (Math.PI / 180); // Начинаем сверху
      const rotationDeg = i * segmentAngle - 90;

      // Вычисляем позицию каждого сегмента
      const x =
        radius +
        (radius - strokeWidth / 2) * Math.cos(angle) -
        strokeWidth * 0.7;
      const y =
        radius +
        (radius - strokeWidth / 2) * Math.sin(angle) -
        strokeWidth * 0.3;

      segments.push(
        <Animated.View
          key={i}
          style={[
            styles.segment,
            {
              position: "absolute",
              left: x,
              top: y,
              width: strokeWidth * 1.4, // Делаем сегменты шире
              height: strokeWidth * 0.6, // Но не очень высокими
              borderRadius: strokeWidth * 0.1, // Минимальное скругление
              backgroundColor: animatedValue.interpolate({
                inputRange: [
                  0,
                  (i / totalSegments) * 100,
                  ((i + 1) / totalSegments) * 100,
                  100,
                ],
                outputRange: [
                  backgroundColor,
                  backgroundColor,
                  progressColor,
                  progressColor,
                ],
                extrapolate: "clamp",
              }),
              transform: [
                { rotate: `${rotationDeg}deg` }, // Поворачиваем каждый сегмент
              ],
            },
          ]}
        />
      );
    }
    return segments;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ scale: scaleAnimation }],
        },
      ]}
    >
      {/* Сегменты круга */}
      <View style={styles.segmentsContainer}>{createSegments()}</View>

      {/* Inner white circle */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerRadius * 2,
            height: innerRadius * 2,
            borderRadius: innerRadius,
          },
        ]}
      />

      {/* Text in center */}
      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.percentageText,
            {
              fontSize: FontSizes.H1Fs,
              color: textColor,
              opacity: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: [0.5, 1],
              }),
            },
          ]}
        >
          {Math.round(percentage)}%
        </Animated.Text>
        <Text
          style={[
            styles.accuracyText,
            { fontSize: FontSizes.TextMediumFs, color: textColor },
          ]}
        >
          accuracy
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  segmentsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  segment: {
    position: "absolute",
  },
  innerCircle: {
    position: "absolute",
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  percentageText: {
    fontWeight: "700",
    marginBottom: 2,
  },
  accuracyText: {
    opacity: 0.7,
  },
});

export default CircularProgress;
