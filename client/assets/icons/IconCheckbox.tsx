import * as React from "react";
import { View } from "react-native";
import Svg, { SvgProps, Rect, Path } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconCheckbox = (props: SvgProps) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon checkbox" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Rect
        width={18}
        height={18}
        x={3}
        y={3}
        fill={Colors.primaryLimo}
        rx={2}
      />
      <Path
        fill={Colors.black}
        d="m10 16.4-4-4L7.4 11l2.6 2.6L16.6 7 18 8.4l-8 8Z"
      />
    </Svg>
  </View>
);
export default IconCheckbox;
