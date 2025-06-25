import AsyncStorage from "@react-native-async-storage/async-storage";

export type Difficulty = "simple" | "medium" | "hard";

type GameInformation = {
  category: string;
  points: number;
  correctAnswers: number;
  totalAnswers: number;
};

type GameCache = Record<string, GameInformation>;

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
    case "simple":
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
    const storedData = await AsyncStorage.getItem("currGameData");
    const currData: GameCache = storedData ? JSON.parse(storedData) : {};
    console.log("currentData", currData);
    // ------------------------------------
    await AsyncStorage.setItem("currGameData", JSON.stringify(gameInformation));
  } catch (error) {
    console.error("Failed to save points:", error);
  }
};

// ---------- CLEAR cache for game Data ----------
export const clearCachePoints = async () => {
  try {
    await AsyncStorage.removeItem("currGameData");
  } catch (error) {
    console.error("Failed to clear points:", error);
  }
};

// ---------- CHECK cache storage for remeining data ----------
export const checkCache = async (): Promise<any> => {
  try {
    const storedData = await AsyncStorage.getItem("currGameData");
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error("Failed to read cache:", error);
    return null;
  }
};
