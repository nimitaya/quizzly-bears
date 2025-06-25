import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ButtonSecondary } from "@/components/Buttons";
import { Alert } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { useState } from "react";

const GoogleSignInButton = () => {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [isLoading, setIsLoading] = useState(false);

  const GoogleForm = async () => {
    try {
      setIsLoading(true);
      router.push("../Loading");
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        Alert.alert("Success", "Signed in with Google!");
        router.replace("/(tabs)/play");
      } else {
        router.back();
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      Alert.alert("Error", err.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ButtonSecondary
      text="Log in with Google"
      icon={<SimpleLineIcons name="social-google" size={24} color="black" />}
      onPress={GoogleForm}
    />
  );
};
export default GoogleSignInButton;
