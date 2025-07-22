import AsyncStorage from "@react-native-async-storage/async-storage";

export const CACHE_KEY = {
  aiQuestions: "aiQuestions",
  quizSettings: "quizSettings",
  gameData: "currGameData",
  currentRoom: "currentRoom",
};

// ---------- LOAD CACHE DATA ----------
export const loadCacheData = async <T = any>(key: string) => {
  try {
    const storedData = await AsyncStorage.getItem(key);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      return parsedData;
    } else {
      return null;
    }
  } catch {
    return null;
  }
};

// ---------- SAVE DATA TO CACHE ----------
// T is generic Type
export const saveDataToCache = async <T>(key: string, data: T) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

// ---------- CLEAR CACHE DATA ----------
export const clearCacheData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
};
