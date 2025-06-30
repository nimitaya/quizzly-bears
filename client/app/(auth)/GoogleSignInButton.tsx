import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ButtonSecondary } from "@/components/Buttons";
import { Alert, Platform, ActivityIndicator } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "@/styles/theme";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

const GoogleSignInButton = () => {
  const router = useRouter();
  const { isLoaded: authLoaded } = useAuth();
  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_google",
    redirectUrl: Platform.OS === "web" ? window.location.origin : undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { refreshGlobalState } = useGlobalLoading();

  const GoogleForm = async () => {
    try {
      setIsLoading(true);

      // IMPORTANT: For mobile, show loading screen during OAuth flow
      if (Platform.OS !== "web") {
        router.push("../Loading");
      }

      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        // IMPORTANT: Update global auth state
        await refreshGlobalState();

        // IMPORTANT: Set navigation flags for AuthNavigationHelper
        await AsyncStorage.setItem("auth_navigation_pending", "true");
        await AsyncStorage.setItem(
          "auth_navigation_destination",
          "/(tabs)/play"
        );

        // Special case for web platforms
        if (Platform.OS === "web") {
          router.replace("/(tabs)/play");
        }
      } else {
        if (Platform.OS !== "web") {
          await AsyncStorage.setItem("auth_navigation_pending", "true");
          await AsyncStorage.setItem(
            "auth_navigation_destination",
            "/(auth)/LogInScreen"
          );
        } else {
          router.replace("/(auth)/LogInScreen");
        }
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);

      if (Platform.OS !== "web") {
        await AsyncStorage.setItem("auth_navigation_pending", "true");
        await AsyncStorage.setItem(
          "auth_navigation_destination",
          "/(auth)/LogInScreen"
        );
      } else {
        router.replace("/(auth)/LogInScreen");
      }

      Alert.alert("Error", err.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!authLoaded) return null;

  return (
    <ButtonSecondary
      text={
        isLoading && Platform.OS === "web"
          ? "Signing in..."
          : "Log in with Google"
      }
      icon={
        isLoading && Platform.OS === "web" ? (
          <ActivityIndicator size="small" color={Colors.primaryLimo} />
        ) : (
          <SimpleLineIcons
            name="social-google"
            size={24}
            color={Colors.black}
          />
        )
      }
      onPress={GoogleForm}
      disabled={isLoading}
    />
  );
};

export default GoogleSignInButton;
