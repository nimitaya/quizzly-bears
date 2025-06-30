import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { SearchInput } from "@/components/Inputs";
import { ButtonPrimary, ButtonSkip } from "@/components/Buttons";
import CustomAlert from "@/components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import { PasswordInput } from "@/components/Inputs";

export default function LogIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { refreshGlobalState } = useGlobalLoading();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailError, setIsEmailError] = useState(false);
  const [showResetAlert, setShowResetAlert] = useState(false);

  // Prevent infinite loading on web
  const safeSetLoading = (isLoading: boolean) => {
    setIsLoading(isLoading);
    if (isLoading && Platform.OS === "web") {
      setTimeout(() => {
        setIsLoading(false);
      }, 15000);
    }
  };

  // Handle sign-in logic
  const onSignInPress = async () => {
    if (!isLoaded || isLoading) return;

    setError("");
    setIsEmailError(false);

    if (!emailAddress) {
      setError("Please enter your email");
      setIsEmailError(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setError("Please enter a valid email address");
      setIsEmailError(true);
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    safeSetLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        await refreshGlobalState();

        // Use AuthNavigationHelper pattern for navigation
        if (Platform.OS !== "web") {
          await AsyncStorage.setItem("auth_navigation_pending", "true");
          // await AsyncStorage.setItem(
          //   "auth_navigation_destination",
          //   "/(tabs)/play"
          // );
        } else {
          router.replace("/(tabs)/play");
        }
      } else {
        setError("Sign in failed. Please check your email and password.");
      }
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        if (
          err.errors.some(
            (e: any) =>
              e.code === "form_password_incorrect" ||
              e.code === "form_identifier_not_found" ||
              (e.message && e.message.toLowerCase().includes("password"))
          )
        ) {
          setError("Incorrect email or password");
        } else if (
          err.errors.some(
            (e: any) =>
              e.code === "form_identifier_not_valid" ||
              (e.message &&
                (e.message.toLowerCase().includes("valid email") ||
                  e.message.toLowerCase().includes("is invalid")))
          )
        ) {
          setError("Please enter a valid email address");
          setIsEmailError(true);
        } else {
          setError(
            err.errors[0].message || "Sign in failed. Please try again."
          );
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      safeSetLoading(false);
    }
  };

  // Show password reset alert if email is present
  const handleForgotPassword = () => {
    if (!emailAddress) {
      setError("Please enter your email first");
      setIsEmailError(true);
      return;
    }
    setShowResetAlert(true);
  };

  // Navigate to forgot password screen
  const handleResetPassword = () => {
    setShowResetAlert(false);
    router.push({
      pathname: "/(auth)/ForgotPassword",
      params: { email: emailAddress },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : Platform.OS === "android"
          ? "height"
          : undefined
      }
    >
      <Text style={styles.title}>Log in</Text>
      <View style={styles.containerInput}>
        <SearchInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => {
            setEmailAddress(email);
            if (isEmailError) {
              setIsEmailError(false);
              setError("");
            }
          }}
        />

        <PasswordInput
          value={password}
          onChangeText={(pwd: string) => {
            setPassword(pwd);
            if (
              error === "Please enter your password" ||
              error === "Incorrect email or password" ||
              error.toLowerCase().includes("password")
            ) {
              setError("");
            }
          }}
        />
      </View>

      {error !== "" && <Text style={styles.errorText}>{error}</Text>}

      <ButtonPrimary
        text={isLoading ? "Signing in..." : "Continue"}
        onPress={onSignInPress}
        style={{ marginTop: Gaps.g16 }}
        disabled={isLoading}
      />

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={handleForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <View style={styles.linkContainer}>
        <Text>Don't have an account?</Text>
        <Link href="/(auth)/SignUp" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Sign up</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <ButtonSkip
        text="Skip for now"
        onPress={async () => {
          if (Platform.OS !== "web") {
            await AsyncStorage.setItem("auth_navigation_pending", "true");
          } else {
            router.replace("/(tabs)/play");
          }
        }}
      />

      <CustomAlert
        visible={showResetAlert}
        onClose={() => setShowResetAlert(false)}
        title="Reset Password"
        message="Do you want to reset your password?"
        cancelText="Cancel"
        confirmText="Reset"
        onConfirm={handleResetPassword}
        noInternet={false}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  containerInput: {
    gap: Gaps.g16,
    width: "100%",
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    marginBottom: Gaps.g32,
  },
  errorText: {
    color: Colors.systemRed,
    marginTop: Gaps.g4,
    fontSize: FontSizes.FootnoteFS,
    alignSelf: "center",
    marginLeft: Gaps.g4,
  },
  linkContainer: {
    flexDirection: "row",
    marginTop: Gaps.g16,
    alignItems: "center",
  },
  link: {
    fontSize: FontSizes.TextMediumFs,
    color: Colors.black,
    marginLeft: Gaps.g8,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: Gaps.g24,
  },
  skipText: {
    color: Colors.black,
    fontSize: FontSizes.TextSmallFs,
  },
  forgotPassword: {
    marginTop: Gaps.g8,
    alignSelf: "center",
  },
  forgotPasswordText: {
    color: Colors.black,
    fontSize: FontSizes.TextSmallFs,
    marginTop: Gaps.g8,
  },
});
