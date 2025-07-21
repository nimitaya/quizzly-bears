import React from "react";
import {
  View,
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
import { Logo } from "@/components/Logos";
import IconCheckbox from "@/assets/icons/IconCheckbox";
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
        {/* Welcome Guide Content */}
        <View style={styles.welcomeContainer}>
          <View style={{ marginBottom: Gaps.g32 }}>
            <Logo size="start" />
          </View>
          <View style={styles.descriptionContainer}>
            <View style={styles.textBox}>
              <Text style={styles.title}>Quizzly Bears Guide</Text>
              <View>
                <View style={styles.iconRow}>
                  <IconCheckbox />
                  <View>
                    <Text style={styles.pointsText}>AI-Generated</Text>
                    <Text style={styles.pointsTextTwo}>
                      Get unique quizzes created by AI
                    </Text>
                  </View>
                </View>
                <View style={styles.iconRow}>
                  <IconCheckbox />
                  <View>
                    <Text style={styles.pointsText}>Custom Topics</Text>
                    <Text style={styles.pointsTextTwo}>
                      Choose from our topics or enter your own (any language)
                    </Text>
                  </View>
                </View>
                <View style={styles.iconRow}>
                  <IconCheckbox />
                  <View>
                    <Text style={styles.pointsText}>Play Your Way</Text>
                    <Text style={styles.pointsTextTwo}>
                      Solo or with friends
                    </Text>
                  </View>
                </View>
                <View style={styles.iconRow}>
                  <IconCheckbox />
                  <View>
                    <Text style={styles.pointsText}>Compete & Win</Text>
                    <Text style={styles.pointsTextTwo}>
                      Score points, connect with friends, and become the weekly
                      best
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.customButton, { width: buttonWidth }]}
          onPress={handleFinish}
        >
          <Text style={styles.customButtonText}>Get Started</Text>
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
  welcomeContainer: {
    flex: 1,
    marginTop: Gaps.g40,
    alignItems: "center",
  },
  descriptionContainer: {
    marginBottom: Gaps.g24,
    alignItems: "center",
    width: "100%",
  },
  textBox: {
    alignItems: "flex-start",
  },
  title: {
    color: Colors.black,
    fontSize: FontSizes.H1Fs,
    marginBottom: Gaps.g16,
    textAlign: "left",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Gaps.g8,
    marginVertical: Gaps.g8,
  },
  pointsText: {
    fontSize: FontSizes.TextLargeFs,
  },
  pointsTextTwo: {
    fontSize: FontSizes.TextMediumFs,
    maxWidth: 280,
    flexShrink: 1,
  },
  customButton: {
    backgroundColor: Colors.primaryLimo,
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    alignSelf: "center",
    borderRadius: Radius.r50,
    marginTop: Gaps.g40,
    marginHorizontal: Gaps.g16,
  },
  customButtonText: {
    fontSize: FontSizes.TextLargeFs,
    color: Colors.black,
    fontFamily: "NotoSans-Regular",
  },
});
