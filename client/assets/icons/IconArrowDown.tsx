import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";

const IconArrowDown = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon arrow down" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.black}
        d="M12 20l-8-8 1.4-1.4 5.6 5.6V4h2.8v12.2l5.6-5.6L20 12l-8 8z"
      />
    </Svg>
  </View>
);

export default IconArrowDown; 