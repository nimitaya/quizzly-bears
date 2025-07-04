//=========languageInterfaces.ts===================================================
// This file defines the interfaces for language management in the quiz application.

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flagId: string;
}

export interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
  isLoading: boolean;
}
