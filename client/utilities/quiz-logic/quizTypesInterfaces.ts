// ============================================= TYPES =============================================
export type PlayStyle = "solo" | "duel" | "group";
export type Difficulty = "easy" | "medium" | "hard";

export type GameState = {
  difficulty: Difficulty;
  category: string;
  playStyle: PlayStyle;
};

export type AnswerState = {
  chosenAnswer: string | null;
  isSelected: boolean;
  isSubmitted: boolean;
  isLocked: boolean;
};
export type PointsState = {
  score: number;
  timePoints: number;
  perfectGame: number;
  total: number;
  chosenCorrect: number;
  totalAnswers: number;
};

export type GameInformation = {
  category: string;
  points: number;
  correctAnswers: number;
  totalAnswers: number;
};

// ============================================= INTERFACES =============================================
export interface CalculatePointsParams {
  difficulty: Difficulty;
  timeTaken: number; // in seconds
  isCorrect: boolean;
  isSolo: boolean;
  allCorrect: boolean;
  totalQuestions: number;
  correctAnswers: number;
}

export interface CachePointsParams {
  gameCategory: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface QuizSettings {
  quizCategory: string;
  quizLevel: Difficulty;
  quizPlayStyle: PlayStyle;
  chosenTopic: string,
}
