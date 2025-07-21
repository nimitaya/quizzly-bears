export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

// const quizQuestions: QuizQuestion[] = [
//   {
//     question: "Wie nennt man „Herbst“ auf Englisch?",
//     options: ["Winter", "Spring", "Autumn", "Summer"],
//     answer: "Autumn",
//   },
//   {
//     question: "Wie nennt man „Sommer“ auf Englisch?",
//     options: ["Spring", "Summer", "Autumn", "Winter"],
//     answer: "Summer",
//   },
//   {
//     question: "Welche Jahreszeit kommt nach dem Sommer?",
//     options: ["Winter", "Spring", "Autumn", "Summer"],
//     answer: "Autumn",
//   },
//   {
//     question: "Wie nennt man „Frühling“ auf Englisch?",
//     options: ["Winter", "Spring", "Autumn", "Summer"],
//     answer: "Spring",
//   },
//   {
//     question: "Welche Jahreszeit kommt vor dem Frühling?",
//     options: ["Winter", "Spring", "Autumn", "Summer"],
//     answer: "Winter",
//   },
//   {
//     question: "Wie nennt man „Winter“ auf Englisch?",
//     options: ["Winter", "Spring", "Autumn", "Summer"],
//     answer: "Winter",
//   },
//   {
//     question: "In welcher Jahreszeit fallen die Blätter von den Bäumen?",
//     options: ["Winter", "Spring", "Autumn", "Summer"],
//     answer: "Autumn",
//   },
//   {
//     question: "Welche Jahreszeit hat die heißesten Temperaturen?",
//     options: ["Winter", "Spring", "Autumn", "Summer"],
//     answer: "Summer",
//   },
//   {
//     question: "Welche Jahreszeit hat die kältesten Temperaturen?",
//     options: ["Winter", "Spring", "Autumn", "Summer"],
//     answer: "Winter",
//   },
//   {
//     question: "In welcher Jahreszeit blühen die Blumen?",
//     options: ["Winter", "Spring", "Autumn", "Summer"],
//     answer: "Spring",
//   },
// ];

// export default quizQuestions;

export type AiQuestions = {
  category: string;
  questionArray: QuestionStructure[];
};

export type QuestionStructure = {
  question: LocalizedString;
  optionA: Option;
  optionB: Option;
  optionC: Option;
  optionD: Option;
};

export type Option = {
  isCorrect: boolean;
} & LocalizedString;

// used index signature, so only isCorrect is boolean and all other key-value-pairs will be strings

export type LocalizedString = {
  [langCode: string]: string; // e.g. "de", "en", "fr", "es"
};

export const aiQuestions = {
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
    {
      question: {
        de: "Welcher der folgenden Drachen stammt aus der Serie 'Game of Thrones'?",
        en: "Which of the following dragons is from 'Game of Thrones'?",
      },
      optionA: { isCorrect: true, en: "Drogon", de: "Drogon" },
      optionB: { isCorrect: false, en: "Fafnir", de: "Fafnir" },
      optionC: { isCorrect: false, en: "Smaug", de: "Smaug" },
      optionD: { isCorrect: false, en: "Eragon", de: "Eragon" },
    },
    {
      question: {
        de: "Wie heißt der weiße Glücksdrache in 'Die unendliche Geschichte'?",
        en: "What is the name of the white luckdragon in 'The Neverending Story'?",
      },
      optionA: { isCorrect: true, en: "Falkor", de: "Fuchur" },
      optionB: { isCorrect: false, en: "Drogon", de: "Drogon" },
      optionC: { isCorrect: false, en: "Saphira", de: "Saphira" },
      optionD: { isCorrect: false, en: "Toothless", de: "Ohnezahn" },
    },
    {
      question: {
        de: "Welches Wesen wird in der chinesischen Mythologie häufig mit Glück assoziiert?",
        en: "Which creature is often associated with luck in Chinese mythology?",
      },
      optionA: { isCorrect: false, en: "Tiger", de: "Tiger" },
      optionB: { isCorrect: false, en: "Phoenix", de: "Phönix" },
      optionC: { isCorrect: true, en: "Dragon", de: "Drache" },
      optionD: { isCorrect: false, en: "Unicorn", de: "Einhorn" },
    },
    {
      question: {
        de: "Welcher Drache ist der Gefährte von Eragon in der gleichnamigen Romanreihe?",
        en: "Which dragon is the companion of Eragon in the book series?",
      },
      optionA: { isCorrect: false, en: "Drogon", de: "Drogon" },
      optionB: { isCorrect: false, en: "Falkor", de: "Fuchur" },
      optionC: { isCorrect: false, en: "Viserion", de: "Viserion" },
      optionD: { isCorrect: true, en: "Saphira", de: "Saphira" },
    },
    {
      question: {
        de: "Was war der Beruf von Hiccup im Film 'Drachenzähmen leicht gemacht'?",
        en: "What was Hiccup's role in 'How to Train Your Dragon'?",
      },
      optionA: { isCorrect: false, en: "Blacksmith", de: "Schmied" },
      optionB: { isCorrect: false, en: "Hunter", de: "Jäger" },
      optionC: { isCorrect: true, en: "Dragon trainer", de: "Drachentrainer" },
      optionD: { isCorrect: false, en: "Knight", de: "Ritter" },
    },
    {
      question: {
        de: "Welche Fähigkeit wird Drachen in westlichen Legenden meist zugeschrieben?",
        en: "Which ability is most commonly attributed to dragons in Western legends?",
      },
      optionA: { isCorrect: true, en: "Breathing fire", de: "Feuer speien" },
      optionB: { isCorrect: false, en: "Healing powers", de: "Heilkräfte" },
      optionC: {
        isCorrect: false,
        en: "Controlling time",
        de: "Zeit kontrollieren",
      },
      optionD: { isCorrect: false, en: "Singing", de: "Singen" },
    },
    {
      question: {
        de: "Wie heißen die drei Drachen von Daenerys Targaryen?",
        en: "What are the names of Daenerys Targaryen's three dragons?",
      },
      optionA: {
        isCorrect: false,
        en: "Norbert, Balthazar, Smaug",
        de: "Norbert, Balthasar, Smaug",
      },
      optionB: {
        isCorrect: false,
        en: "Fafnir, Glaurung, Saphira",
        de: "Fafnir, Glaurung, Saphira",
      },
      optionC: {
        isCorrect: false,
        en: "Falkor, Toothless, Igneel",
        de: "Fuchur, Ohnezahn, Igneel",
      },
      optionD: {
        isCorrect: true,
        en: "Drogon, Rhaegal, Viserion",
        de: "Drogon, Rhaegal, Viserion",
      },
    },
    {
      question: {
        de: "Was symbolisieren Drachen in der japanischen Mythologie häufig?",
        en: "What do dragons often symbolize in Japanese mythology?",
      },
      optionA: {
        isCorrect: false,
        en: "Chaos and destruction",
        de: "Chaos und Zerstörung",
      },
      optionB: {
        isCorrect: true,
        en: "Water and wisdom",
        de: "Wasser und Weisheit",
      },
      optionC: { isCorrect: false, en: "Fire and rage", de: "Feuer und Wut" },
      optionD: {
        isCorrect: false,
        en: "Death and rebirth",
        de: "Tod und Wiedergeburt",
      },
    },
  ],
};
