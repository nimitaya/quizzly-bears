import React from "react";
import { Image, View, ImageStyle, ViewStyle } from "react-native";

interface IconMedal2PlaceWebpProps {
  size?: number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
}

const IconMedal2PlaceWebp: React.FC<IconMedal2PlaceWebpProps> = ({
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
      accessibilityLabel="Medal 2nd place icon"
    >
      <Image
        source={require("./medal-2nd-place.webp")}
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

export default IconMedal2PlaceWebp;
