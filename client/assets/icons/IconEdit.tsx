import * as React from "react";
import { View } from "react-native";
import Svg, { Path, SvgProps } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconEdit = (props: SvgProps) => (
  <View
    style={{
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Icon edit" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.black}
        d="M5 19h1.42l9.78-9.78-1.42-1.42L5 17.57V19Zm-2 2v-4.25L16.2 3.57c.2-.18.42-.32.66-.42a2.07 2.07 0 0 1 1.54 0c.25.1.47.25.65.45L20.43 5c.2.18.34.4.43.65a2.14 2.14 0 0 1 0 1.51c-.09.25-.23.47-.43.67L7.25 21H3ZM15.47 8.53l-.7-.73 1.43 1.42-.72-.7Z"
      />
    </Svg>
  </View>
);
export default IconEdit;
