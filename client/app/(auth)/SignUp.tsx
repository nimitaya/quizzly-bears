import * as React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { SearchInput } from "@/components/Inputs";
import { ButtonPrimary, ButtonPrimaryDisabled } from "@/components/Buttons";
import CustomAlert from "@/components/CustomAlert";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  // State management
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [repeatPassword, setRepeatPassword] = React.useState("");
  const [passwordsMatch, setPasswordsMatch] = React.useState(true);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [isEmailError, setIsEmailError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResendingCode, setIsResendingCode] = React.useState(false);
  const [loadingStartTime, setLoadingStartTime] = React.useState(0);
  const [showExistsAlert, setShowExistsAlert] = React.useState(false);
  const [isRateLimited, setIsRateLimited] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | number | null>(null);

  // Form validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswords = () => {
    if (error === "Password must be at least 8 characters") {
      setError("");
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (password !== repeatPassword) {
      setPasswordsMatch(false);
      setError("Passwords don't match");
      return false;
    }

    return true;
  };

  // prevent infinite loading
  const safeSetLoading = (isLoading: boolean) => {
    setIsLoading(isLoading);

    if (isLoading && Platform.OS === "web") {
      setTimeout(() => {
        setIsLoading(false);
      }, 15000);
    }
  };

  const onSignUpPress = async () => {
    if (!isLoaded || isLoading) {
      return;
    }

    setError("");
    setIsEmailError(false);
    safeSetLoading(true);

    // Validate email format
    if (!validateEmail(emailAddress)) {
      setError("Please enter a valid email address");
      setIsEmailError(true);
      safeSetLoading(false);
      return;
    }

    // Email validation passed, now check passwords
    if (!validatePasswords()) {
      safeSetLoading(false);
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
      // Handle common errors
      if (err.errors && err.errors.length > 0) {
        // Check for password breach error
        if (
          err.errors.some(
            (e: any) =>
              (e.message && e.message.toLowerCase().includes("data breach")) ||
              e.code === "password_compromised" ||
              e.code === "form_password_pwned"
          )
        ) {
          setError(
            "Password has been found in a data breach. Please use a different password."
          );
          return;
        }
        // Check for email already exists
        else if (
          err.errors.some(
            (e: any) =>
              e.code === "form_identifier_exists" ||
              (e.message && e.message.toLowerCase().includes("already exists"))
          )
        ) {
          handleExistingEmailError();
        }
        // Check for invalid email error
        else if (
          err.errors.some(
            (e: any) =>
              e.code === "form_identifier_not_valid" ||
              (e.message &&
                (e.message.toLowerCase().includes("valid email") ||
                  e.message.toLowerCase().includes("must be a valid email") ||
                  e.message.toLowerCase().includes("is invalid")))
          )
        ) {
          setError("Please enter a valid email address");
          setIsEmailError(true);
        }
        // Other validation errors
        else {
          setError(
            err.errors[0].message || "Sign up failed. Please try again."
          );
        }
      } else if (err.code === "form_identifier_exists") {
        handleExistingEmailError();
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      safeSetLoading(false);
    }
  };

  // error handlers for better organization
  const handleExistingEmailError = () => {
    setError("This email is already registered");
    setIsEmailError(true);
    setShowExistsAlert(true); // Show custom alert instead of Alert.alert
  };

  // Create a handler to navigate to login when confirmed
  const handleGoToLogin = () => {
    setShowExistsAlert(false);
    router.replace("/(auth)/LogInScreen");
  };

  const onVerifyPress = async () => {
    if (!isLoaded || isLoading) return;

    safeSetLoading(true);
    setError("");

    try {
      if (!code || code.trim().length === 0) {
        setError("Please enter the verification code");
        safeSetLoading(false);
        return;
      }

      try {
        const signUpAttempt = await signUp.attemptEmailAddressVerification({
          code,
        });

        if (signUpAttempt.status === "complete") {
          try {
            await setActive({ session: signUpAttempt.createdSessionId });
            router.replace("/(tabs)/play");
          } catch (sessionErr) {
            setError(
              "Verification succeeded but couldn't log you in. Please try logging in."
            );
          }
        } else {
          setError("Please enter a valid verification code");
        }
      } catch (verificationErr: any) {
        // Handle specific verification errors
        if (verificationErr.errors && verificationErr.errors.length > 0) {
          const invalidCodeError = verificationErr.errors.find(
            (e: any) =>
              e.code === "verification_failed" ||
              (e.message && e.message.toLowerCase().includes("code")) ||
              (e.message && e.message.toLowerCase().includes("invalid"))
          );

          if (invalidCodeError) {
            setError("Please enter a valid verification code");
          } else {
            setError("Please enter a valid verification code");
          }
        } else {
          setError("Please enter a valid verification code");
        }
      }
    } catch (err: any) {
      if (!error) {
        setError("Please enter a valid verification code");
      }
    } finally {
      safeSetLoading(false);
    }
  };

  // Add this function to check if resend is rate limited
  const checkResendRateLimit = async () => {
    try {
      const lastResendTime = await AsyncStorage.getItem(
        "last_verification_resend"
      );

      if (lastResendTime) {
        const lastTime = parseInt(lastResendTime, 10);
        const now = Date.now();
        const timePassed = now - lastTime;
        const COOLDOWN_PERIOD = 60 * 1000; // 60 seconds

        if (timePassed < COOLDOWN_PERIOD) {
          // User needs to wait
          const timeLeft = Math.ceil((COOLDOWN_PERIOD - timePassed) / 1000);
          setTimeRemaining(timeLeft);
          setIsRateLimited(true);

          // Start countdown timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                setIsRateLimited(false);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return true; // Rate limited
        }
      }

      return false; // Not rate limited
    } catch (err) {
      console.log("Rate limit check error:", err);
      return false; // Allow operation if storage fails
    }
  };

  // Add this function to record resend attempt
  const recordResendAttempt = async () => {
    try {
      await AsyncStorage.setItem(
        "last_verification_resend",
        Date.now().toString()
      );
    } catch (err) {
      console.log("Failed to record resend attempt:", err);
    }
  };

  // Clean up timer when component unmounts
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const resendVerificationCode = async () => {
    if (!isLoaded || isResendingCode) return;

    // Check for rate limiting
    const isLimited = await checkResendRateLimit();
    if (isLimited) {
      return;
    }

    setIsResendingCode(true);

    try {
      if (signUp) {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        Alert.alert("Success", "Verification code resent to your email");

        // Record successful resend for rate limiting
        await recordResendAttempt();
      }
    } catch (err: any) {
      setError("Failed to resend verification code");
    } finally {
      setIsResendingCode(false);
    }
  };

  // Verification screen
  if (pendingVerification) {
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
        <Text style={styles.title}>Verify your email</Text>

        <Text style={styles.subtitle}>We've sent a verification code to </Text>
        <Text style={{ ...styles.subtitle, fontWeight: "bold", marginTop: 0 }}>
          {emailAddress}
        </Text>

        <SearchInput
          value={code}
          placeholder="Enter verification code"
          onChangeText={(newCode) => {
            const numbersOnly = newCode.replace(/[^0-9]/g, "");

            if (newCode !== numbersOnly) {
              setError("Please enter numbers only");
            } else if (error && error.includes("verification code")) {
              setError("");
            }

            setCode(numbersOnly);
          }}
          keyboardType="number-pad"
          autoFocus
        />

        {error !== "" && <Text style={styles.errorText}>{error}</Text>}

        <View style={{ marginTop: Gaps.g16, width: "100%" }}>
          {code.length === 0 || isLoading ? (
            <ButtonPrimaryDisabled
              text={isLoading ? "Verifying..." : "Verify Email"}
              disabled={true}
            />
          ) : (
            <ButtonPrimary
              text="Verify Email"
              onPress={onVerifyPress}
              disabled={false}
            />
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.resendButton,
            isRateLimited && styles.disabledButton, // Add this style
          ]}
          onPress={resendVerificationCode}
          disabled={isResendingCode || isRateLimited}
        >
          {isResendingCode ? (
            <ActivityIndicator size="small" color={Colors.black} />
          ) : isRateLimited ? (
            <Text style={styles.resendText}>
              Wait {timeRemaining}s to resend
            </Text>
          ) : (
            <Text style={styles.resendText}>Resend code</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  // Sign up screen
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
      <Text style={styles.title}>Sign up</Text>
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
          secureTextEntry={true}
          onChangeText={(pwd) => {
            setPassword(pwd);

            if (error) {
              setError("");
            }

            if (isEmailError) {
              setIsEmailError(false);
            }

            if (repeatPassword.length > 0) {
              setPasswordsMatch(pwd === repeatPassword);
            }
          }}
        />
        <SearchInput
          value={repeatPassword}
          placeholder="Repeat password"
          secureTextEntry={true}
          onChangeText={(text) => {
            setRepeatPassword(text);

            if (error) {
              setError("");
            }

            if (text.length > 0) {
              setPasswordsMatch(text === password);
            } else {
              setPasswordsMatch(true);
            }
          }}
        />

        {!passwordsMatch && repeatPassword.length > 0 && (
          <Text style={styles.errorText}>Passwords don't match</Text>
        )}
      </View>
      {error !== "" && error !== "Passwords don't match" && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <ButtonPrimary
        text={isLoading ? "Creating Account..." : "Continue"}
        onPress={() => {
          if (isLoading) {
            Alert.alert(
              "Processing",
              "Your request is being processed. Please wait..."
            );

            if (new Date().getTime() - loadingStartTime > 10000) {
              setIsLoading(false);
              setError("Request timed out. Please try again.");
            }
          } else {
            setLoadingStartTime(new Date().getTime());
            onSignUpPress();
          }
        }}
        style={{ marginTop: Gaps.g16 }}
        disabled={isLoading}
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

      {/* Custom Alert for Account Exists */}
      <CustomAlert
        visible={showExistsAlert}
        onClose={() => setShowExistsAlert(false)}
        title="Account Exists"
        message="An account with this email already exists."
        cancelText="Try Another Email"
        confirmText="Go to Login"
        onConfirm={handleGoToLogin}
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
  subtitle: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g16,
    textAlign: "center",
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
  resendButton: {
    marginTop: Gaps.g16,
    padding: Gaps.g8,
  },
  resendText: {
    color: Colors.black,
    fontSize: FontSizes.TextMediumFs,
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
