//=========languageInterfaces.ts===================================================

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
