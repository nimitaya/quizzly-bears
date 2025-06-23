import * as React from "react";
import { View } from "react-native";
import Svg, { ClipPath, Defs, G, Mask, Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconStatisticsTabAktiv = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Statistics aktiv" }}
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
          fill={Colors.primaryLimo}
          stroke={Colors.black}
          d="M23.5 12a1.5 1.5 0 0 1-3 0v-1.38l-5.44 5.44a1.5 1.5 0 0 1-2.13 0L10 13.12l-4.94 4.94a1.5 1.5 0 0 1-2.13 0 1.5 1.5 0 0 1 0-2.13l6-6a1.5 1.5 0 0 1 2.13 0L14 12.89l4.38-4.38H17a1.5 1.5 0 0 1 0-3h5.15c.15.02.3.06.43.12A1.5 1.5 0 0 1 23.5 7v5Z"
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
export default IconStatisticsTabAktiv;
