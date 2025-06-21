import { Stack } from "expo-router";

// For all routes and the root of the grouped-routes
export default function RootLayout() {
  return (
    <Stack>
      {/* First Example - All pages we want to use go in here */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
