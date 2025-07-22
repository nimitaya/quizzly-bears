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
      // Disconnect socket and clear pending operations
      socketService.disconnect();
      socketService.clearPendingOperations();

      // Clear auth-related flags
      await Promise.all([
        AsyncStorage.removeItem("password_recently_reset"),
        AsyncStorage.removeItem("password_recently_reset_persist"),
        AsyncStorage.removeItem("force_signed_in"),
        AsyncStorage.removeItem("had_password_reset"),
        AsyncStorage.removeItem("auth_token"),
      ]);

      // Set navigation flags for AuthNavigationHelper
      await AsyncStorage.setItem("auth_navigation_pending", "true");
      await AsyncStorage.setItem(
        "auth_navigation_destination",
        "/(auth)/LogInScreen"
      );

      // Sign out from Clerk
      await signOut();

      // Navigate to login screen
      router.replace("/(auth)/LogInScreen");
    } catch {
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
