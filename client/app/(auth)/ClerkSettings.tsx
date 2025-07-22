import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useUser, useAuth, useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import SignOutButton from "@/app/(auth)/SignOutButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import DeleteAccountButton from "./DeleteAccountButton";
import ChangePassword from "./ChangePassword";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { useStatistics } from "@/providers/UserProvider";
import { navigationState } from "@/utilities/navigationStateManager";

// Define the ref type
export type ClerkSettingsRefType = {
  manualRefresh: () => Promise<void>;
};

// Component using forwardRef to expose methods to parent
const ClerkSettings = forwardRef<ClerkSettingsRefType, { refreshKey: number }>(
  ({ refreshKey = 0 }, ref) => {
    const { user, isLoaded: userLoaded } = useUser();
    const { isSignedIn, isLoaded: authLoaded } = useAuth();
    const clerk = useClerk();
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);
    const [wasRecentlyReset, setWasRecentlyReset] = useState(false);
    const prevRefreshKeyRef = useRef(refreshKey);
    const maxChecksRef = useRef(0);
    const forceSignedInRef = useRef(false);
    const { currentUsername } = useStatistics();

    // Check for password reset on component mount
    useEffect(() => {
      let isMounted = true;

      const checkPasswordReset = async () => {
        if (authLoaded && userLoaded && isMounted) {
          try {
            const resetFlag = await AsyncStorage.getItem(
              "password_recently_reset"
            );
            if (resetFlag === "true") {
              setWasRecentlyReset(true);
              await AsyncStorage.removeItem("password_recently_reset");
            }
          } catch (err) {}
        }
      };

      checkPasswordReset();
      return () => {
        isMounted = false;
      };
    }, [authLoaded, userLoaded]);

    // Check for force signed in flag on mount
    useEffect(() => {
      let isMounted = true;

      const checkForceSignedIn = async () => {
        if (!isMounted) return;

        try {
          const forceFlag = await AsyncStorage.getItem("force_signed_in");
          const resetFlag = await AsyncStorage.getItem(
            "password_recently_reset"
          );
          const persistResetFlag = await AsyncStorage.getItem(
            "password_recently_reset_persist"
          );
          const hadResetFlag = await AsyncStorage.getItem("had_password_reset");

          if (
            forceFlag === "true" ||
            resetFlag === "true" ||
            persistResetFlag === "true" ||
            hadResetFlag === "true"
          ) {
            forceSignedInRef.current = true;
            setWasRecentlyReset(true);
          }
        } catch (err) {}
      };

      checkForceSignedIn();
      return () => {
        isMounted = false;
      };
    }, []);

    // Clean up stale auth flags when definitely not signed in
    useEffect(() => {
      if (authLoaded && userLoaded && !isSignedIn && !user) {
        const cleanupFlags = async () => {
          try {
            if (!clerk || !clerk.session) {
              await Promise.all([
                AsyncStorage.removeItem("password_recently_reset"),
                AsyncStorage.removeItem("password_recently_reset_persist"),
                AsyncStorage.removeItem("force_signed_in"),
                AsyncStorage.removeItem("had_password_reset"),
              ]);
            }
          } catch (err) {}
        };

        cleanupFlags();
      }
    }, [authLoaded, userLoaded, isSignedIn, user, clerk]);

    // Handle refresh key changes - limiting to prevent infinite checks
    useEffect(() => {
      if (refreshKey !== prevRefreshKeyRef.current) {
        prevRefreshKeyRef.current = refreshKey;
        maxChecksRef.current += 1;

        if (maxChecksRef.current <= 3) {
          setIsCheckingAuth(true);
          setTimeout(() => {
            setIsCheckingAuth(false);
          }, 2000);
        }
      }
    }, [refreshKey]);

    // Force syncing clerk session state when checking auth
    useEffect(() => {
      if (isCheckingAuth && clerk) {
        const syncSession = async () => {
          try {
            if (clerk.session) {
              if (typeof clerk.session.touch === "function") {
                await clerk.session.touch();
              }
            }
          } catch (e) {
          } finally {
            setTimeout(() => {
              setIsCheckingAuth(false);
            }, 1000);
          }
        };

        syncSession();
      }
    }, [isCheckingAuth, clerk]);

    // Reset max checks counter when component unmounts
    useEffect(() => {
      return () => {
        maxChecksRef.current = 0;
      };
    }, []);

    // Enhanced manual refresh to handle edge cases
    const manualRefresh = async () => {
      setIsCheckingAuth(true);

      try {
        // Direct token check - most reliable method
        const sessionToken = await AsyncStorage.getItem("__clerk_client_jwt");
        if (sessionToken) {
          setWasRecentlyReset(true);
        }

        // Check password reset flags
        const resetFlag = await AsyncStorage.getItem("password_recently_reset");
        const persistResetFlag = await AsyncStorage.getItem(
          "password_recently_reset_persist"
        );

        if (resetFlag === "true" || persistResetFlag === "true") {
          setWasRecentlyReset(true);

          if (resetFlag === "true") {
            await AsyncStorage.removeItem("password_recently_reset");
          }
          await AsyncStorage.setItem("had_password_reset", "true");
        }

        // Check for Clerk session inconsistency
        if (clerk?.session && !isSignedIn) {
          setWasRecentlyReset(true);

          if (typeof clerk.session.touch === "function") {
            try {
              await clerk.session.touch();
            } catch {}
          }
        }

        // Check for any session-related data
        try {
          const clerkStorage = await AsyncStorage.getItem("clerk-js-session");
          const clerkUser = await AsyncStorage.getItem("clerk-js-user");

          if ((clerkStorage || clerkUser) && !isSignedIn) {
            setWasRecentlyReset(true);
          }
        } catch {}
      } catch {
      } finally {
        if (wasRecentlyReset) {
          try {
            await AsyncStorage.setItem("force_signed_in", "true");
          } catch {}
        }
        setTimeout(() => {
          setIsCheckingAuth(false);
        }, 1000);
      }
    };

    // Expose methods via ref for parent component access
    useImperativeHandle(ref, () => ({
      manualRefresh,
    }));

    // Special handling for password reset detection
    useEffect(() => {
      let isMounted = true;

      const checkForceSignedIn = async () => {
        if (!isMounted) return;

        try {
          const resetFlag = await AsyncStorage.getItem(
            "password_recently_reset"
          );
          const hasValidSession = clerk && clerk.session;

          if (resetFlag === "true" || (hasValidSession && !isSignedIn)) {
            setWasRecentlyReset(true);

            if (resetFlag === "true") {
              await AsyncStorage.removeItem("password_recently_reset");
            }
          }
        } catch (err) {}
      };

      checkForceSignedIn();
      return () => {
        isMounted = false;
      };
    }, [refreshKey, clerk, isSignedIn]);

    // Track current auth state
    const [currentAuthState, setCurrentAuthState] = useState<
      "checking" | "signedIn" | "signedOut"
    >("checking");

    // Determine auth state based on multiple signals
    const determineAuthState = async () => {
      if (isSignedIn && user) {
        return "signedIn";
      }

      try {
        const resetFlag = await AsyncStorage.getItem("password_recently_reset");
        const persistResetFlag = await AsyncStorage.getItem(
          "password_recently_reset_persist"
        );

        if (resetFlag === "true" || persistResetFlag === "true") {
          return "signedIn";
        }

        if (wasRecentlyReset) {
          return "signedIn";
        }

        const forceFlag = await AsyncStorage.getItem("force_signed_in");
        if (forceFlag === "true" && (clerk?.session || user)) {
          return "signedIn";
        }

        if (clerk && clerk.session) {
          return "signedIn";
        }
      } catch (err) {}

      return "signedOut";
    };

    // Run auth state determination whenever dependencies change
    useEffect(() => {
      let isMounted = true;

      const checkAuthState = async () => {
        if (!isMounted) return;

        try {
          const state = await determineAuthState();
          if (isMounted) {
            setCurrentAuthState(state);
          }
        } catch (err) {
          if (isMounted) {
            setCurrentAuthState("signedOut");
          }
        }
      };

      checkAuthState();
      return () => {
        isMounted = false;
      };
    }, [isSignedIn, user, clerk, wasRecentlyReset, refreshKey]);

    // Show loading state
    if (isCheckingAuth || currentAuthState === "checking") {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryLimo} />
          <Text style={styles.loadingText}>
            checking authentication status...
          </Text>
        </View>
      );
    }

    const router = useRouter();
    const handleNavigateToAuth = () => {
      // Signal that we're starting auth navigation
      navigationState.startAuthNavigation();
      router.push("/(auth)/LogInScreen");
    };

    const handleNavigateToSignUp = () => {
      // Signal that we're starting auth navigation
      navigationState.startAuthNavigation();
      router.push("/(auth)/SignUp");
    };

    return (
      <View style={styles.container}>
        {currentAuthState === "signedIn" ? (
          <View style={styles.signedInContainer}>
            <Text style={styles.greeting}>
              {currentUsername ||
                user?.firstName ||
                (user?.emailAddresses &&
                  user.emailAddresses[0]?.emailAddress) ||
                "User"}
            </Text>
            <ChangePassword />
            <SignOutButton />
            <DeleteAccountButton />
          </View>
        ) : (
          <View style={styles.signedOutContainer}>
            <Text style={styles.title}>Guest</Text>

            <ButtonPrimary text="Log in" onPress={handleNavigateToAuth} />

            <ButtonSecondary text="Sign up" onPress={handleNavigateToSignUp} />
          </View>
        )}
      </View>
    );
  }
);

ClerkSettings.displayName = "ClerkSettings";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  signedInContainer: {
    alignItems: "center",
    gap: Gaps.g16,
  },
  signedOutContainer: {
    alignItems: "center",
    gap: Gaps.g16,
  },
  greeting: {
    fontSize: FontSizes.H2Fs,
    textAlign: "center",
  },
  emailText: {
    fontSize: FontSizes.TextMediumFs,
  },
  infoText: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g8,
  },
  title: {
    fontSize: FontSizes.H3Fs,
    marginBottom: Gaps.g16,
  },
  loadingContainer: {
    padding: Gaps.g24,
    alignItems: "center",
    justifyContent: "center",
    gap: Gaps.g16,
  },
  loadingText: {
    fontSize: FontSizes.TextSmallFs,
    color: Colors.disable,
  },
});

export default ClerkSettings;
