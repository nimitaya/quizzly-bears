import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconDelete = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon delete" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        stroke={Colors.systemRed}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="m17.5 9.33-.84 8.87c-.13 1.34-.19 2.01-.48 2.52-.25.45-.63.8-1.07 1.03-.51.25-1.15.25-2.43.25h-2.36c-1.28 0-1.92 0-2.43-.25a2.55 2.55 0 0 1-1.07-1.03c-.29-.5-.35-1.18-.48-2.52L5.5 9.33M13 16.2v-5.27m-3 5.27v-5.27M4 6.69h4.62m0 0L9 3.87c.11-.5.52-.87.98-.87h3.04c.46 0 .87.36.98.87l.38 2.82m-5.77 0h5.78m0 0H19"
      />
    </Svg>
  </View>
);
export default IconDelete;
