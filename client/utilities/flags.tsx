import { Flag } from "react-native-svg-flagkit";
import { View } from "react-native";
import React from "react";

const SingleFlag = ({ id, size = 1, width, height }: { id: string; size?: number; width?: number; height?: number }) => {
  return (
    <View>
      <Flag id={id} size={size} width={width} height={height} />
    </View>
  );
};

export default SingleFlag;