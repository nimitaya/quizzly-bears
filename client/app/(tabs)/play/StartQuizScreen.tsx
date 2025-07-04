import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import IconCheckbox from "@/assets/icons/IconCheckbox";
import { useState, useEffect } from "react";
import { loadCacheData, saveDataToCache } from "@/utilities/cacheUtils";
import { generateMultipleQuizQuestions } from "@/utilities/api/quizApi";
import { Difficulty } from "@/utilities/types";
import { PlayStyle } from "@/utilities/quiz-logic/quizTypesInterfaces";
import { CACHE_KEY } from "@/utilities/cacheUtils";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import Countdown from "@/components/Countdown";
import QuizLoader from "@/components/QuizLoader";

const StartQuizScreen = () => {
  const router = useRouter();
  const cacheKey = CACHE_KEY.quizSettings;
  const cacheAi = CACHE_KEY.aiQuestions;
  const [level, setLevel] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");
  const [rounds, setRounds] = useState(10);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showLocalLoader, setShowLocalLoader] = useState(false);
  const { withLoading, isGloballyLoading, showLoading } = useGlobalLoading();

  // ---------- Functions ----------
  const fetchCachedQuizSpecs = async () => {
    try {
      const cachedQuizSpecs = await loadCacheData(cacheKey);
      if (cachedQuizSpecs) {
        console.log(cachedQuizSpecs);
        setCategory(cachedQuizSpecs.quizCategory);
        setLevel(cachedQuizSpecs.quizLevel);
        setTopic(cachedQuizSpecs.chosenTopic);
        setPlayStyle(cachedQuizSpecs.quizPlayStyle);
      }
    } catch (error) {
      console.error("Failed to load data from cache:", error);
    }
  };

  // IMPORTANT - Función handleStartQuiz corregida
  const handleStartQuiz = async (
    topic: string,
    level: Difficulty,
    rounds: number
  ) => {
    try {
      console.log("Starting quiz generation...");
      setIsGeneratingQuestions(true);
      setShowLocalLoader(true);

      // wir benutzen die Data aus dem Cache, um das Thema zu bekommen
      const cachedInfo = await loadCacheData(cacheKey);
      const specificTopic = cachedInfo?.chosenTopic || topic;

      console.log(
        `Generiere Fragen für das spezifische Thema: "${specificTopic}"`
      );

      //  WICHTIG: IA muss fertig sein, um weiter zu gehenm
      const questionsData = await generateMultipleQuizQuestions(
        specificTopic,
        level,
        rounds
      );

      console.log("Generated Questions Data:", questionsData);
      console.log("Questions array length:", questionsData.questionArray?.length);
      
      // Die API gibt bereits AiQuestions zurück, speichere direkt
      await saveDataToCache(cacheAi, questionsData);
      console.log("Questions saved to cache successfully");

      // Starte direkt den Countdown nach der KI-Generierung
      setShowLocalLoader(false);
      setShowCountdown(true);
    } catch (error) {
      console.error("Error generating questions:", error);
      setIsGeneratingQuestions(false);
      setShowLocalLoader(false);
    }
  };

  const handleCountdownComplete = () => {
    console.log("Countdown complete - navigating to QuizScreen");
    setShowCountdown(false);
    setIsGeneratingQuestions(false);
    // Navigation zur Quiz-Screen nach dem Countdown
    router.push("/(tabs)/play/QuizScreen");
  };

  // ---------- USE EFFECT ----------
  // Fetch cached quiz specs to set information
  useEffect(() => {
    fetchCachedQuizSpecs();
  }, []);

  // Reset loader state when component mounts
  useEffect(() => {
    setShowCountdown(false);
    setShowLocalLoader(false);
    setIsGeneratingQuestions(false);
  }, []);

  // Zeige den lokalen Loader wenn aktiv
  if (showLocalLoader) {
    return (
      <QuizLoader
        key={`local-loader-${Date.now()}`}
        onComplete={() => {
          setShowLocalLoader(false);
          setShowCountdown(true);
        }}
        minDuration={3000} // 3 Sekunden für den Loader
      />
    );
  }

  // Zeige den Countdown wenn aktiv
  if (showCountdown) {
    return (
      <Countdown
        key={`countdown-${Date.now()}`} // Eindeutiger key für jeden Countdown
        onComplete={handleCountdownComplete}
        startNumber={3}
        duration={1500}
      />
    );
  }

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
            <Text style={styles.pointsText}>Chosen topic: {topic}</Text>
          </View>
          {category !== topic && (
            <View style={styles.pointsRow}>
              <IconCheckbox />
              <Text style={styles.pointsText}>
                Assigned category: {category}
              </Text>
            </View>
          )}
          <View style={styles.pointsRow}>
            <IconCheckbox />
            <Text style={styles.pointsText}>Chosen level: {level}</Text>
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
          text={isGeneratingQuestions ? "Generating..." : "Start"}
          onPress={() => {
            handleStartQuiz(topic, level, rounds);
          }}
          disabled={isGeneratingQuestions}
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
