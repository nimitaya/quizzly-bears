//-- TESTZONE, ES WIRD NUR FÜR TESTS VERWENDET, NICHT FÜR PRODUCTION --//

import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SearchInput } from "@/components/Inputs";
import { RadioButton } from "@/components/RadioButton";
import { useEffect, useState } from "react";
import {
  saveDataToCache,
  QuizSpecs,
  loadCacheData,
  PlayStyle,
} from "@/utilities/quiz-logic/cacheUtils";

const LEVELS = [
  { label: "Easy: Cub Curious", value: "easy" },
  { label: "Medium: Bearly Brainy", value: "medium" },
  { label: "Hard: Grizzly Guru", value: "hard" },
];
const CACHE_KEY = "quizSpecs";

const CategoryScreen = () => {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState("medium");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");

  // ---------- FUNCTIONS ----------
  // send selected quiz info to cache
  const sendInformationToCache = async (category: string) => {
    const chosenSpecs: QuizSpecs = {
      quizCategory: category,
      quizLevel: selectedLevel,
      quizPlayStyle: playStyle,
    };
    try {
      await saveDataToCache(CACHE_KEY, chosenSpecs);
    } catch (error) {
      console.error("Failed to save specs:", error);
    }
  };

  // set the selected category, call cache function and navigate to StartQuizScreen
  const handleChosenCategory = (category: string) => {
    setSelectedCategory(category);
    sendInformationToCache(category);
    router.push("/(tabs)/play/StartQuizScreen");
  };

  // ---------- USE EFFECT ----------
  useEffect(() => {
    // Fetch cached quiz specs to set the play style
    const fetchCachedQuizSpecs = async () => {
      try {
        const cachedQuizSpecs = await loadCacheData(CACHE_KEY);
        if (cachedQuizSpecs) {
          setPlayStyle(cachedQuizSpecs.quizPlayStyle);
        }
      } catch (error) {
        console.error("Failed to load data from cache:", error);
      }
    };
    fetchCachedQuizSpecs();
  }, []);
  // ----------------------------------------
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
          <SearchInput
            placeholder="Your topic ..."
            value={selectedCategory}
            onChangeText={(text: string) => setSelectedCategory(text)}
          />
          <ButtonPrimary
            text="Search"
            onPress={() => handleChosenCategory(selectedCategory)}
          />
        </View>
        <View style={{ marginVertical: Gaps.g32 }}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            Or pick a prepared category
          </Text>
        </View>
        <View style={styles.preparedTopicContainer}>
          <ButtonSecondary
            text="History"
            onPress={() => handleChosenCategory("History")}
          />
          <ButtonSecondary
            text="Science"
            onPress={() => handleChosenCategory("Science")}
          />
          <ButtonSecondary
            text="Sports"
            onPress={() => handleChosenCategory("Sports")}
          />
          <ButtonSecondary
            text="Geography"
            onPress={() => handleChosenCategory("Geography")}
          />
          <ButtonSecondary
            text="Media"
            onPress={() => handleChosenCategory("Media")}
          />
          <ButtonSecondary
            text="Culture"
            onPress={() => handleChosenCategory("Culture")}
          />
          <ButtonSecondary
            text="Daily life"
            onPress={() => handleChosenCategory("Daily life")}
          />
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
  preparedTopicContainer: {
    gap: Gaps.g16,
  },
});

export default CategoryScreen;
