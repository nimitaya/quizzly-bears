type Difficulty = "simple" | "medium" | "hard";

interface CalculatePointsParams {
  difficulty: Difficulty;
  timeTaken: number; // in seconds
  isCorrect: boolean;
  isSolo: boolean;
  allCorrect: boolean;
  totalQuestions: number;
  correctAnswers: number;
}

export function calculatePoints({
  difficulty,
  timeTaken,
  isCorrect,
  isSolo,
  allCorrect,
  totalQuestions,
  correctAnswers,
}: CalculatePointsParams): number {
  if (!isCorrect) return 0;

  let basePoints = 0;
  switch (difficulty) {
    case "simple":
      basePoints = 5;
      break;
    case "medium":
      basePoints = 10;
      break;
    case "hard":
      basePoints = 15;
      break;
  }

  let timeBonus = 0;
  if (timeTaken <= 5) timeBonus = 5;
  else if (timeTaken <= 10) timeBonus = 3;
  else if (timeTaken <= 20) timeBonus = 1;

  let bonusAllCorrect = 0;
  if (isSolo && allCorrect && correctAnswers === totalQuestions) {
    bonusAllCorrect = 10; // or any other bonus
  }

  return basePoints + timeBonus + bonusAllCorrect;
}
