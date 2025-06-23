import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconArrowBack = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon arrow back" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.black}
        d="m7.83 13 5.6 5.6L12 20l-8-8 8-8 1.43 1.4-5.6 5.6H20v2H7.82Z"
      />
    </Svg>
  </View>
);
export default IconArrowBack;
