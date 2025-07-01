import * as React from "react";
import { View } from "react-native";
import Svg, { SvgProps, Path } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconProfilTab = (props: SvgProps) => (
  <View
    style={{
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    }}
    accessibilityValue={{ text: "Profil aktiv" }}
    accessibilityRole="image"
  >
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fill={Colors.black}
        d="M12 12a4.81 4.81 0 0 1-3.53-1.47A4.81 4.81 0 0 1 7 7c0-1.38.49-2.55 1.47-3.53A4.81 4.81 0 0 1 12 2c1.38 0 2.55.49 3.53 1.47A4.81 4.81 0 0 1 17 7c0 1.38-.49 2.55-1.47 3.53A4.81 4.81 0 0 1 12 12ZM2 22v-3.5a3.66 3.66 0 0 1 2-3.31 17.95 17.95 0 0 1 8-1.94 17.95 17.95 0 0 1 8 1.94c.6.31 1.08.77 1.44 1.37.37.59.56 1.23.56 1.94V22H2Zm2.5-2.5h15v-1c0-.23-.06-.44-.19-.63a1.1 1.1 0 0 0-.43-.43A15.66 15.66 0 0 0 12 15.75a15.66 15.66 0 0 0-6.88 1.69c-.18.1-.34.25-.46.43-.1.2-.16.4-.16.63v1Zm7.5-10c.69 0 1.27-.24 1.75-.72.5-.5.75-1.1.75-1.78 0-.69-.25-1.27-.75-1.75A2.33 2.33 0 0 0 12 4.5c-.69 0-1.28.25-1.78.75A2.38 2.38 0 0 0 9.5 7c0 .69.24 1.28.72 1.78.5.48 1.1.72 1.78.72Z"
      />
    </Svg>
  </View>
);
export default IconProfilTab;
