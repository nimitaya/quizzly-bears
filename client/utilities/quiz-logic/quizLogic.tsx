import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { QuizButton } from "@/components/QuizButtons";
import { ButtonPrimary, ButtonPrimaryDisabled } from "@/components/Buttons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Dummy data:
import quizQuestions from "@/utilities/quiz-logic/data";
import type { QuizQuestion } from "@/utilities/quiz-logic/data";

const quizLogic = () => {
  const [currentQuestionData, setCurrentQuestionData] =
    useState<QuizQuestion | null>(null);
  const [currQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chosenAnswer, setChosenAnswer] = useState<string | null>(null);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [readTimer, setReadTimer] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [playStyle, setPlayStyle] = useState("solo"); // solo or group play TODO temporary
  // To reset the Answer Timer if user answers before timeout
  const answerTimeout = useRef<number | null>(null);

  // ===== PLACEHOLDER FOR FETCHING FROM CACHE TODO =====
  const fetchQuestionsFromCache = async (): Promise<QuizQuestion[] | null> => {
    try {
      const cached = await AsyncStorage.getItem("quizQuestions");
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error("Error fetching questions from cache:", error);
      return null;
    }
  };

  // ----- LOAD current question data -----
  const loadQuestions = async () => {
    let questions = await fetchQuestionsFromCache();
    if (!questions) {
      // Fallback to dummy data if cache is empty
      questions = quizQuestions;
    }
    if (currQuestionIndex < questions.length) {
      setCurrentQuestionData(questions[currQuestionIndex]);
      setChosenAnswer(null);
      setIsAnswerSelected(false);
      setIsAnswerLocked(false);
      setTimeout(() => {
        // Set read timer to true to show the answers
        setReadTimer(true);
        console.log("Answer Timer started");

        answerTimeout.current = setTimeout(() => {
          setIsAnswerLocked(true);
          handleAnswerSubmit();
          console.log("Answer Timer finished");
          if (playStyle === "group") {
            handleNextQuestion();
          }
          // 10 seconds to provide an answer
        }, 5000);
      }, 2000);
    } else {
      setShowResult(true);
    }
  };

  // ----- Handle ANSWER SELECTION -----
  const handleAnswerSelect = (selectedOption: string) => {
    if (isAnswerLocked) return;
    // Prevent further actions if answer is locked

    setIsAnswerSelected(true);
    setChosenAnswer(selectedOption);
    console.log("Chosen Answer:", chosenAnswer);
  };

  // ----- Handle ANSWER SUBMISSION -----
  const handleAnswerSubmit = () => {
    setIsAnswerLocked(true);
    const isCorrect = chosenAnswer === currentQuestionData?.answer;
    if (isCorrect) {
      // Increment score for correct answer TODO correct points according to difficulty
      setScore((prevScore) => prevScore + 1);
      console.log("Current Score:", score);
    }

    // Logic for SOLO Play
    if (currQuestionIndex < quizQuestions.length - 1 && playStyle === "solo") {
      // Clear the timeout if answer is submitted early
      if (answerTimeout.current) {
        clearTimeout(answerTimeout.current);
        answerTimeout.current = null;
      }
    } else if (playStyle === "group") {
      // Wait for other players to answer
      return; 
    } else {
      // Save score to cache or handle end of quiz logic
      setShowResult(true);
    }
  };

  // ----- Handle NEXT QUESTION -----
  const handleNextQuestion = () => {
    if (playStyle === "solo") {
      // Logic for Solo Play
      if (currQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setReadTimer(false);
      }
    }
    if (playStyle === "group") {
      // Logic for Group Play
      setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setReadTimer(false);
        // Wait for x seconds before showing next question
      }, 2000);
    }
  };

  // ----- INITIALIZE questions loading on mount and when index changes -----
  useEffect(() => {
    loadQuestions();
  }, [currQuestionIndex]);

  return (
    <>
      {showResult ? (
        // TODO: Show correct restulst Page
        <View style={styles.container}>
          <Text>Ergebnis: {score}</Text>
          <TouchableHighlight onPress={() => console.log("Restart Quiz")}>
            <View>
              <Text>Quiz Neu Starten</Text>
            </View>
          </TouchableHighlight>
        </View>
      ) : (
        <View style={styles.container}>
          <View>
            <Text>Frage: {currQuestionIndex + 1}/10</Text>
            <Text>{currentQuestionData?.question}</Text>
          </View>
          {/* Show only after readTimer = 0 */}
          {readTimer && (
            <View>
              <View>
                <Text>Timer Anzeige TODO</Text>
              </View>
              <View style={styles.answerContainer}>
                {/* show one quiz button for each option */}
                {currentQuestionData &&
                  currentQuestionData.options.map((option, index) => (
                    <QuizButton
                      key={index}
                      text={option}
                      selected={chosenAnswer === option ? true : false}
                      checked={isAnswerLocked}
                      isCorrect={currentQuestionData.answer === option}
                      onPress={() => handleAnswerSelect(option)}
                    />
                  ))}
              </View>
              <View>
                {isAnswerLocked && playStyle === "solo" ? (
                  <ButtonPrimary text="Next" onPress={handleNextQuestion} />
                ) : isAnswerLocked && playStyle === "group" ? (
                  <ButtonPrimaryDisabled text="Waiting for other bears..." />
                ) : isAnswerSelected ? (
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

export default quizLogic;

// IMPORTANT
// Zeit messen bis Antwort gegeben
// (Punkte Cachen)
