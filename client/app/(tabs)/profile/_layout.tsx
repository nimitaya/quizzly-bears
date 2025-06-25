import { Stack } from "expo-router";

export default function ProfilLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // или true, если нужен хедер
      }}
    />
  );
}
