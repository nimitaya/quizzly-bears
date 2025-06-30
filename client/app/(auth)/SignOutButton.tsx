import { useClerk } from "@clerk/clerk-expo";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

const SignOutButton = () => {
  const { signOut } = useClerk();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSignOut = async () => {
    if (isProcessing) return; // Prevent multiple clicks

    setIsProcessing(true);

    try {
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
      // await AsyncStorage.setItem(
      //   "auth_navigation_destination",
      //   "/(auth)/LogInScreen"
      // );
      // Sign out from Clerk
      await signOut();
      // No need for router.replace here - AuthNavigationHelper will handle it
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      style={[styles.button, isProcessing && styles.disabledButton]}
      disabled={isProcessing}
    >
      <Text style={styles.text}>
        {isProcessing ? "Signing out..." : "Log out"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    color: "#dc3545",
  },
});

export default SignOutButton;
