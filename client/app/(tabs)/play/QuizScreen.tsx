
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { QuizButton } from "@/components/QuizButtons";
import { ButtonPrimary, ButtonPrimaryDisabled } from "@/components/Buttons";
import { useQuizLogic } from "@/utilities/quiz-logic/useQuizLogic";

const QuizLogic = () => {
  const {
    currentQuestionData,
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

  return (
    <>
      {showResult ? (
        // TODO: Show correct restulst Page or forward to it
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
