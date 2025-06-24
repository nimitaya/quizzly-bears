import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { QuizButton } from "@/components/QuizButtons";
import { ButtonPrimary, ButtonPrimaryDisabled } from "@/components/Buttons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Dummy data:
import quizQuestions from "@/utilities/quiz-logic/data";
import type { QuizQuestion } from "@/utilities/quiz-logic/data";

const QuizLogic = () => {
  const [currentQuestionData, setCurrentQuestionData] = useState<QuizQuestion | null>(null);
  const [currQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chosenAnswer, setChosenAnswer] = useState<string | null>(null);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [readTimer, setReadTimer] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  // solo or group play TODO temporary
  const [playStyle, setPlayStyle] = useState("solo"); 
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
    try {
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
        // Start the timer for the question
        timingQuestions(); 
      } else {
        setShowResult(true);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const timingQuestions = () => {
    setTimeout(() => {
          // Set read timer to true after 2 seconds to show the answers
          setReadTimer(true);
          console.log("Answer Timer started");
          // Start - you have 10 seconds to choose an answer
          answerTimeout.current = setTimeout(() => {
            setIsAnswerLocked(true);
            handleAnswerSubmit();
            console.log("Answer Timer finished");
            if (playStyle === "group") {
              handleNextQuestion();
            }
            // 10 seconds to provide an answer
          }, 10000);
        }, 2000);
        // TODO Seconds
  }

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
      // Increment score for correct answer TODO correct points according to difficulty + Add to cache
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
    } else if (currQuestionIndex < quizQuestions.length - 1 && playStyle === "group") {
      // Wait for other players to answer
      return;
    } 
  };

  // ----- Handle NEXT QUESTION -----
  const handleNextQuestion = () => {
    if (currQuestionIndex < quizQuestions.length - 1 && playStyle === "solo") {
      // Logic for Solo Play
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setReadTimer(false);
      
    } else if (currQuestionIndex < quizQuestions.length - 1 && playStyle === "group") {
      // Logic for Group Play
      setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setReadTimer(false);
        // Wait for 3 seconds TODO before showing next question
      }, 3000);
    } else {
      setShowResult(true);
    }
  };

  // ===== INITIALIZE questions loading on mount and when currQuestionIndex changes =====
  useEffect(() => {
    loadQuestions();
    // clear the timeout if the component unmounts or new question is loaded
    return () => {
    if (answerTimeout.current) {
      clearTimeout(answerTimeout.current);
      answerTimeout.current = null;
    }
  };
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

export default QuizLogic;

// IMPORTANT
// Zeit messen bis Antwort gegeben
// (Punkte Cachen)
