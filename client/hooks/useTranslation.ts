import { useLanguage } from "@/providers/LanguageContext";
import { getTranslation, TranslationKeys } from "@/utilities/translations";

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  
  const t = (key: keyof TranslationKeys): string => {
    return getTranslation(key, currentLanguage.code);
  };
  
  return { t, currentLanguage };
}; 