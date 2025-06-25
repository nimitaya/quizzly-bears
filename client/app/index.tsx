import { useEffect } from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo"; // Add this import
import { Colors } from "@/styles/theme";
import { FontSizes } from "@/styles/theme";
import { ButtonPrimary } from "@/components/Buttons";

export default function WelcomeScreen() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const IndexNavigation = () => {
    if (isSignedIn) {
      router.replace("/(tabs)/play");
    } else {
      router.replace("/(auth)/LogInScreen");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: Colors.black, fontSize: FontSizes.H1Fs }}>
        Quizzly Bears Guide
      </Text>
      <Text>AI-Generated Get unique quizzes created by AI!</Text>
      <ButtonPrimary text="Next" onPress={IndexNavigation} />
    </View>
  );
}
