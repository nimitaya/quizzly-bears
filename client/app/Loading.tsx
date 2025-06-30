import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Logo } from "@/components/Logos";
import { Gaps, Colors } from "@/styles/theme";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoadingOverlay = () => {
  const { isGloballyLoading } = useGlobalLoading();
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = (params.returnTo as string) || null;

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
      <View style={styles.container}>
        <Logo size="big" />
        <Image
          source={{
            uri: "https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif",
          }}
          style={{ width: 100, height: 100, alignSelf: "center" }}
          accessibilityLabel="Loading animation"
        />
      </View>
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
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Gaps.g40,
  },
});
