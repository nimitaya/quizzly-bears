import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSocket } from "@/providers/SocketProvider";

export default function AuthNavigationHelper() {
  const router = useRouter();
  // Get initialize function for socket reconnection
  const { initialize } = useSocket();

  useEffect(() => {
    const checkPendingNavigation = async () => {
      try {
        const isPending = await AsyncStorage.getItem("auth_navigation_pending");

        if (isPending === "true") {
          const destination = await AsyncStorage.getItem(
            "auth_navigation_destination"
          );
          const needsReconnect = await AsyncStorage.getItem(
            "socket_needs_reconnect"
          );

          // Clear flags
          await AsyncStorage.removeItem("auth_navigation_pending");
          await AsyncStorage.removeItem("auth_navigation_destination");

          // Check if we need to reconnect socket (after OAuth)
          if (needsReconnect === "true") {
            console.log(
              "🔄 AuthNavigationHelper: Reconnecting socket after OAuth"
            );
            await AsyncStorage.removeItem("socket_needs_reconnect");

            try {
              await initialize();
              console.log("✅ Socket reconnected via AuthNavigationHelper");
            } catch (err) {
              console.error("❌ Socket reconnection failed:", err);
            }
          }

          // Navigate to destination
          if (destination) {
            router.replace(destination as any);
          }
        }
      } catch (err) {
        console.error("Error in AuthNavigationHelper:", err);
      }
    };

    checkPendingNavigation();
  }, []);

  return null;
}
