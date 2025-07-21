import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";

const IconArrowRight = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon arrow right" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.black}
        d="M20 12l-8-8-1.4 1.4 5.6 5.6H4v2.8h12.2l-5.6 5.6L12 20l8-8z"
      />
    </Svg>
  </View>
);

export default IconArrowRight; 