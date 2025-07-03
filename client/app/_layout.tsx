import React, { useEffect } from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import { View, Text, TextInput } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@/styles/theme";
import { useCustomFonts } from "@/hooks/useCustomFonts";
import NetworkAlertProvider from "@/providers/NetworkAlertProvider";
import AuthNavigationHelper from "@/components/AuthNavigationHelper";
import { GlobalLoadingProvider } from "@/providers/GlobalLoadingProvider";
import { UserProvider } from "@/providers/UserProvider";
import { MusicProvider } from "@/providers/MusicProvider";
import { SoundProvider } from "@/providers/SoundProvider";
import { OnboardingProvider } from "@/providers/OnboardingProvider";


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
      <UserProvider>
         <OnboardingProvider>
        <GlobalLoadingProvider>
          <NetworkAlertProvider>
            <SafeAreaProvider>
              <MusicProvider>
                <SoundProvider>
                  <View style={{ flex: 1, backgroundColor: Colors.bgGray }}>
                    <AuthNavigationHelper />
                    <Slot />
                  </View>
                </SoundProvider>
              </MusicProvider>
            </SafeAreaProvider>
          </NetworkAlertProvider>
        </GlobalLoadingProvider>
            </OnboardingProvider>

      </UserProvider>
    </ClerkProvider>
  );
}
