import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

import {
  SignedIn,
  SignedOut,
  useUser,
  useAuth,
  useClerk,
} from "@clerk/clerk-expo";

import { useUser, useAuth, useClerk } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import SignOutButton from "@/app/(auth)/SignOutButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, FontSizes, Gaps } from "@/styles/theme";

// Define the ref type
export type ClerkSettingsRefType = {
  manualRefresh: () => Promise<void>;
};

// Change the component to use forwardRef
// Component using forwardRef to expose methods to parent
const ClerkSettings = forwardRef<ClerkSettingsRefType, { refreshKey: number }>(
  ({ refreshKey = 0 }, ref) => {
    const { user, isLoaded: userLoaded } = useUser();
    const { isSignedIn, isLoaded: authLoaded } = useAuth();
    const clerk = useClerk();
    const [isCheckingAuth, setIsCheckingAuth] = useState(false); // Start as false to avoid immediate checking

    const [isCheckingAuth, setIsCheckingAuth] = useState(false);
    const [wasRecentlyReset, setWasRecentlyReset] = useState(false);
    const prevRefreshKeyRef = useRef(refreshKey);
    const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const maxChecksRef = useRef(0);

    // First render effect to check for password reset

    const forceSignedInRef = useRef(false);

    // IMPORTANT: First check for password reset on component mount
    useEffect(() => {
      let isMounted = true;

      const checkPasswordReset = async () => {
        if (authLoaded && userLoaded && isMounted) {
          try {
            const resetFlag = await AsyncStorage.getItem(
              "password_recently_reset"
            );
            if (resetFlag === "true") {
              console.log("Found recent password reset flag");
              setWasRecentlyReset(true);
              await AsyncStorage.removeItem("password_recently_reset");
            }
          } catch (err) {
            console.log("Error checking reset status:", err);
          }
        }
      };

      checkPasswordReset();

      return () => {
        isMounted = false;
      };
    }, [authLoaded, userLoaded]);

    // Handle refresh key changes
    useEffect(() => {
      // Only check if the refresh key actually changed
      if (refreshKey !== prevRefreshKeyRef.current) {
        console.log("ClerkSettings refresh key changed:", refreshKey);
        prevRefreshKeyRef.current = refreshKey;

        // Increment check counter to prevent infinite loops
        maxChecksRef.current += 1;

        // Only check up to 3 times per component lifecycle
        if (maxChecksRef.current <= 3) {
          setIsCheckingAuth(true);

          // Set a timeout to end checking state after 2 seconds max

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
            console.log("Found force signed in flag - forcing signed in view");
            forceSignedInRef.current = true;
            setWasRecentlyReset(true);
          }
        } catch (err) {
          console.log("Error checking force signed in flag:", err);
        }
      };

      checkForceSignedIn();
      return () => {
        isMounted = false;
      };
    }, []);

    // IMPORTANT: Clean up stale auth flags when definitely not signed in
    useEffect(() => {
      if (authLoaded && userLoaded && !isSignedIn && !user) {
        const cleanupFlags = async () => {
          try {
            if (!clerk || !clerk.session) {
              console.log("No clerk session - cleaning up auth flags");
              await Promise.all([
                AsyncStorage.removeItem("password_recently_reset"),
                AsyncStorage.removeItem("password_recently_reset_persist"),
                AsyncStorage.removeItem("force_signed_in"),
                AsyncStorage.removeItem("had_password_reset"),
              ]);
            }
          } catch (err) {
            console.log("Error cleaning up auth flags:", err);
          }
        };

        cleanupFlags();
      }
    }, [authLoaded, userLoaded, isSignedIn, user, clerk]);

    // Handle refresh key changes - limiting to prevent infinite checks
    useEffect(() => {
      if (refreshKey !== prevRefreshKeyRef.current) {
        console.log("ClerkSettings refresh key changed:", refreshKey);
        prevRefreshKeyRef.current = refreshKey;
        maxChecksRef.current += 1;

        if (maxChecksRef.current <= 3) {
          setIsCheckingAuth(true);
          setTimeout(() => {
            setIsCheckingAuth(false);
          }, 2000);
        } else {
          console.log("Too many auth checks - skipping");
        }
      }
    }, [refreshKey]);

    // Force syncing the clerk session state

    // Force syncing clerk session state when checking auth
    useEffect(() => {
      if (isCheckingAuth && clerk) {
        const syncSession = async () => {
          try {
            // Try to sync the session using available methods
            if (clerk.session) {
              console.log("Found clerk session, attempting to refresh");

              // Clerk-expo specific: try touching the session
            if (clerk.session) {
              console.log("Found clerk session, attempting to refresh");

              if (typeof clerk.session.touch === "function") {
                await clerk.session.touch();
                console.log("Touched clerk session");
              }
            }
          } catch (e) {
            console.log("Error syncing clerk session:", e);
          } finally {
            // Always end checking after a delay

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

    // Manual refresh function - enhanced version
    // IMPORTANT: Enhanced manual refresh to handle edge cases
    const manualRefresh = async () => {
      console.log("Performing manual auth refresh");
      setIsCheckingAuth(true);

      try {
        // Force clerk session synchronization
        if (clerk) {
          // Check for session
          if (clerk.session) {
            console.log("Found existing session during manual refresh");

            // Try using touch method if available
            if (typeof clerk.session.touch === "function") {
              await clerk.session.touch();
              console.log("Touched clerk session");
            }
          }

          // Special handling for different auth states
          if (!isSignedIn && clerk.session) {
            console.log(
              "Session exists but isSignedIn is false - possible state mismatch"
            );

            // Force state refresh by setting wasRecentlyReset
            setWasRecentlyReset(true);
          }
        }

        // Check if there's a token in storage that indicates we should be signed in
        try {
          const token = await AsyncStorage.getItem("auth_token");
          if (token && !isSignedIn) {
            console.log(
              "Found auth token but not signed in - forcing signed in view"
            );
            setWasRecentlyReset(true);
          }
        } catch (tokenErr) {
          console.log("Error checking token:", tokenErr);
        }

        // Check for password reset flag as a last resort
        // Direct token check - most reliable method
        const sessionToken = await AsyncStorage.getItem("__clerk_client_jwt");
        if (sessionToken) {
          console.log(
            "Found Clerk session token - user should be considered signed in"
          );
          setWasRecentlyReset(true);
        }

        // Check password reset flags
        const resetFlag = await AsyncStorage.getItem("password_recently_reset");
        const persistResetFlag = await AsyncStorage.getItem(
          "password_recently_reset_persist"
        );

        if (resetFlag === "true" || persistResetFlag === "true") {
          console.log("Found password reset flag during manual refresh");
          setWasRecentlyReset(true);

          if (resetFlag === "true") {
            await AsyncStorage.removeItem("password_recently_reset");
          }
          await AsyncStorage.setItem("had_password_reset", "true");
        }

        // Check for Clerk session inconsistency
        if (clerk?.session && !isSignedIn) {
          console.log(
            "Clerk session exists but isSignedIn is false - fixing state"
          );
          setWasRecentlyReset(true);

          if (typeof clerk.session.touch === "function") {
            try {
              await clerk.session.touch();
              console.log("Touched clerk session");
            } catch (touchErr) {
              console.log("Error touching session:", touchErr);
            }
          }
        }

        // Check for any session-related data
        try {
          const clerkStorage = await AsyncStorage.getItem("clerk-js-session");
          const clerkUser = await AsyncStorage.getItem("clerk-js-user");

          if ((clerkStorage || clerkUser) && !isSignedIn) {
            console.log("Found clerk storage data but not signed in");
            setWasRecentlyReset(true);
          }
        } catch (storageErr) {
          console.log("Error checking clerk storage:", storageErr);
        }
      } catch (e) {
        console.log("Error during manual refresh:", e);
      } finally {
        if (wasRecentlyReset) {
          try {
            await AsyncStorage.setItem("force_signed_in", "true");
          } catch (err) {
            console.log("Error setting force signed in flag:", err);
          }
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
          if (resetFlag === "true") {
            console.log("Found password reset flag during manual refresh");
            setWasRecentlyReset(true);
            await AsyncStorage.removeItem("password_recently_reset");

          const hasValidSession = clerk && clerk.session;

          if (resetFlag === "true" || (hasValidSession && !isSignedIn)) {
            console.log("Force showing signed in view");
            setWasRecentlyReset(true);

            if (resetFlag === "true") {
              await AsyncStorage.removeItem("password_recently_reset");
            }
          }
        } catch (resetErr) {
          console.log("Error checking reset flag:", resetErr);
        }
      } catch (e) {
        console.log("Error during manual refresh:", e);
      } finally {
        // Give time for all operations to complete
        setTimeout(() => {
          setIsCheckingAuth(false);
        }, 1000);
      }
    };

    // Expose functions via ref
    useImperativeHandle(ref, () => ({
      manualRefresh,
    }));

    // Add a special case for forcing signed-in view based on password reset flag
    // regardless of what Clerk's state shows
    useEffect(() => {
      let isMounted = true;

      // Check on mount and also on each refresh key change
      const checkForceSignedIn = async () => {
        if (!isMounted) return;

        try {
          // Check for password reset flag
          const resetFlag = await AsyncStorage.getItem(
            "password_recently_reset"
          );

          // Check for any other special flags that might indicate the user is signed in
          const hasValidSession = clerk && clerk.session;

          if (resetFlag === "true" || (hasValidSession && !isSignedIn)) {
            console.log("Force showing signed in view");

            // Force showing signed-in view by setting wasRecentlyReset
            setWasRecentlyReset(true);

            // Clear the flag
            if (resetFlag === "true") {
              await AsyncStorage.removeItem("password_recently_reset");
            }
          }
        } catch (err) {
          console.log("Error checking force signed in state:", err);
        }
      };

      checkForceSignedIn();

      return () => {
        isMounted = false;
      };
    }, [refreshKey, clerk, isSignedIn]);

    // Determine which view to show based on multiple factors
    const determineAuthState = () => {
      // If we know the password was reset, always show signed in
      if (wasRecentlyReset) {
        return "signedIn";
      }

      // If Clerk says we're signed in, trust that
      if (isSignedIn) {
        return "signedIn";
      }

      // If we have a session but Clerk says not signed in, it might be a race condition
      if (clerk && clerk.session) {
        return "signedIn";
      }

      // Otherwise show signed out
      return "signedOut";
    };

    // Show a loading state locally instead of navigating
    if (isCheckingAuth) {
        }
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

    // IMPORTANT: Determine auth state based on multiple signals
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
      } catch (err) {
        console.log("Error in determineAuthState:", err);
      }

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
          console.log("Error checking auth state:", err);
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
            Checking authentication status...
          </Text>
        </View>
      );
    }

    // Use our own auth state determination instead of relying solely on Clerk components
    const authState = determineAuthState();

    return (
      <View style={styles.container}>
        {authState === "signedIn" ? (

    return (
      <View style={styles.container}>
        {currentAuthState === "signedIn" ? (
          <View style={styles.signedInContainer}>
            <Text style={styles.greeting}>
              Hello,{" "}
              {user?.firstName ||
                (user?.emailAddresses &&
                  user.emailAddresses[0]?.emailAddress) ||
                "User"}
            </Text>
            <TouchableOpacity
              onPress={manualRefresh}
              style={styles.refreshButton}
            >
              <Text style={styles.refreshText}>Refresh Auth</Text>
            </TouchableOpacity>

            <SignOutButton />
          </View>
        ) : (
          <View style={styles.signedOutContainer}>
            <Text style={styles.title}>Account Options</Text>
 
            <Link href="/(auth)/LogIn" style={styles.link} asChild>

            <Link href="/(auth)/LogInScreen" style={styles.link} asChild>
 
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(auth)/SignUp" style={styles.link} asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign up</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              onPress={manualRefresh}
              style={styles.refreshButton}
            >
              <Text style={styles.refreshText}>Refresh Auth</Text>
            </TouchableOpacity>

          </View>
        )}
      </View>
    );
  }
);

// Add display name

ClerkSettings.displayName = "ClerkSettings";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
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
    fontSize: FontSizes.H2Fs,
    marginBottom: Gaps.g16,
  },
  link: {
    backgroundColor: Colors.primaryLimo,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  linkText: {
    color: Colors.white,
    fontSize: FontSizes.TextMediumFs,
    textAlign: "center",
  },
  loadingContainer: {
    padding: Gaps.g24,
    alignItems: "center",
    justifyContent: "center",
    gap: Gaps.g16,
  },
  loadingText: {
    fontSize: FontSizes.TextMediumFs,
  },
  refreshButton: {
    backgroundColor: Colors.black + "15",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  refreshText: {
    color: Colors.white,
    fontSize: FontSizes.TextSmallFs,
  },
});

export default ClerkSettings;
