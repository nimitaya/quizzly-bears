import socketService from "@/utilities/socketService";
import { useClerk } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { ButtonSecondary } from "@/components/Buttons";
import { useRouter } from "expo-router";

const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignOut = async () => {
    if (isProcessing) return; // Prevent multiple clicks

    setIsProcessing(true);

    try {
      // Force disconnect and clear pending operations
      console.log("🔒 Logging out - disconnecting socket");
      socketService.disconnect();

      // Clear socket state (add this method to your socketService)
      socketService.clearPendingOperations();

      // Clear auth-related flags
      await Promise.all([
        AsyncStorage.removeItem("password_recently_reset"),
        AsyncStorage.removeItem("password_recently_reset_persist"),
        AsyncStorage.removeItem("force_signed_in"),
        AsyncStorage.removeItem("had_password_reset"),
        AsyncStorage.removeItem("auth_token"),
      ]);

      // Set up navigation for AuthNavigationHelper to handle
      await AsyncStorage.setItem("auth_navigation_pending", "true");
      await AsyncStorage.setItem(
        "auth_navigation_destination",
        "/(auth)/LogInScreen"
      );

      // Sign out from Clerk
      await signOut();

      // Navigate to login
      router.replace("/(auth)/LogInScreen");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ButtonSecondary
      text={isProcessing ? "Signing out..." : "Log out"}
      onPress={handleSignOut}
      disabled={isProcessing}
    />
  );
};

export default SignOutButton;
