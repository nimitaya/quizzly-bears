import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SearchInput } from "@/components/Inputs";
import { RadioButton } from "@/components/RadioButton";
import { useState } from "react";
import { saveDataToCache } from "@/utilities/quiz-logic/cacheUtils";
import { QuizData } from "@/utilities/quiz-logic/cacheUtils";

const LEVELS = [
  { label: "Easy: Cub Curious", value: "easy" },
  { label: "Medium: Bearly Brainy", value: "medium" },
  { label: "Hard: Grizzly Guru", value: "hard" },
];
const CACHE_KEY = "quizData";

const CategoryScreen = () => {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const sendInformationToCache = async (level: string) => {
    const chosenSpecs: QuizData = {
      quizCategory: "selectedLevel",
      quizLevel: selectedLevel,
      quizQuestions: {},
    };
    try {
      await saveDataToCache(CACHE_KEY, chosenSpecs);
    } catch (error) {
      console.error("Failed to save points:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <IconArrowBack />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: Gaps.g24 }}>
          <Logo size="small" />
        </View>
        <View style={styles.levelSelectionBlock}>
          {LEVELS.map((level) => (
            <RadioButton
              key={level.value}
              label={level.label}
              selected={selectedLevel === level.value}
              onChange={() => setSelectedLevel(level.value)}
            />
          ))}
        </View>
        <View style={styles.searchToticBlock}>
          <SearchInput placeholder="Your topic ..." />
          <ButtonPrimary text="Search" />
        </View>
        <View style={{ marginVertical: Gaps.g32 }}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            Or pick a prepared category
          </Text>
        </View>
        <View style={styles.preparedToticContainer}>
          <ButtonSecondary
            text="History"
            onPress={() => router.push("/(tabs)/play/StartQuizScreen")}
          />
          <ButtonSecondary text="Science" />
          <ButtonSecondary text="Sports" />
          <ButtonSecondary text="Geography" />
          <ButtonSecondary text="Media" />
          <ButtonSecondary text="Culture" />
          <ButtonSecondary text="Daily life" />
        </View>
      </ScrollView>
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
  scrollContent: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
  searchToticBlock: {
    gap: Gaps.g16,
  },
  levelSelectionBlock: {
    marginBottom: Gaps.g32,
  },
  preparedToticContainer: {
    gap: Gaps.g16,
  },
});

export default CategoryScreen;
