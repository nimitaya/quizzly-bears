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
import { sendPoints } from "./pointsApi";

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
  } catch {}
};

// ---------- CLEAR cache for game Data ----------
export const clearCachePoints = async () => {
  try {
    await clearCacheData(cacheKey);
  } catch {}
};

// ---------- CHECK cache storage for remaining data ----------
export const checkCache = async (clerkUserId: string) => {
  if (!clerkUserId) {
    return;
  }
  try {
    const storedData = await loadCacheData(cacheKey);
    if (!storedData) {
      return;
    } else {
      // send Data to Database
      await sendPoints({
        clerkUserId,
        totalPoints: storedData.points,
        correctAnswers: storedData.correctAnswers,
        totalAnswers: storedData.totalAnswers,
        category: storedData.category,
      });
      // Clear cache after successful send
      await clearCachePoints();
    }
  } catch (error) {
    return null;
  }
};

// ---------- SEND cached data TO DATABASE ----------
export const sendPointsToDatabase = async (
  clerkUserId: string,
  onSuccess?: () => void
) => {
  try {
    const finalGameData: GameInformation = await loadCacheData(cacheKey);
    if (!finalGameData) {
      return;
    }

    // Send data to database
    await sendPoints({
      clerkUserId,
      totalPoints: finalGameData.points,
      correctAnswers: finalGameData.correctAnswers,
      totalAnswers: finalGameData.totalAnswers,
      category: finalGameData.category,
    });

    // Call the success callback if provided
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    throw error;
  }
};
