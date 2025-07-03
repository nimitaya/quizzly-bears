import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/styles/theme";
import WelcomeGuide from "@/components/WelcomeGuide";

const ONBOARDING_COMPLETED_KEY = "@onboarding_completed";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      router.replace("/");
    } catch (error) {
      console.error("Error saving onboarding state:", error);
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WelcomeGuide onNext={handleFinish} buttonText="Get Started" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgGray,
  },
});
