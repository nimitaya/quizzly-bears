import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthNavigationHelper() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkPendingNavigation = async () => {
      try {
        const isPending = await AsyncStorage.getItem("auth_navigation_pending");

        if (isPending === "true" && isMounted) {
          // Clear the pending flag first to prevent loops
          await AsyncStorage.removeItem("auth_navigation_pending");

          // Get the destination
          const destination =
            (await AsyncStorage.getItem("auth_navigation_destination")) ||
            "/(tabs)/play";

          // Use a timeout for extra safety
          setTimeout(() => {
            if (isMounted) {
              try {
                router.replace(destination as any);
                AsyncStorage.setItem(
                  "auth_navigation_destination",
                  "/(tabs)/play"
                );
              } catch (e) {
                console.log("Navigation failed:", e);
              }
            }
          }, 100);
        }
      } catch (err) {
        console.log("Error checking pending navigation:", err);
      }
    };

    // Check for pending navigation on mount and periodically
    checkPendingNavigation();

    //periodic check for pending navigation
    const intervalId = setInterval(checkPendingNavigation, 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [router]);

  return null;
}
