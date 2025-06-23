import * as React from "react";
import { View } from "react-native";
import Svg, { ClipPath, Defs, G, Mask, Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconStatisticsTab = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Statistics" }}
    accessibilityRole="image"
  >
    <Svg width={25} height={25} fill="none" {...props}>
      <G clipPath="url(#a)">
        <Mask
          id="b"
          width={25}
          height={25}
          x={0}
          y={0}
          fill={Colors.black}
          maskUnits="userSpaceOnUse"
        >
          <Path fill={Colors.white} d="M0 0h25v25H0z" />
          <Path d="M1 0h24v24H1V0Z" />
        </Mask>
        <Path
          fill={Colors.black}
          d="M22.92 6.62A1 1 0 0 0 22 6h-5a1 1 0 0 0 0 2h2.59L14 13.59l-3.29-3.3a1 1 0 0 0-1.42 0l-6 6A1 1 0 0 0 4 18.01a1 1 0 0 0 .71-.3l5.29-5.3 3.29 3.3a1 1 0 0 0 1.42 0L21 9.41V12a1 1 0 0 0 2 0V7a1 1 0 0 0-.08-.38Z"
        />
      </G>
      <Path
        fill={Colors.black}
        d="M1 24H0v1h1v-1Zm24 0v-1H1v2h24v-1ZM1 24h1V0H0v24h1Z"
        mask="url(#b)"
      />
      <Defs>
        <ClipPath id="a">
          <Path fill={Colors.white} d="M1 0h24v24H1V0Z" />
        </ClipPath>
      </Defs>
    </Svg>
  </View>
);
export default IconStatisticsTab;
