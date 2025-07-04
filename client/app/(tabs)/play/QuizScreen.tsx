import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
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
import IconClose from "@/assets/icons/IconClose";
import TimerBar from "@/components/TimerBar";
import { clearCacheData, CACHE_KEY } from "@/utilities/cacheUtils";
import CustomAlert from "@/components/CustomAlert";

const QuizLogic = () => {
  const {
    language,
    currentQuestionData,
    currQuestionIndex,
    gameState,
    answerState,
    readTimer,
    pointsState,
    showResult,
    handleAnswerSelect,
    handleSelection,
    handleAnswerSubmit,
    handleNextQuestion,
  } = useQuizLogic();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const timerBarWidth = Math.min(348, width - 32); // Gleiche Breite wie QuizButtons

  const options = [
    { key: "A", data: currentQuestionData?.optionA },
    { key: "B", data: currentQuestionData?.optionB },
    { key: "C", data: currentQuestionData?.optionC },
    { key: "D", data: currentQuestionData?.optionD },
  ];

  const cacheKey = {
    questions: CACHE_KEY.aiQuestions,
    points: CACHE_KEY.gameData,
    settings: CACHE_KEY.quizSettings,
  };

  const [showAlert, setShowAlert] = useState(false);

  const handleRoundAgain = () => {
    clearCacheData(cacheKey.questions);
    clearCacheData(cacheKey.points);
    clearCacheData(cacheKey.settings);
    router.push("./CategoryScreen");
  };

  const handleHome = () => {
    clearCacheData(cacheKey.questions);
    clearCacheData(cacheKey.points);
    clearCacheData(cacheKey.settings);
    router.push("./");
  };

  const handleBackButton = () => {
    if (!showResult) {
      setShowAlert(true);
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const handleConfirmAlert = () => {
    setShowAlert(false);
    clearCacheData(cacheKey.questions);
    clearCacheData(cacheKey.points);
    clearCacheData(cacheKey.settings);
    router.push("./");
  };

  return (
    <>
      {/* ---------- SHOW RESULT ---------- */}
      {showResult ? (
        <ScrollView
          style={styles.containerResult}
          contentContainerStyle={styles.contentContainerResult}
        >
          <Logo size="big" />
          <View style={styles.resultsContainer}>
            <Text style={{ fontSize: FontSizes.H1Fs, fontWeight: "bold" }}>
              Well done!
            </Text>

            <View style={styles.pointsRow}>
              <IconCheckbox />
              <Text style={styles.pointsText}>
                Total Quizzly-Points:{" "}
                {pointsState.timePoints + pointsState.score}
              </Text>
            </View>
            <View style={styles.pointsRow}>
              <IconCheckbox />
              <Text style={styles.pointsText}>
                Earned {pointsState.score} Knowledge-Points
              </Text>
            </View>
            <View style={styles.pointsRow}>
              <IconCheckbox />
              <Text style={styles.pointsText}>
                Plus extra {pointsState.timePoints} Timing-Points
              </Text>
            </View>
            <View style={styles.pointsRow}>
              <IconCheckbox />
              <Text style={styles.pointsText}>
                Correct questions: {pointsState.chosenCorrect} out of{" "}
                {pointsState.totalAnswers}
              </Text>
            </View>
          </View>

          <View style={styles.buttonsContainer}>
            <ButtonPrimary
              text="Play again"
              onPress={() => handleRoundAgain()}
            />
            <ButtonSecondary text="Home" onPress={() => handleHome()} />
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
          {/* ---------- BACK BUTTON ---------- */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => handleBackButton()}
            accessibilityLabel="Go back"
          >
            <IconClose />
          </TouchableOpacity>

          {/* ---------- ALERT ---------- */}
          <CustomAlert
            visible={showAlert}
            onClose={handleConfirmAlert}
            title="Quit game"
            message="Do you really want to leave?"
            cancelText="Quit"
            confirmText="Continue"
            onConfirm={handleCloseAlert}
            noInternet={false}
          />

          {/* ---------- QUESTIONS ---------- */}
          <View style={styles.questionScreenContainer}>
            <Text style={styles.questionNumber}>
              {currQuestionIndex + 1} from 10
            </Text>
            <Text style={styles.questionText}>
              {currentQuestionData?.question.de}
            </Text>
          </View>
          {/* Show only if readTimer true */}
          {readTimer && (
            <View style={styles.answerSection}>
              <View style={styles.timerContainer}>
                <TimerBar
                  key={`timer-${currQuestionIndex}`}
                  duration={30}
                  delay={0}
                  width={timerBarWidth} // Gleiche Breite wie die Antworten
                  isPaused={answerState.isSubmitted}
                />
              </View>
              <View style={styles.questionAnswerContainer}>
                <View style={styles.answerContainer}>
                  {/* show one quiz button for each option */}
                  {options &&
                    options.map(({ key, data }) => (
                      <QuizButton
                        key={key}
                        text={data?.[language] ?? data?.["en"] ?? ""}
                        selected={handleSelection(data?.[language] ?? "")}
                        checked={
                          (answerState.isLocked && data?.isCorrect) ||
                          (answerState.isLocked &&
                            answerState.isSubmitted &&
                            answerState.chosenAnswer ===
                              (data?.[language] ?? ""))
                        }
                        isCorrect={!!data?.isCorrect}
                        onPress={() =>
                          handleAnswerSelect(data?.[language] ?? "")
                        }
                      />
                    ))}
                </View>
                <View style={styles.buttonsWrapper}>
                  {answerState.isLocked && gameState.playStyle === "solo" ? (
                    <ButtonPrimary text="Next" onPress={handleNextQuestion} />
                  ) : answerState.isLocked &&
                    gameState.playStyle === "group" ? (
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
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
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

  closeButton: {
    position: "absolute",
    top: -8,
    right: 16,
    zIndex: 10,
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
  timerContainer: {
    alignItems: "center",
    marginBottom: Gaps.g32,
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
