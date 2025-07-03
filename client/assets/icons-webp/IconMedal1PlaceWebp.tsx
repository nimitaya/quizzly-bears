import React from "react";
import { Image, View, ImageStyle, ViewStyle } from "react-native";

interface IconMedal1PlaceWebpProps {
  size?: number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
}

const IconMedal1PlaceWebp: React.FC<IconMedal1PlaceWebpProps> = ({
  size = 24,
  style,
  containerStyle,
}) => {
  return (
    <View
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
        },
        containerStyle,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Medal 1st place icon"
    >
      <Image
        source={require("./medal-1st-place.webp")}
        style={[
          {
            width: size,
            height: size,
          },
          style,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

export default IconMedal1PlaceWebp;
