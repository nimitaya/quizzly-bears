import * as React from "react";
import { View } from "react-native";
import Svg, { SvgProps, Path } from "react-native-svg";
import { Colors } from "../../styles/theme";
const IconProfilTabAktiv = (props: SvgProps) => (
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
    <Svg width={25} height={24} fill="none" {...props}>
      <Path
        fill={Colors.primaryLimo}
        stroke={Colors.black}
        d="M12.88 12.52c1.27 0 2.53.16 3.77.49l.47.12c.92.26 1.84.62 2.74 1.06l.45.23c.63.34 1.12.84 1.48 1.49.4.63.59 1.34.59 2.1v3.82h-19v-3.82c0-.76.18-1.46.54-2.1.38-.64.89-1.14 1.52-1.49a16.12 16.12 0 0 1 7.43-1.9Zm0 3.38a13.12 13.12 0 0 0-5.94 1.54.73.73 0 0 0-.24.22c-.05.1-.07.21-.08.35v.45h12.5V18a.59.59 0 0 0-.09-.33v-.01l-.02-.02a.53.53 0 0 0-.2-.22c-.97-.51-1.95-.89-2.93-1.13h-.01c-1-.27-1.99-.4-3-.4Zm0-14.07c1.38 0 2.56.53 3.54 1.56a5.2 5.2 0 0 1 1.45 3.7 5.2 5.2 0 0 1-1.45 3.7 4.72 4.72 0 0 1-3.55 1.54 4.72 4.72 0 0 1-3.54-1.55 5.2 5.2 0 0 1-1.46-3.7 5.2 5.2 0 0 1 1.46-3.7 4.72 4.72 0 0 1 3.54-1.55Zm0 3.38c-.48 0-.88.17-1.25.56-.33.35-.5.78-.5 1.31s.16.97.5 1.35c.36.36.77.53 1.24.53.48 0 .88-.17 1.22-.53.36-.38.54-.82.54-1.35 0-.52-.18-.95-.54-1.3v-.01l-.01-.01a1.55 1.55 0 0 0-1.2-.55Z"
      />
    </Svg>
  </View>
);
export default IconProfilTabAktiv;
