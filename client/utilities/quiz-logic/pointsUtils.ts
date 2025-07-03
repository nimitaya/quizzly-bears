import {
  loadCacheData,
  saveDataToCache,
  clearCacheData,
} from "@/utilities/cacheUtils";
import {
  GameInformation,
  CalculatePointsParams,
  CachePointsParams,
} from "@/utilities/quiz-logic/quizTypesInterfaces";
import { CACHE_KEY } from "@/utilities/cacheUtils";

const cacheKey = CACHE_KEY.gameData;

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
    bonusAllCorrect = 10;
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
    await saveDataToCache(cacheKey, gameInformation);
    console.log("Answers Info:", gameInformation);
  } catch (error) {
    console.error("Failed to save points:", error);
  }
};

// ---------- CLEAR cache for game Data ----------
export const clearCachePoints = async () => {
  try {
    await clearCacheData(cacheKey);
  } catch (error) {
    console.error("Failed to clear points:", error);
  }
};

// ---------- CHECK cache storage for remaining data ----------
export const checkCache = async () => {
  try {
    const storedData = await loadCacheData(cacheKey);
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
  const finalGameData = loadCacheData(cacheKey);
  // Code goes here TODO
  // send finalGameData to DB
};
