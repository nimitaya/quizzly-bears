
// Schwierigkeiten und Kategorien für Quizfragen
// Diese werden in der App verwendet, um Fragen zu generieren und anzuzeigen.
export type Difficulty = 'easy' | 'medium' | 'difficult';
export type Category = 
  | 'Science'
  | 'History'
  | 'Geography'
  | 'Sports'
  | 'Media'
  | 'Culture'
  | 'Daily Life';

// API Antworttyp für Quizfragen
export interface GroqQuestionResponse {
  question: string;
  options?: string[];
  correctAnswer?: string;
}

// Type für die Quizfrage, die in der App verwendet wird
export interface QuizScreenProps {
  difficulty: Difficulty;
  category: Category;
  onComplete?: (score: number) => void;
}