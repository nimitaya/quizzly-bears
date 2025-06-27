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
const ClerkSettings = forwardRef<ClerkSettingsRefType, { refreshKey: number }>(
  ({ refreshKey = 0 }, ref) => {
    const { user, isLoaded: userLoaded } = useUser();
    const { isSignedIn, isLoaded: authLoaded } = useAuth();
    const clerk = useClerk();
    const [isCheckingAuth, setIsCheckingAuth] = useState(false); // Start as false to avoid immediate checking
    const [wasRecentlyReset, setWasRecentlyReset] = useState(false);
    const prevRefreshKeyRef = useRef(refreshKey);
    const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const maxChecksRef = useRef(0);

    // First render effect to check for password reset
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
          setTimeout(() => {
            setIsCheckingAuth(false);
          }, 2000);
        } else {
          console.log("Too many auth checks - skipping");
        }
      }
    }, [refreshKey]);

    // Force syncing the clerk session state
    useEffect(() => {
      if (isCheckingAuth && clerk) {
        const syncSession = async () => {
          try {
            // Try to sync the session using available methods
            if (clerk.session) {
              console.log("Found clerk session, attempting to refresh");

              // Clerk-expo specific: try touching the session
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
        try {
          const resetFlag = await AsyncStorage.getItem(
            "password_recently_reset"
          );
          if (resetFlag === "true") {
            console.log("Found password reset flag during manual refresh");
            setWasRecentlyReset(true);
            await AsyncStorage.removeItem("password_recently_reset");
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
    width: "100%",
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
