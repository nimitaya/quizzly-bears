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
import { navigationState } from "@/utilities/navigationStateManager";
import { useSocket } from "@/providers/SocketProvider";

// Initialize WebBrowser for web platform
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
  const { initialize } = useSocket();

  const GoogleForm = async () => {
    try {
      setIsLoading(true);
      navigationState.startAuthNavigation();

      if (Platform.OS !== "web") {
        router.push("../Loading");
      }

      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        await refreshGlobalState();
        await AsyncStorage.setItem("auth_navigation_pending", "true");
        await AsyncStorage.setItem(
          "auth_navigation_destination",
          "/(tabs)/play"
        );

        if (Platform.OS === "web") {
          navigationState.startAuthNavigation();
          setTimeout(async () => {
            try {
              await initialize();
              router.replace("/(tabs)/play");
            } catch {
              router.replace("/(tabs)/play");
            }
          }, 800);
        } else {
          await AsyncStorage.setItem("socket_needs_reconnect", "true");
        }
      } else {
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
    } catch {
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
