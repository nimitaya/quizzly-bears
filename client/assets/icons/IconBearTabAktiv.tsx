import React from "react";
import { View, Image } from "react-native";

const IconBearTabAktiv = () => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityLabel="Bear TabAktiv"
    accessibilityRole="image"
  >
    <Image
      source={require("../images/Logo-Bear-green-black.webp")}
      style={{ width: 32, height: 32 }}
      resizeMode="contain"
    />
  </View>
);
export default IconBearTabAktiv;
