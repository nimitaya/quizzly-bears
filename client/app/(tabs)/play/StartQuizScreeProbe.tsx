//-- TESTZONE, ES WIRD NUR FÜR TESTS VERWENDET, NICHT FÜR PRODUCTION --//

import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import IconCheckbox from "@/assets/icons/IconCheckbox";
import { useState, useEffect } from "react";
import { loadCacheData } from "@/utilities/quiz-logic/cacheUtils";
import { generateMultipleQuizQuestions } from "@/utilities/api/quizApi";
import { Difficulty } from "@/utilities/types";
import { PlayStyle } from "@/utilities/quiz-logic/quizTypesInterfaces";
import { CACHE_KEY } from "@/utilities/quiz-logic/cacheStructure";
//vadim
import { saveDataToCache } from "@/utilities/quiz-logic/cacheUtils";

const StartQuizScreen = () => {
  const router = useRouter();
  const cacheKey = CACHE_KEY.quizSettings;
  const [level, setLevel] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState<string>("");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");
  const [rounds, setRounds] = useState(10);
//vadim
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);


  // ---------- Functions ----------
  const fetchCachedQuizSpecs = async () => {
    try {
      const cachedQuizSpecs = await loadCacheData(cacheKey);
      if (cachedQuizSpecs) {
        console.log(cachedQuizSpecs);
        
        setLevel(cachedQuizSpecs.quizLevel);
        setTopic(cachedQuizSpecs.chosenTopic);
        setPlayStyle(cachedQuizSpecs.quizPlayStyle);
      }
    } catch (error) {
      console.error("Failed to load data from cache:", error);
    }
  };

  //vadim
  // Función para generar y guardar preguntas
const handleStartQuiz = async () => {
  setIsGeneratingQuestions(true);
  try {
    // Generar 10 preguntas
    const questions = await generateMultipleQuizQuestions(topic, level, 10);
    
    // Guardar en cache
    const questionsData = {
      category: topic,
      questionArray: questions
    };
    
    await saveDataToCache(CACHE_KEY.aiQuestions, questionsData);
    

  } catch (error) {
    console.error("Error generating questions:", error);
    // Aquí podrías mostrar un mensaje de error al usuario
  } finally {
    setIsGeneratingQuestions(false);
  }
};


// IMPORTANT
  // const handleStartQuiz = (topic: string, level: Difficulty, rounds: number) => {
  //   router.push("/(tabs)/play/QuizScreen")

  //   generateMultipleQuizQuestions(topic, level, rounds)
  // }

  // ---------- USE EFFECT ----------
  // Fetch cached quiz specs to set information
  useEffect(() => {
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
            <Text style={styles.pointsText}>Chosen topic: {topic}</Text>
          </View>
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
        {/*vadim */}
        <ButtonPrimary
  text={isGeneratingQuestions ? "Generating..." : "Start"}
  onPress={handleStartQuiz}
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