import IconBearTab from "@/assets/icons/IconBearTab";
import IconBearTabAktiv from "@/assets/icons/IconBearTabAktiv";
import { Text, View, TouchableOpacity } from "react-native";
import ClerkSettings from "@/app/(auth)/ClerkSettings";
import QuizComponent from "@/components/QuizComponent";
import { useUser } from "@clerk/clerk-expo";
import { useRouter, useFocusEffect } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Colors, FontSizes } from "@/styles/theme";
import Loading from "@/app/Loading";

const ProfileScreen = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const isMounted = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Set up isMounted ref for safe operations
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Force ClerkSettings to re-render when tab is focused
  useFocusEffect(
    useCallback(() => {
      console.log("Profile tab focused - forcing ClerkSettings refresh");
      if (isMounted.current) {
        // Increment the key to force re-render
        setRefreshKey((prev) => prev + 1);
      }

      return () => {
        // Tab lost focus - no cleanup needed
      };
    }, [])
  );

  const handleAuthRedirect = () => {
    if (isMounted.current) {
      // Safe navigation
      setTimeout(() => {
        router.push("/(auth)/LogIn");
      }, 100);
    }
  };

  // Show loading state while checking auth
  if (!isLoaded) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>ProfileScreen</Text>
      <IconBearTab />
      <IconBearTabAktiv />
      {isSignedIn ? (
        // Pass refreshKey as a prop instead of using it as part of key
        <ClerkSettings refreshKey={refreshKey} />
      ) : (
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
