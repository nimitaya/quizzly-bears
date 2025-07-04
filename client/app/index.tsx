import { View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useOnboarding } from "@/providers/OnboardingProvider";
import PlayScreen from "./(tabs)/play/index";

export default function WelcomeScreen() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { shouldShowOnboarding: shouldShowOnboardingScreen, isLoading } = useOnboarding();

  // Navigate to onboarding if user hasn't seen it yet
  useEffect(() => {
    if (!isLoading && shouldShowOnboardingScreen) {
      router.push({
        pathname: "/onboarding",
      } as any);
    }
  }, [isLoading, shouldShowOnboardingScreen, router]);

  // Show loading while checking onboarding status
  if (isLoading) {
    return null; // Or your loading component
  }

  // Don't render anything if we're navigating to onboarding
  if (shouldShowOnboardingScreen) {
    return null;
  }

  // If user is signed in, show the play screen
  if (isSignedIn) {
    return <PlayScreen />;
  }

  // If not signed in, redirect to login
  return <Redirect href="/(auth)/LogInScreen" />;
}

export function Index() {
  return <Redirect href="/(tabs)/play" />;
}
