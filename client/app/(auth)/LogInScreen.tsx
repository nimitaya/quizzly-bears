import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import GoogleSignInButton from "@/app/(auth)/GoogleSignInButton";
import FacebookInButton from "@/app/(auth)/FacebookSignInButton";
import { Gaps, FontSizes, Colors } from "@/styles/theme";
import { ButtonSecondary, ButtonSkip } from "@/components/Buttons";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useRouter } from "expo-router";
import { useTranslation } from "@/hooks/useTranslation";

const LogInScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();

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
      <Text style={styles.textH1}>{t("logInSignUp")}</Text>
      <Text style={styles.text}>
        {t("createAccountOrLogin")}
      </Text>
      <Text style={[styles.text, { marginBottom: Gaps.g16 }]}>
        {t("saveProgressConnectFriends")}
      </Text>
      <GoogleSignInButton />
      <FacebookInButton />
      <ButtonSecondary
        text={t("logInWithEmail")}
        icon={<Fontisto name="email" size={24} color={Colors.darkGreen} />}
        onPress={EmailLogIn}
      />
      <ButtonSecondary
        text={t("signUp")}
        onPress={SignUp}
        style={{ marginTop: Gaps.g16 }}
      />
      <ButtonSkip text={t("skipForNow")} onPress={Skip} />
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
