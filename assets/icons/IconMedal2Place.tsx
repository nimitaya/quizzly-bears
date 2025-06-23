import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconMedal2Place = (props: SvgProps) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon medal 2st place" }}
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
        d="M10.5 13.12c.08-.79.6-1.12 1.16-1.12h.66c.55 0 1.08.33 1.16 1.12a4 4 0 0 1 0 .76c-.05.48-.63 1.03-.63 1.03l-.85.59s-1.5 1-1.5 2c0 .54.44.5.98.5h2m.08-16L11 7.9M18 2l-2.82 6.5M10.44 2 12 5.6M6 2l2.82 6.5"
      />
    </Svg>
  </View>
);
export default IconMedal2Place;
