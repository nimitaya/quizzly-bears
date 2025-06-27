import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import ClerkSettings from "@/app/(auth)/ClerkSettings";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";

const ProfileScreen = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const handleAuthRedirect = () => {
    router.push("/(auth)/LogInScreen");
  };

  // Show loading state while checking auth
  if (!isLoaded) {
    return router.replace("../Loading");
  }

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>
      {/* Profile name aund settings */}
      {isSignedIn ? (
        // Show settings for signed-in users
        <ClerkSettings />
      ) : (
        // Show sign-in button for non-authenticated users

        <View>
          <Text>Sign in to access your profile settings</Text>
          <TouchableOpacity onPress={handleAuthRedirect}>
            <Text>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
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
