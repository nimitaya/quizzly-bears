import * as React from "react";
import { View } from "react-native";
import Svg, { Path, Rect, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconAddFriend = (props: SvgProps) => (
  <View
    style={{
      width: 80,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Add friend" }}
    accessibilityRole="image"
  >
    <Svg width={80} height={32} fill="none" {...props}>
      <Rect width={80} height={32} fill={Colors.primaryLimo} rx={16} />
      <Path
        fill={Colors.black}
        d="M27 17h-6v-2h6V9h2v6h6v2h-6v6h-2v-6Zm18.85 4.1a10.18 10.18 0 0 1 12.3 0 7.53 7.53 0 0 0 1.35-2.33c.33-.86.5-1.79.5-2.77 0-2.22-.78-4.1-2.35-5.65A7.65 7.65 0 0 0 52 8c-2.22 0-4.1.78-5.67 2.35A7.7 7.7 0 0 0 44 16c0 .98.16 1.9.48 2.77.33.87.79 1.65 1.37 2.33ZM52 17a3.45 3.45 0 0 1-3.5-3.5c0-.98.33-1.8 1-2.47A3.4 3.4 0 0 1 52 10c.98 0 1.8.34 2.48 1.03.68.66 1.02 1.49 1.02 2.47a3.4 3.4 0 0 1-1.02 2.5c-.67.67-1.5 1-2.48 1Zm0 9a9.87 9.87 0 0 1-7.08-2.93A9.87 9.87 0 0 1 42 16a9.87 9.87 0 0 1 6.1-9.2A9.6 9.6 0 0 1 52 6a9.6 9.6 0 0 1 3.9.8 9.93 9.93 0 0 1 5.3 13.1A9.93 9.93 0 0 1 52 26Zm0-2c.88 0 1.72-.13 2.5-.38.78-.26 1.5-.64 2.15-1.12A7.7 7.7 0 0 0 52 21a7.7 7.7 0 0 0-4.65 1.5c.65.48 1.37.86 2.15 1.13.78.25 1.62.37 2.5.37Zm0-9a1.46 1.46 0 0 0 1.5-1.5A1.46 1.46 0 0 0 52 12a1.46 1.46 0 0 0-1.5 1.5A1.46 1.46 0 0 0 52 15Z"
      />
    </Svg>
  </View>
);
export default IconAddFriend;
