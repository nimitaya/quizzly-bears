import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Clear ALL auth-related flags before signing out
      await Promise.all([
        AsyncStorage.removeItem("password_recently_reset"),
        AsyncStorage.removeItem("password_recently_reset_persist"),
        AsyncStorage.removeItem("force_signed_in"),
        AsyncStorage.removeItem("had_password_reset"),
        AsyncStorage.removeItem("auth_token"),
      ]);

      await signOut();

      // Redirect to the welcome screen using router
      router.replace("/(auth)/LogInScreen");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity onPress={handleSignOut} style={styles.button}>
      <Text style={styles.text}>Sign out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    color: "#dc3545",
  },
});

export default SignOutButton;
