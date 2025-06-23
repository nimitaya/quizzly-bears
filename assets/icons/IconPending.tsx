import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconPending = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Pending" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.black}
        d="M4 3.68c0-.18.07-.35.2-.48.12-.13.29-.2.47-.2h14.66c.18 0 .35.07.47.2a.68.68 0 0 1 0 .96c-.12.13-.29.2-.47.2H18V5.7a6.19 6.19 0 0 1-3.4 5.51c-.4.2-.6.52-.6.8v.96c0 .28.2.6.6.8a6.04 6.04 0 0 1 3.4 5.5v1.36h1.33c.18 0 .35.07.47.2a.68.68 0 0 1 0 .96c-.12.13-.29.2-.47.2H4.67a.66.66 0 0 1-.47-.2.68.68 0 0 1 0-.96c.12-.13.29-.2.47-.2H6V19.3a6.19 6.19 0 0 1 3.4-5.51c.4-.2.6-.52.6-.8v-.96c0-.28-.2-.6-.6-.8A6.04 6.04 0 0 1 6 5.72V4.35H4.67a.66.66 0 0 1-.47-.2.68.68 0 0 1-.2-.48Zm3.33.68V5.7A4.81 4.81 0 0 0 10 10a2.3 2.3 0 0 1 1.34 2.02v.96A2.3 2.3 0 0 1 10 15a4.7 4.7 0 0 0-2.66 4.29v1.35h9.34V19.3A4.81 4.81 0 0 0 14 15a2.3 2.3 0 0 1-1.34-2.02v-.96c0-.95.63-1.67 1.34-2.02a4.7 4.7 0 0 0 2.66-4.29V4.36H7.33Z"
      />
    </Svg>
  </View>
);
export default IconPending;
