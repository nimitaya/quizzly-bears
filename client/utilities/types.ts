
// Schwierigkeiten und Kategorien für Quizfragen
// Diese werden in der App verwendet, um Fragen zu generieren und anzuzeigen.

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Category = 
  | 'Science'
  | 'History'
  | 'Geography'
  | 'Sports'
  | 'Media'
  | 'Culture'
  | 'Daily Life';

export interface QuizComponentProps {
  difficulty?: Difficulty;
  category?: Category;  
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

