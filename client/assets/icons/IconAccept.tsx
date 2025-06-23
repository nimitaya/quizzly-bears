import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconAccept = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon accept" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.primaryLimo}
        stroke={Colors.black}
        strokeWidth={0.5}
        d="m21.34 6.66-.17.18L8.82 19.18l-.17.17-7-6.99 2.02-2 4.98 4.97 10.5-10.5.18-.18 2.01 2Z"
      />
    </Svg>
  </View>
);
export default IconAccept;
