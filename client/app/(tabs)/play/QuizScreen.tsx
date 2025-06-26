import { ScrollView, View, Text, StyleSheet } from "react-native";
import { QuizButton } from "@/components/QuizButtons";
import {
  ButtonPrimary,
  ButtonPrimaryDisabled,
  ButtonSecondary,
} from "@/components/Buttons";
import { useQuizLogic } from "@/utilities/quiz-logic/useQuizLogic";
import { Colors, FontSizes, FontWeights, Gaps } from "@/styles/theme";
import { Logo } from "@/components/Logos";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IconCheckbox from "@/assets/icons/IconCheckbox";

const QuizLogic = () => {
  const {
    currentQuestionData,
    currQuestionIndex,
    gameState,
    answerState,
    readTimer,
    remainingTime,
    pointsState,
    showResult,
    handleAnswerSelect,
    handleSelection,
    handleAnswerSubmit,
    handleNextQuestion,
  } = useQuizLogic();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      {showResult ? (
        // TODO: Show correct restulst Page or forward to it
        <ScrollView
          style={styles.containerResult}
          contentContainerStyle={styles.contentContainerResult}
        >
          <Logo size="big" />
          <View style={styles.resultsContainer}>
            <Text style={{ fontSize: FontSizes.H1Fs, fontWeight: "bold" }}>
              Cool!
            </Text>

            <View style={styles.pointsRow}>
              <IconCheckbox />
              <Text style={styles.pointsText}>
                Total Points: {pointsState.timePoints + pointsState.score}
              </Text>
            </View>
            <View style={styles.pointsRow}>
              <IconCheckbox />
              <Text style={styles.pointsText}>
                has earned {pointsState.score} Grizzly-Points
              </Text>
            </View>
            <View style={styles.pointsRow}>
              <IconCheckbox />
              <Text style={styles.pointsText}>
                plus extra {pointsState.timePoints} Grizzly-Points
              </Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <ButtonPrimary
              text="Round again?"
              onPress={() => router.push("./CategoryScreen")}
            />
            <ButtonSecondary text="Home" onPress={() => router.push("./")} />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.questionScreenContainer}>
            <Text style={styles.questionNumber}>
              {currQuestionIndex + 1} from 10
            </Text>
            <Text style={styles.questionText}>
              {currentQuestionData?.question}
            </Text>
          </View>
          {/* Show only if readTimer true */}
          {readTimer && (
            <View style={styles.answerSection}>
              <View>
                <Text>Timer Anzeige TODO</Text>
                <Text>Taste „Close“ oben links, die das Quiz beendet.</Text>
                <Text>Time left: {remainingTime}s</Text>
              </View>
              <View style={styles.questionAnswerContainer}>
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
                <View style={styles.buttonsWrapper}>
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
            </View>
          )}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Gaps.g32,
    color: Colors.black,
    paddingTop: Gaps.g80,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: Gaps.g40,
  },
  containerResult: {
    flex: 1,
    paddingHorizontal: Gaps.g32,
    color: Colors.black,
  },
  contentContainerResult: {
    flexGrow: 1,
    justifyContent: "flex-start",
    marginVertical: Gaps.g80,
  },

  questionNumber: {
    textAlign: "center",
    color: Colors.black,
    fontSize: FontSizes.H3Fs,
    paddingBottom: Gaps.g16,
  },
  answerSection: {
    flexGrow: 1,
  },
  buttonsWrapper: {},
  answerContainer: {},
  questionAnswerContainer: {
    gap: Gaps.g16,
  },
  questionText: {
    color: Colors.black,
    fontSize: FontSizes.H3Fs,
    paddingBottom: Gaps.g32,
    textAlign: "center",
    minHeight: 135,
  },

  questionScreenContainer: {},

  resultsContainer: {
    alignItems: "flex-start",
    gap: Gaps.g16,
    paddingVertical: Gaps.g48,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gaps.g8,
  },
  pointsText: {
    fontSize: FontSizes.TextLargeFs,
  },
  buttonsContainer: {
    gap: Gaps.g16,
  },
});

export default QuizLogic;
