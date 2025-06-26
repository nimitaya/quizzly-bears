import { loadCacheData, saveDataToCache, clearCacheData } from "@/utilities/quiz-logic/cacheUtils";

// ---------- TYPES AND INTERFACES ----------
export type Difficulty = "easy" | "medium" | "hard";

type GameInformation = {
  category: string;
  points: number;
  correctAnswers: number;
  totalAnswers: number;
};

interface CalculatePointsParams {
  difficulty: Difficulty;
  timeTaken: number; // in seconds
  isCorrect: boolean;
  isSolo: boolean;
  allCorrect: boolean;
  totalQuestions: number;
  correctAnswers: number;
}

interface CachePointsParams {
  gameCategory: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
}

// // ---------- OTHERS ----------
const CACHE_KEY = "currGameData";

// ---------- CALCULATE Points according to rules ----------
export const calculatePoints = ({
  difficulty,
  timeTaken,
  isCorrect,
  isSolo,
  allCorrect,
  totalQuestions,
  correctAnswers,
}: CalculatePointsParams): {
  basePoints: number;
  timeBonus: number;
  bonusAllCorrect: number;
  totalPoints: number;
} | null => {
  if (!isCorrect) return null;

  let basePoints = 0;
  switch (difficulty) {
    case "easy":
      basePoints = 5;
      break;
    case "medium":
      basePoints = 10;
      break;
    case "hard":
      basePoints = 15;
      break;
  }

  let timeBonus = 0;
  if (timeTaken <= 5) timeBonus = 5;
  else if (timeTaken <= 10) timeBonus = 3;
  else if (timeTaken <= 20) timeBonus = 1;

  let bonusAllCorrect = 0;
  if (isSolo && allCorrect && correctAnswers === totalQuestions) {
    bonusAllCorrect = 10; // or any other bonus
  }

  return {
    basePoints,
    timeBonus,
    bonusAllCorrect,
    totalPoints: basePoints + timeBonus + bonusAllCorrect,
  };
};

// ---------- CACHE Points ----------
export const cachePoints = async ({
  gameCategory,
  score,
  correctAnswers,
  totalAnswers,
}: CachePointsParams): Promise<void> => {
  const gameInformation: GameInformation = {
    category: gameCategory,
    points: score,
    correctAnswers: correctAnswers,
    totalAnswers: totalAnswers,
  };
  try {
    // Just for checking if it is working, can be deleted later
    const storedData = await loadCacheData(CACHE_KEY);
    console.log("currentData", storedData);
    // ------------------------------------ TODO
    await saveDataToCache(CACHE_KEY, gameInformation);
  } catch (error) {
    console.error("Failed to save points:", error);
  }
};

// ---------- CLEAR cache for game Data ----------
export const clearCachePoints = async () => {
  try {
    await clearCacheData(CACHE_KEY);
  } catch (error) {
    console.error("Failed to clear points:", error);
  }
};

// ---------- CHECK cache storage for remaining data ----------
export const checkCache = async () => {
  try {
    const storedData = await loadCacheData(CACHE_KEY);
    if (!storedData) {
      return;
    } else {
      // send Data to Database TODO
    }
  } catch (error) {
    console.error("Failed to read cache:", error);
    return null;
  }
};

// ---------- SEND cached data TO DATABASE ----------
export const sendPointsToDatabase = async () => {
  const finalGameData = loadCacheData(CACHE_KEY)
  // Code goes here TODO
  // send finalGameData to DB
}