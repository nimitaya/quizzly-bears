import React, { createContext, useContext, useState } from "react";

interface QuizContextType {
  isQuizActive: boolean;
  setIsQuizActive: (active: boolean) => void;
}

const QuizContext = createContext<QuizContextType>({
  isQuizActive: false,
  setIsQuizActive: () => {},
});

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isQuizActive, setIsQuizActive] = useState(false);

  return (
    <QuizContext.Provider value={{ isQuizActive, setIsQuizActive }}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizContext = () => useContext(QuizContext);
