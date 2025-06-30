import React from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";

type LogoSize = "small" | "medium" | "big";

interface LogoProps {
  size?: LogoSize;
}

const logoImage = require("../assets/images/Logo-Bear-green-black.webp");
const textImage = require("../assets/images/Logo-Text.webp");

export const Logo: React.FC<LogoProps> = ({ size = "medium" }) => {
  const { logoStyle, showText } = getLogoStyle(size);

  return (
    <View style={styles.container}>
      {showText && (
        <Image
          source={textImage}
          style={styles.textStyle}
          resizeMode="contain"
        />
      )}
      <Image source={logoImage} style={logoStyle} resizeMode="contain" />
    </View>
  );
};

const getLogoStyle = (size: LogoSize) => {
  switch (size) {
    case "small":
      return { logoStyle: styles.small, showText: false };
    case "medium":
      return { logoStyle: styles.medium, showText: true };
    case "big":
      return { logoStyle: styles.big, showText: true };
    default:
      return { logoStyle: styles.medium, showText: false };
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  small: {
    width: 80,
    height: 80,
  },
  medium: {
    width: 150,
    height: 150,
  },
  big: {
    width: 180,
    height: 180,
  },
  textStyle: {
    marginBottom: 24,
    width: 200,
    height: 32,
  },
});
