import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ButtonSecondary } from "@/components/Buttons";
import { Platform, ActivityIndicator } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "@/styles/theme";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/CustomAlert";
// Add these imports for socket handling
import socketService from "@/utilities/socketService";
import { navigationState } from "@/utilities/navigationStateManager";
import { useSocket } from "@/providers/SocketProvider";

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
  // Get socket initialize function
  const { initialize } = useSocket();

  const GoogleForm = async () => {
    try {
      setIsLoading(true);

      // Preserve socket during navigation to loading screen
      navigationState.startAuthNavigation();

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
          // ADDED: Socket reconnection for web
          console.log("🔄 Google OAuth successful - reconnecting socket");
          // Start auth navigation to preserve socket during navigation
          navigationState.startAuthNavigation();

          // Wait for auth state to update before reconnecting socket
          setTimeout(async () => {
            try {
              await initialize();
              console.log("✅ Socket reconnected after Google OAuth");
              router.replace("/(tabs)/play");
            } catch (err) {
              console.error("❌ Socket reconnection failed:", err);
              router.replace("/(tabs)/play"); // Still navigate even if socket fails
            }
          }, 800);
        } else {
          // For mobile, add reconnection info to AsyncStorage for AuthNavigationHelper
          await AsyncStorage.setItem("socket_needs_reconnect", "true");
        }
      } else {
        // Existing code for handling cancellation...
        if (Platform.OS !== "web") {
          await AsyncStorage.setItem("auth_navigation_pending", "true");
          await AsyncStorage.setItem(
            "auth_navigation_destination",
            "/(auth)/LogInScreen"
          );
        } else {
          navigationState.startAuthNavigation();
          router.replace("/(auth)/LogInScreen");
        }
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);

      // Existing error handling...
      if (Platform.OS !== "web") {
        await AsyncStorage.setItem("auth_navigation_pending", "true");
        await AsyncStorage.setItem(
          "auth_navigation_destination",
          "/(auth)/LogInScreen"
        );
      } else {
        navigationState.startAuthNavigation();
        router.replace("/(auth)/LogInScreen");
      }

      <CustomAlert
        visible={true}
        message="Something went wrong while signing in with Google. Please try again later."
        onConfirm={() => {
          navigationState.startAuthNavigation();
          router.replace("/(auth)/LogInScreen");
        }}
        onClose={() => {
          navigationState.startAuthNavigation();
          router.replace("/(auth)/LogInScreen");
        }}
        noInternet={false}
      />;
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
