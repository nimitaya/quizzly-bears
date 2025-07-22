import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Language,
  LanguageContextType,
} from "@/utilities/quiz-logic/languageInterfaces";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>({
    code: "en",
    name: "English",
    nativeName: "English",
    flagId: "GB",
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (user?.id) {
      loadLanguageFromDB(user.id);
    } else {
      loadSavedLanguage();
    }
  }, [user?.id]);

  //
  const loadSavedLanguage = async () => {
    try {
      const savedLanguageCode = await AsyncStorage.getItem("selected_language");
      if (savedLanguageCode) {
        const { LANGUAGES } = require("@/utilities/languages");
        const language = LANGUAGES.find(
          (lang: Language) => lang.code === savedLanguageCode
        );
        if (language) {
          setCurrentLanguage(language);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const loadLanguageFromDB = async (clerkUserId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/users/${clerkUserId}`);
      const userSettingsLangCode = res.data?.settings?.language;
      if (userSettingsLangCode) {
        const { LANGUAGES } = require("@/utilities/languages");
        const language = LANGUAGES.find(
          (lang: Language) => lang.code === userSettingsLangCode
        );
        if (language) {
          setCurrentLanguage(language);
          await AsyncStorage.setItem("selected_language", language.code);
        }
      }
    } catch {
      await loadSavedLanguage();
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (language: Language) => {
    try {
      setCurrentLanguage(language);
      await AsyncStorage.setItem("selected_language", language.code);

      if (user?.id) {
        await axios.patch(`${API_BASE_URL}/users/${user.id}/settings`, {
          language: language.code,
        });
      }
    } catch {}
  };

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, changeLanguage, isLoading }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
