import * as React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
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
  const [error, setError] = React.useState(""); // Add error state
  const [isEmailError, setIsEmailError] = React.useState(false); // Add specific email error state

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswords = () => {
    return password === repeatPassword;
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Reset previous errors
    setError("");
    setIsEmailError(false);

    // Validate email format
    if (!validateEmail(emailAddress)) {
      setError("Please enter a valid email address");
      setIsEmailError(true);
      return;
    }

    // Validate passwords
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
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      // Check for specific email-exists error
      if (
        err.errors &&
        err.errors.some(
          (e: { code?: string; message?: string }) =>
            e.code === "form_identifier_exists" ||
            e.message?.toLowerCase().includes("email already exists") ||
            e.message?.toLowerCase().includes("email address is already in use")
        )
      ) {
        setError("This email is already registered. Please log in instead.");
        setIsEmailError(true);

        // Optionally show an alert with navigation option
        Alert.alert(
          "Account Exists",
          "An account with this email already exists.",
          [
            { text: "Try Another Email", style: "cancel" },
            {
              text: "Go to Login",
              onPress: () => router.replace("/(auth)/LogInScreen"),
            },
          ]
        );
      }
      // Handle CAPTCHA errors
      else if (
        err.errors &&
        err.errors.some((e: any) => e.code === "captcha_invalid")
      ) {
        setError(
          "Could not verify you're human. Try another authentication method."
        );
      }
      // Handle other errors
      else {
        setError(err.errors?.[0]?.message || "Failed to create account.");
      }
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
          onChangeText={(email) => {
            setEmailAddress(email);
            // Clear email error when user types
            if (isEmailError) {
              setIsEmailError(false);
              setError("");
            }
          }}
          // style={isEmailError ? styles.inputError : {}} // Add red border for email error
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
      {error !== "" && <Text style={styles.errorText}>{error}</Text>}
      <ButtonPrimary
        text="Continue"
        onPress={onSignUpPress}
        style={{ marginTop: Gaps.g16 }}
      />

      <View style={styles.linkContainer}>
        <Text>Already have an account?</Text>
        <Link href="/(auth)/LogInScreen" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Log in</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/play")}
        style={styles.skipButton}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  containerInput: {
    gap: Gaps.g8,
    width: "100%",
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    marginBottom: Gaps.g16,
  },
  errorText: {
    color: Colors.systemRed,
    marginTop: 5,
    fontSize: FontSizes.FootnoteFS,
    alignSelf: "flex-start",
    marginLeft: 5,
  },
  inputError: {
    borderColor: Colors.systemRed,
    borderWidth: 1,
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
  skipButton: {
    marginTop: Gaps.g24,
    padding: 10,
  },
  skipText: {
    color: Colors.black,
    fontSize: FontSizes.TextSmallFs,
  },
});
