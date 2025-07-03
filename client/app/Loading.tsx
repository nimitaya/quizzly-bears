import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "@/styles/theme";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QuizLoader from "@/components/QuizLoader";

const LoadingOverlay = () => {
  const { isGloballyLoading, showLoading } = useGlobalLoading();
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = (params.returnTo as string) || null;

  const handleLoaderComplete = async () => {
    // Get the lastScreen from storage if no returnTo is provided
    let destination = returnTo;
    if (!destination) {
      try {
        destination =
          (await AsyncStorage.getItem("last_screen")) || "/(tabs)/play";
      } catch (err) {
        destination = "/(tabs)/play";
      }
    }
    
    setTimeout(() => {
      router.replace(destination as any);
    }, 1500);
  };

  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout>;

    const checkAndNavigate = async () => {
      if (!isGloballyLoading && isMounted) {
        // Get the lastScreen from storage if no returnTo is provided
        let destination = returnTo;
        if (!destination) {
          try {
            destination =
              (await AsyncStorage.getItem("last_screen")) || "/(tabs)/play";
          } catch (err) {
            destination = "/(tabs)/play";
          }
        }
        timer = setTimeout(() => {
          if (isMounted) {
            router.replace(destination as any);
          }
        }, 1500);
      }
    };
    checkAndNavigate();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [isGloballyLoading, router, returnTo]);

  return (
    <View style={styles.overlay}>
      <QuizLoader
        onComplete={handleLoaderComplete}
        minDuration={3000} // 3 Sekunden für den Loader
      />
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
    backgroundColor: Colors.white,
    zIndex: 9999,
  },
});
