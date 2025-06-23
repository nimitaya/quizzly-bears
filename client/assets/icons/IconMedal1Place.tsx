import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconMedal1Place = (props: SvgProps) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon medal 1st place" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        stroke={Colors.black}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5 15c0-3.87 3.02-7 6.75-7h.5A6.88 6.88 0 0 1 19 15c0 3.87-3.02 7-6.75 7h-.5A6.88 6.88 0 0 1 5 15Z"
      />
      <Path
        stroke={Colors.black}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12.5 18v-5.05c0-.58 0-.86-.23-.93-.5-.16-1.27.98-1.27.98m1.5 5H11m1.5 0H14m-.44-16L11 7.9M18 2l-2.82 6.5M10.44 2 12 5.6M6 2l2.82 6.5"
      />
    </Svg>
  </View>
);
export default IconMedal1Place;
