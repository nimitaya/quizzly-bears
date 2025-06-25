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
