import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ButtonSecondary } from "@/components/Buttons";
import { Alert } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

const GoogleSignInButton = () => {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const GoogleForm = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        Alert.alert("Success", "Signed in with Google!");
        router.replace("/(tabs)/play");
      }
    } catch (err: any) {
      console.error("Google OAuth error:", err);
      Alert.alert("Error", err.message || "Google sign-in failed");
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
