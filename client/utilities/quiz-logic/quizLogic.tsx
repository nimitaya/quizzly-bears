import { useState, useEffect } from "react";
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import quizQuestions from "@/utilities/quiz-logic/data";

const quizLogic = () => {
  const [currQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // get current question from quiz data
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [chosenAnswer, setChosenAnswer] = useState<string | null>(null);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [timer, setTimer] = useState(30); // 30 seconds for each question
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  return (
    <>
      {showResult ? (
        <View style={styles.container}>
          <Text>Ergebnis: {score}</Text>
          <TouchableHighlight onPress={() => console.log("Restart Quiz")}>
            <View style={styles.button}>
              <Text>Quiz Neu Starten</Text>
            </View>
          </TouchableHighlight>
        </View>
      ) : (
        <View style={styles.container}>
          <View>
            <Text>Inhalt der Frage</Text>
          </View>
          <View>
            <Text>Timer Anzeige</Text>
          </View>
          <View style={styles.answerContainer}>
            <TouchableHighlight onPress={() => console.log("Button 1 Pressed")}>
              <View style={styles.button}>
                <Text>Antwort A</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={() => console.log("Button 2 Pressed")}>
              <View style={styles.button}>
                <Text>Antwort B</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={() => console.log("Button 3 Pressed")}>
              <View style={styles.button}>
                <Text>Antwort C</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={() => console.log("Button 4 Pressed")}>
              <View style={styles.button}>
                <Text>Antwort D</Text>
              </View>
            </TouchableHighlight>
          </View>
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
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
  },
  answerContainer: {
    gap: 10,
  },
});

export default quizLogic;

// Frage anzeigen Timer
// Frage mit Antworten zeigen
//  Timer für Antwortzeit
// Zeit messen bis Antwort gegeben
// Antwort einloggen und zwischenschpeichern
// Next Button aktiv machen
// Richtige Antwort anzeigen
// (Punkte Cachen)
// Anzahl der Fragen anzeigen 3/10
// Nach 10 Fragen Ergebnis anzeigen