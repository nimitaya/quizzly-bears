export const CACHE_KEY = {
    aiQuestions: "aiQuestions",
    quizSettings: "quizSettings",
    gameData: "currGameData",
  }

const quizSettings = {
    quizCategory: "",
    quizLevel: "",
    quizPlayStyle: "",
    chosenTopic: "",
}

const gameData = {
    category: "",
    points: "",
    correctAnswers: "",
    totalAnswers: "",
  };

const aiQuestions = {
    category: "Fantasy",
    questionArray: 
    [{
      question: {de: "Welche Jahreszeit hat die kältesten Temperaturen?", en: "Which season has the coldest temperatures?"},
      optionA: {isCorrect: true, en: "Winter", de: "Winter"},
      optionB: {isCorrect: false, en: "Spring", de: "Frühling"},
      optionC: {isCorrect: false, en: "Autumn", de: "Herbst"},
      optionD: {isCorrect: false, en: "Summer", de: "Sommer"},
    },
    {
      question: {de: "Welche Jahreszeit hat die wärmsten Temperaturen?", en: "Which season has the warmest temperatures?"},
      optionA: {isCorrect: false, en: "Winter", de: "Winter"},
      optionB: {isCorrect: false, en: "Spring", de: "Frühling"},
      optionC: {isCorrect: false, en: "Autumn", de: "Herbst"},
      optionD: {isCorrect: true, en: "Summer", de: "Sommer"},
    },
    // ... weitere Fragen ...
    ]
};
