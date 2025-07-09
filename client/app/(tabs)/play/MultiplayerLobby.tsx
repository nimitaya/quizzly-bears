import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { socketService, Player, QuizRoom } from "@/utilities/socketService";
import {
  loadCacheData,
  saveDataToCache,
  CACHE_KEY,
} from "@/utilities/cacheUtils";
import CustomAlert from "@/components/CustomAlert";
import { InviteRequest } from "@/utilities/invitationInterfaces";
import {
  getSentInviteRequests,
  getAcceptedInvites,
  removeAllInvites,
} from "@/utilities/invitationApi";
import { UserContext } from "@/providers/UserProvider";
import IconPending from "@/assets/icons/IconPending";
import IconAccept from "@/assets/icons/IconAccept";
import IconDismiss from "@/assets/icons/IconDismiss";
import IconArrowBack from "@/assets/icons/IconArrowBack";

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
  const { userData } = useContext(UserContext);

  // ====================== State Variables =====================
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

  // ====================== Invite Functions =====================
  // ----- Handler fetch Invites -----
  const fetchInvites = async () => {
    try {
      setIsLoading(true);
      if (!userData) return;
      const sent = await getSentInviteRequests(userData.clerkUserId);
      const accepted = await getAcceptedInvites(userData.clerkUserId);

      setSentInvites(sent.inviteRequests || []);
      setAcceptedInvites(accepted.inviteRequests || []);
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ----- Filter sent invites to exclude players who already joined -----
  const getFilteredSentInvites = () => {
    if (!currentRoom || !sentInvites) return sentInvites;

    // Get list of player emails/usernames who are already in the room
    const joinedPlayerEmails = currentRoom.players.map((player) =>
      player.name.toLowerCase()
    );

    // Filter out invites for players who have already joined
    return sentInvites.filter((invite) => {
      const inviteUserEmail = (
        invite.to.username || invite.to.email
      ).toLowerCase();
      return !joinedPlayerEmails.includes(inviteUserEmail);
    });
  };

  // ----- Handler Remove ALL Invitations -----
  // IMPORTANT: This should also be done after the quiz is over
  const handleRemoveAllInvites = async () => {
    try {
      if (!userData) return;
      await removeAllInvites(userData.clerkUserId);
    } catch (error) {
      console.error("Error removing all invitations:", error);
    }
  };

  // ====================== UseEffect =====================
  useEffect(() => {
    loadRoomInfo();
    setupSocketListeners();
    fetchInvites();

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

  // ========================== Socket Functions ==========================
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
      // Refresh invites when a player joins to update the filtered list
      fetchInvites();
    });

    socketService.onPlayerLeft((data) => {
      console.log("Player left:", data.playerName);
      setCurrentRoom(data.room);
      // Refresh invites when a player leaves
      fetchInvites();
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

        console.log("STARTING GAME WITH SPECS:", cachedQuizSpecs.chosenTopic, "or", cachedQuizSpecs.quizCategory);
        

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
      // Clear cache for current room
      saveDataToCache(CACHE_KEY.currentRoom, null);
      // Remove all sent invitations
      handleRemoveAllInvites();
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
        // Clear cache for current room
        saveDataToCache(CACHE_KEY.currentRoom, null);
        // Remove all sent invitations
        handleRemoveAllInvites();
        router.back();
      }
    }
  };

  // ===================== Render Functions =====================
  // ----- Get Combined Players and Invites List -----
  const getCombinedPlayersList = () => {
    const invites = getFilteredSentInvites().map((invite) => ({
      type: "invite" as const,
      id: invite._id,
      name: invite.to.username || invite.to.email.split("@")[0],
      status: invite.status,
      data: invite,
    }));

    const players = currentRoom
      ? currentRoom.players.map((player) => {
          const isHost = player.id === currentRoom?.host;
          let displayName = player.name;

          // If this is the host and we have user data, show real name/email
          if (isHost && userData) {
            displayName = userData.username || userData.email.split("@")[0];
          } else {
            // For other players, clean up the display name
            displayName = player.name.includes("@")
              ? player.name.split("@")[0]
              : player.name;
          }

          return {
            type: "player" as const,
            id: player.id,
            name: displayName,
            isReady: player.isReady,
            isHost,
            data: player,
          };
        })
      : [];

    return [...invites, ...players];
  };

  // ----- Render Combined Item -----
  const renderCombinedItem = ({ item }: { item: any }) => (
    <View style={styles.playerItem}>
      <Text style={styles.playerName}>
        {item.name} {item.isHost && "(Host)"}
      </Text>
      <View
        style={[
          styles.readyIndicator,
          item.type === "player" && item.isReady && styles.readyIndicatorActive,
        ]}
      >
        {item.type === "invite" ? (
          item.status === "pending" ? (
            <IconPending />
          ) : item.status === "declined" ? (
            <IconDismiss />
          ) : item.status === "accepted" ? (
            <IconAccept />
          ) : (
            <Text style={styles.readyText}>{item.status}</Text>
          )
        ) : item.isReady ? (
          <IconAccept />
        ) : (
          <IconDismiss />
        )}
      </View>
    </View>
  );

  // ================ CustomAlert handlers ================
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
      >
        <IconArrowBack/>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: Gaps.g24 }}>
          <Logo size="small" />
        </View>

        <Text style={styles.roomTitle}>{currentRoom.name}</Text>
        <Text style={styles.roomId}>Room ID: {roomInfo.roomId}</Text>

        {roomInfo.selectedCategory && (
          <Text style={styles.selectedCategory}>
            Selected Topic:{" "}
            {roomInfo.selectedTopic || roomInfo.selectedCategory}
          </Text>
        )}

        {/* Show combined players and invitations */}
        <View style={styles.playersContainer}>
          <FlatList
            data={getCombinedPlayersList()}
            renderItem={renderCombinedItem}
            keyExtractor={(item) => item.id}
            nestedScrollEnabled={true}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

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
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: Gaps.g16,
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
  },
  selectedCategory: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g16,
    color: "#4caf50",
    fontWeight: "500",
  },
  playersContainer: {
    width: "100%",
    marginBottom: Gaps.g32,
  },
  playersTitle: {
    fontSize: FontSizes.TextLargeFs,
    fontWeight: "bold",
    marginBottom: Gaps.g16,
  },
  // playersList: {
  //   maxHeight: 200,
  // },
  playerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: Gaps.g16,
  },
  playerName: {
    fontSize: FontSizes.TextLargeFs,
  },
  readyIndicator: {
    paddingHorizontal: Gaps.g16,
    paddingVertical: Gaps.g4,
  },
  readyIndicatorActive: {},
  readyText: {
    fontSize: FontSizes.TextSmallFs,
    color: "#666",
  },
  buttonContainer: {
    width: "100%",
    gap: Gaps.g16,
    paddingVertical: Gaps.g16,
  },
  errorText: {
    fontSize: FontSizes.TextLargeFs,
    color: "#666",
  },
});

export default MultiplayerLobby;
