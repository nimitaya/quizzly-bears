import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconChat = (props: SvgProps) => (
  <View
    style={{
      width: 46,
      height: 46,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon Chat" }}
    accessibilityRole="image"
  >
    <Svg width={46} height={46} fill="none" {...props}>
      <Path
        stroke={Colors.black}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.42 17.97h19.17M13.42 28.03h13.67M23 45A22 22 0 1 0 3.25 32.69c.25.52.34 1.11.2 1.68l-1.93 8.4a1.43 1.43 0 0 0 1.71 1.72l8.4-1.94a2.52 2.52 0 0 1 1.69.21A21.88 21.88 0 0 0 23 45Z"
      />
    </Svg>
  </View>
);
export default IconChat;
