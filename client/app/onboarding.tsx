import React from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, FontSizes, Radius, Gaps } from "@/styles/theme";
import WelcomeGuide from "@/components/WelcomeGuide";
import { useOnboarding } from "@/providers/OnboardingProvider";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";

const ONBOARDING_COMPLETED_KEY = "@onboarding_completed";

export default function OnboardingScreen() {
  const router = useRouter();
  const { markOnboardingCompleted } = useOnboarding();
  const { shouldShowLoading } = useGlobalLoading();
  const { width } = useWindowDimensions();

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      markOnboardingCompleted();
      router.replace("/");
    } catch (error) {
      console.error("Error saving onboarding state:", error);
      markOnboardingCompleted();
      router.replace("/");
    }
  };

  const buttonWidth = Math.min(348, width - 32);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeGuide showButton={false} />

        <TouchableOpacity
          style={[styles.customButton, { width: buttonWidth }]}
          onPress={handleFinish}
        >
          <Text style={styles.customButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Gaps.g40,
  },
  customButton: {
    backgroundColor: Colors.primaryLimo,
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    width: 48,
    alignSelf: "center",
    borderRadius: Radius.r50,
    marginTop: Gaps.g16,
    marginHorizontal: Gaps.g16,
  },
  customButtonText: {
    fontSize: FontSizes.H3Fs,
    color: Colors.black,
    fontFamily: "NotoSans-Regular",
  },
});
