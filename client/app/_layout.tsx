import React, { useEffect } from "react";
import { Text, TextInput, View } from "react-native";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
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
import { LanguageProvider } from "@/providers/LanguageContext";
import { SocketProvider } from "@/providers/SocketProvider";
import { QuizProvider } from "@/providers/QuizProvider";

// ========== Override system fonts globally ==========
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
    if (fontsLoaded) overrideDefaultFont();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <SocketProvider>
        <UserProvider>
          <LanguageProvider>
            <OnboardingProvider>
              <GlobalLoadingProvider>
                <NetworkAlertProvider>
                  <SafeAreaProvider>
                    <MusicProvider>
                      <SoundProvider>
                        <QuizProvider>
                          <View
                            style={{ flex: 1, backgroundColor: Colors.bgGray }}
                          >
                            <AuthNavigationHelper />
                            <Slot />
                          </View>
                        </QuizProvider>
                      </SoundProvider>
                    </MusicProvider>
                  </SafeAreaProvider>
                </NetworkAlertProvider>
              </GlobalLoadingProvider>
            </OnboardingProvider>
          </LanguageProvider>
        </UserProvider>
      </SocketProvider>
    </ClerkProvider>
  );
}
