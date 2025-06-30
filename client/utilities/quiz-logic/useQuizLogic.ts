import { useState, useEffect, useRef } from "react";
import {
  calculatePoints,
  cachePoints,
  clearCachePoints,
  sendPointsToDatabase,
  checkCache,
} from "@/utilities/quiz-logic/pointsUtils";
import { loadCacheData } from "./cacheUtils";
import {
  GameState,
  AnswerState,
  PointsState,
} from "@/utilities/quiz-logic/quizTypesInterfaces";
// Dummy data: TODO
import { AiQuestions, aiQuestions, QuestionStructure
 } from "@/utilities/quiz-logic/data";

// ========================================================== START OF HOOK ==========================================================
export function useQuizLogic() {
  const CACHE_KEY = {
    aiQuestions: "aiQuestions",
    quizSettings: "quizSettings",
    gameData: "currGameData",
  };
  // Timer duration/ delays TODO
  const READ_TIMER_DURATION = 2000;
  const ANSWER_TIMER_DURATION = 5000;
  const NEXT_QUESTION_DELAY = 3000;

  // To reset Timers
  const readTimeout = useRef<number | null>(null);
  const answerTimeout = useRef<number | null>(null);

  // ========================================================== STATE MANAGEMENT ==========================================================
  // TODO combine states
  const [language, setLanguage] = useState("de");
  const [currQuestionsArray, setCurrQuestionsArray] = useState<QuestionStructure[]>([]);
  const [currentQuestionData, setCurrentQuestionData] =
    useState<QuestionStructure | null>(null);
  const [currQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  // TODO setGameState
  const [gameState, setGameState] = useState<GameState>({
    difficulty: "medium",
    category: "",
    playStyle: "solo",
  });
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
    perfectGame: 0,
    total: 0,
    chosenCorrect: 0,
    totalAnswers: 0,
  });
  const [showResult, setShowResult] = useState<boolean>(false);

  // ========================================================== FUNCTIONS ==========================================================
  // ===== FETCHING FROM CACHE TODO =====
  const fetchFromCache = async (key: string) => {
    try {
      const cachedData = await loadCacheData(key);
      if (cachedData) {
        return cachedData;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching data with key ${key} from cache:`, error);
      return null;
    }
  };

  // ----- fetch Data and set Game State -----
  const fetchGameInfo = async () => {
    try {
      const cachedInfo = await loadCacheData(CACHE_KEY.quizSettings);
      if (cachedInfo) {
        setGameState((prev) => ({
          ...prev,
          difficulty: cachedInfo.quizLevel,
          category: cachedInfo.quizCategory,
          playStyle: cachedInfo.quizPlayStyle,
        }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  // ----- fetch Data and set all Questions Array -----
  const fetchAiData = async () => {
    try {
      const cachedInfo = await loadCacheData(CACHE_KEY.aiQuestions);
      if (cachedInfo) {
        setCurrQuestionsArray(cachedInfo.questionArray);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  // ===== Quiz functionality =====
  // ----- LOAD current question data -----
  const loadQuestions = async (): Promise<void> => {
    try {
      // fetch questions from cache
      let questions = await fetchFromCache(CACHE_KEY.aiQuestions);
      if (!questions) {
        // Fallback to dummy data if cache is empty
        questions = aiQuestions;
        setCurrQuestionsArray(questions.questionArray);
      }
      if (currQuestionIndex < questions.questionArray.length) {
        // Reset
        setCurrentQuestionData(questions.questionArray[currQuestionIndex]);
        setAnswerState((prev) => ({
          ...prev,
          chosenAnswer: null,
          isSelected: false,
          isSubmitted: false,
          isLocked: false,
        }));
        // Start the timer for the question
        timingQuestions();
      } else {
        setShowResult(true);
        setAnswerState((prev) => ({
          ...prev,
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

  // ----- set TIMING for questions -----
  const timingQuestions = (): void => {
    readTimeout.current = setTimeout(() => {
      // Set read timer to true after 2 seconds to show the answers
      setReadTimer(true);
      // Start - you have 10 seconds to choose an answer
      answerTimeout.current = setTimeout(() => {
        setAnswerState((prevState) => ({ ...prevState, isLocked: true }));
        handleAnswerCheck();
        if (gameState.playStyle === "group" || "duel") {
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

  // ----- HELPER for finding correct answer -----
  const getIsCorrect = (): boolean => {
  if (!currentQuestionData || !answerState.chosenAnswer) return false;
  const { optionA, optionB, optionC, optionD } = currentQuestionData;
  const options = [optionA, optionB, optionC, optionD];
  const chosenText = answerState.chosenAnswer;
  // Find the matching option (in the current language)
  const matchedOption = options.find((option) => option[language] === chosenText);  
  return !!matchedOption?.isCorrect;
};

  // ----- Handle ANSWER CHECK -----
  const handleAnswerCheck = (): void => {
    const isCorrect = getIsCorrect();    
    if (isCorrect) {
      const newChosenCorrect = pointsState.chosenCorrect + 1;

      let difficulty = gameState.difficulty;
      let timeTaken = ANSWER_TIMER_DURATION / 1000 - remainingTime;
      let isSolo = gameState.playStyle === "solo";
      let totalQuestions = currQuestionsArray.length;
      let allCorrect = newChosenCorrect === totalQuestions;
      let correctAnswers = newChosenCorrect;

      // calculate points accoirding to our rules
      const gainedPoints = calculatePoints({
        difficulty,
        timeTaken,
        isCorrect: isCorrect,
        isSolo,
        allCorrect,
        totalQuestions,
        correctAnswers,
      });
      // Early exit if null
      if (!gainedPoints) return;
      // Add correct points to state
      setPointsState((prevPoints) => ({
        ...prevPoints,
        score: prevPoints.score + gainedPoints?.basePoints,
        timePoints: prevPoints.timePoints + gainedPoints?.timeBonus,
        perfectGame: prevPoints.perfectGame + gainedPoints?.bonusAllCorrect,
        total: prevPoints.total + gainedPoints?.totalPoints,
        chosenCorrect: newChosenCorrect,
      }));          }
    // Logic for SOLO Play
    if (
      currQuestionIndex < currQuestionsArray.length - 1 &&
      gameState.playStyle === "solo"
    ) {
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
    const newTotalAnswers = pointsState.totalAnswers + 1;
    // update totalAnswers
    setPointsState((prevPoints) => ({
      ...prevPoints,
      totalAnswers: newTotalAnswers,
    }));
    // Cache current points & information
    cachePoints({
      gameCategory: gameState.category,
      score: pointsState.total,
      correctAnswers: pointsState.chosenCorrect,
      totalAnswers: newTotalAnswers,
    });
    // Clear timer
    if (answerTimeout.current) {
      clearTimeout(answerTimeout.current);
      answerTimeout.current = null;
    }
    // Logic for Solo Play
    if (
      currQuestionIndex < currQuestionsArray.length - 1 &&
      gameState.playStyle === "solo"
    ) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setReadTimer(false);
    }
    // Logic for Group Play
    else if (
      (currQuestionIndex < currQuestionsArray.length - 1 &&
        gameState.playStyle === "group") ||
      "duel"
    ) {
      setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setReadTimer(false);
      }, NEXT_QUESTION_DELAY);
    }
    // if last question done
    else {
      setShowResult(true);
      setAnswerState((prev) => ({
        ...prev,
        chosenAnswer: null,
        isSelected: false,
        isSubmitted: false,
        isLocked: false,
      }));
      endGame();
    }
  };

  const endGame = async () => {
    // send to database
    sendPointsToDatabase();
    // clear cached data
    clearCachePoints();
  };

  // ========================================================== USE EFFECTS ==========================================================
  // ----- START check and loading
  useEffect(() => {
    // check if points need to be uploaded to DB
    checkCache(); // TODO
    // get Game Settings
    fetchGameInfo();
    fetchAiData();
  }, []);

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
    language,
    currentQuestionData,
    currQuestionIndex,
    answerState,
    gameState,
    pointsState,
    readTimer,
    remainingTime,
    showResult,
    handleAnswerSelect,
    handleSelection,
    handleAnswerSubmit,
    handleNextQuestion,
  };
}
