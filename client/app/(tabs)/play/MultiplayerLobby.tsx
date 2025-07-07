import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { socketService, Player, QuizRoom } from "@/utilities/socketService";
import {
  loadCacheData,
  saveDataToCache,
  CACHE_KEY,
} from "@/utilities/cacheUtils";
import CustomAlert from "@/components/CustomAlert";
import { InviteRequest } from "@/utilities/invitationInterfaces";
import { useUser } from "@clerk/clerk-expo";
import {
  getSentInviteRequests,
  getAcceptedInvites,
  removeInvite,
  removeAllInvites,
} from "@/utilities/invitationApi";

interface RoomInfo {
  roomId: string;
  room: QuizRoom;
  questions?: any[];
  isHost: boolean;
  isAdmin?: boolean;
  selectedCategory?: string;
  selectedTopic?: string;
}

const MultiplayerLobby = () => {
  const router = useRouter();
  const { user } = useUser(); 
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [currentRoom, setCurrentRoom] = useState<QuizRoom | null>(null);
  const [isReady, setIsReady] = useState(false);

  // CustomAlert states
  const [showNewHostAlert, setShowNewHostAlert] = useState(false);
  const [newHostName, setNewHostName] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [showCancelRoomAlert, setShowCancelRoomAlert] = useState(false);

  // For invitation handling
  const [isLoading, setIsLoading] = useState(false);
  const [sentInvites, setSentInvites] = useState<InviteRequest[]>([]);
    const [acceptedInvites, setAcceptedInvites] = useState<InviteRequest[]>([]);

  // =========== Functions ==========
// ----- Handler fetch Invites -----
  const fetchInvites = async () => {
    try {
      setIsLoading(true);
      if (!user) return;
      const sent = await getSentInviteRequests(user.id);
      const accepted = await getAcceptedInvites(user.id);

      setSentInvites(sent.inviteRequests || []);
      setAcceptedInvites(accepted.inviteRequests || []);
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Handler Remove Invite -----
  const handleRemoveInvite = async (friendId: string) => {
    try {
      if (!user) return;
      await removeInvite(user.id, friendId);
      // Refresh the invites list after removing
      const sent = await getSentInviteRequests(user.id);
      setSentInvites((prev) => [...prev, ...sent.inviteRequests]);
    } catch (error) {
      console.error("Error removing invitation:", error);
    }
  };

  // ----- Handler Remove ALL Invitations -----
  // IMPORTANT: This should be done after the quiz is over
  const handleRemoveAllInvites = async () => {
    try {
      if (!user) return;
      await removeAllInvites(user.id);
      // THIS NEEDS TO BE DONE AFTER THE WHOLE QUIZ IS OVER
    } catch (error) {
      console.error("Error removing all invitations:", error);
    }
  };

  // =========== UseEffect ==========
  useEffect(() => {
    loadRoomInfo();
    setupSocketListeners();
    fetchInvites()

    // Also listen for cache updates (when admin selects category)
    const interval = setInterval(async () => {
      const updatedRoomInfo = await loadCacheData(CACHE_KEY.currentRoom);
      if (
        updatedRoomInfo &&
        updatedRoomInfo.selectedCategory !== roomInfo?.selectedCategory
      ) {
        setRoomInfo(updatedRoomInfo);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      // Clean up listeners when component unmounts
      socketService.off("player-joined");
      socketService.off("player-left");
      socketService.off("player-ready-updated");
      socketService.off("game-started");
      socketService.off("show-start-quiz");
      socketService.off("host-changed");
    };
  }, []);

  // ==============================
// ----- Load Room Info -----
  const loadRoomInfo = async () => {
    try {
      const cachedRoomInfo = await loadCacheData(CACHE_KEY.currentRoom);
      if (cachedRoomInfo) {
        setRoomInfo(cachedRoomInfo);
        setCurrentRoom(cachedRoomInfo.room);
      }
    } catch (error) {
      console.error("Error loading room info:", error);
    }
  };

  // ----- Setup Socket Listeners -----
  const setupSocketListeners = () => {
    socketService.onPlayerJoined((data) => {
      console.log("Player joined:", data.player.name);
      setCurrentRoom(data.room);
    });

    socketService.onPlayerLeft((data) => {
      console.log("Player left:", data.playerName);
      setCurrentRoom(data.room);
    });

    socketService.onPlayerReadyUpdated((data) => {
      console.log("Player ready updated:", data.playerId, data.isReady);
      setCurrentRoom(data.room);
    });

    socketService.onGameStarted((data) => {
      console.log("Game started!");
      // Go to quiz screen
      router.push("/(tabs)/play/QuizScreen");
    });

    socketService.onShowStartQuiz((data) => {
      console.log("Admin selected topic, showing StartQuizScreen");
      // Go to StartQuizScreen
      router.push("/(tabs)/play/StartQuizScreen");
    });

    socketService.onHostChanged((data) => {
      console.log("Host changed to:", data.newHost.name);
      setNewHostName(data.newHost.name);
      setShowNewHostAlert(true);
    });

    socketService.onError((error) => {
      console.error("Socket error:", error);
      setErrorMessage(error.message);
      setShowErrorAlert(true);
    });
  };

  // ----- Toggle Ready -----
  const toggleReady = () => {
    if (roomInfo && currentRoom) {
      const playerId = currentRoom.players.find(
        (p) => p.socketId === socketService.getSocketId()
      )?.id;
      if (playerId) {
        socketService.togglePlayerReady(roomInfo.roomId, playerId);
        setIsReady(!isReady);
      }
    }
  };

  // ----- Start Game -----
  const startGame = async () => {
    if (
      roomInfo &&
      currentRoom &&
      roomInfo.isHost &&
      roomInfo.selectedCategory
    ) {
      // Check that all players are ready
      const allReady = currentRoom.players.every((p) => p.isReady);
      if (!allReady) {
        setShowWarningAlert(true);
        return;
      }

      try {
        // Load questions based on selected category
        // This should match the logic from StartQuizScreen
        const { loadCacheData } = await import("@/utilities/cacheUtils");
        const { generateMultipleQuizQuestions } = await import(
          "@/utilities/api/quizApi"
        );

        const cachedQuizSpecs = await loadCacheData(CACHE_KEY.quizSettings);
        if (!cachedQuizSpecs) {
          setErrorMessage("Quiz settings not found");
          setShowErrorAlert(true);
          return;
        }

        const fetchedQuestions = await generateMultipleQuizQuestions(
          cachedQuizSpecs.chosenTopic || cachedQuizSpecs.quizCategory,
          cachedQuizSpecs.quizLevel,
          10 // question count
        );

        if (
          !fetchedQuestions ||
          !fetchedQuestions.questionArray ||
          fetchedQuestions.questionArray.length === 0
        ) {
          setErrorMessage("Failed to load quiz questions");
          setShowErrorAlert(true);
          return;
        }

        // Transform questions to socket format
        const socketQuestions = fetchedQuestions.questionArray.map(
          (q: any, index: number) => ({
            id: index.toString(),
            question: q.question.en || q.question,
            options: [
              q.optionA.text?.en || q.optionA.en,
              q.optionB.text?.en || q.optionB.en,
              q.optionC.text?.en || q.optionC.en,
              q.optionD.text?.en || q.optionD.en,
            ],
            correctAnswer: q.correctAnswer?.en || q.correctAnswer,
            category: q.category || "general",
            difficulty: "medium" as const,
            timeLimit: 30,
          })
        );

        socketService.startGame(roomInfo.roomId, socketQuestions);
      } catch (error) {
        console.error("Error starting game:", error);
        setErrorMessage("Failed to start the game");
        setShowErrorAlert(true);
      }
    }
  };

  // ----- Admin goes to select category/topic -----
  const goToSelectCategory = async () => {
    if (roomInfo?.isAdmin) {
      // Save admin status to cache for other screens
      const updatedRoomInfo = {
        ...roomInfo,
        isAdmin: true,
      };
      await saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
      router.push("/(tabs)/play/CategoryScreen");
    }
  };

  // ----- Admin cancels room -----
  const cancelRoom = () => {
    if (roomInfo?.isAdmin) {
      setShowCancelRoomAlert(true);
    }
  };

  // ----- Handle Cancel Room Confirmation -----
  const handleCancelRoomConfirm = () => {
    if (roomInfo && currentRoom) {
      // Get player ID and leave room
      const playerId = currentRoom.players.find(
        (p) => p.socketId === socketService.getSocketId()
      )?.id;
      if (playerId) {
        socketService.leaveRoom(roomInfo.roomId, playerId);
      }
      socketService.disconnect();
      // Go back to QuizTypeSelectionScreen
      router.push("/(tabs)/play/QuizTypeSelectionScreen");
    }
    setShowCancelRoomAlert(false);
  };

  // ----- Leave Room -----
  const leaveRoom = () => {
    if (roomInfo && currentRoom) {
      const playerId = currentRoom.players.find(
        (p) => p.socketId === socketService.getSocketId()
      )?.id;
      if (playerId) {
        socketService.leaveRoom(roomInfo.roomId, playerId);
        socketService.disconnect();
        router.back();
      }
    }
  };

  // ========== Render Functions ==========
  // ----- Render Invite Item -----
  const renderInviteRequest = ({ item }: { item: InviteRequest }) => (
    <View style={styles.playerItem}>
      <Text style={styles.playerName}>
        {item.to.username || item.to.email} (Invited)
      </Text>
      <View style={styles.readyIndicator}>
        <Text style={styles.readyText}>
          {item.status === "pending" ? "Pending" : item.status}
        </Text>
      </View>
    </View>
  );

  // ----- Render Player Item -----
  const renderPlayer = ({ item }: { item: Player }) => (
    <View style={styles.playerItem}>
      <Text style={styles.playerName}>
        {item.name} {item.id === currentRoom?.host && "(Host)"}
      </Text>
      <View
        style={[
          styles.readyIndicator,
          item.isReady && styles.readyIndicatorActive,
        ]}
      >
        <Text style={styles.readyText}>
          {item.isReady ? "Ready" : "Not Ready"}
        </Text>
      </View>
    </View>
  );

  // ===== CustomAlert handlers =====
  const handleNewHostAlertClose = () => {
    setShowNewHostAlert(false);
  };

  const handleErrorAlertClose = () => {
    setShowErrorAlert(false);
  };

  const handleWarningAlertClose = () => {
    setShowWarningAlert(false);
  };

  const handleCancelRoomAlertClose = () => {
    setShowCancelRoomAlert(false);
  };

  if (!roomInfo || !currentRoom) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading room...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={leaveRoom}
        accessibilityLabel="Leave room"
      >BackButton HERE</TouchableOpacity>

      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>

      <Text style={styles.roomTitle}>{currentRoom.name}</Text>
      <Text style={styles.roomId}>Room ID: {roomInfo.roomId}</Text>

      {roomInfo.selectedCategory && (
        <Text style={styles.selectedCategory}>
          Selected Topic: {roomInfo.selectedTopic || roomInfo.selectedCategory}
        </Text>
      )}

{/* Show sent invitations */}
<View style={styles.playersContainer}>
        <Text style={styles.playersTitle}>
          Sent invitations: ({sentInvites.length}/{currentRoom.maxPlayers})
        </Text>
        <FlatList
          data={sentInvites}
          renderItem={renderInviteRequest}
          keyExtractor={(item) => item._id}
          style={styles.playersList}
        />
      </View>

{/* Show joined players */}
      <View style={styles.playersContainer}>
        <Text style={styles.playersTitle}>
          Players ({currentRoom.players.length}/{currentRoom.maxPlayers})
        </Text>
        <FlatList
          data={currentRoom.players}
          renderItem={renderPlayer}
          keyExtractor={(item) => item.id}
          style={styles.playersList}
        />
      </View>

      <View style={styles.buttonContainer}>
        {!roomInfo.isAdmin && (
          <ButtonSecondary
            text={isReady ? "Not Ready" : "Ready"}
            onPress={toggleReady}
          />
        )}

        {roomInfo.isAdmin && !roomInfo.selectedCategory && (
          <>
            <ButtonPrimary text="Go" onPress={goToSelectCategory} />
            <ButtonSecondary text="Cancel" onPress={cancelRoom} />
          </>
        )}

        {roomInfo.isAdmin && roomInfo.selectedCategory && (
          <>
            <ButtonPrimary text="Start" onPress={startGame} />
            <ButtonSecondary text="Cancel" onPress={cancelRoom} />
          </>
        )}
      </View>

      {/* Custom Alerts */}
      <CustomAlert
        visible={showNewHostAlert}
        title="New Host"
        message={`${newHostName} is now the room host`}
        onClose={handleNewHostAlertClose}
        cancelText={null}
        confirmText="OK"
        onConfirm={handleNewHostAlertClose}
        noInternet={false}
      />

      <CustomAlert
        visible={showErrorAlert}
        title="Error"
        message={errorMessage}
        onClose={handleErrorAlertClose}
        cancelText={null}
        confirmText="OK"
        onConfirm={handleErrorAlertClose}
        noInternet={false}
      />

      <CustomAlert
        visible={showWarningAlert}
        title="Warning"
        message="Not all players are ready for the game"
        onClose={handleWarningAlertClose}
        cancelText={null}
        confirmText="OK"
        onConfirm={handleWarningAlertClose}
        noInternet={false}
      />

      <CustomAlert
        visible={showCancelRoomAlert}
        title="Cancel Room"
        message="Are you sure you want to cancel the room?"
        onClose={handleCancelRoomAlertClose}
        cancelText="No"
        confirmText="Yes"
        onConfirm={handleCancelRoomConfirm}
        noInternet={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Gaps.g80,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: -8,
    left: 16,
    zIndex: 10,
  },
  roomTitle: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    marginBottom: Gaps.g8,
    textAlign: "center",
  },
  roomId: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g32,
    color: "#666",
  },
  selectedCategory: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g16,
    color: "#4caf50",
    fontWeight: "500",
  },
  playersContainer: {
    flex: 1,
    width: "100%",
    marginBottom: Gaps.g32,
  },
  playersTitle: {
    fontSize: FontSizes.TextLargeFs,
    fontWeight: "bold",
    marginBottom: Gaps.g16,
  },
  playersList: {
    flex: 1,
  },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Gaps.g16,
    marginBottom: Gaps.g8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  playerName: {
    fontSize: FontSizes.TextMediumFs,
    fontWeight: "500",
  },
  readyIndicator: {
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g4,
    borderRadius: 12,
    backgroundColor: "#ffebee",
  },
  readyIndicatorActive: {
    backgroundColor: "#e8f5e8",
  },
  readyText: {
    fontSize: FontSizes.TextSmallFs,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    gap: Gaps.g16,
  },
  errorText: {
    fontSize: FontSizes.TextLargeFs,
    color: "#666",
  },
});

export default MultiplayerLobby;
