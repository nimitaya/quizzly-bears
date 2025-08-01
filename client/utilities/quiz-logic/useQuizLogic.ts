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
import { Audio } from "expo-av";
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
  // To reset Timers
  const readTimeout = useRef<number | null>(null);
  const answerTimeout = useRef<number | null>(null);
  const nextQuestionTimeout = useRef<number | null>(null);
  // Fix: ref to store current points data between state updates
  const currentPointsRef = useRef({ total: 0, chosenCorrect: 0 });
  // Track if a question transition is already scheduled for multiplayer
  const isTransitionScheduled = useRef<boolean>(false);
  
  // Audio refs for feedback sounds
  const correctSound = useRef<Audio.Sound | null>(null);
  const errorSound = useRef<Audio.Sound | null>(null);
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

  // ========================================================== AUDIO FUNCTIONS ==========================================================
  // Load feedback sounds
  useEffect(() => {
    const loadFeedbackSounds = async () => {
      try {      
        // Initialize audio mode for mobile devices
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Load correct answer sound
        const { sound: correctSnd } = await Audio.Sound.createAsync(
          require('@/assets/Sounds/richtig.mp3'),
          { 
            volume: 0.8,
            shouldPlay: false
          }
        );
        correctSound.current = correctSnd;

        // Load error answer sound
        const { sound: errorSnd } = await Audio.Sound.createAsync(
          require('@/assets/Sounds/error.mp3'),
          { 
            volume: 0.8,
            shouldPlay: false
          }
        );
        errorSound.current = errorSnd;
      } catch (error) {
        // console.error('useQuizLogic: Error loading feedback sounds:', error);
        correctSound.current = null;
        errorSound.current = null;
      }
    };

    loadFeedbackSounds();

    // Cleanup function
    return () => {
      if (correctSound.current) {
        correctSound.current.unloadAsync().catch(() => {});
        correctSound.current = null;
      }
      if (errorSound.current) {
        errorSound.current.unloadAsync().catch(() => {});
        errorSound.current = null;
      }
    };
  }, []);

  // Play feedback sound based on answer correctness
  const playFeedbackSound = async (isCorrect: boolean) => {
    if (!soundEnabled) {
      // console.log('useQuizLogic: Sound not enabled, skipping feedback sound');
      return;
    }
    
    const soundToPlay = isCorrect ? correctSound.current : errorSound.current;
    const soundType = isCorrect ? 'richtig' : 'error';
    
    if (!soundToPlay) {
      // console.log(`useQuizLogic: Cannot play ${soundType} sound - not loaded`);
      return;
    }
    
    try {
      await soundToPlay.setPositionAsync(0);
      await soundToPlay.playAsync();
    } catch (error) {
      // console.error(`useQuizLogic: Error playing ${soundType} sound:`, error);
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
      // console.error(`Error fetching data with key ${key} from cache:`, error);
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
        // console.log("No cached quiz settings found");
      }
    } catch (error) {
      // console.error("Error loading settings:", error);
    }
  };

  // ----- fetch Data and set all Questions Array -----
  const fetchAiData = async () => {
    try {
      const cachedInfo = await loadCacheData(key.aiQuestions);
      if (cachedInfo) {
        setCurrQuestionsArray(cachedInfo.questionArray);
      } else {
        // console.log("No cached AI questions found");
      }
    } catch (error) {
      // console.error("Error loading questions:", error);
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
        questions = aiQuestions;
        setCurrQuestionsArray(questions.questionArray);
      } else {
        setCurrQuestionsArray(questions.questionArray);
      }
      
      if (currQuestionIndex < questions.questionArray.length) {
        // Check if questions have the right structure
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
      // console.error("Error loading questions:", error);
    }
  };

  // ----- set TIMING for questions -----
  const timingQuestions = (): void => {
    // Reset the transition flag for new question
    isTransitionScheduled.current = false;
    
    readTimeout.current = setTimeout(() => {
      // Set read timer to true after 2 seconds to show the answers
      setReadTimer(true);
      // Start - you have 30 seconds to choose an answer
      answerTimeout.current = setTimeout(async () => {
        // Lock the answers when time is up
        setAnswerState((prevState) => ({ ...prevState, isLocked: true }));
        handleAnswerCheck();
        
        // For multiplayer modes, notify server about timeout
        if ((gameState.playStyle === "group" || gameState.playStyle === "duel") && !isTransitionScheduled.current) {
          try {
            // Get current room info
            const roomInfo = await loadCacheData(CACHE_KEY.currentRoom);
            
            if (roomInfo && roomInfo.roomId && user?.id) {
              // Notify the server that this player has timed out
              socketService.playerAnswerSubmitted(
                roomInfo.roomId,
                user.id,
                currQuestionIndex
              );
            }
          } catch (error) {
            // console.error("Error notifying timeout:", error);
            
            // Fallback: If we can't communicate with server, proceed locally
            if (!isTransitionScheduled.current) {
              isTransitionScheduled.current = true;
              nextQuestionTimeout.current = setTimeout(() => {
                handleNextQuestion();
              }, NEXT_QUESTION_DELAY);
            }
          }
        } else if (gameState.playStyle === "solo" && !isTransitionScheduled.current) {
          // Solo mode: move to next question after delay
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
  const handleAnswerSubmit = async () => {
    // Store the chosen answer before updating state
    const selectedAnswer = answerState.chosenAnswer;
    
    setAnswerState((prevState) => ({
      ...prevState,
      isSubmitted: true,
      isLocked: true,
    }));
    
    // Check the answer and update points
    handleAnswerCheck();
    
    // Clear the answer timeout since we've manually submitted
    if ((gameState.playStyle === "group" || gameState.playStyle === "duel") && !isTransitionScheduled.current) {
      // Clear any existing timers
      if (answerTimeout.current) {
        clearTimeout(answerTimeout.current);
        answerTimeout.current = null;
      }
      
      // Schedule the next question after the fixed delay
      isTransitionScheduled.current = true;
      nextQuestionTimeout.current = setTimeout(() => {
        handleNextQuestion();
      }, NEXT_QUESTION_DELAY);
    }
  };

  // ----- HELPER for finding correct answer -----
  const getIsCorrect = (): boolean => {
    if (!currentQuestionData || !answerState.chosenAnswer) {
      return false;
    }

    const { optionA, optionB, optionC, optionD } = currentQuestionData;
    const options = [optionA, optionB, optionC, optionD];
    const chosenOption = answerState.chosenAnswer; // This is now "A", "B", "C" or "D" (option key)

    // Compare by option index (A, B, C, D), not by text
    let optionIndex = -1;

    // Determine the index of the selected option
    switch (chosenOption.toUpperCase()) {
      case "A":
      case "0":
        optionIndex = 0;
        break;
      case "B":
      case "1":
        optionIndex = 1;
        break;
      case "C":
      case "2":
        optionIndex = 2;
        break;
      case "D":
      case "3":
        optionIndex = 3;
        break;
      default:
        return false;
    }

    if (optionIndex === -1 || optionIndex >= options.length) {
      return false;
    }

    const selectedOption = options[optionIndex];
    return selectedOption.isCorrect;
  };

  // ----- Handle ANSWER CHECK -----
  const handleAnswerCheck = (): void => {
    const isCorrect = getIsCorrect();

    // Play feedback sound based on answer correctness
    playFeedbackSound(isCorrect);

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
    }

    // OLD CODE (COMMENTED):
    // // Add correct points to state
    // setPointsState((prevPoints) => ({
    //   ...prevPoints,
    //   score: prevPoints.score + gainedPoints?.basePoints,
    //   timePoints: prevPoints.timePoints + gainedPoints?.timeBonus,
    //   perfectGame: prevPoints.perfectGame + gainedPoints?.bonusAllCorrect,
    //   total: prevPoints.total + gainedPoints?.totalPoints,
    //   chosenCorrect: newChosenCorrect,
    // }));

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

    // Fix Race Condition: use current data from ref
    setPointsState((prevPoints) => {
      const updatedPoints = {
        ...prevPoints,
        totalAnswers: newTotalAnswers,
      };

      // Use current data from ref instead of outdated state
      const actualTotal = currentPointsRef.current.total || updatedPoints.total;
      const actualCorrect =
        currentPointsRef.current.chosenCorrect || updatedPoints.chosenCorrect;

      // Cache current points & information with up-to-date values
      cachePoints({
        gameCategory: gameState.category,
        score: actualTotal, // Use current data from ref
        correctAnswers: actualCorrect, // Use current data from ref
        totalAnswers: updatedPoints.totalAnswers,
      });

      return updatedPoints;
    });

    // OLD CODE (COMMENTED - RACE CONDITION):
    // // update totalAnswers
    // setPointsState((prevPoints) => ({
    //   ...prevPoints,
    //   totalAnswers: newTotalAnswers,
    // }));
    // // Cache current points & information
    // cachePoints({
    //   gameCategory: gameState.category,
    //   score: pointsState.total,              // PROBLEM: old data
    //   correctAnswers: pointsState.chosenCorrect,  // PROBLEM: old data
    //   totalAnswers: newTotalAnswers,
    // });

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
        (gameState.playStyle === "group" ||
      gameState.playStyle === "duel")) 
    ) {     
      // For multiplayer, we simply advance to the next question without additional delay
      // since the delay was already applied either in handleAnswerSubmit or timingQuestions
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setReadTimer(false);
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

  const endGame = async () => {
    // Fixed version - pass callback for setOnChanges:
    if (user?.id) {
      await sendPointsToDatabase(user.id, () => {});
    }
    // clear cached data
    clearCachePoints();
    // Clear all timers
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
    // Reset transition flag
    isTransitionScheduled.current = false;
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
  useEffect(() => {
    if (gameState.playStyle === "group" || gameState.playStyle === "duel") {      
      // Handle when all players in a room have answered
      const handleAllPlayersAnswered = (data: any) => {
        
        // Proceed to next question only if we're on the same question index
        // This prevents issues if messages arrive out of order
        if (data.questionIndex === currQuestionIndex && !isTransitionScheduled.current) {
          
          // Schedule transition to next question
          isTransitionScheduled.current = true;
          nextQuestionTimeout.current = setTimeout(() => {
            handleNextQuestion();
          }, NEXT_QUESTION_DELAY);
        }
      };
      
      // Listen for game results at the end
      const handleGameResults = (data: any) => {
        // console.log("Received game results from server:", data);
      };
      
      // Register the listeners
      socketService.on("all-players-answered", handleAllPlayersAnswered);
      socketService.on("game-results", handleGameResults);
      
      // Clean up the listeners when component unmounts or playStyle changes
      return () => {
        socketService.off("all-players-answered", handleAllPlayersAnswered);
        socketService.off("game-results", handleGameResults);
      };
    }
  }, [gameState.playStyle]);

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
