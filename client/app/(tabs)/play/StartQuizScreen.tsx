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
import QuizLoader from "@/components/QuizLoader";
import { aiQuestions } from "@/utilities/quiz-logic/data";

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
  const [showLoader, setShowLoader] = useState(false);
  const { withLoading, isGloballyLoading } = useGlobalLoading();

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
      setShowLoader(true); // Zeige den Loader

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

      // Loader läuft mindestens 6 Sekunden, auch wenn KI schneller ist
      // Der onComplete Callback wird nach dem Countdown aufgerufen
      // Keine Navigation hier - der Loader macht das
    } catch (error) {
      console.error("Error generating questions:", error);
      setShowLoader(false);
      setIsGeneratingQuestions(false);
    }
  };

  // NEUE FUNKTION: Test-Modus mit Dummy-Daten
  const handleTestQuiz = async () => {
    try {
      console.log("Starting test quiz with dummy data...");
      setIsGeneratingQuestions(true);
      setShowLoader(true);

      // Verwende Dummy-Daten statt KI-Anfrage
      const dummyQuestionsData = {
        category: topic || "Test",
        questionArray: aiQuestions.questionArray,
      };

      console.log("Using dummy questions data:", dummyQuestionsData);
      console.log("Dummy questions array length:", dummyQuestionsData.questionArray.length);
      
      // Speichere Dummy-Daten
      await saveDataToCache(cacheAi, dummyQuestionsData);
      console.log("Dummy questions saved to cache successfully");

      // Loader läuft trotzdem 3 Sekunden + Countdown
    } catch (error) {
      console.error("Error in test mode:", error);
      setShowLoader(false);
      setIsGeneratingQuestions(false);
    }
  };

  const handleLoaderComplete = () => {
    console.log("Loader complete - navigating to QuizScreen");
    setShowLoader(false);
    setIsGeneratingQuestions(false);
    // Navigation zur Quiz-Screen nach dem Loader
    router.push("/(tabs)/play/QuizScreen");
  };

  // ---------- USE EFFECT ----------
  // Fetch cached quiz specs to set information
  useEffect(() => {
    fetchCachedQuizSpecs();
  }, []);

  // Reset loader state when component mounts
  useEffect(() => {
    setShowLoader(false);
    setIsGeneratingQuestions(false);
  }, []);

  // Zeige den Loader wenn aktiv
  if (showLoader) {
    return (
      <QuizLoader
        key={`loader-${Date.now()}`} // Eindeutiger key für jeden Loader
        onComplete={handleLoaderComplete}
        minDuration={10000} // 10 Sekunden für Test
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
        {/* Test-Button für Dummy-Daten */}
        <ButtonSecondary
          text="Test Mode (Dummy Data)"
          onPress={handleTestQuiz}
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
