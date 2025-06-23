import * as React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconProfilTab = () => (
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
        fill={Colors.black}
        d="M12 12c-1.1 0-2.04-.4-2.82-1.18A3.85 3.85 0 0 1 8 8c0-1.1.4-2.04 1.18-2.83A3.85 3.85 0 0 1 12 4c1.1 0 2.04.4 2.82 1.17A3.85 3.85 0 0 1 16 8c0 1.1-.4 2.04-1.18 2.82A3.85 3.85 0 0 1 12 12Zm-8 8v-2.8a2.93 2.93 0 0 1 1.6-2.65A14.36 14.36 0 0 1 12 13a14.35 14.35 0 0 1 6.4 1.55c.48.25.87.62 1.15 1.1.3.47.45.98.45 1.55V20H4Zm2-2h12v-.8a.88.88 0 0 0-.15-.5.88.88 0 0 0-.35-.35A12.53 12.53 0 0 0 12 15a12.53 12.53 0 0 0-5.5 1.35c-.15.08-.28.2-.38.35-.08.15-.12.32-.12.5v.8Zm6-8c.55 0 1.02-.2 1.4-.57.4-.4.6-.88.6-1.43 0-.55-.2-1.02-.6-1.4-.38-.4-.85-.6-1.4-.6-.55 0-1.03.2-1.43.6A1.9 1.9 0 0 0 10 8c0 .55.2 1.03.57 1.43.4.38.88.57 1.43.57Z"
      />
    </Svg>
  </View>
);
export default IconProfilTab;
