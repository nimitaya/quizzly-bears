import { useState, useEffect, useRef } from "react";
import {
  calculatePoints,
  cachePoints,
  clearCachePoints,
  sendPointsToDatabase,
  checkCache,
} from "@/utilities/quiz-logic/pointsUtils";
import { loadCacheData, CACHE_KEY } from "@/utilities/cacheUtils";
import {
  GameState,
  AnswerState,
  PointsState,
} from "@/utilities/quiz-logic/quizTypesInterfaces";
import socketService from "@/utilities/socketService";
// Dummy data: TODO
import {
  AiQuestions,
  aiQuestions,
  QuestionStructure,
} from "@/utilities/quiz-logic/data";
import { useUser } from "@clerk/clerk-expo";
// Fix: import useStatistics in React component
import { useStatistics } from "@/providers/UserProvider";
import { Audio } from 'expo-av';
import { useSound } from "@/providers/SoundProvider";

// ========================================================== START OF HOOK ==========================================================
export function useQuizLogic() {
  const key = CACHE_KEY;
  // Timer duration/ delays TODO
  const READ_TIMER_DURATION = 2000;
  const ANSWER_TIMER_DURATION = 30000; // 30 seconds for answers
  const NEXT_QUESTION_DELAY = 3000;
  // get current user from Clerk:
  const { user } = useUser();
  // Fix: use useStatistics inside React component
  // To reset Timers
  const readTimeout = useRef<number | null>(null);
  const answerTimeout = useRef<number | null>(null);
  const nextQuestionTimeout = useRef<number | null>(null);
  // Fix: ref to store current points data between state updates
  const currentPointsRef = useRef({ total: 0, chosenCorrect: 0 });
  // Track if a question transition is already scheduled for multiplayer
  const isTransitionScheduled = useRef<boolean>(false);

  // Audio refs for quiz sounds
  const timerSoundRef = useRef<Audio.Sound | null>(null);
  const selectionSoundRef = useRef<Audio.Sound | null>(null);
  const correctSoundRef = useRef<Audio.Sound | null>(null);
  const errorSoundRef = useRef<Audio.Sound | null>(null);
  const nextSoundRef = useRef<Audio.Sound | null>(null);

  // Get global sound settings
  const { soundEnabled } = useSound();

  // ========================================================== STATE MANAGEMENT ==========================================================
  const [currQuestionsArray, setCurrQuestionsArray] = useState<
    QuestionStructure[]
  >([]);
  const [currentQuestionData, setCurrentQuestionData] =
    useState<QuestionStructure | null>(null);
  const [currQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
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

  // ========================================================== SOUND FUNCTIONS ==========================================================
  // ----- Load quiz sounds -----
  const loadQuizSounds = async () => {
    try {
      const { sound: timerSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/time-01.mp3'),
        { shouldPlay: false, isLooping: true }
      );
      timerSoundRef.current = timerSound;

      const { sound: selectionSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/auswahl.mp3')
      );
      selectionSoundRef.current = selectionSound;

      const { sound: correctSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/richtig.mp3')
      );
      correctSoundRef.current = correctSound;

      const { sound: errorSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/error.mp3')
      );
      errorSoundRef.current = errorSound;

      const { sound: nextSound } = await Audio.Sound.createAsync(
        require('@/assets/Sounds/next.mp3')
      );
      nextSoundRef.current = nextSound;
    } catch (error) {
      console.log('Error loading quiz sounds:', error);
    }
  };

  // ----- Play timer sound (looping) -----
  const playTimerSound = async () => {
    if (!soundEnabled) return;
    
    try {
      if (timerSoundRef.current) {
        await timerSoundRef.current.setPositionAsync(0);
        await timerSoundRef.current.playAsync();
      }
    } catch (error) {
      console.log('Error playing timer sound:', error);
    }
  };

  // ----- Stop timer sound -----
  const stopTimerSound = async () => {
    try {
      if (timerSoundRef.current) {
        await timerSoundRef.current.stopAsync();
      }
    } catch (error) {
      console.log('Error stopping timer sound:', error);
    }
  };

  // ----- Play selection sound -----
  const playSelectionSound = async () => {
    if (!soundEnabled) return;
    
    try {
      if (selectionSoundRef.current) {
        await selectionSoundRef.current.setPositionAsync(0);
        await selectionSoundRef.current.playAsync();
      }
    } catch (error) {
      console.log('Error playing selection sound:', error);
    }
  };

  // ----- Play correct/error sound -----
  const playAnswerSound = async (isCorrect: boolean) => {
    if (!soundEnabled) return;
    
    try {
      const soundRef = isCorrect ? correctSoundRef.current : errorSoundRef.current;
      if (soundRef) {
        await soundRef.setPositionAsync(0);
        await soundRef.playAsync();
      }
    } catch (error) {
      console.log('Error playing answer sound:', error);
    }
  };

  // ----- Play next sound -----
  const playNextSound = async () => {
    if (!soundEnabled) return;
    
    try {
      if (nextSoundRef.current) {
        await nextSoundRef.current.setPositionAsync(0);
        await nextSoundRef.current.playAsync();
      }
    } catch (error) {
      console.log('Error playing next sound:', error);
    }
  };

  // ----- Cleanup sounds -----
  const cleanupSounds = async () => {
    try {
      // Stop all sounds first, then unload them
      if (timerSoundRef.current) {
        await timerSoundRef.current.stopAsync();
        await timerSoundRef.current.unloadAsync();
      }
      if (selectionSoundRef.current) {
        await selectionSoundRef.current.stopAsync();
        await selectionSoundRef.current.unloadAsync();
      }
      if (correctSoundRef.current) {
        await correctSoundRef.current.stopAsync();
        await correctSoundRef.current.unloadAsync();
      }
      if (errorSoundRef.current) {
        await errorSoundRef.current.stopAsync();
        await errorSoundRef.current.unloadAsync();
      }
      if (nextSoundRef.current) {
        await nextSoundRef.current.stopAsync();
        await nextSoundRef.current.unloadAsync();
      }
    } catch (error) {
      console.log('Error cleaning up sounds:', error);
    }
  };

  // ========================================================== FUNCTIONS ==========================================================
  // ===== FETCHING FROM CACHE =====
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
      const cachedInfo = await loadCacheData(key.quizSettings);
      if (cachedInfo) {
        setGameState((prev) => ({
          ...prev,
          difficulty: cachedInfo.quizLevel,
          category: cachedInfo.quizCategory,
          playStyle: cachedInfo.quizPlayStyle,
        }));
      } else {
        console.log("No cached quiz settings found");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  // ----- fetch Data and set all Questions Array -----
  const fetchAiData = async () => {
    try {
      const cachedInfo = await loadCacheData(key.aiQuestions);
      if (cachedInfo) {
        setCurrQuestionsArray(cachedInfo.questionArray);
      } else {
        console.log("No cached AI questions found");
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
      let questions = await fetchFromCache(key.aiQuestions);
      if (!questions) {
        // Fallback to dummy data if cache is empty TODO delete later
        console.log("No questions in cache, using dummy data");
        questions = aiQuestions;
        setCurrQuestionsArray(questions.questionArray);
      } else {
        console.log("Questions loaded from cache:", questions.questionArray?.length, "questions");
        setCurrQuestionsArray(questions.questionArray);
      }
      
      if (currQuestionIndex < questions.questionArray.length) {
        // Check if questions have the right structure
        // Reset
        setCurrentQuestionData(questions.questionArray[currQuestionIndex]);
        setReadTimer(false); // Reset read timer
        setAnswerState({
          chosenAnswer: null,
          isSelected: false,
          isSubmitted: false,
          isLocked: false,
        });
        // Start the timer for the question
        timingQuestions();
      } else {
        setShowResult(true);
        setReadTimer(false); // Reset read timer
        setAnswerState({
          chosenAnswer: null,
          isSelected: false,
          isSubmitted: false,
          isLocked: false,
        });
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  // ----- set TIMING for questions -----
  const timingQuestions = (): void => {
    // Reset the transition flag for new question
    isTransitionScheduled.current = false;
    
    readTimeout.current = setTimeout(() => {
      // Set read timer to true after 2 seconds to show the answers
      setReadTimer(true);
      // Start timer sound when answers become visible
      playTimerSound();
      // Start - you have 30 seconds to choose an answer
      answerTimeout.current = setTimeout(() => {
        setAnswerState((prevState) => ({ ...prevState, isLocked: true }));
        stopTimerSound(); // Stop timer sound when time is up
        handleAnswerCheck();
        
        // For multiplayer modes, automatically move to next question after a delay
        if ((gameState.playStyle === "group" || gameState.playStyle === "duel") && !isTransitionScheduled.current) {
          isTransitionScheduled.current = true;
          nextQuestionTimeout.current = setTimeout(() => {
            handleNextQuestion();
          }, NEXT_QUESTION_DELAY);
        }
      }, ANSWER_TIMER_DURATION);
    }, READ_TIMER_DURATION);
  };

  // ----- Handle ANSWER SELECTION -----
  const handleAnswerSelect = (selectedOption: string): void => {
    if (answerState.isLocked) {
      return;
    }

    // Play selection sound when an answer is chosen
    playSelectionSound();

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
  const handleAnswerSubmit = () => {
    // Store the chosen answer before updating state
    const selectedAnswer = answerState.chosenAnswer;
    
    // Stop timer sound when answer is submitted
    stopTimerSound();
    
    setAnswerState((prevState) => ({
      ...prevState,
      isSubmitted: true,
      isLocked: true,
    }));
    
    // Check the answer and update points
    handleAnswerCheck();
    
    // For multiplayer modes, we need to maintain consistent timing
    // Clear the answer timeout since we've manually submitted
    if ((gameState.playStyle === "group" || gameState.playStyle === "duel") && !isTransitionScheduled.current) {
      // Clear any existing timers
      if (answerTimeout.current) {
        clearTimeout(answerTimeout.current);
        answerTimeout.current = null;
      }
      
      // Schedule the next question after the fixed delay
      // This ensures consistent timing between questions in multiplayer modes
      isTransitionScheduled.current = true;
      nextQuestionTimeout.current = setTimeout(() => {
        handleNextQuestion();
      }, NEXT_QUESTION_DELAY);
    }
  };

  // ----- Get if answer is correct -----
  const getIsCorrect = (): boolean => {
    if (!currentQuestionData || !answerState.chosenAnswer) {
      return false;
    }

    const selectedOption = answerState.chosenAnswer;
    const correctOption = [
      currentQuestionData.optionA,
      currentQuestionData.optionB,
      currentQuestionData.optionC,
      currentQuestionData.optionD,
    ].find((option) => option?.isCorrect);

    if (!correctOption) {
      return false;
    }

    const optionMap = {
      A: currentQuestionData.optionA,
      B: currentQuestionData.optionB,
      C: currentQuestionData.optionC,
      D: currentQuestionData.optionD,
    };

    return optionMap[selectedOption as keyof typeof optionMap]?.isCorrect || false;
  };

  // ----- Handle ANSWER CHECK -----
  const handleAnswerCheck = (): void => {
    const isCorrect = getIsCorrect();

    // Only play answer sound if an answer was actually selected
    if (answerState.chosenAnswer) {
      playAnswerSound(isCorrect);
    }

    if (isCorrect) {
      const newChosenCorrect = pointsState.chosenCorrect + 1;

      let difficulty = gameState.difficulty;
      let timeTaken = ANSWER_TIMER_DURATION / 1000 - remainingTime;
      let isSolo = gameState.playStyle === "solo";
      let totalQuestions = currQuestionsArray.length;
      let allCorrect = newChosenCorrect === totalQuestions;
      let correctAnswers = newChosenCorrect;

      // Calculate points according to our rules
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
      if (!gainedPoints) {
        return;
      }

      // Update state and save current data for caching
      const newTotal = pointsState.total + gainedPoints.totalPoints;

      // Add correct points to state
      setPointsState((prevPoints) => {
        const updatedState = {
          ...prevPoints,
          score: prevPoints.score + gainedPoints?.basePoints,
          timePoints: prevPoints.timePoints + gainedPoints?.timeBonus,
          perfectGame: prevPoints.perfectGame + gainedPoints?.bonusAllCorrect,
          total: newTotal,
          chosenCorrect: newChosenCorrect,
        };

        // Update ref with current data
        currentPointsRef.current = {
          total: updatedState.total,
          chosenCorrect: updatedState.chosenCorrect,
        };

        return updatedState;
      });

      // Cache points
      cachePoints({
        gameCategory: gameState.category,
        score: newTotal,
        correctAnswers: newChosenCorrect,
        totalAnswers: pointsState.totalAnswers + 1,
      });

      // Send points to database
      sendPointsToDatabase(user?.id || "guest");
    } else {
      // Update total answers for incorrect answers
      setPointsState((prevPoints) => ({
        ...prevPoints,
        totalAnswers: prevPoints.totalAnswers + 1,
      }));
    }
  };

  // ----- Handle NEXT QUESTION -----
  const handleNextQuestion = (): void => {
    // Clear all timeouts
    if (readTimeout.current) {
      clearTimeout(readTimeout.current);
      readTimeout.current = null;
    }
    if (answerTimeout.current) {
      clearTimeout(answerTimeout.current);
      answerTimeout.current = null;
    }
    if (nextQuestionTimeout.current) {
      clearTimeout(nextQuestionTimeout.current);
      nextQuestionTimeout.current = null;
    }

    // Stop timer sound when moving to next question
    stopTimerSound();

    // Reset answer state
    setAnswerState({
      chosenAnswer: null,
      isSelected: false,
      isSubmitted: false,
      isLocked: false,
    });

    // Play next sound
    playNextSound();

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
        (gameState.playStyle === "group" ||
      gameState.playStyle === "duel")) 
    ) {     
      // For multiplayer, we simply advance to the next question without additional delay
      // since the delay was already applied either in handleAnswerSubmit or timingQuestions
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setReadTimer(false);
        
      // Optionally notify the server about the question change (for analytics)
      // const notifyQuestionChange = async () => {
      //   try {
      //     const roomInfo = await loadCacheData(CACHE_KEY.currentRoom);
      //     if (roomInfo && roomInfo.roomId) {
      //       socketService.emit("question-progress", {
      //         roomId: roomInfo.roomId,
      //         questionIndex: currQuestionIndex + 1,
      //         playerId: user?.id || "guest"
      //       });
      //     }
      //   } catch (error) {
      //     // Non-critical operation, just log the error
      //     console.log("Error notifying question change:", error);
      //   }
      // };
      // notifyQuestionChange();
    }
    // ---------------------------------
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

  // ----- End Game -----
  const endGame = async (): Promise<void> => {
    try {
      // Stop timer sound when game ends
      stopTimerSound();

      // Cache final points
      await cachePoints({
        gameCategory: gameState.category,
        score: pointsState.total,
        correctAnswers: pointsState.chosenCorrect,
        totalAnswers: pointsState.totalAnswers,
      });

      // Send final points to database
      await sendPointsToDatabase(user?.id || "guest");

      // Clear cache for next game
      await clearCachePoints();
    } catch (error) {
      console.error("Error ending game:", error);
    }
  };

  // ========================================================== USE EFFECTS ==========================================================
  // ----- START check and loading
  useEffect(() => {
    // check if points need to be uploaded to DB
    if (user?.id) {
      checkCache(user.id);
    }
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
      if (readTimeout.current) {
        clearTimeout(readTimeout.current);
        readTimeout.current = null;
      }
      if (nextQuestionTimeout.current) {
        clearTimeout(nextQuestionTimeout.current);
        nextQuestionTimeout.current = null;
      }
      // Reset the transition flag
      isTransitionScheduled.current = false;
    };
  }, [currQuestionIndex]);
  
  // ----- Setup for multiplayer mode -----
  // useEffect(() => {
  //   if (gameState.playStyle === "group" || gameState.playStyle === "duel") {
  //     console.log("Setting up multiplayer game");
      
  //     // Listen for game results at the end
  //     const handleGameResults = (data: any) => {
  //       console.log("Received game results from server:", data);
  //     };
      
  //     // Register the listener for game results only
  //     socketService.on("game-results", handleGameResults);
      
  //     // Clean up the listeners when component unmounts or playStyle changes
  //     return () => {
  //       console.log("Cleaning up multiplayer listeners");
  //       socketService.off("game-results", handleGameResults);
  //     };
  //   }
  // }, [gameState.playStyle]);

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

  // ----- Initialize sounds and load data -----
  useEffect(() => {
    loadQuizSounds();
    fetchGameInfo();
    fetchAiData();
    loadQuestions();

    return () => {
      // Cleanup timeouts
      if (readTimeout.current) clearTimeout(readTimeout.current);
      if (answerTimeout.current) clearTimeout(answerTimeout.current);
      if (nextQuestionTimeout.current) clearTimeout(nextQuestionTimeout.current);
      
      // Cleanup sounds
      cleanupSounds();
    };
  }, []);

  // ----- Reload questions when question index changes -----
  useEffect(() => {
    if (currQuestionsArray.length > 0) {
      loadQuestions();
    }
  }, [currQuestionIndex]);

  return {
    // State
    currentQuestionData,
    currQuestionIndex,
    gameState,
    answerState,
    readTimer,
    pointsState,
    showResult,
    remainingTime,
    
    // Functions
    handleAnswerSelect,
    handleSelection,
    handleAnswerSubmit,
    handleNextQuestion,
    stopTimerSound, // Exportiere stopTimerSound
  };
}
