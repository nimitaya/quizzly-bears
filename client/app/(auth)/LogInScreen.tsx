import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import GoogleSignInButton from "@/app/(auth)/GoogleSignInButton";
import FacebookInButton from "@/app/(auth)/FacebookSignInButton";
import { Gaps, FontSizes, FontWeights } from "@/styles/theme";
import { ButtonSecondary } from "@/components/Buttons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useRouter } from "expo-router";

const LogInScreen = () => {
  const router = useRouter();
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
        icon={<Fontisto name="email" size={24} color="black" />}
        onPress={EmailLogIn}
      />
      <ButtonSecondary
        text="Sign Up"
        onPress={SignUp}
        style={{ marginTop: Gaps.g16 }}
      />
      <TouchableOpacity onPress={Skip}>
        <Text style={styles.text}>Skip</Text>
      </TouchableOpacity>
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
    fontWeight: "400",
    textAlign: "center",
    marginTop: Gaps.g16,
    marginHorizontal: Gaps.g16,
  },
});
