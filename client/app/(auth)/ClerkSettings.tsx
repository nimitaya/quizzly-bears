import { SignedIn, SignedOut, useUser, useAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import SignOutButton from "@/app/(auth)/SignOutButton";
import { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, FontSizes, Gaps } from "@/styles/theme";

// Add a prop to receive the refresh key from the parent
export default function ClerkSettings({ refreshKey = 0 }) {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [wasRecentlyReset, setWasRecentlyReset] = useState(false);
  const router = useRouter();
  const prevRefreshKeyRef = useRef(refreshKey);

  // React to refreshKey changes
  useEffect(() => {
    if (refreshKey !== prevRefreshKeyRef.current) {
      console.log("ClerkSettings detected refresh key change:", refreshKey);
      prevRefreshKeyRef.current = refreshKey;

      // Force a re-check of auth status
      setIsCheckingAuth(true);

      // Force user and auth to re-evaluate
      const forceRefresh = async () => {
        try {
          // Check if auth has already been loaded
          if (authLoaded && userLoaded) {
            // Check if password was recently reset
            const resetFlag = await AsyncStorage.getItem(
              "password_recently_reset"
            );
            if (resetFlag === "true") {
              console.log("Found recent password reset flag");
              setWasRecentlyReset(true);
              await AsyncStorage.removeItem("password_recently_reset");
            }

            // Short delay before finishing check to let auth state stabilize
            setTimeout(() => {
              setIsCheckingAuth(false);
              console.log("Refreshed auth state:", { isSignedIn, userLoaded });
            }, 500);
          }
        } catch (e) {
          console.log("Error during refresh:", e);
          setIsCheckingAuth(false);
        }
      };

      forceRefresh();
    }
  }, [refreshKey, authLoaded, userLoaded, isSignedIn]);

  // Check authentication status and recent password reset
  useEffect(() => {
    const checkAuthState = async () => {
      if (authLoaded && userLoaded) {
        try {
          // Check if password was recently reset
          const resetFlag = await AsyncStorage.getItem(
            "password_recently_reset"
          );
          if (resetFlag === "true") {
            console.log("Found recent password reset flag");
            setWasRecentlyReset(true);

            // Clear the flag so we don't keep checking
            await AsyncStorage.removeItem("password_recently_reset");
          }
        } catch (err) {
          console.log("Error checking reset status:", err);
        } finally {
          // Give some time for auth state to stabilize
          setTimeout(() => {
            setIsCheckingAuth(false);
          }, 1000);
        }
      }
    };

    checkAuthState();
  }, [authLoaded, userLoaded]);

  // Log auth state for debugging
  useEffect(() => {
    console.log("Auth state:", {
      isSignedIn,
      authLoaded,
      userLoaded,
      refreshKey,
    });
  }, [isSignedIn, authLoaded, userLoaded, refreshKey]);

  // Show a loading state locally instead of navigating
  if (isCheckingAuth || !authLoaded || !userLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryLimo} />
        <Text style={styles.loadingText}>
          Checking authentication status...
        </Text>
      </View>
    );
  }

  // Force signed-in view if we recently reset password
  if (wasRecentlyReset) {
    return (
      <View style={styles.container}>
        <View style={styles.signedInContainer}>
          <Text style={styles.greeting}>Welcome back!</Text>
          {user && (
            <Text style={styles.emailText}>
              {user.emailAddresses[0].emailAddress}
            </Text>
          )}
          <Text style={styles.infoText}>Your password was recently reset.</Text>
          <SignOutButton />
        </View>
      </View>
    );
  }

  // The rest of your component stays the same
  return (
    <View style={styles.container}>
      <SignedIn>
        <View style={styles.signedInContainer}>
          <Text style={styles.greeting}>
            Hello,{" "}
            {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}
          </Text>
          <SignOutButton />
        </View>
      </SignedIn>
      <SignedOut>
        <View style={styles.signedOutContainer}>
          <Text style={styles.title}>Account Options</Text>
          <Link href="/(auth)/LogIn" style={styles.link}>
            <Text style={styles.linkText}>Sign in</Text>
          </Link>
          <Link href="/(auth)/SignUp" style={styles.link}>
            <Text style={styles.linkText}>Sign up</Text>
          </Link>
        </View>
      </SignedOut>

      {/* Debug button with refreshKey info - remove in production */}
      <Text
        style={styles.debugButton}
        onPress={() => {
          console.log("Debug - Auth state:", {
            isSignedIn,
            authLoaded,
            userLoaded,
            wasRecentlyReset,
            refreshKey,
          });
        }}
      >
        Debug Auth State (Refresh: {refreshKey})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.black,
  },
  signedInContainer: {
    alignItems: "center",
    padding: 20,
  },
  signedOutContainer: {
    alignItems: "center",
    padding: 20,
  },
  greeting: {
    fontSize: FontSizes.H2Fs,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emailText: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: 20,
  },
  infoText: {
    fontSize: FontSizes.TextMediumFs,
    color: Colors.primaryLimo,
    marginBottom: 20,
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    marginBottom: 24,
  },
  link: {
    marginVertical: 8,
    padding: 12,
    backgroundColor: Colors.black + "10",
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  linkText: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: "600",
  },
  debugButton: {
    marginTop: 40,
    padding: 8,
    textAlign: "center",
    color: Colors.black + "80",
    fontSize: 12,
  },
});
