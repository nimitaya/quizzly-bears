// Don't use! Just for visualising the structure!
// Nicht benutzen, nur zur Visualisierung der Struktur!

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
    category: "Media",
    questionArray: [
    {
      question: {
        de: "Welcher Drache bewacht den Schatz in der 'Nibelungensage'?",
        en: "Which dragon guards the treasure in the 'Nibelungenlied'?",
      },
      optionA: { isCorrect: false, en: "Smaug", de: "Smaug" },
      optionB: { isCorrect: false, en: "Drogon", de: "Drogon" },
      optionC: { isCorrect: true, en: "Fafnir", de: "Fafnir" },
      optionD: { isCorrect: false, en: "Norbert", de: "Norbert" },
    },
    {
      question: {
        de: "Wie heißt der Drache in J.R.R. Tolkiens 'Der Hobbit'?",
        en: "What is the name of the dragon in J.R.R. Tolkien's 'The Hobbit'?",
      },
      optionA: { isCorrect: false, en: "Drogon", de: "Drogon" },
      optionB: { isCorrect: false, en: "Falkor", de: "Fuchur" },
      optionC: { isCorrect: false, en: "Toothless", de: "Ohnezahn" },
      optionD: { isCorrect: true, en: "Smaug", de: "Smaug" },
    },
    // ... weitere Fragen ...
    ]
};
