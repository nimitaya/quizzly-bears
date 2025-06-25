import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Dummy data:
import quizQuestions from "@/utilities/quiz-logic/data";
import type { QuizQuestion } from "@/utilities/quiz-logic/data";

// ========================================================== TYPES ==========================================================
type AnswerState = {
  chosenAnswer: string | null;
  isSelected: boolean;
  isSubmitted: boolean;
  isLocked: boolean;
};
type PointsState = {
  score: number;
  timePoints: number;
  total: number;
};
// solo or group play TODO temporary
type PlayStyle = "solo" | "group";

export function useQuizLogic() {
  // Timer duration/ delays TODO
  const READ_TIMER_DURATION = 2000;
  const ANSWER_TIMER_DURATION = 5000;
  const NEXT_QUESTION_DELAY = 3000;

  // To reset Timers
  const readTimeout = useRef<number | null>(null);
  const answerTimeout = useRef<number | null>(null);

  // ========================================================== STATE MANAGEMENT ==========================================================
  const [currentQuestionData, setCurrentQuestionData] =
    useState<QuizQuestion | null>(null);
  const [currQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answerState, setAnswerState] = useState<AnswerState>({
    chosenAnswer: null,
    isSelected: false,
    isSubmitted: false,
    isLocked: false,
  });
  const [readTimer, setReadTimer] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(
    ANSWER_TIMER_DURATION / 1000
  );
  const [pointsState, setPointsState] = useState<PointsState>({
    score: 0,
    timePoints: 0,
    total: 0,
  });
  const [showResult, setShowResult] = useState<boolean>(false);

  // solo or group play TODO temporary
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");

  // ========================================================== FUNCTIONS ==========================================================
  // ===== PLACEHOLDER FOR FETCHING FROM CACHE TODO =====
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

  // ----- LOAD current question data -----
  const loadQuestions = async (): Promise<void> => {
    try {
      let questions = await fetchQuestionsFromCache();
      if (!questions) {
        // Fallback to dummy data if cache is empty
        questions = quizQuestions;
      }
      if (currQuestionIndex < questions.length) {
        // Reset
        setCurrentQuestionData(questions[currQuestionIndex]);
        setAnswerState(() => ({
          chosenAnswer: null,
          isSelected: false,
          isSubmitted: false,
          isLocked: false,
        }));
        // Start the timer for the question
        timingQuestions();
      } else {
        setShowResult(true);
        setAnswerState(() => ({
          chosenAnswer: null,
          isSelected: false,
          isSubmitted: false,
          isLocked: false,
        }));
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  // set TIMING for questions
  const timingQuestions = (): void => {
    readTimeout.current = setTimeout(() => {
      // Set read timer to true after 2 seconds to show the answers
      setReadTimer(true);
      // Start - you have 10 seconds to choose an answer
      answerTimeout.current = setTimeout(() => {
        setAnswerState((prevState) => ({ ...prevState, isLocked: true }));
        handleAnswerCheck();
        if (playStyle === "group") {
          handleNextQuestion();
        }
      }, ANSWER_TIMER_DURATION);
    }, READ_TIMER_DURATION);
  };

  // ----- Handle ANSWER SELECTION -----
  const handleAnswerSelect = (selectedOption: string): void => {
    if (answerState.isLocked) return;
    // Prevent further actions if answer is locked
    setAnswerState((prevState) => ({
      ...prevState,
      chosenAnswer: selectedOption,
      isSelected: true,
    }));
  };

  // ----- Handle SELECTION STATE for Quizbuttons -----
  const handleSelection = (option: string): boolean => {
    if (
      answerState.chosenAnswer === option &&
      !answerState.isSubmitted &&
      !answerState.isLocked
    ) {
      return true;
    } else if (!answerState.isSubmitted && answerState.isLocked) {
      return false;
    } else if (
      answerState.chosenAnswer === option &&
      answerState.isSubmitted &&
      answerState.isLocked
    ) {
      return true;
    } else {
      return false;
    }
  };

  // ----- Handle ANSWER SUBMISSION -----
  const handleAnswerSubmit = (): void => {
    setAnswerState((prevState) => ({
      ...prevState,
      isSubmitted: true,
      isLocked: true,
    }));
    handleAnswerCheck();
  };

  // ----- Handle ANSWER CHECK -----
  const handleAnswerCheck = (): void => {
    const isCorrect = answerState.chosenAnswer === currentQuestionData?.answer;
    if (isCorrect) {
      // Increment points for correct answer TODO correct points according to difficulty + Add to cache
      setPointsState((prevPoints) => ({
        ...prevPoints,
        score: prevPoints.score + 1,
        timePoints: prevPoints.timePoints + remainingTime,
      }));
    }
    // Logic for SOLO Play
    if (currQuestionIndex < quizQuestions.length - 1 && playStyle === "solo") {
      // Clear the timeout if answer is submitted early
      if (answerTimeout.current) {
        clearTimeout(answerTimeout.current);
        answerTimeout.current = null;
      }
      if (readTimeout.current) {
        clearTimeout(readTimeout.current);
        readTimeout.current = null;
      }
    }
  };

  // ----- Handle NEXT QUESTION -----
  const handleNextQuestion = (): void => {
    if (answerTimeout.current) {
      clearTimeout(answerTimeout.current);
      answerTimeout.current = null;
    }
    if (currQuestionIndex < quizQuestions.length - 1 && playStyle === "solo") {
      // Logic for Solo Play
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setReadTimer(false);
    } else if (
      currQuestionIndex < quizQuestions.length - 1 &&
      playStyle === "group"
    ) {
      // Logic for Group Play
      setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setReadTimer(false);
      }, NEXT_QUESTION_DELAY);
    } else {
      setShowResult(true);
      setAnswerState(() => ({
        chosenAnswer: null,
        isSelected: false,
        isSubmitted: false,
        isLocked: false,
      }));
    }
  };

  // ========================================================== USE EFFECTS ==========================================================
  // ----- INITIALIZE questions loading on mount and when currQuestionIndex changes -----
  useEffect(() => {
    loadQuestions();
    // clear the timeout if the component unmounts or new question is loaded
    return () => {
      if (answerTimeout.current) {
        clearTimeout(answerTimeout.current);
        answerTimeout.current = null;
      }
    };
  }, [currQuestionIndex]);

  // ----- Show COUNTDOWN Timer -----
  useEffect(() => {
    if (readTimer && !answerState.isLocked) {
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        setRemainingTime(ANSWER_TIMER_DURATION / 1000);
        clearInterval(interval);
      };
    }
  }, [readTimer, answerState.isLocked]);

  return {
    currentQuestionData,
    currQuestionIndex,
    answerState,
    readTimer,
    remainingTime,
    pointsState,
    showResult,
    playStyle,
    setPlayStyle,
    handleAnswerSelect,
    handleSelection,
    handleAnswerSubmit,
    handleNextQuestion,
  };
}
