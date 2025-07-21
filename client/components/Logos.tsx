import React from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";

type LogoSize = "small" | "medium" | "big" | "start" | "noconnect";

interface LogoProps {
  size?: LogoSize;
}

const logoImage = require("../assets/images/Logo-Bear-green-black.webp");
const textImage = require("../assets/images/Logo-Text.webp");
const noconnectImage = require("../assets/images/Bear-green-black-ooh.webp");

export const Logo: React.FC<LogoProps> = ({ size = "medium" }) => {
  const { logoStyle, showText, imageSource } = getLogoStyle(size);

  return (
    <View style={styles.container}>
      {showText && (
        <Image
          source={textImage}
          style={styles.textStyle}
          resizeMode="contain"
        />
      )}
      <Image source={imageSource} style={logoStyle} resizeMode="contain" />
    </View>
  );
};

const getLogoStyle = (size: LogoSize) => {
  switch (size) {
    case "small":
      return {
        logoStyle: styles.small,
        showText: false,
        imageSource: logoImage,
      };
    case "medium":
      return {
        logoStyle: styles.medium,
        showText: true,
        imageSource: logoImage,
      };
    case "big":
      return { logoStyle: styles.big, showText: true, imageSource: logoImage };
    case "start":
      return { logoStyle: styles.big, showText: false, imageSource: logoImage };
    case "noconnect":
      return {
        logoStyle: styles.small,
        showText: false,
        imageSource: noconnectImage,
      };
    default:
      return {
        logoStyle: styles.medium,
        showText: false,
        imageSource: logoImage,
      };
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
  start: {
    width: 180,
    height: 180,
  },

  textStyle: {
    marginBottom: 24,
    width: 200,
    height: 32,
  },
});
