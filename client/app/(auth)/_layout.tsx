import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={"/(tabs)/play"} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SignUp" />
      <Stack.Screen name="LogIn" />
      <Stack.Screen name="LogInScreen" />
      <Stack.Screen name="GoogleSignInButton" />
      <Stack.Screen name="FacebookSignInButton" />
      <Stack.Screen name="ChangePassword" />
      <Stack.Screen name="ForgotPassword" />
    </Stack>
  );
}
