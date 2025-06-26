import React from "react";
import { View, Image } from "react-native";

const IconBearTab = () => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityLabel="Bear Tab"
    accessibilityRole="image"
  >
    <Image
      source={require("../images/Logo-Bear-black.png")}
      style={{ width: 32, height: 32 }}
      resizeMode="contain"
    />
  </View>
);

export default IconBearTab;
