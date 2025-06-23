import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconSearchFriend = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Search friend" }}
    accessibilityRole="image"
  >
    <Svg width={26} height={27} fill="none" {...props}>
      <Path
        fill={Colors.black}
        d="m18.04 18.65 4.28 4.29-1.42 1.41-4.27-4.29a9 9 0 1 1 1.42-1.41Zm-2-.75a7 7 0 1 0-.15.15l.15-.15Zm9.38-14.31v1.48H18.6v-1.5l6.82.02Zm-2.6-2.8-.02 7.25h-1.59l.01-7.25h1.6Z"
      />
    </Svg>
  </View>
);
export default IconSearchFriend;
