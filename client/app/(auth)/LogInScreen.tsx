import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import GoogleSignInButton from "@/app/(auth)/GoogleSignInButton";
import FacebookInButton from "@/app/(auth)/FacebookSignInButton";
import { Gaps, FontSizes, Colors } from "@/styles/theme";
import { ButtonSecondary, ButtonSkip } from "@/components/Buttons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { navigationState } from "@/utilities/navigationStateManager";

const LogInScreen = () => {
  const router = useRouter();

  // Reset navigation state when auth screen mounts
  useEffect(() => {
    navigationState.endAuthNavigation();
  }, []);

  // Navigation handlers
  const EmailLogIn = () => {
    router.push("/(auth)/LogIn");
  };

  const SignUp = () => {
    router.push("/(auth)/SignUp");
  };

  const Skip = () => {
    router.replace("/(tabs)/play");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: Gaps.g16,
      }}
    >
      <Text style={styles.textH1}>Log in / Sign Up</Text>
      <Text style={styles.text}>
        Create an account or log in to save your progress and connect with
        friends to explore together.
      </Text>
      <Text style={[styles.text, { marginBottom: Gaps.g16 }]}>
        You can always skip this step for now and come back later!
      </Text>
      <GoogleSignInButton />
      <FacebookInButton />
      <ButtonSecondary
        text="Log in with e-mail"
        icon={<Fontisto name="email" size={24} color={Colors.darkGreen} />}
        onPress={EmailLogIn}
      />
      <ButtonSecondary
        text="Sign Up"
        onPress={SignUp}
        style={{ marginTop: Gaps.g16 }}
      />
      <ButtonSkip text="Skip" onPress={Skip} />
    </View>
  );
};

export default LogInScreen;

const styles = StyleSheet.create({
  textH1: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    textAlign: "center",
  },
  text: {
    fontSize: FontSizes.TextLargeFs,
    textAlign: "center",
    marginTop: Gaps.g16,
    marginHorizontal: Gaps.g16,
  },
});
