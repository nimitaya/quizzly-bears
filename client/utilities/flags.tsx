import React from "react";
import { View } from "react-native";
import CountryFlag from "react-native-country-flag";

const SingleFlag = ({
  id,
  size = 0.2,
}: {
  id: string;
  size?: number;
}) => {
  // Convertimos el "size" a un valor en píxeles (ej: 0.2 => 20px)
  const pixelSize = size * 150;

  return (
    <View>
      <CountryFlag isoCode={id.toUpperCase()} size={pixelSize} />
    </View>
  );
};

export default SingleFlag;
