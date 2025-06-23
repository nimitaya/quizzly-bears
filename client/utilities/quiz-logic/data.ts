export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

const quizQuestions: QuizQuestion[] = [
    {
      question: "Wie nennt man „Herbst“ auf Englisch?",
      options: ["Winter", "Spring", "Autumn", "Summer"],
      answer: "Autumn",
    },
    {
      question: "Wie nennt man „Sommer“ auf Englisch?",
      options: ["Spring", "Summer", "Autumn", "Winter"],
      answer: "Summer",
    },
    {
      question: "Welche Jahreszeit kommt nach dem Sommer?",
      options: ["Winter", "Spring", "Autumn", "Summer"],
      answer: "Autumn",
    },
    {
      question: "Wie nennt man „Frühling“ auf Englisch?",
      options: ["Winter", "Spring", "Autumn", "Summer"],
      answer: "Spring",
    },
    {
      question: "Welche Jahreszeit kommt vor dem Frühling?",
      options: ["Winter", "Spring", "Autumn", "Summer"],
      answer: "Winter",
    },
    {
      question: "Wie nennt man „Winter“ auf Englisch?",
      options: ["Winter", "Spring", "Autumn", "Summer"],
      answer: "Winter",
    },
    {
      question: "In welcher Jahreszeit fallen die Blätter von den Bäumen?",
      options: ["Winter", "Spring", "Autumn", "Summer"],
      answer: "Autumn",
    },
    {
      question: "Welche Jahreszeit hat die heißesten Temperaturen?",
      options: ["Winter", "Spring", "Autumn", "Summer"],
      answer: "Summer",
    },
    {
      question: "Welche Jahreszeit hat die kältesten Temperaturen?",
      options: ["Winter", "Spring", "Autumn", "Summer"],
      answer: "Winter",
    },
    {
      question: "In welcher Jahreszeit blühen die Blumen?",
      options: ["Winter", "Spring", "Autumn", "Summer"],
      answer: "Spring",
    },
  ];

export default quizQuestions;