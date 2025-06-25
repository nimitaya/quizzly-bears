import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { generateQuizQuestion } from "@/utilities/api/quizApi";
import { Difficulty, Category } from "@/utilities/types";

export interface QuizQuestion {
  question: {
    de: string;
    en: string;
  };
  optionA: {
    isCorrect: boolean;
    de: string;
    en: string;
  };
  optionB: {
    isCorrect: boolean;
    de: string;
    en: string;
  };
  optionC: {
    isCorrect: boolean;
    de: string;
    en: string;
  };
  optionD: {
    isCorrect: boolean;
    de: string;
    en: string;
  };
  correctAnswer?: number;
}

interface QuizComponentProps {
  difficulty?: Difficulty;
  category?: Category;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  difficulty = "easy",
  category = "Sports",
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set()); // Nachverfolgung bereits gestellter Fragen

  /**
   * Lädt eine neue Frage
   */
  const loadNewQuestion = async () => {
    if (totalQuestions >= 10) {
      Alert.alert(
        "Ende der Runde",
        "Du hast alle 10 Fragen dieser Runde abgeschlossen. Gut gemacht!",
        [{ text: "OK", onPress: resetQuiz }]
      );
      return; // Stoppe die Generierung neuer Fragen
    }

    setLoading(true);
    setSelectedAnswer(null);
    setShowResult(false);

    try {
      const rawQuestion = await generateQuizQuestion(
        category,
        difficulty,
        usedQuestions
      );
      console.log("Raw Question:", rawQuestion); // API Antwort in der Konsole ausgeben

      // Umwandlung der Frage in das QuizQuestion Format
      const transformedQuestion: QuizQuestion = {
        question: rawQuestion.question,
        optionA: rawQuestion.optionA,
        optionB: rawQuestion.optionB,
        optionC: rawQuestion.optionC,
        optionD: rawQuestion.optionD,
        correctAnswer: ["optionA", "optionB", "optionC", "optionD"].findIndex(
          (option) => {
            const value = rawQuestion[option as keyof typeof rawQuestion];
            return (
              typeof value === "object" &&
              "isCorrect" in value &&
              value.isCorrect
            );
          }
        ),
      };

      setCurrentQuestion(transformedQuestion);
      setUsedQuestions(
        (prev) =>
          new Set([
            ...prev,
            rawQuestion.question.de.substring(0, 50).toLowerCase(),
          ])
      );
      setTotalQuestions((prev) => prev + 1);
    } catch (error) {
      Alert.alert(
        "Fehler",
        "Frage konnte nicht geladen werden. Versuche es erneut."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Behandelt die Auswahl einer Antwort
   */
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // Array para almacenar las opciones seleccionadas

  /**
   * Behandelt die Auswahl einer Antwort
   */
  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;

    const selectedOption = currentQuestion
      ? currentQuestion[
          ["optionA", "optionB", "optionC", "optionD"][
            answerIndex
          ] as keyof QuizQuestion
        ]
      : undefined;
    console.log(
      `Ausgewählte Option: ${answerIndex}, Inhalt: ${
        typeof selectedOption === "object" && selectedOption.de
          ? selectedOption.de
          : "Keine Option verfügbar"
      }`
    );

    // Füge die ausgewählte Option dem Array hinzu
    if (selectedOption) {
      if (typeof selectedOption === "string") {
        setSelectedAnswers((prev) => [...prev, selectedOption]);
      }
    }

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (currentQuestion && answerIndex === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };
  /**
   * Setzt das Quiz zurück
   */
  const resetQuiz = () => {
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTotalQuestions(0);
    setUsedQuestions(new Set()); // Fragenverlauf löschen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Kopfbereich */}
        <View style={styles.header}>
          <Text style={styles.title}>Quizzly Bears</Text>
          <Text style={styles.subtitle}>
            {category} - {difficulty}
          </Text>
          {totalQuestions > 0 && (
            <Text style={styles.score}>Quizzies: {score}/10</Text>
          )}
        </View>

        {/* Ladezustand */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Generiere Frage...</Text>
          </View>
        )}

        {/* Fragenanzeige */}
        {currentQuestion && !loading && (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {currentQuestion.question.de}
            </Text>
            {/* Antwortoptionen */}
            <View style={styles.optionsContainer}>
              {["optionA", "optionB", "optionC", "optionD"].map(
                (optionKey, index) => {
                  const option =
                    currentQuestion[optionKey as keyof QuizQuestion];
                  let buttonStyle = styles.optionButton;
                  let textStyle = styles.optionText;

                  if (showResult) {
                    if (index === currentQuestion.correctAnswer) {
                      buttonStyle = StyleSheet.flatten({
                        ...styles.optionButton,
                        ...styles.correctOption,
                      });
                      textStyle = StyleSheet.flatten([
                        styles.optionText,
                        styles.correctOptionText,
                      ]);
                    } else if (index === selectedAnswer) {
                      buttonStyle = StyleSheet.flatten({
                        ...styles.optionButton,
                        ...styles.incorrectOption,
                      });
                      textStyle = StyleSheet.flatten([
                        styles.optionText,
                        styles.incorrectOptionText,
                      ]);
                    }
                  } else if (selectedAnswer === index) {
                    buttonStyle = StyleSheet.flatten({
                      ...styles.optionButton,
                      ...styles.selectedOption,
                    });
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      style={buttonStyle}
                      onPress={() => handleAnswerSelect(index)}
                      disabled={showResult}
                    >
                      <Text style={styles.optionNumber}>{index + 1}</Text>
                      <Text style={textStyle}>
                        {typeof option === "object" &&
                        typeof option.de === "string" &&
                        option.de.trim() !== ""
                          ? option.de
                          : "Keine Option verfügbar"}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>
        )}

        {/* Aktionsschaltflächen */}
        <View style={styles.buttonContainer}>
          {!currentQuestion && !loading && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={loadNewQuestion}
            >
              <Text style={styles.primaryButtonText}>Quiz Starten</Text>
            </TouchableOpacity>
          )}

          {currentQuestion && showResult && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={loadNewQuestion}
            >
              <Text style={styles.primaryButtonText}>Nächste Frage</Text>
            </TouchableOpacity>
          )}

          {totalQuestions > 0 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={resetQuiz}
            >
              <Text style={styles.secondaryButtonText}>Quiz Zurücksetzen</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textTransform: "capitalize",
  },
  score: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  questionContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: "#E9ECEF",
  },
  selectedOption: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  correctOption: {
    borderColor: "#28A745",
    backgroundColor: "#D4EDDA",
  },
  incorrectOption: {
    borderColor: "#DC3545",
    backgroundColor: "#F8D7DA",
  },
  optionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginRight: 12,
    minWidth: 20,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  correctOptionText: {
    color: "#155724",
    fontSize: 16,
    flex: 1,
  },
  incorrectOptionText: {
    color: "#721C24",
    fontSize: 16,
    flex: 1,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
  },
  correctText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28A745",
    textAlign: "center",
    marginBottom: 10,
  },
  incorrectText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC3545",
    textAlign: "center",
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonContainer: {
    gap: 15,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default QuizComponent;
