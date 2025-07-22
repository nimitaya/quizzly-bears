import React from "react";
import { View } from "react-native";
import CountryFlag from "react-native-country-flag";

const SingleFlag = ({ id, size = 0.2 }: { id: string; size?: number }) => {
  const pixelSize = size * 150;

  return (
    <View>
      <CountryFlag isoCode={id.toUpperCase()} size={pixelSize} />
    </View>
  );
};

export default SingleFlag;
