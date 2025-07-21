import React, { useState, useEffect, useContext } from "react";
import { useQuizContext } from "@/providers/QuizProvider";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { Logo } from "@/components/Logos";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserContext } from "@/providers/UserProvider";
import {
  loadCacheData,
  clearCacheData,
  CACHE_KEY,
} from "@/utilities/cacheUtils";
import socketService, { Player } from "@/utilities/socketService";
import { sendMedal } from "@/utilities/quiz-logic/medalsApi";
import IconCheckbox from "@/assets/icons/IconCheckbox";
import IconClose from "@/assets/icons/IconClose";
import IconMedal1PlaceWebp from "@/assets/icons-webp/IconMedal1PlaceWebp";
import IconMedal2PlaceWebp from "@/assets/icons-webp/IconMedal2PlaceWebp";
import IconMedal3PlaceWebp from "@/assets/icons-webp/IconMedal3PlaceWebp";

const MultiplayerResultScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userData } = useContext(UserContext);
  const { setIsQuizActive } = useQuizContext();

  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [quizSettings, setQuizSettings] = useState<any>(null);

  // ========== useEffect ==========

  useEffect(() => {
    setIsQuizActive(true);
    const loadRoom = async () => {
      try {
        const room = await loadCacheData(CACHE_KEY.currentRoom);
        if (room) {
          setRoomInfo(room);
          // Listen for game results from other players
          socketService.onGameResults((data) => {
            // Sort players by total score in descending order
            const sortedPlayers = [...data.finalScores].sort(
              (a, b) => (b.gamePoints?.total || 0) - (a.gamePoints?.total || 0)
            );
            setPlayers(sortedPlayers);
            setIsLoading(false);
          });

          // Request the current results
          socketService.emit("get-game-results", { roomId: room.roomId });
        } else {
          console.error("No room information found");
          setIsLoading(false);
        }
        // Load quiz settings from cache
        const settings = await loadCacheData(CACHE_KEY.quizSettings);
        setQuizSettings(settings);
      } catch (error) {
        console.error("Error loading room information:", error);
        setIsLoading(false);
      }
    };

    loadRoom();

    return () => {
      socketService.off("game-results");
    };
  }, [setIsQuizActive]);

  // ========== Functions ==========

  const [medalsSent, setMedalsSent] = useState(false);

  const sendMedalsOnce = async () => {
    // Medals sent only if room type is "group"
    if (
      !medalsSent &&
      roomInfo &&
      players.length > 0 &&
      quizSettings?.quizPlayStyle === "group"
    ) {
      setMedalsSent(true);
      try {
        const awarded = new Set();
        for (let i = 0; i < 3 && i < players.length; i++) {
          const player = players[i];
          if (!awarded.has(player.id)) {
            console.log(
              `Отправка медали в базу данных: userId=${player.id}, place=${
                i + 1
              }, roomId=${roomInfo.roomId}`
            );
            await sendMedal({
              clerkUserId: player.id,
              place: i + 1,
              roomId: roomInfo.roomId,
            });
            console.log(
              `Medal successfully sent: userId=${player.id}, place=${
                i + 1
              }, roomId=${roomInfo.roomId}`
            );
            awarded.add(player.id);
          }
        }
        console.log("All medals have been sent to the database.");
      } catch (err) {
        console.error("Error sending medals:", err);
      }
    }
  };

  const handlePlayAgain = async () => {
    await sendMedalsOnce();
    if (roomInfo && userData) {
      clearCacheData(CACHE_KEY.aiQuestions);
      clearCacheData(CACHE_KEY.gameData);
      router.push("./MultiplayerLobby");
    }
  };

  const handleHome = async () => {
    await sendMedalsOnce();
    clearCacheData(CACHE_KEY.aiQuestions);
    clearCacheData(CACHE_KEY.gameData);
    clearCacheData(CACHE_KEY.quizSettings);
    setIsQuizActive(false);

    if (roomInfo && userData) {
      const onRoomLeft = () => {
        clearCacheData(CACHE_KEY.currentRoom);
        router.push("./");
      };

      socketService.on("error", (data: { message: string }) => {
        if (data.message === "Room not found") {
          clearCacheData(CACHE_KEY.currentRoom);
          router.push("./");
        }
      });

      socketService.leaveRoom(roomInfo.roomId, userData.clerkUserId);

      setTimeout(() => {
        socketService.off("error");
        clearCacheData(CACHE_KEY.currentRoom);
        router.push("./");
      }, 300);
    } else {
      router.push("./");
    }
  };

  // Render the trophy icon for top players (1st, 2nd, 3rd place)
  //Medals should be sent only for group rooms
  const renderTrophy = (index: number) => {
    if (quizSettings?.quizPlayStyle !== "group") return null;
    if (index === 0) {
      return <IconMedal1PlaceWebp />;
    } else if (index === 1) {
      return <IconMedal2PlaceWebp />;
    } else if (index === 2) {
      return <IconMedal3PlaceWebp />;
    }
    return null;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleHome}
        accessibilityLabel="Go back"
      >
        <IconClose />
      </TouchableOpacity>

      <Logo size="small" />
      <View style={styles.resultsContainer}>
        <Text style={styles.title}>
          Cool! {players.length > 0 ? players[0].name : ""} wins!
        </Text>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading results...</Text>
        ) : (
          <>
            {/* Player Rankings */}
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerRankRow}>
                  <View style={styles.playerIcon}>{renderTrophy(index)}</View>
                  <Text style={styles.playerName}>
                    {player.name}{" "}
                    {player.id === userData?.clerkUserId ? "(You)" : ""}
                  </Text>
                </View>

                <View style={styles.scoreDetails}>
                  <View style={styles.pointsRow}>
                    <IconCheckbox />
                    <Text style={styles.pointsText}>
                      Knowledge: {player.gamePoints?.score || 0} points
                    </Text>
                  </View>
                  <View style={styles.pointsRow}>
                    <IconCheckbox />
                    <Text style={styles.pointsText}>
                      Time bonus: {player.gamePoints?.timePoints || 0} points
                    </Text>
                  </View>
                  <View style={styles.pointsRow}>
                    <IconCheckbox />
                    <Text style={styles.pointsText}>
                      Total Quizzly Points: {player.gamePoints?.total || 0}{" "}
                      points
                    </Text>
                  </View>
                  <View style={styles.pointsRow}>
                    <IconCheckbox />
                    <Text style={styles.pointsText}>
                      Correct: {player.gamePoints?.chosenCorrect || 0}/
                      {player.gamePoints?.totalAnswers || 0}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <ButtonPrimary text="Play Again" onPress={handlePlayAgain} />
        <ButtonSecondary text="Home" onPress={handleHome} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Gaps.g32,
    color: Colors.black,
    maxWidth: 440,
    alignSelf: "center",
    width: "100%",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    marginVertical: Gaps.g80,
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
  },
  title: {
    fontSize: FontSizes.H1Fs,
    textAlign: "center",
    marginBottom: Gaps.g16,
  },
  loadingText: {
    fontSize: FontSizes.TextLargeFs,
    textAlign: "center",
    marginVertical: Gaps.g32,
  },
  resultsContainer: {
    alignItems: "center",
    gap: Gaps.g16,
    paddingVertical: Gaps.g24,
  },
  playerCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: Gaps.g24,
    padding: Gaps.g16,
    marginBottom: Gaps.g8,
  },
  playerRankRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Gaps.g16,
  },
  playerIcon: {
    marginRight: Gaps.g8,
  },
  playerName: {
    fontSize: FontSizes.TextLargeFs,
    flexGrow: 1,
  },
  scoreDetails: {},
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gaps.g8,
    marginBottom: Gaps.g8,
  },
  pointsText: {
    fontSize: FontSizes.TextMediumFs,
  },

  buttonsContainer: {
    gap: Gaps.g16,
    marginTop: Gaps.g8,
    paddingBottom: Gaps.g40,
  },
});

export default MultiplayerResultScreen;
