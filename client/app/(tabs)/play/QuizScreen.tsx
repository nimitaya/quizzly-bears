import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { QuizButton } from "@/components/QuizButtons";
import { ButtonPrimary, ButtonPrimaryDisabled } from "@/components/Buttons";
import { useQuizLogic } from "@/utilities/quiz-logic/useQuizLogic";
import { generateQuizQuestion } from "../../../utilities/api/quizApi";
import { useState, useEffect } from "react";

// Typ für die generierte Frage
interface GeneratedQuestion {
  question: { de: string; en: string };
  optionA: { isCorrect: boolean; de: string; en: string };
  optionB: { isCorrect: boolean; de: string; en: string };
  optionC: { isCorrect: boolean; de: string; en: string };
  optionD: { isCorrect: boolean; de: string; en: string };
  correctAnswer?: number;
}

// Angepasster Typ für deine Komponente
interface AdaptedQuestion {
  question: string;
  options: string[];
  answer: string;
}

const QuizLogic = () => {
  const {
    currQuestionIndex,
    answerState,
    readTimer,
    remainingTime,
    pointsState,
    showResult,
    playStyle,
    setPlayStyle,
    handleAnswerSelect,
    handleSelection,
    handleAnswerSubmit,
    handleNextQuestion,
  } = useQuizLogic();

  const [currentQuestionData, setCurrentQuestionData] = useState<AdaptedQuestion | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'de' | 'en'>('de'); // Aktuelle Sprache

  // Funktion zur Anpassung der generierten Frage an das erwartete Format
  const adaptQuestion = (generatedQuestion: GeneratedQuestion): AdaptedQuestion => {
    const options = [
      generatedQuestion.optionA[language],
      generatedQuestion.optionB[language],
      generatedQuestion.optionC[language],
      generatedQuestion.optionD[language],
    ];

    // Korrekte Antwort finden
    const correctOption = [
      generatedQuestion.optionA,
      generatedQuestion.optionB,
      generatedQuestion.optionC,
      generatedQuestion.optionD,
    ].find(option => option.isCorrect);

    return {
      question: generatedQuestion.question[language],
      options: options,
      answer: correctOption ? correctOption[language] : options[0],
    };
  };

  // Funktion zum Laden einer neuen Frage
  const loadNewQuestion = async () => {
    setIsLoading(true);
    try {
      // Hier kannst du Kategorie und Schwierigkeit nach deiner Logik definieren
      const category = "General Knowledge"; // Nach Bedarf ändern
      const difficulty = "medium"; // Nach Bedarf ändern
      
      const generatedQuestion = await generateQuizQuestion(category, difficulty, usedQuestions);
      const adaptedQuestion = adaptQuestion(generatedQuestion);
      
      setCurrentQuestionData(adaptedQuestion);
      
      // Frage zum Set der verwendeten Fragen hinzufügen
      setUsedQuestions(prev => new Set(prev).add(adaptedQuestion.question.substring(0, 50).toLowerCase()));
      
    } catch (error) {
      console.error("Fehler beim Laden der Frage:", error);
      // Hier könntest du eine Fallback-Frage oder Fehlermeldung anzeigen
    } finally {
      setIsLoading(false);
    }
  };

  // Frage laden wenn sich der Index ändert
  useEffect(() => {
    loadNewQuestion();
  }, [currQuestionIndex]);

  // Erste Frage beim Mounten der Komponente laden
  useEffect(() => {
    loadNewQuestion();
  }, []);

  return (
    <>
      {showResult ? (
        // TODO: Korrekte Ergebnisseite anzeigen oder weiterleiten
        <View style={styles.container}>
          <Text>Ergebnis: {pointsState.timePoints + pointsState.score}</Text>
          <Text>Score: {pointsState.score}</Text>
          <Text>Time Points: {pointsState.timePoints}</Text>
          <TouchableHighlight onPress={() => {
            console.log("Quiz neu starten");
            setUsedQuestions(new Set()); // Verwendete Fragen löschen
            loadNewQuestion(); // Neue Frage laden
          }}>
            <View>
              <Text>Quiz Neu Starten</Text>
            </View>
          </TouchableHighlight>
        </View>
      ) : (
        <View style={styles.container}>
          <View>
            <Text>Frage: {currQuestionIndex + 1}/10</Text>
            {isLoading ? (
              <Text>Lade Frage...</Text>
            ) : (
              <Text>{currentQuestionData?.question}</Text>
            )}
          </View>
          
          {/* Nur anzeigen wenn readTimer true und nicht laden */}
          {readTimer && !isLoading && (
            <View>
              <View>
                <Text>Timer Anzeige TODO</Text>
                <Text>Time left: {remainingTime}s</Text>
              </View>
              
              <View style={styles.answerContainer}>
                {/* Eine Quiz-Schaltfläche für jede Option anzeigen */}
                {currentQuestionData &&
                  currentQuestionData.options.map((option, index) => (
                    <QuizButton
                      key={index}
                      text={option}
                      selected={handleSelection(option)}
                      checked={
                        (answerState.isLocked &&
                          currentQuestionData.answer === option) ||
                        (answerState.isLocked &&
                          answerState.isSubmitted &&
                          answerState.chosenAnswer === option)
                      }
                      isCorrect={currentQuestionData.answer === option}
                      onPress={() => handleAnswerSelect(option)}
                    />
                  ))}
              </View>
              
              <View>
                {answerState.isLocked && playStyle === "solo" ? (
                  <ButtonPrimary text="Next" onPress={() => {
                    handleNextQuestion();
                    // Die neue Frage wird automatisch durch useEffect geladen
                  }} />
                ) : answerState.isLocked && playStyle === "group" ? (
                  <ButtonPrimaryDisabled text="Waiting for other bears..." />
                ) : answerState.isSelected ? (
                  <ButtonPrimary text="Answer" onPress={handleAnswerSubmit} />
                ) : (
                  <ButtonPrimaryDisabled text="Answer" />
                )}
              </View>
            </View>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  answerContainer: {
    gap: 10,
  },
});

export default QuizLogic;