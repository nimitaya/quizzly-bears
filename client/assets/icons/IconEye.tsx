import { Colors } from "@/styles/theme";
import * as React from "react";
import { View } from "react-native";
import Svg, { SvgProps, Path } from "react-native-svg";
const IconEye = (props: SvgProps) => (
  <View accessibilityValue={{ text: "Icon eye" }} accessibilityRole="image">
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.disable}
        d="M12 9.33a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 8a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-12.5c-5 0-9.27 3.11-11 7.5a11.83 11.83 0 0 0 22 0c-1.73-4.39-6-7.5-11-7.5Z"
      />
    </Svg>
  </View>
);
export default IconEye;
