import React, { useState, useContext, useEffect } from "react";
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
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { Logo } from "@/components/Logos";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IconCheckbox from "@/assets/icons/IconCheckbox";
import IconClose from "@/assets/icons/IconClose";
import TimerBar from "@/components/TimerBar";
import {
  clearCacheData,
  CACHE_KEY,
  loadCacheData,
} from "@/utilities/cacheUtils";
import CustomAlert from "@/components/CustomAlert";
import { useLanguage } from "@/providers/LanguageContext";
import { getLocalizedText } from "@/utilities/languageUtils";
import { removeAllInvites } from "@/utilities/invitationApi";
import { UserContext } from "@/providers/UserProvider";
import socketService from "@/utilities/socketService";

const QuizLogic = () => {
  const {
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
  const timerBarWidth = Math.min(348, width - 32);
  const { currentLanguage } = useLanguage();

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
    currentRoom: CACHE_KEY.currentRoom,
  };

  const { userData } = useContext(UserContext);
  const [showAlert, setShowAlert] = useState(false);

  // ~~~~~~~ Effect to ensure socket connection for final results ~~~~~~~
  useEffect(() => {
    if (gameState.playStyle === "group" || gameState.playStyle === "duel") {
      // Just make sure socket is connected for final results
      console.log("Ensuring socket connection for multiplayer results...");
      socketService.ensureConnection();
    }

    return () => {
      // Nothing to clean up
    };
  }, [gameState.playStyle]);

  // ----- Handler Play again -----
  const handleRoundAgain = async () => {
    clearCacheData(cacheKey.questions);
    clearCacheData(cacheKey.points);
    if (gameState.playStyle === "solo") {
      clearCacheData(cacheKey.settings);
    }

    // in Multiplayer send gameState and pointsState to socket server
    if (gameState.playStyle === "group" || gameState.playStyle === "duel") {
      try {
        const roomInfo = await loadCacheData(cacheKey.currentRoom);
        if (roomInfo && roomInfo.roomId && userData) {
          // Send the player's score to the socket server
          socketService.submitGameResults(
            roomInfo.roomId,
            userData.clerkUserId,
            userData.username || userData.email,
            {
              score: pointsState.score,
              timePoints: pointsState.timePoints,
              perfectGame: pointsState.perfectGame,
              total: pointsState.score + pointsState.timePoints,
              chosenCorrect: pointsState.chosenCorrect,
              totalAnswers: pointsState.totalAnswers,
            }
          );
          router.push("./MultiplayerResultScreen");
        } else {
          console.error("Missing room info or user data");
        }
      } catch (error) {
        console.error("Error submitting game results:", error);
      }
      return;
    }
    router.push("./CategoryScreen");
  };

  // ----- Handler go back Home -----
  const handleHome = async () => {
    clearCacheData(cacheKey.questions);
    clearCacheData(cacheKey.points);
    clearCacheData(cacheKey.settings);
    // Leave socket room if in multiplayer mode
    if (gameState.playStyle === "group" || gameState.playStyle === "duel") {
      await leaveSocketRoom();
      clearCacheData(cacheKey.currentRoom);
      handleRemoveAllInvites();
    }
    router.push("./");
  };

  // ----- Handler Back Button -----
  const handleBackButton = () => {
    if (!showResult) {
      setShowAlert(true);
    }
  };

  // ----- Handler close Alert -----
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  /// ----- Handler confirm Alert -----
  const handleConfirmAlert = async () => {
    setShowAlert(false);
    clearCacheData(cacheKey.questions);
    clearCacheData(cacheKey.points);
    clearCacheData(cacheKey.settings);

    // Leave socket room if in multiplayer mode
    if (gameState.playStyle === "group" || gameState.playStyle === "duel") {
      await leaveSocketRoom();
      clearCacheData(cacheKey.currentRoom);
      handleRemoveAllInvites();
    }

    router.push("./");
  };

  // ----- Handler Remove ALL Invitations -----
  const handleRemoveAllInvites = async () => {
    try {
      if (!userData) return;
      await removeAllInvites(userData.clerkUserId);
    } catch (error) {
      console.error("Error removing all invitations:", error);
    }
  };

  // ----- Helper function to leave socket room -----
  const leaveSocketRoom = async () => {
    if (gameState.playStyle === "group" || gameState.playStyle === "duel") {
      try {
        const roomInfo = await loadCacheData(cacheKey.currentRoom);
        if (roomInfo && roomInfo.roomId && userData) {
          console.log("Leaving socket room:", roomInfo.roomId);
          socketService.leaveRoom(roomInfo.roomId, userData.clerkUserId);
        }
      } catch (error) {
        console.error("Error leaving socket room:", error);
      }
    }
  };

  // ~~~~~ Language utility functions ~~~~~
  const getQuestionText = () => {
    if (!currentQuestionData?.question) return "";
    const result = getLocalizedText(
      currentQuestionData.question,
      currentLanguage.code
    );
    return result;
  };

  const getOptionText = (optionData: any) => {
    if (!optionData) return "";

    // If optionData is already a string, return it
    if (typeof optionData === "string") {
      return optionData;
    }

    // Create a localized string object by extracting the text part (without isCorrect)
    const { isCorrect, ...localizedText } = optionData;
    const result = getLocalizedText(localizedText, currentLanguage.code);
    return result;
  };

  return (
    <>
      {/* ---------- SHOW RESULT ---------- */}
      {showResult ? (
        <ScrollView
          style={styles.containerResult}
          contentContainerStyle={styles.contentContainerResult}
          showsVerticalScrollIndicator={false}
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
              text={gameState.playStyle === "solo" ? "Play again" : "Next"}
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
          <View>
            <Text style={styles.questionNumber}>
              {currQuestionIndex + 1} from 10
            </Text>
            <Text style={styles.questionText}>{getQuestionText()}</Text>
          </View>
          {/* Show only if readTimer true */}
          {readTimer && (
            <View style={styles.answerSection}>
              <View style={styles.timerContainer}>
                <TimerBar
                  key={`timer-${currQuestionIndex}`}
                  duration={30}
                  delay={0}
                  width={timerBarWidth}
                  isPaused={answerState.isSubmitted}
                />
              </View>
              <View style={styles.questionAnswerContainer}>
                <View style={styles.answerContainer}>
                  {/* show one quiz button for each option */}
                  {options &&
                    options.map(({ key, data }) => {
                      const optionText = getOptionText(data);
                      return (
                        <QuizButton
                          key={key}
                          text={optionText}
                          selected={handleSelection(key)}
                          checked={
                            (answerState.isLocked && data?.isCorrect) ||
                            (answerState.isLocked &&
                              answerState.isSubmitted &&
                              answerState.chosenAnswer === key)
                          }
                          isCorrect={!!data?.isCorrect}
                          onPress={() => handleAnswerSelect(key)}
                        />
                      );
                    })}
                </View>
                <View style={styles.buttonsWrapper}>
                  {answerState.isLocked && gameState.playStyle === "solo" ? (
                    <ButtonPrimary text="Next" onPress={handleNextQuestion} />
                  ) : answerState.isLocked &&
                    (gameState.playStyle === "group" ||
                      gameState.playStyle === "duel") ? (
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
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
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
    gap: Gaps.g32,
  },
  questionText: {
    color: Colors.black,
    fontSize: FontSizes.H3Fs,
    paddingBottom: Gaps.g32,
    textAlign: "center",
    minHeight: 135,
  },

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
    paddingBottom: Gaps.g80,
  },
});

export default QuizLogic;
