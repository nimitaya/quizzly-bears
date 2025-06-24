

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

// Tipo para las respuestas de Groq API
export interface GroqQuestionResponse {
  question: string;
  options?: string[];
  correctAnswer?: string;
}

// Tipo para las props de los componentes de quiz
export interface QuizScreenProps {
  difficulty: Difficulty;
  category: Category;
  onComplete?: (score: number) => void;
}