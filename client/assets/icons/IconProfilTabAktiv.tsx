import * as React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconProfilTabAktiv = () => (
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
    <Svg width={24} height={24} fill="none">
      <Path
        fill={Colors.primaryLimo}
        stroke={Colors.black}
        d="M12 12.5a14.71 14.71 0 0 1 6.22 1.4l.4.2h.01c.56.3 1.01.73 1.34 1.28l.12.2c.27.5.41 1.04.41 1.62v3.3h-17v-3.3c0-.65.17-1.26.5-1.8v-.01c.35-.56.8-1 1.37-1.28A14.86 14.86 0 0 1 12 12.5Zm0 0c1.23 0 2.3-.44 3.18-1.32A4.35 4.35 0 0 0 16.5 8c0-1.23-.44-2.3-1.32-3.18A4.35 4.35 0 0 0 12 3.5c-1.23 0-2.3.44-3.18 1.32A4.35 4.35 0 0 0 7.5 8c0 1.23.44 2.3 1.32 3.18A4.35 4.35 0 0 0 12 12.5Zm0 3c-.9 0-1.77.11-2.65.34h-.01c-.87.2-1.74.52-2.6.95a.57.57 0 0 0-.19.17.52.52 0 0 0-.05.24v.3h11v-.3a.38.38 0 0 0-.07-.22v-.02l-.02-.02a.38.38 0 0 0-.15-.15c-.86-.43-1.73-.75-2.6-.95A10.7 10.7 0 0 0 12 15.5Zm0-9c-.41 0-.76.14-1.07.45A1.4 1.4 0 0 0 10.5 8c0 .42.14.77.43 1.07.3.3.65.43 1.07.43.42 0 .76-.14 1.05-.43.3-.3.45-.66.45-1.07 0-.41-.14-.75-.45-1.04l-.01-.01c-.3-.3-.63-.45-1.04-.45Z"
      />
    </Svg>
  </View>
);
export default IconProfilTabAktiv;
