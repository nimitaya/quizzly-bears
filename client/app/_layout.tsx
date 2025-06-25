import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { Colors } from "@/styles/theme";

export default function RootLayout() {
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
