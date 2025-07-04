import React from "react";
import { Image, View, ImageStyle, ViewStyle } from "react-native";

interface IconMedal3PlaceWebpProps {
  size?: number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
}

const IconMedal3PlaceWebp: React.FC<IconMedal3PlaceWebpProps> = ({
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
      accessibilityLabel="Medal 3rd place icon"
    >
      <Image
        source={require("./medal-3rd-place.webp")}
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

export default IconMedal3PlaceWebp;
