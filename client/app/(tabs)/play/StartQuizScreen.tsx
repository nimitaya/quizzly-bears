import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import IconCheckbox from "@/assets/icons/IconCheckbox";
import { useState, useEffect } from "react";
import { loadCacheData, saveDataToCache } from "@/utilities/cacheUtils";
//import { generateMultipleQuizQuestions } from "@/utilities/api/QiuzzApiTest"; //openrouter
import { generateMultipleQuizQuestions } from "@/utilities/api/quizApi"; // groq
import { Difficulty } from "@/utilities/types";
import { PlayStyle } from "@/utilities/quiz-logic/quizTypesInterfaces";
import { CACHE_KEY } from "@/utilities/cacheUtils";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import Countdown from "@/components/Countdown";
import QuizLoader from "@/components/QuizLoader";
import CustomAlert from "@/components/CustomAlert";

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
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  // IMPORTANT - Corrected handleStartQuiz function
  const handleStartQuiz = async (
    topic: string,
    level: Difficulty,
    rounds: number
  ) => {
    try {
      console.log("Starting quiz generation...");
      setIsGeneratingQuestions(true);
      setShowLocalLoader(true);

      // we use the data from the cache to get the topic
      const cachedInfo = await loadCacheData(cacheKey);
      const specificTopic = cachedInfo?.chosenTopic || topic;

      console.log(
        `Generiere Fragen für das spezifische Thema: "${specificTopic}"`
      );

      // IMPORTANT: AI must finish before proceeding
      const questionsData = await generateMultipleQuizQuestions(
        specificTopic,
        level,
        rounds
      );

      console.log("🌐 AI raw content received!");
      console.log("Generated Questions Data:", questionsData);

      // The API already returns AiQuestions, save directly
      await saveDataToCache(cacheAi, questionsData);
      console.log("Questions saved to cache successfully");

      // Only after receiving data from AI, hide the loader and show countdown
      setShowLocalLoader(false);
      setIsGeneratingQuestions(false);
      setShowCountdown(true);
    } catch (error) {
      console.error("Error generating questions:", error);

      // Show error to user
      setShowLocalLoader(false);
      setIsGeneratingQuestions(false);
      setErrorMessage(
        "Failed to generate questions. Please try again or check your internet connection."
      );
      setShowErrorAlert(true);
    }
  };

  const handleCountdownComplete = () => {
    console.log("Countdown complete - navigating to QuizScreen");
    setShowCountdown(false);
    setIsGeneratingQuestions(false);
    // Navigation zur Quiz-Screen nach dem Countdown
    router.push("/(tabs)/play/QuizScreen");
  };

  const handleErrorAlertClose = () => {
    setShowErrorAlert(false);
    setErrorMessage("");
  };

  const handleErrorAlertConfirm = () => {
    setShowErrorAlert(false);
    setErrorMessage("");
    // You can try again or go back
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

  // Show the local loader when AI is generating questions
  if (showLocalLoader && isGeneratingQuestions) {
    return (
      <QuizLoader
        key={`ai-questions-loader-${Date.now()}`}
        onComplete={() => {
          console.log(
            "QuizLoader animation cycle completed, but waiting for AI..."
          );
        }}
        minDuration={1000} // Minimum display duration for the loader
        waitForExternal={true} // Wait for external signal (AI generation completion)
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

      {/* Error Alert */}
      <CustomAlert
        visible={showErrorAlert}
        onClose={handleErrorAlertClose}
        title="Generation Failed"
        message={errorMessage}
        cancelText="Back"
        confirmText="Try Again"
        onConfirm={() => {
          handleErrorAlertConfirm();
          handleStartQuiz(topic, level, rounds);
        }}
        noInternet={false}
      />

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
