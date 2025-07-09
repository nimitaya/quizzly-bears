import { View, TouchableOpacity, Text, ScrollView, Alert } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { SearchInput } from "@/components/Inputs";
import { RadioButton } from "@/components/RadioButton";
import { useEffect, useState } from "react";
import { saveDataToCache, loadCacheData } from "@/utilities/cacheUtils";
import {
  QuizSettings,
  PlayStyle,
  Difficulty,
} from "@/utilities/quiz-logic/quizTypesInterfaces";
import { CACHE_KEY } from "@/utilities/cacheUtils";
//vadim der Funktion
import { categorizeTopic } from "@/utilities/api/quizApi";

const LEVELS = [
  { label: "Easy: Cub Curious", value: "easy" },
  { label: "Medium: Bearly Brainy", value: "medium" },
  { label: "Hard: Grizzly Guru", value: "hard" },
];
const PREDEFINED_CATEGORIES = [
  "History",
  "Science",
  "Sports",
  "Geography",
  "Media",
  "Culture",
  "Daily life",
];

const cacheKey = CACHE_KEY.quizSettings;

const CategoryScreen = () => {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>("medium");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");
  const [suggestedCategory, setSuggestedCategory] = useState<string>("");
  const [isMultiplayerMode, setIsMultiplayerMode] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);

  // ---------- FUNCTIONS ----------
  const sendInformationToCache = async (category: string, topic?: string) => {
    const chosenSpecs: QuizSettings = {
      quizCategory: category, // Kategorie wird jetzt das Thema sein
      quizLevel: selectedLevel,
      quizPlayStyle: playStyle,
      chosenTopic: topic || category, // User eingegebenes Topic
    };
    try {
      await saveDataToCache(cacheKey, chosenSpecs);
    } catch (error) {
      console.error("Failed to save specs:", error);
    }
  };

  // Set the selected category, call cache function and navigate accordingly
  const handleChosenCategory = async (category: string) => {
    let finalCategory = category;
    let specificTopic = category;

    // User enters a topic that needs to be categorized
    if (category === selectedTopic && selectedTopic.trim()) {
      try {
        finalCategory = await categorizeTopic(selectedTopic);
        specificTopic = selectedTopic;
        console.log(
          `Topic "${selectedTopic}" categorized as: ${finalCategory}`
        );
      } catch (error) {
        console.error("Error categorizing topic:", error);
        finalCategory = "Culture"; // Fallback
        specificTopic = selectedTopic; // Keep the entered topic even if categorization failed
      }
    }

    setSelectedTopic(selectedTopic || finalCategory);
    await sendInformationToCache(finalCategory, specificTopic);

    if (isMultiplayerMode && roomInfo) {
      // Save selected category to room info for multiplayer
      const updatedRoomInfo = {
        ...roomInfo,
        selectedCategory: finalCategory,
        selectedTopic: specificTopic,
      };
      await saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
      
      // For multiplayer admin, go back to lobby with selected category
      router.push("/(tabs)/play/MultiplayerLobby");
    } else {
      // For solo mode, go to StartQuizScreen as before
      router.push("/(tabs)/play/StartQuizScreen");
    }
  };

  //vadim: auto analyze wenn user hat aufgehört zu tippen, wichtig JA / NEIN? Mal prüfen
  useEffect(() => {
    if (selectedTopic.trim().length >= 3) {
      const delayedAnalysis = setTimeout(async () => {
        try {
          const category = await categorizeTopic(selectedTopic);
          setSuggestedCategory(category);
        } catch (error) {
          console.error("Error in background analysis:", error);
        }
      }, 1000); // nach 1 Sekunde

      return () => clearTimeout(delayedAnalysis);
    } else {
      setSuggestedCategory("");
    }
  }, [selectedTopic]);

  // ---------- USE EFFECT ----------
  useEffect(() => {
    // Fetch cached quiz specs to set the play style
    const fetchCachedQuizSpecs = async () => {
      try {
        const cachedQuizSpecs = await loadCacheData(cacheKey);
        if (cachedQuizSpecs) {
          setPlayStyle(cachedQuizSpecs.quizPlayStyle);
        }

        // Check if we're in multiplayer mode
        const cachedRoomInfo = await loadCacheData(CACHE_KEY.currentRoom);
        if (
          cachedRoomInfo &&
          (cachedRoomInfo.isAdmin || cachedRoomInfo.isHost)
        ) {
          setIsMultiplayerMode(true);
          setRoomInfo(cachedRoomInfo);
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
            placeholder="your topic ..."
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
