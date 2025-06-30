import { Colors } from "@/styles/theme";
import * as React from "react";
import { View } from "react-native";
import Svg, { SvgProps, Path } from "react-native-svg";
const IconEyeClose = (props: SvgProps) => (
  <View
    accessibilityValue={{ text: "Icon eye close" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.disable}
        d="M3.8 9.64a1 1 0 1 1 1.91-.57c2.09 6.98 11.99 6.98 14.07 0a1 1 0 0 1 1.92.57 9.5 9.5 0 0 1-1.81 3.42l1.27 1.27a1 1 0 0 1-1.41 1.42l-1.31-1.31a9.1 9.1 0 0 1-2.32 1.27l.36 1.33a1 1 0 1 1-1.94.52l-.36-1.36a9.8 9.8 0 0 1-2.86 0l-.37 1.36a1 1 0 1 1-1.93-.52l.36-1.33a9.1 9.1 0 0 1-2.32-1.27l-1.3 1.3a1 1 0 1 1-1.42-1.4l1.27-1.28A9.54 9.54 0 0 1 3.8 9.64Z"
      />
    </Svg>
  </View>
);
export default IconEyeClose;
