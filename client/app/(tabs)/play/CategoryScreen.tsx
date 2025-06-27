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
  loadCacheData,
} from "@/utilities/quiz-logic/cacheUtils";
import {
  QuizSettings,
  PlayStyle,
  Difficulty,
} from "@/utilities/quiz-logic/quizTypesInterfaces";
import { CACHE_KEY } from "@/utilities/quiz-logic/cacheStructure";

const LEVELS = [
  { label: "Easy: Cub Curious", value: "easy" },
  { label: "Medium: Bearly Brainy", value: "medium" },
  { label: "Hard: Grizzly Guru", value: "hard" },
];
const cacheKey = CACHE_KEY.quizSettings; 

const CategoryScreen = () => {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("medium");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");

  // ---------- FUNCTIONS ----------
  // Send selected quiz info to cache
  const sendInformationToCache = async (category: string) => {
    const chosenSpecs: QuizSettings = {
      quizCategory: "",
      quizLevel: selectedLevel,
      quizPlayStyle: playStyle,
      chosenTopic: category
    };
    try {
      await saveDataToCache(cacheKey, chosenSpecs);
    } catch (error) {
      console.error("Failed to save specs:", error);
    }
  };

  // Set the selected category, call cache function and navigate to StartQuizScreen
  const handleChosenCategory = (category: string) => {
    setSelectedTopic(category);
    sendInformationToCache(category);
    router.push("/(tabs)/play/StartQuizScreen");
  };

  // ---------- USE EFFECT ----------
  useEffect(() => {
    // Fetch cached quiz specs to set the play style
    const fetchCachedQuizSpecs = async () => {
      try {
        const cachedQuizSpecs = await loadCacheData(cacheKey);
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
              onChange={() => setSelectedLevel(level.value as Difficulty)}
            />
          ))}
        </View>
        <View style={styles.searchToticBlock}>
          <SearchInput
            placeholder="Your topic ..."
            value={selectedTopic}
            onChangeText={(text: string) => setSelectedTopic(text)}
          />
          <ButtonPrimary
            text="Search"
            onPress={() => handleChosenCategory(selectedTopic)}
          />
        </View>
        <View style={{ marginVertical: Gaps.g32 }}>
          <Text style={{ fontSize: FontSizes.TextLargeFs }}>
            Or pick a prepared category
          </Text>
        </View>
        <View style={styles.preparedToticContainer}>
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
  preparedToticContainer: {
    gap: Gaps.g16,
  },
});

export default CategoryScreen;
