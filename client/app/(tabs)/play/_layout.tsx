import { Stack } from "expo-router";

export default function PlayLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // или true, если нужен хедер
      }}
    />
  );
}
