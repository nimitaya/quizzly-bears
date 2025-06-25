import IconBearTab from "@/assets/icons/IconBearTab";
import IconBearTabAktiv from "@/assets/icons/IconBearTabAktiv";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import ClerkSettings from "@/app/(auth)/ClerkSettings";
import QuizComponent from "@/components/QuizComponent";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>ProfileScreen</Text>
      <IconBearTab />
      <IconBearTabAktiv />
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
      <QuizComponent />
    </View>
  );
};
export default ProfileScreen;
