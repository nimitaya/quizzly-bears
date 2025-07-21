import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "@/styles/theme";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QuizLoader from "@/components/QuizLoader";

const LoadingOverlay = () => {
  const { isGloballyLoading } = useGlobalLoading();
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = (params.returnTo as string) || null;

  // Unified function to get destination
  const getDestination = async (): Promise<string> => {
    if (returnTo) {
      return returnTo;
    }

    try {
      const lastScreen = await AsyncStorage.getItem("last_screen");
      return lastScreen || "/(tabs)/play";
    } catch (err) {
      return "/(tabs)/play";
    }
  };
  // Unified navigation function - called only when QuizLoader is completed
  const handleLoaderComplete = async () => {
    const destination = await getDestination();
    router.replace(destination as any);
  };

  return (
    <View style={styles.overlay}>
      <QuizLoader onComplete={handleLoaderComplete} minDuration={3000} />
    </View>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.bgGray,
    zIndex: 9999,
  },
});
