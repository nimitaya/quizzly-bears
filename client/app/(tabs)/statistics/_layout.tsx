import { Stack } from "expo-router";

export default function StatisticslLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // или true, если нужен хедер
      }}
    />
  );
}
