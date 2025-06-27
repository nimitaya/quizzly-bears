import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useClerk, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ButtonPrimary } from "@/components/Buttons";
import { SearchInput } from "@/components/Inputs";
import { Colors, FontSizes, Gaps } from "@/styles/theme";

// Email validation regex
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export default function ForgotPassword() {
  // Get email from params if available
  const params = useLocalSearchParams();
  const initialEmail = typeof params.email === "string" ? params.email : "";

  // Auth hooks
  const { client } = useClerk();
  const { signOut } = useAuth();

  // State variables
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

  // Ref to track component mount state
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check for rate limiting
  const checkRateLimit = async (email: string) => {
    try {
      const lastResetTime = await AsyncStorage.getItem(`pwd_reset_${email}`);

      if (lastResetTime) {
        const lastTime = parseInt(lastResetTime, 10);
        const now = Date.now();
        const timePassed = now - lastTime;
        const COOLDOWN_PERIOD = 60 * 1000; // 60 seconds

        if (timePassed < COOLDOWN_PERIOD) {
          // User needs to wait
          const timeLeft = Math.ceil((COOLDOWN_PERIOD - timePassed) / 1000);
          setTimeRemaining(timeLeft);
          setIsRateLimited(true);

          // Start countdown timer
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

          return true; // Rate limited
        }
      }

      // Not rate limited, record this attempt
      await AsyncStorage.setItem(`pwd_reset_${email}`, Date.now().toString());
      return false; // Not rate limited
    } catch (err) {
      console.log("Rate limit check error:", err);
      return false; // Allow operation if storage fails
    }
  };

  // Go back to previous screen
  const goBack = () => {
    if (!isMountedRef.current) return;

    console.log("Navigating back to login screen");

    // Clear any potential error states from previous login attempts
    AsyncStorage.removeItem("auth_error").catch(() => {});

    // Use a more reliable navigation approach with fallbacks
    setTimeout(() => {
      try {
        // Try the first navigation approach
        router.push("/LogIn");
      } catch (e) {
        console.log("First login navigation failed:", e);

        // Try alternative navigation approaches
        setTimeout(() => {
          try {
            router.replace("/LogIn");
          } catch (e2) {
            console.log("Second login navigation failed:", e2);

            // Try a different path format as last resort
            setTimeout(() => {
              try {
                router.replace("/(auth)/LogIn");
              } catch (e3) {
                console.log("All navigation attempts failed");

                // Set flag for root layout to handle
                AsyncStorage.setItem("auth_navigation_pending", "true");
                AsyncStorage.setItem("auth_navigation_destination", "/LogIn");
              }
            }, 100);
          }
        }, 100);
      }
    }, 100);
  };

  // Handle the password reset request
  const handleResetPasswordRequest = async () => {
    // Validate email first
    if (!validateEmail(emailAddress)) {
      setError("Please enter a valid email address");
      setIsEmailError(true);
      return;
    }

    // Check rate limit before proceeding
    const isLimited = await checkRateLimit(emailAddress);
    if (isLimited) {
      return;
    }

    setError("");
    setIsEmailError(false);
    setIsLoading(true);

    try {
      // Just attempt to create the reset code directly
      // No need to sign out first - let Clerk handle session state
      console.log("Sending verification code to:", emailAddress);

      await client.signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });

      console.log("Verification code sent successfully");
      setResetSent(true);
    } catch (err: any) {
      console.log("Reset error:", JSON.stringify(err, null, 2));

      // If we get session exists error, we still proceed to verification
      if (
        err.errors &&
        err.errors.some(
          (e: any) =>
            e.code === "session_exists" ||
            (e.message &&
              e.message.toLowerCase().includes("session already exists"))
        )
      ) {
        // Just proceed with verification - the code was sent
        setResetSent(true);
        setError("A verification code has been sent to your email");
      }
      // Other error handling
      else if (err.errors && err.errors.length > 0) {
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

  // Handle resending the verification code
  const handleResendCode = async () => {
    // Check rate limit before proceeding
    const isLimited = await checkRateLimit(emailAddress);
    if (isLimited) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Skip all sign-out logic completely for resends
      await client.signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });

      setError("New verification code sent to your email");
    } catch (err: any) {
      // For session exists error, just show a message but don't attempt sign-out
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

  // Handle verification and password reset
  const handleVerifyAndReset = async () => {
    // Check if code is empty
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    // Ensure code contains only digits
    if (!/^\d+$/.test(verificationCode)) {
      setError("Verification code should contain only numbers");
      return;
    }

    // Check if password meets requirements
    if (!newPassword || newPassword.length < 8) {
      setError("Please enter a password (minimum 8 characters)");
      return;
    }

    setError("");
    setIsVerifying(true);

    try {
      // Attempt to verify the code and reset password
      const result = await client.signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: verificationCode,
        password: newPassword,
      });

      if (result.status === "complete") {
        // Password reset successful
        setResetComplete(true);

        // If we have a session ID, this indicates auto sign-in worked
        if (result.createdSessionId) {
          try {
            // Store the successful reset flag for other components
            await AsyncStorage.setItem("password_recently_reset", "true");
            console.log("Set password reset flag"); // Add this line

            console.log(
              "Authentication successful, session created:",
              result.createdSessionId
            );
          } catch (sessionErr) {
            console.log("Session handling error:", sessionErr);
          }
        }
      } else {
        setError("Verification failed. Please check your code and try again.");
      }
    } catch (err: any) {
      console.log("Password reset error:", JSON.stringify(err));
      if (err.errors && err.errors.length > 0) {
        // Check for invalid code error
        if (
          err.errors.some(
            (e: any) =>
              e.code === "verification_failed" ||
              (e.message && e.message.toLowerCase().includes("verification")) ||
              (e.message && e.message.toLowerCase().includes("code"))
          )
        ) {
          setError("Invalid verification code. Please try again.");
        }
        // Check for password requirements
        else if (
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

  // Safe navigation function to avoid errors
  const safeNavigate = () => {
    if (!isMountedRef.current) return;

    // Set a flag that will be checked on app root level to determine navigation
    AsyncStorage.setItem("auth_navigation_pending", "true").catch(() => {});
    AsyncStorage.setItem("auth_navigation_destination", "/").catch(() => {});

    // Just finish the reset flow without trying to navigate immediately
    // The navigation will happen at a safer time from the app's root layout
    console.log("Auth successful, navigation will happen from root layout");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Reset Password</Text>

      {resetComplete ? (
        // Final success state - after password reset
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Password Reset Successful!</Text>
          <Text style={styles.instructionText}>
            Your password has been updated. You are now signed in.
          </Text>

          <View style={styles.buttonContainer}>
            <ButtonPrimary
              text="Start Playing"
              onPress={() => {
                console.log("Navigating to play tab");

                // Store the reset flag for other components
                AsyncStorage.setItem("password_recently_reset", "true").catch(
                  (err) => console.log("Failed to store reset flag:", err)
                );

                // Simple direct navigation - no alerts, no complex logic
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
        // Enter verification code and new password state
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
                // Only allow digits
                const numbersOnly = code.replace(/[^0-9]/g, "");
                setVerificationCode(numbersOnly);

                // If user tried to enter non-digits, show a gentle reminder
                if (code !== numbersOnly) {
                  setError("Please enter numbers only");
                }
                // Otherwise clear errors
                else if (
                  error &&
                  (error.includes("code") || error.includes("verification"))
                ) {
                  setError("");
                }
              }}
              keyboardType="number-pad"
              autoFocus
            />
            <SearchInput
              value={newPassword}
              placeholder="New password (8+ characters)"
              secureTextEntry={true}
              onChangeText={(pwd: string) => {
                setNewPassword(pwd);
                // Clear error messages when typing a password
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

          {/* Resend code button */}
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
        // Initial state - enter email
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
                // Clear rate limit if user changes email
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
