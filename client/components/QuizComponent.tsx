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
import axios from "axios";
import Config from "react-native-config";

// Groq-Konfiguration
const GROQ_API_URL =
  Config.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY =
  Config.GROQ_API_KEY ||
  "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";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizComponentProps {
  difficulty?: string;
  category?: string;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  difficulty = "medium",
  category = "Geschichte",
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
   * Generiert eine vollständige Frage mit Multiple-Choice-Optionen mithilfe der Groq API
   */
  const generateQuizQuestion = async (): Promise<QuizQuestion> => {
    try {
      // Zufällige Elemente generieren, um jede Frage einzigartig zu machen
      const randomSeed = Math.floor(Math.random() * 10000);
      const timestamp = Date.now();
      const questionTypes = [
        "konzeptionell",
        "praktisch",
        "analytisch",
        "anwendungsbezogen",
      ];
      const randomType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      const prompt = `Du bist ein Generator für Bildungsquiz-Fragen. 

SPEZIFISCHE ANWEISUNGEN:
- Erstelle EINE völlig NEUE UND EINZIGARTIGE Frage über ${category}
- Schwierigkeitsgrad: ${difficulty}
- Fragetyp: ${randomType}
- Referenznummer: ${randomSeed}
- Zeitstempel: ${timestamp}

WICHTIG: Jede Frage muss ANDERS sein als alle vorherigen Fragen. Verwende verschiedene Konzepte, Zahlen, Beispiele und Ansätze.

Du musst GENAU in diesem JSON-Format antworten:
{
  "question": "Deine völlig neue Frage hier",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0,
  "explanation": "Kurze Erklärung, warum diese Antwort richtig ist"
}

REGELN:
- correctAnswer muss der Index (0, 1, 2, oder 3) der richtigen Antwort sein
- Alle 4 Optionen müssen unterschiedlich und plausibel sein
- Nur eine Option darf richtig sein
- Generiere völlig originale und abwechslungsreiche Inhalte
- Bei Mathematik verwende jedes Mal andere Zahlen
- Bei Geschichte verwende verschiedene Ereignisse/Personen
- Die Erklärung sollte kurz und klar sein
- Antworte NUR mit dem JSON, ohne zusätzlichen Text`;

      const response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.9, // Erhöht für mehr Variabilität
          max_tokens: 400, // Erhöht für vollständigere Antworten
          top_p: 0.9, // Hinzugefügt für mehr Vielfalt
          frequency_penalty: 0.5, // Bestraft Wiederholungen
          presence_penalty: 0.3, // Fördert neue Themen
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY.trim()}`,
            "Content-Type": "application/json",
          },
        }
      );

      let responseContent = response.data.choices[0].message.content;

      // Antwort bereinigen, um nur das JSON zu erhalten
      responseContent = responseContent.replace(/```json\n?/g, "");
      responseContent = responseContent.replace(/```\n?/g, "");
      responseContent = responseContent.trim();

      // JSON-Antwort parsen
      const questionData = JSON.parse(responseContent);

      // Prüfen, ob diese Frage bereits zuvor generiert wurde
      const questionKey = questionData.question?.substring(0, 50).toLowerCase();
      if (usedQuestions.has(questionKey)) {
        // Wenn die Frage bereits verwendet wurde, rekursiv eine neue Anfrage stellen
        console.log("Doppelte Frage erkannt, generiere neue...");
        return await generateQuizQuestion();
      }

      // Validieren, dass die korrekte Struktur vorhanden ist
      if (
        !questionData.question ||
        !questionData.options ||
        !Array.isArray(questionData.options) ||
        questionData.options.length !== 4
      ) {
        throw new Error("Ungültiges Antwortformat");
      }

      // Frage zum Set der verwendeten hinzufügen
      setUsedQuestions((prev) => new Set([...prev, questionKey]));
    //const truncatedQuestion = questionData.question.slice(0, 30);

      return {
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer || 0,
        explanation: questionData.explanation || "Keine Erklärung verfügbar",
      };
    } catch (error) {
      console.error("Fehler beim Generieren der Frage:", error);
      throw new Error("Frage konnte nicht generiert werden. Versuche es erneut.");
    }
  };

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
      const question = await generateQuizQuestion();
      setCurrentQuestion(question);

      // Gesamtzahl der beantworteten Fragen und Punktzahl beim Laden einer neuen Frage erhöhen
      setTotalQuestions((prev) => prev + 1);
      setScore((prev) => prev + 1);
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
  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setTotalQuestions((prev) => prev + 1);

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
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {/* Antwortoptionen */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
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
                    <Text style={textStyle}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Ergebnisanzeige */}
            {showResult && (
              <View style={styles.resultContainer}>
                <Text
                  style={
                    selectedAnswer === currentQuestion.correctAnswer
                      ? styles.correctText
                      : styles.incorrectText
                  }
                >
                  {selectedAnswer === currentQuestion.correctAnswer
                    ? "Richtig! 🎉"
                    : "Falsch 😔"}
                </Text>
                {currentQuestion.explanation && (
                  <Text style={styles.explanationText}>
                    {currentQuestion.explanation}
                  </Text>
                )}
              </View>
            )}
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