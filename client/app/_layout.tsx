import React, { useEffect } from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TextProps,
  TextInputProps,
  Platform,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@/styles/theme";
import { useCustomFonts } from "@/hooks/useCustomFonts";

// Override with safe type casting
const overrideDefaultFont = () => {
  const textRender = (Text as any).render;
  (Text as any).render = function (...args: any[]) {
    const origin = textRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [{ fontFamily: "NotoSans-Regular" }, origin.props.style],
    });
  };

  const inputRender = (TextInput as any).render;
  (TextInput as any).render = function (...args: any[]) {
    const origin = inputRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [{ fontFamily: "NotoSans-Regular" }, origin.props.style],
    });
  };
};

export default function RootLayout() {
  const [fontsLoaded] = useCustomFonts();

  useEffect(() => {
    if (fontsLoaded) {
      overrideDefaultFont();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: Colors.bgGray }}>
          <Slot />
        </View>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
