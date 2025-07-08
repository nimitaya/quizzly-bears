import { Stack } from "expo-router";
import { useRouter, useFocusEffect, useSegments } from "expo-router";
import { useCallback, useRef } from "react";

export default function ProfilLayout() {
  const router = useRouter();
  const segments = useSegments();
  const lastTabRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const currentTab = segments[1]; // "profile", "play", "statistics", etc.
      const isProfileTab = currentTab === "profile";
      const isProfileRoot =
        segments.length === 2 &&
        segments[0] === "(tabs)" &&
        segments[1] === "profile";

      // If we just switched TO profile tab from another tab
      if (
        isProfileTab &&
        lastTabRef.current !== null &&
        lastTabRef.current !== "profile"
      ) {
        // If we're not on profile root, reset to root
        if (!isProfileRoot) {
          router.replace("/(tabs)/profile");
        }
      }

      // Update last tab
      if (
        currentTab &&
        (currentTab === "profile" ||
          currentTab === "play" ||
          currentTab === "statistics")
      ) {
        lastTabRef.current = currentTab;
      }
    }, [segments, router])
  );

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
