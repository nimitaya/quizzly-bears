import { View, StyleSheet } from "react-native";
import ClerkSettings, {
  ClerkSettingsRefType,
} from "@/app/(auth)/ClerkSettings";
import { useFocusEffect } from "expo-router";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Gaps } from "@/styles/theme";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "@/app/Loading";
import { Logo } from "@/components/Logos";

const ProfileScreen = () => {
  const { isAuthenticated, refreshGlobalState, isGloballyLoading } =
    useGlobalLoading();
  const isMounted = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const hasFocusedRef = useRef(false);
  const clerkSettingsRef = useRef<ClerkSettingsRefType>(null);
  const [passwordResetFlag, setPasswordResetFlag] = useState<string | null>(
    null
  );

  // Check for password reset flag on mount and refresh
  useEffect(() => {
    let isMounted = true;

    const checkPasswordResetFlag = async () => {
      try {
        const resetFlag = await AsyncStorage.getItem("password_recently_reset");
        if (isMounted) {
          setPasswordResetFlag(resetFlag);
        }
      } catch (err) {
        console.log("Error checking password reset flag:", err);
      }
    };

    checkPasswordResetFlag();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // IMPORTANT: Trigger manual refresh via ref when auth state changes
  useEffect(() => {
    if (!isMounted.current || !clerkSettingsRef.current) return;

    const timer = setTimeout(() => {
      if (isMounted.current && clerkSettingsRef.current?.manualRefresh) {
        clerkSettingsRef.current.manualRefresh();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [refreshKey, passwordResetFlag, isAuthenticated]);

  // Track mounted state and save last screen
  useEffect(() => {
    isMounted.current = true;
    AsyncStorage.setItem("last_screen", "/(tabs)/profile");
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Store refreshGlobalState in a ref to avoid dependency loops
  const refreshGlobalStateRef = useRef(refreshGlobalState);
  useEffect(() => {
    refreshGlobalStateRef.current = refreshGlobalState;
  }, [refreshGlobalState]);

  // IMPORTANT: Reset focus flag after timeout to allow future refreshes when tab is revisited
  useEffect(() => {
    if (hasFocusedRef.current) {
      const timer = setTimeout(() => {
        hasFocusedRef.current = false;
      }, 5000); // Reset after 5 seconds to allow future focus events
      return () => clearTimeout(timer);
    }
  });

  // CRITICAL: Handle tab focus and password reset detection
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(async () => {
        if (hasFocusedRef.current) return;

        console.log("Profile tab focused - refreshing auth state");
        hasFocusedRef.current = true;

        if (isMounted.current) {
          try {
            // IMPORTANT: Special handling for password reset flag
            const resetFlag = await AsyncStorage.getItem(
              "password_recently_reset"
            );
            if (resetFlag === "true") {
              // Ensure flag persists for ClerkSettings to detect
              await AsyncStorage.setItem(
                "password_recently_reset_persist",
                "true"
              );

              // Delay cleanup to ensure proper detection
              setTimeout(() => {
                AsyncStorage.removeItem("password_recently_reset").catch(
                  (err) =>
                    console.log("Error clearing password reset flag:", err)
                );
              }, 2000);
            }

            // Trigger refresh cascade
            setRefreshKey((prev) => prev + 1);
          } catch (err) {
            console.log("Error in profile tab focus:", err);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  if (isGloballyLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>

      {/* IMPORTANT: Always render ClerkSettings to maintain ref connection */}
      <ClerkSettings ref={clerkSettingsRef} refreshKey={refreshKey} />
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
