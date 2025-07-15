import React, { useEffect } from "react";
import { AppState, AppStateStatus, Text, TextInput, View } from "react-native";
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

import socketService from "@/utilities/socketService";

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

  useEffect(() => {
    console.log("Initializing socket connection from layout");

    socketService
      .initialize()
      .then(() => {
        console.log("Socket initialized successfully");
      })
      .catch((err) => {
        console.error("Socket initialization failed:", err);
      });

    let currentAppState = AppState.currentState;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        currentAppState.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("🔄 App resumed — reconnecting socket...");
        await socketService.ensureConnection();
      }

      if (
        currentAppState === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log("📴 App moved to background — disconnecting socket...");
        socketService.disconnect();
      }

      currentAppState = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => {
      subscription.remove(); // ✅ no error here, remove() exists on subscription object
      socketService.disconnect(); // cleanup on unmount
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <UserProvider>
        <LanguageProvider>
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
        </LanguageProvider>
      </UserProvider>
    </ClerkProvider>
  );
}
