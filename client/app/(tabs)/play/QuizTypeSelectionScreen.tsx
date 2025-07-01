import { View, TouchableOpacity, StyleSheet } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { saveDataToCache, CACHE_KEY } from "@/utilities/cacheUtils";
import { QuizSettings, PlayStyle } from "@/utilities/quiz-logic/quizTypesInterfaces";

// Use the cache key for quiz settings
const cacheKey = CACHE_KEY.quizSettings; 

const QuizTypeSelectionScreen = () => {
  const router = useRouter();
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");

  // ---------- FUNCTIONS ----------
  // send selected Playstyle to cache
  const sendInformationToCache = async () => {
    const chosenSpecs: QuizSettings = {
      quizCategory: "",
      quizLevel: "medium",
      quizPlayStyle: playStyle,
      chosenTopic: "",
    };    
    try {
      await saveDataToCache(cacheKey, chosenSpecs);      
    } catch (error) {
      console.error("Failed to save specs:", error);
    }
  };

  // set the selected Playstyle, call cache function and navigate to CategoryScreen
  const handlePlayStyleChoice = (style: PlayStyle) => {
    setPlayStyle(style);
    sendInformationToCache();
    router.push("/(tabs)/play/CategoryScreen");
  };
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
      <View style={{ marginBottom: Gaps.g40 }}>
        <Logo size="big" />
      </View>
      <View style={styles.buttonContainer}>
        <ButtonPrimary
          text="Play alone"
          onPress={() => handlePlayStyleChoice("solo")}
        />
        <ButtonPrimary
          text="Play a duel"
          onPress={() => handlePlayStyleChoice("duel")}
        />
        <ButtonPrimary
          text="Play in group"
          onPress={() => handlePlayStyleChoice("group")}
        />
        <ButtonSecondary text="Mini games" />
      </View>
    </View>
  );
};
export default QuizTypeSelectionScreen;

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
  buttonContainer: {
    gap: Gaps.g32,
  },
});
