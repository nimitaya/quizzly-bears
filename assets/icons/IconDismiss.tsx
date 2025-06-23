import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconDismiss = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon dismiss" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.systemRed}
        stroke={Colors.black}
        strokeWidth={0.5}
        d="m20.35 5.6-6.4 6.4 6.4 6.4-1.95 1.95-6.4-6.4-6.4 6.4-1.95-1.95 6.4-6.4-6.4-6.4L5.6 3.65l6.4 6.4 6.4-6.4 1.95 1.95Z"
      />
    </Svg>
  </View>
);
export default IconDismiss;
