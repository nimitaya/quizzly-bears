import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { QuizButton } from "@/components/QuizButtons";
import { ButtonPrimary, ButtonPrimaryDisabled } from "@/components/Buttons";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Dummy data:
import quizQuestions from "@/utilities/quiz-logic/data";
import type { QuizQuestion } from "@/utilities/quiz-logic/data";

const QuizLogic = () => {
  // Timer duration/ delays TODO
  const READ_TIMER_DURATION = 2000;
  const ANSWER_TIMER_DURATION = 10000;
  const NEXT_QUESTION_DELAY = 3000;
  // To reset Timers
  const readTimeout = useRef<number | null>(null);
  const answerTimeout = useRef<number | null>(null);
  // ====== State Management =====
  const [currentQuestionData, setCurrentQuestionData] =
    useState<QuizQuestion | null>(null);
  const [currQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState({
    chosenAnswer: null as string | null,
    isSelected: false,
    isSubmitted: false,
    isLocked: false,
  });
  const [readTimer, setReadTimer] = useState(false);
  const [remainingTime, setRemainingTime] = useState(
    ANSWER_TIMER_DURATION / 1000
  );
  const [pointsState, setPointsState] = useState({
    score: 0,
    timePoints: 0,
    total: 0,
  })
  const [showResult, setShowResult] = useState(false);
  // solo or group play TODO temporary
  type PlayStyle = "solo" | "group";
  const [playStyle, setPlayStyle] = useState("solo");

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
        // Reset
        setCurrentQuestionData(questions[currQuestionIndex]);

        setAnswerState(() => ({
          chosenAnswer: null,
          isSelected: false,
          isSubmitted: false,
          isLocked: false,
        }));

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
    readTimeout.current = setTimeout(() => {
      // Set read timer to true after 2 seconds to show the answers
      setReadTimer(true);
      console.log("Answer Timer started");
      // Start - you have 10 seconds to choose an answer
      answerTimeout.current = setTimeout(() => {
        setAnswerState((prevState) => ({ ...prevState, isLocked: true }));
        handleAnswerCheck();
        console.log("Answer Timer finished");
        if (playStyle === "group") {
          handleNextQuestion();
        }
      }, ANSWER_TIMER_DURATION);
    }, READ_TIMER_DURATION);
  };

  // ----- Handle ANSWER SELECTION -----
  const handleAnswerSelect = (selectedOption: string) => {
    if (answerState.isLocked) return;
    // Prevent further actions if answer is locked

    setAnswerState((prevState) => ({
      ...prevState,
      chosenAnswer: selectedOption,
      isSelected: true,
    }));
    console.log("Chosen Answer:", answerState.chosenAnswer);
  };

  // ----- Handle SELECTION STATE for Quizbuttons -----
  const handleSelection = (option: string) => {
    if (
      answerState.chosenAnswer === option &&
      !answerState.isSubmitted &&
      !answerState.isLocked
    ) {
      return true;
    } else if (!answerState.isSubmitted && answerState.isLocked) {
      return false;
    } else if (
      answerState.chosenAnswer === option &&
      answerState.isSubmitted &&
      answerState.isLocked
    ) {
      return true;
    } else {
      return false;
    }
  };

  // ----- Handle ANSWER SUBMISSION -----
  const handleAnswerSubmit = () => {
    setAnswerState((prevState) => ({
      ...prevState,
      isSubmitted: true,
      isLocked: true,
    }));
    handleAnswerCheck();
  };

  // ----- Handle ANSWER CHECK -----
  const handleAnswerCheck = () => {
    const isCorrect = answerState.chosenAnswer === currentQuestionData?.answer;
    if (isCorrect) {
      // Increment points for correct answer TODO correct points according to difficulty + Add to cache
      setPointsState((prevPoints) => ({...prevPoints, score: prevPoints.score + 1, timePoints: prevPoints.timePoints + remainingTime}));
      console.log("Current Score:", pointsState.score);
      console.log("Timer at:", remainingTime);
    }
    // Logic for SOLO Play
    if (currQuestionIndex < quizQuestions.length - 1 && playStyle === "solo") {
      // Clear the timeout if answer is submitted early
      if (answerTimeout.current) {
        clearTimeout(answerTimeout.current);
        answerTimeout.current = null;
      }
      if (readTimeout.current) {
        clearTimeout(readTimeout.current);
        readTimeout.current = null;
      }
    } else if (
      currQuestionIndex < quizQuestions.length - 1 &&
      playStyle === "group"
    ) {
      // Wait for other players to answer
      return;
    }
  };

  // ----- Handle NEXT QUESTION -----
  const handleNextQuestion = () => {
    if (answerTimeout.current) {
        clearTimeout(answerTimeout.current);
        answerTimeout.current = null;
      }
    if (currQuestionIndex < quizQuestions.length - 1 && playStyle === "solo") {
      // Logic for Solo Play
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setReadTimer(false);
    } else if (
      currQuestionIndex < quizQuestions.length - 1 &&
      playStyle === "group"
    ) {
      // Logic for Group Play
      setTimeout(() => {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setReadTimer(false);
      }, NEXT_QUESTION_DELAY);
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

  // ===== Show Countdown Timer =====
  useEffect(() => {
    if (readTimer && !answerState.isLocked) {
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        setRemainingTime(ANSWER_TIMER_DURATION / 1000);
        clearInterval(interval);
      };
    }
  }, [readTimer, answerState.isLocked]);

  return (
    <>
      {showResult ? (
        // TODO: Show correct restulst Page
        <View style={styles.container}>
          <Text>Ergebnis: {pointsState.timePoints + pointsState.score}</Text>
          <Text>Score: {pointsState.score}</Text>
          <Text>Time Points: {pointsState.timePoints}</Text>
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
          {/* Show only if readTimer true */}
          {readTimer && (
            <View>
              <View>
                <Text>Timer Anzeige TODO</Text>
                <Text>Time left: {remainingTime}s</Text>
              </View>
              <View style={styles.answerContainer}>
                {/* show one quiz button for each option */}
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
                  <ButtonPrimary text="Next" onPress={handleNextQuestion} />
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
