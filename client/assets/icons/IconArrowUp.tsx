import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";

const IconArrowUp = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon arrow up" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.black}
        d="M12 4l8 8-1.4 1.4-5.6-5.6V20h-2.8V7.8L6.4 13.4 5 12l7-8z"
      />
    </Svg>
  </View>
);

export default IconArrowUp; 