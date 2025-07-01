import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { Colors, FontSizes, Radius } from "../styles/theme";

interface CategoryProgressBarProps {
  text: string;
  progress: number; // 0-100 percentage
  maxWidth?: number;
}

export const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({
  text,
  progress,
  maxWidth,
}) => {
  const { width } = useWindowDimensions();
  const buttonWidth = Math.min(maxWidth || 348, width - 32);

  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.container, { width: buttonWidth }]}>
      <View
        style={[
          styles.progressFill,
          {
            width: `${normalizedProgress}%`,
          },
        ]}
      />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    alignSelf: "center",
    borderRadius: Radius.r50,
    position: "relative",
    overflow: "hidden",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    backgroundColor: Colors.primaryLimo,
    borderRadius: Radius.r50,
    zIndex: 1,
  },
  text: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.darkGreen,
    zIndex: 2,
  },
});
