import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ButtonSecondary } from "@/components/Buttons";
import { Alert } from "react-native";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";

const FacebookInButton = () => {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_facebook" });

  const FacebookForm = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        Alert.alert("Success", "Signed in with Facebook!");
      }
    } catch (err: any) {
      console.error("Facebook OAuth error:", err);
      Alert.alert("Error", err.message || "Facebook sign-in failed");
    }
  };

  return (
    <ButtonSecondary
      text="Log in with Facebook"
      icon={<SimpleLineIcons name="social-facebook" size={24} color="black" />}
      onPress={FacebookForm}
    />
  );
};
export default FacebookInButton;
