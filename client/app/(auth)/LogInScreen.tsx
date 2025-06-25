import { Text, View, Alert, TouchableOpacity } from "react-native";
import GoogleSignInButton from "@/app/(auth)/GoogleSignInButton";
import FacebookInButton from "@/app/(auth)/FacebookSignInButton";
import { Gaps } from "@/styles/theme";
import { ButtonSecondary } from "@/components/Buttons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useRouter } from "expo-router";

const LogInScreen = () => {
  const router = useRouter();
  const EmailLogIn = () => {
    router.replace("/(auth)/LogIn");
  };

  const SignUp = () => {
    router.replace("/(auth)/SignUp");
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
      <Text>Log in / Sign Up</Text>
      <Text>
        Create an account or log in to save your progress and connect with
        friends to explore together.
      </Text>
      <Text>You can always skip this step for now and come back later!</Text>
      <GoogleSignInButton />
      <FacebookInButton />
      <ButtonSecondary
        text="Log in with e-mail"
        icon={<Fontisto name="email" size={24} color="black" />}
        onPress={EmailLogIn}
      />
      <ButtonSecondary text="Sign Up" onPress={SignUp} />
      <TouchableOpacity onPress={Skip}>
        <Text>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};
export default LogInScreen;
