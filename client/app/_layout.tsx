import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function RootLayout() {
  return (

    <ClerkProvider tokenCache={tokenCache}>
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
    </ClerkProvider>

  );
}
