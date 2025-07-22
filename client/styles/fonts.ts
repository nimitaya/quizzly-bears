import { useFonts } from "expo-font";
import {
  NotoSans_400Regular,
  NotoSans_700Bold,
  NotoSans_600SemiBold,
} from "@expo-google-fonts/noto-sans";

export const useCustomFonts = () => {
  return useFonts({
    "NotoSans-Regular": NotoSans_400Regular,
    "NotoSans-Bold": NotoSans_700Bold,
    "NotoSans-SemiBold": NotoSans_600SemiBold,
  });
};

export const Fonts = {
  pressStart2P: "NotoSans-Bold",
};

export const fontImports = {
  pressStart2P:
    "https://fonts.googleapis.com/css2?family=Press+Start+2P:wght@400;700&display=swap",
};
