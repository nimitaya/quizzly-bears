import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import IconCheckbox from "@/assets/icons/IconCheckbox";
import { useState, useEffect } from "react";
import { PlayStyle, loadCacheData } from "@/utilities/quiz-logic/cacheUtils";

const StartQuizScreen = () => {
  const router = useRouter();
  const CACHE_KEY = "quizSpecs";
  const [level, setLevel] = useState("medium");
  const [category, setCategory] = useState<string>("");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");

  // ---------- USE EFFECT ----------
  // Fetch cached quiz specs to set information
  useEffect(() => {
    const fetchCachedQuizSpecs = async () => {
      try {
        const cachedQuizSpecs = await loadCacheData(CACHE_KEY);
        if (cachedQuizSpecs) {
          setLevel(cachedQuizSpecs.quizLevel);
          setCategory(cachedQuizSpecs.quizCategory);
          setPlayStyle(cachedQuizSpecs.quizPlayStyle);
        }
      } catch (error) {
        console.error("Failed to load data from cache:", error);
      }
    };
    fetchCachedQuizSpecs();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <IconArrowBack />
      </TouchableOpacity>
      <View style={{ marginBottom: Gaps.g40 }}>
        <Logo size="big" />
      </View>
      {/* Summary Container */}
      <View style={styles.summaryContainer}>
        <Text style={{ fontSize: FontSizes.H1Fs }}>That's the great!</Text>
        <View style={{ marginTop: Gaps.g16, gap: Gaps.g16 }}>
          <View style={styles.pointsRow}>
            <IconCheckbox />
            <Text style={styles.pointsText}>Chosen topic: {category}</Text>
          </View>
          <View style={styles.pointsRow}>
            <IconCheckbox />
            <Text style={styles.pointsText}>Chosen level: {level[0].toUpperCase()+level.slice(1)}</Text>

          </View>
          <View style={styles.pointsRow}>
            <IconCheckbox />
            <Text style={styles.pointsText}>
              10 questions, max 30 seconds each
            </Text>
          </View>
        </View>
      </View>
      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <ButtonPrimary
          text="Start"
          onPress={() => router.push("/(tabs)/play/QuizScreen")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: -8,
    left: 16,
    zIndex: 10,
  },
  summaryContainer: {
    marginBottom: Gaps.g48,
    alignSelf: "flex-start",
    marginLeft: Gaps.g32,
  },
  button: {
    marginTop: Gaps.g32,
    alignSelf: "flex-end",
  },
  buttonContainer: {
    gap: Gaps.g32,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gaps.g8,
  },
  pointsText: {
    fontSize: FontSizes.TextLargeFs,
  },
});
export default StartQuizScreen;
