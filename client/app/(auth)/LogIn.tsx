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
import { ButtonPrimary } from "@/components/Buttons";
import CustomAlert from "@/components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import { Feather } from "@expo/vector-icons";

export default function LogIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { refreshGlobalState } = useGlobalLoading();

  // State management
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailError, setIsEmailError] = useState(false);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Safe loading state with timeout to prevent infinite loading
  const safeSetLoading = (isLoading: boolean) => {
    setIsLoading(isLoading);

    if (isLoading && Platform.OS === "web") {
      setTimeout(() => {
        setIsLoading(false);
      }, 15000);
    }
  };

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded || isLoading) return;

    // Clear previous errors
    setError("");
    setIsEmailError(false);

    // Validate email first - both presence and format
    if (!emailAddress) {
      setError("Please enter your email");
      setIsEmailError(true);
      return;
    }

    // Email format validation before checking password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setError("Please enter a valid email address");
      setIsEmailError(true);
      return;
    }

    // Only check password after email is valid
    if (!password) {
      setError("Please enter your password");
      return;
    }

    // Proceed with sign-in if validation passes
    safeSetLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });

        // IMPORTANT: Update global auth state
        await refreshGlobalState();

        // IMPORTANT: Use AuthNavigationHelper pattern
        if (Platform.OS !== "web") {
          await AsyncStorage.setItem("auth_navigation_pending", "true");
          await AsyncStorage.setItem(
            "auth_navigation_destination",
            "/(tabs)/play"
          );
        } else {
          router.replace("/(tabs)/play");
        }
      } else {
        setError("Sign in failed. Please check your email and password.");
      }
    } catch (err: any) {
      // Handle common errors
      if (err.errors && err.errors.length > 0) {
        // Check for incorrect credentials
        if (
          err.errors.some(
            (e: any) =>
              e.code === "form_password_incorrect" ||
              e.code === "form_identifier_not_found" ||
              (e.message && e.message.toLowerCase().includes("password"))
          )
        ) {
          setError("Incorrect email or password");
        }
        // Check for invalid email
        else if (
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
        }
        // Other errors
        else {
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

  // Handle password reset request
  const handleForgotPassword = () => {
    if (!emailAddress) {
      setError("Please enter your email first");
      setIsEmailError(true);
      return;
    }

    setShowResetAlert(true);
  };

  // Navigate to the forgot password screen
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
        <SearchInput
          value={password}
          placeholder="Enter password"
          secureTextEntry={!showPassword}
          onChangeText={(pwd) => {
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
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <Feather
            name={showPassword ? "eye" : "eye-off"}
            size={22}
            color={Colors.black}
          />
        </TouchableOpacity>
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

      <TouchableOpacity
        onPress={async () => {
          if (Platform.OS !== "web") {
            await AsyncStorage.setItem("auth_navigation_pending", "true");
            await AsyncStorage.setItem(
              "auth_navigation_destination",
              "/(tabs)/play"
            );
          } else {
            router.replace("/(tabs)/play");
          }
        }}
        style={styles.skipButton}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>

      {/* Password Reset Alert */}
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
    padding: 20,
    width: "100%",
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
    alignSelf: "center",
    marginLeft: 5,
  },
  linkContainer: {
    flexDirection: "row",
    marginTop: Gaps.g16,
    alignItems: "center",
  },
  link: {
    color: Colors.black,
    marginLeft: 5,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: Gaps.g24,
    padding: 10,
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
    textDecorationLine: "underline",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 1,
  },
});
