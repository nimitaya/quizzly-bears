import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ButtonSecondary } from "@/components/Buttons";
import { Alert, Platform, ActivityIndicator } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useState, useEffect, useRef } from "react";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "@/styles/theme";

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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const previousScreen = useRef("");

  // Helper function to handle navigation back
  const navigateBack = () => {
    if (Platform.OS !== "web") {
      if (previousScreen.current === "back" && router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(auth)/LogInScreen");
      }
    }
  };

  // handle navigation back
  useEffect(() => {
    if (isAuthenticating && Platform.OS !== "web") {
      previousScreen.current = router.canGoBack()
        ? "back"
        : "/(auth)/LogInScreen";
      router.push("../Loading");
    }
  }, [isAuthenticating]);

  const GoogleForm = async () => {
    try {
      setIsLoading(true);
      setIsAuthenticating(true);

      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)/play");
      } else {
        navigateBack();
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      navigateBack();
      Alert.alert("Error", err.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
      setIsAuthenticating(false);
    }
  };

  if (!authLoaded) return null;
  if (isAuthenticating && Platform.OS !== "web") {
    return null;
  }
  return (
    <ButtonSecondary
      text={
        isLoading && Platform.OS === "web"
          ? "Signing in..."
          : "Log in with Google"
      }
      icon={
        isLoading && Platform.OS === "web" ? (
          <ActivityIndicator size="small" color={Colors.black} />
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
