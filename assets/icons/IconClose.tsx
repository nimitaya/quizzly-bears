import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const SvgComponent = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon close" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.black}
        d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19Z"
      />
    </Svg>
  </View>
);
export default SvgComponent;
