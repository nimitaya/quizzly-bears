import IconBearTab from "@/assets/icons/IconBearTab";
import IconBearTabAktiv from "@/assets/icons/IconBearTabAktiv";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import ClerkSettings from "@/app/(auth)/ClerkSettings";
import QuizComponent from "@/components/QuizComponent";
import { useRouter, useFocusEffect } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "@/app/Loading";
import { Logo } from "@/components/Logos";

const ProfileScreen = () => {
  const { isAuthenticated, refreshGlobalState, isGloballyLoading } =
    useGlobalLoading();
  const router = useRouter();
  const isMounted = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasFocusedRef = useRef(false);

  // Set up isMounted ref for safe operations
  useEffect(() => {
    isMounted.current = true;

    // Save current screen for returning from Loading
    AsyncStorage.setItem("last_screen", "/(tabs)/profile");

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Store refreshGlobalState in a ref to avoid dependency changes
  const refreshGlobalStateRef = useRef(refreshGlobalState);
  useEffect(() => {
    refreshGlobalStateRef.current = refreshGlobalState;
  }, [refreshGlobalState]);

  // Reset the focus flag after a certain time to allow future refreshes
  useEffect(() => {
    if (hasFocusedRef.current) {
      const timer = setTimeout(() => {
        hasFocusedRef.current = false;
      }, 5000); // Reset after 5 seconds

      return () => clearTimeout(timer);
    }
  });

  // Refresh global state when tab is focused
  useFocusEffect(
    useCallback(() => {
      // Delay the refresh slightly to avoid race conditions
      const timer = setTimeout(() => {
        // Prevent multiple refreshes in the same focus session
        if (hasFocusedRef.current) return;

        console.log("Profile tab focused - refreshing global state");
        hasFocusedRef.current = true;

        if (isMounted.current) {
          // Force global state refresh
          refreshGlobalStateRef.current();

          // Force ClerkSettings component to update by changing refreshKey
          setRefreshKey((prev) => prev + 1);

          // Clear any previous errors that might be cached
          AsyncStorage.removeItem("auth_error_state").catch((err) =>
            console.log("Failed to clear auth error state", err)
          );
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        // Tab lost focus - DO NOT reset focus tracking here
        // It's reset by the separate useEffect with timeout
      };
    }, [])
  );

  const handleAuthRedirect = () => {
    if (isMounted.current) {
      // Safe navigation
      setTimeout(() => {
        router.push("/(auth)/LogIn");
      }, 100);
    }
  };

  // If globally loading, show the Loading component
  if (isGloballyLoading) {
    // Don't navigate programmatically - render the Loading component directly
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>
      {/* Profile name aund settings */}
      {isAuthenticated ? (
        // Pass refreshKey as a prop instead of using it as part of key
        <ClerkSettings refreshKey={refreshKey} />
      ) : (
        <View>
          <Text>Sign in to access your profile settings</Text>
          <TouchableOpacity onPress={handleAuthRedirect}>
            <Text>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
      <QuizComponent />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
  },
});
