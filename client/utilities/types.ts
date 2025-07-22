export type Difficulty = "easy" | "medium" | "hard";

export type Category =
  | "Science"
  | "History"
  | "Geography"
  | "Sports"
  | "Media"
  | "Culture"
  | "Daily Life";

export interface QuizComponentProps {
  difficulty?: Difficulty;
  category?: Category;
}
export interface QuizData {
  category: string;
  originalTopic?: string;
  mappedCategory?: string;
  questionArray: QuizQuestion[];
}

export interface QuizQuestion {
  question: {
    de: string;
    en: string;
  };
  optionA: {
    isCorrect: boolean;
    de: string;
    en: string;
  };
  optionB: {
    isCorrect: boolean;
    de: string;
    en: string;
  };
  optionC: {
    isCorrect: boolean;
    de: string;
    en: string;
  };
  optionD: {
    isCorrect: boolean;
    de: string;
    en: string;
  };
  correctAnswer?: number;
}

export interface CategoryMappingResult {
  mappedCategory: Category;
  confidence: number;
  explanation: string;
}
