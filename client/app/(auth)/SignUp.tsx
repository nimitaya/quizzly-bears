import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { SearchInput } from "@/components/Inputs";
import { ButtonPrimary } from "@/components/Buttons";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [repeatPassword, setRepeatPassword] = React.useState("");
  const [passwordsMatch, setPasswordsMatch] = React.useState(true);
  const [pendingVerification, setPendingVerification] = React.useState(false);

  const [code, setCode] = React.useState("");
  const validatePasswords = () => {
    return password === repeatPassword;
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (!validatePasswords()) {
      setPasswordsMatch(false);
      return;
    }
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/(tabs)/play");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <SearchInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity onPress={onVerifyPress}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>
      <View style={styles.containerInput}>
        <SearchInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
        />
        <SearchInput
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        <SearchInput
          value={repeatPassword}
          placeholder="Repeat password"
          secureTextEntry={true}
          onChangeText={(text) => {
            setRepeatPassword(text);
            setPasswordsMatch(text === password);
          }}
        />
      </View>
      {!passwordsMatch && (
        <Text style={styles.errorText}>Passwords don't match</Text>
      )}
      <ButtonPrimary
        text="Continue"
        onPress={onSignUpPress}
        style={{ marginTop: Gaps.g16 }}
      />

      <View style={styles.linkContainer}>
        <Text>Already have an account?</Text>
        <Link href="/(auth)/LogInScreen" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <TouchableOpacity onPress={() => router.replace("/(tabs)/play")}>
        <Text>Skip Signup </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerInput: {
    gap: Gaps.g8,
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    marginBottom: Gaps.g16,
  },
  errorText: {
    color: Colors.systemRed,
    marginTop: 5,
    marginLeft: Gaps.g16,
    fontSize: FontSizes.FootnoteFS,
    alignSelf: "flex-start",
  },

  linkContainer: {
    flexDirection: "row",
    marginTop: Gaps.g16,
    alignItems: "center",
  },
  link: {
    color: Colors.black,
    marginLeft: 5,
    fontWeight: "600",
  },
});
