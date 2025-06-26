import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------- TYPES AND INTERFACES ----------
export interface QuizData {
  quizCategory: string,
  quizLevel: string,
  quizQuestions: {}
}

// ---------- LOAD CACHE DATA ----------
export const loadCacheData = async <T = any>(
  key: string
): Promise<T | null> => {
  try {
    const storedData = await AsyncStorage.getItem(key);
    if (storedData) {
      const parsedData = JSON.parse(storedData);

      return parsedData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to load data from cache:", error);
    return null;
  }
};

// ---------- SAVE DATA TO CACHE ----------
// T is generic Type
export const saveDataToCache = async <T>(key: string, data: T) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save data to cache:", error);
  }
};

// ---------- CLEAR CACHE DATA ----------
export const clearCacheData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear data from cache:", error);
  }
};
