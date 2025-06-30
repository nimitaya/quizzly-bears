import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useClerk, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ButtonPrimary } from "@/components/Buttons";
import { SearchInput, PasswordInput } from "@/components/Inputs";
import { Colors, FontSizes, Gaps } from "@/styles/theme";

// Email validation regex
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export default function ForgotPassword() {
  const params = useLocalSearchParams();
  const initialEmail = typeof params.email === "string" ? params.email : "";

  const { client } = useClerk();

  const [emailAddress, setEmailAddress] = useState(initialEmail);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isEmailError, setIsEmailError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Rate limiting for resend
  const checkRateLimit = async (email: string) => {
    try {
      const lastResetTime = await AsyncStorage.getItem(`pwd_reset_${email}`);
      if (lastResetTime) {
        const lastTime = parseInt(lastResetTime, 10);
        const now = Date.now();
        const timePassed = now - lastTime;
        const COOLDOWN_PERIOD = 60 * 1000;
        if (timePassed < COOLDOWN_PERIOD) {
          const timeLeft = Math.ceil((COOLDOWN_PERIOD - timePassed) / 1000);
          setTimeRemaining(timeLeft);
          setIsRateLimited(true);
          const timerId = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                clearInterval(timerId);
                setIsRateLimited(false);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          return true;
        }
      }
      await AsyncStorage.setItem(`pwd_reset_${email}`, Date.now().toString());
      return false;
    } catch {
      return false;
    }
  };

  // Go back to login screen
  const goBack = () => {
    if (!isMountedRef.current) return;
    AsyncStorage.removeItem("auth_error").catch(() => {});
    setTimeout(() => {
      try {
        router.push("/LogIn");
      } catch {
        setTimeout(() => {
          try {
            router.replace("/LogIn");
          } catch {
            setTimeout(() => {
              try {
                router.replace("/(auth)/LogIn");
              } catch {
                AsyncStorage.setItem("auth_navigation_pending", "true");
                AsyncStorage.setItem("auth_navigation_destination", "/LogIn");
              }
            }, 100);
          }
        }, 100);
      }
    }, 100);
  };

  // Send reset code
  const handleResetPasswordRequest = async () => {
    if (!validateEmail(emailAddress)) {
      setError("Please enter a valid email address");
      setIsEmailError(true);
      return;
    }
    const isLimited = await checkRateLimit(emailAddress);
    if (isLimited) return;
    setError("");
    setIsEmailError(false);
    setIsLoading(true);
    try {
      await client.signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setResetSent(true);
    } catch (err: any) {
      if (
        err.errors &&
        err.errors.some(
          (e: any) =>
            e.code === "session_exists" ||
            (e.message &&
              e.message.toLowerCase().includes("session already exists"))
        )
      ) {
        setResetSent(true);
        setError("A verification code has been sent to your email");
      } else if (err.errors && err.errors.length > 0) {
        if (
          err.errors.some(
            (e: any) =>
              e.code === "form_identifier_not_found" ||
              (e.message && e.message.toLowerCase().includes("not found"))
          )
        ) {
          setError("No account found with this email");
        } else if (
          err.errors.some(
            (e: any) =>
              e.code === "form_identifier_not_valid" ||
              (e.message && e.message.toLowerCase().includes("valid email"))
          )
        ) {
          setError("Please enter a valid email address");
          setIsEmailError(true);
        } else {
          setError(err.errors[0].message || "Failed to send reset email");
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    const isLimited = await checkRateLimit(emailAddress);
    if (isLimited) return;
    setIsLoading(true);
    setError("");
    try {
      await client.signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setError("New verification code sent to your email");
    } catch (err: any) {
      if (
        err.errors &&
        err.errors.some(
          (e: any) =>
            e.code === "session_exists" ||
            (e.message &&
              e.message.toLowerCase().includes("session already exists"))
        )
      ) {
        setError("New code sent. Use the most recent code from your email.");
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify code and reset password
  const handleVerifyAndReset = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }
    if (!/^\d+$/.test(verificationCode)) {
      setError("Verification code should contain only numbers");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Please enter a password (minimum 8 characters)");
      return;
    }
    setError("");
    setIsVerifying(true);
    try {
      const result = await client.signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: verificationCode,
        password: newPassword,
      });
      if (result.status === "complete") {
        setResetComplete(true);
        if (result.createdSessionId) {
          try {
            await AsyncStorage.setItem("password_recently_reset", "true");
          } catch {}
        }
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        if (
          err.errors.some(
            (e: any) =>
              e.code === "verification_failed" ||
              (e.message && e.message.toLowerCase().includes("verification")) ||
              (e.message && e.message.toLowerCase().includes("code")) ||
              (e.message && e.message.toLowerCase().includes("invalid")) ||
              (e.message && e.message.toLowerCase().includes("incorrect"))
          )
        ) {
          setError("Invalid verification code. Please try again.");
        } else if (
          err.errors.some(
            (e: any) =>
              e.code === "form_password_pwned" ||
              e.code === "form_password_min_length" ||
              (e.message && e.message.toLowerCase().includes("password"))
          )
        ) {
          setError(err.errors[0].message || "Please use a stronger password");
        } else {
          setError(
            err.errors[0].message || "An error occurred. Please try again."
          );
        }
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Reset Password</Text>

      {resetComplete ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Password Reset Successful!</Text>
          <Text style={styles.instructionText}>
            Your password has been updated. You are now signed in.
          </Text>
          <View style={styles.buttonContainer}>
            <ButtonPrimary
              text="Start Playing"
              onPress={() => {
                AsyncStorage.setItem("password_recently_reset", "true").catch(
                  () => {}
                );
                router.navigate("/(tabs)/play");
              }}
              style={{
                marginTop: Gaps.g24,
                width: "100%",
              }}
            />
          </View>
        </View>
      ) : resetSent ? (
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Enter the verification code sent to:
          </Text>
          <Text style={styles.emailText}>{emailAddress}</Text>
          <Text style={styles.spamNote}>
            If you don't see the email, please check your spam or junk folder.
          </Text>
          <View style={styles.containerInput}>
            <SearchInput
              value={verificationCode}
              placeholder="Verification code"
              onChangeText={(code: string) => {
                const numbersOnly = code.replace(/[^0-9]/g, "");
                setVerificationCode(numbersOnly);
                if (code !== numbersOnly) {
                  setError("Please enter numbers only");
                } else if (
                  error &&
                  (error.includes("code") || error.includes("verification"))
                ) {
                  setError("");
                }
              }}
              keyboardType="number-pad"
              autoFocus
            />
            <PasswordInput
              value={newPassword}
              placeholder="New password (8+ characters)"
              onChangeText={(pwd: string) => {
                setNewPassword(pwd);
                if (error && error.includes("password")) {
                  setError("");
                }
              }}
            />
          </View>
          {error !== "" && <Text style={styles.errorText}>{error}</Text>}
          {isVerifying ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primaryLimo} />
              <Text style={styles.loadingText}>Verifying...</Text>
            </View>
          ) : (
            <ButtonPrimary
              text="Reset Password"
              onPress={handleVerifyAndReset}
              style={{ marginTop: Gaps.g16 }}
            />
          )}
          <TouchableOpacity
            style={[
              styles.resendButton,
              isRateLimited && styles.disabledButton,
            ]}
            onPress={handleResendCode}
            disabled={isLoading || isRateLimited}
          >
            <Text style={styles.resendText}>
              {isRateLimited
                ? `Wait ${timeRemaining}s to resend`
                : isLoading
                ? "Sending..."
                : "Resend Code"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a verification code.
          </Text>
          <View style={styles.containerInput}>
            <SearchInput
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              onChangeText={(email: string) => {
                setEmailAddress(email);
                if (isEmailError) {
                  setIsEmailError(false);
                  setError("");
                }
                if (isRateLimited) {
                  setIsRateLimited(false);
                }
              }}
            />
          </View>
          {error !== "" && <Text style={styles.errorText}>{error}</Text>}
          {isRateLimited ? (
            <View style={styles.rateLimitContainer}>
              <Text style={styles.rateLimitText}>
                Please wait {timeRemaining} seconds before requesting another
                code.
              </Text>
            </View>
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primaryLimo} />
              <Text style={styles.loadingText}>
                Sending verification code...
              </Text>
            </View>
          ) : (
            <ButtonPrimary
              text="Send Verification Code"
              onPress={handleResetPasswordRequest}
              style={{ marginTop: Gaps.g16 }}
            />
          )}
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    marginBottom: Gaps.g24,
  },
  subtitle: {
    fontSize: FontSizes.TextMediumFs,
    textAlign: "center",
    marginBottom: Gaps.g16,
  },
  emailText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Gaps.g16,
  },
  containerInput: {
    width: "100%",
    marginBottom: Gaps.g16,
    gap: Gaps.g8,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  errorText: {
    color: Colors.systemRed,
    fontSize: FontSizes.TextSmallFs,
    marginBottom: Gaps.g16,
  },
  backButton: {
    marginTop: Gaps.g32,
  },
  backButtonText: {
    color: Colors.darkGreen,
    fontSize: FontSizes.TextMediumFs,
  },
  loadingContainer: {
    marginTop: Gaps.g16,
    alignItems: "center",
  },
  loadingText: {
    marginTop: Gaps.g8,
    fontSize: FontSizes.TextSmallFs,
  },
  successContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Gaps.g24,
  },
  successText: {
    fontSize: FontSizes.H2Fs,
    fontWeight: "bold",
    color: Colors.darkGreen,
    marginBottom: Gaps.g16,
  },
  instructionText: {
    fontSize: FontSizes.TextMediumFs,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: Gaps.g24,
  },
  alternateButton: {
    marginTop: Gaps.g8,
    padding: 10,
  },
  alternateButtonText: {
    color: Colors.black,
    fontSize: FontSizes.TextSmallFs,
    textDecorationLine: "underline",
  },
  resendButton: {
    marginTop: Gaps.g8,
    padding: 10,
  },
  resendText: {
    color: Colors.black,
    fontSize: FontSizes.TextSmallFs,
    textDecorationLine: "underline",
  },
  disabledButton: {
    opacity: 0.5,
  },
  rateLimitContainer: {
    marginTop: Gaps.g16,
    padding: 12,
    backgroundColor: Colors.black + "15",
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
  },
  rateLimitText: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.black,
    textAlign: "center",
  },
  spamNote: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.black,
    opacity: 0.6,
    textAlign: "center",
    marginBottom: Gaps.g16,
  },
});
