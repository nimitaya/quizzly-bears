import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to the welcome screen using router
      router.replace("/");
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
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
    color: "#dc3545", // Red color for sign out
  },
});

export default SignOutButton;
