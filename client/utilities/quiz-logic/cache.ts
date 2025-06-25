import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QuizQuestion } from "@/utilities/quiz-logic/data";

// ===== FETCHING Questions FROM CACHE TODO =====
  const fetchQuestionsFromCache = async (): Promise<QuizQuestion[] | null> => {
    try {
      const cached = await AsyncStorage.getItem("quizQuestions");
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error("Error fetching questions from cache:", error);
      return null;
    }
  };

// TODO create reusable Hook for cache interaction
// implement in Quiz- and Points-Logik and more