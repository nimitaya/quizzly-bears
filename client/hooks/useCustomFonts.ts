import { useFonts } from "expo-font";

export const useCustomFonts = () =>
  useFonts({
    "NotoSans-Regular": require("@/assets/fonts/NotoSans-Regular.ttf"),
    "NotoSans-Bold": require("@/assets/fonts/NotoSans-Bold.ttf"),
    "NotoSans-SemiBold": require("@/assets/fonts/NotoSans-SemiBold.ttf"),
  });
