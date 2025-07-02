import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { FontSizes, Gaps } from "@/styles/theme";
import { socketService, Player, QuizRoom } from "@/utilities/socketService";
import { loadCacheData, saveDataToCache, CACHE_KEY } from "@/utilities/cacheUtils";

interface RoomInfo {
  roomId: string;
  room: QuizRoom;
  questions?: any[];
  isHost: boolean;
  isAdmin?: boolean;
}

const MultiplayerLobby = () => {
  const router = useRouter();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [currentRoom, setCurrentRoom] = useState<QuizRoom | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadRoomInfo();
    setupSocketListeners();

    return () => {
      // Clean up listeners when component unmounts
      socketService.off("player-joined");
      socketService.off("player-left");
      socketService.off("player-ready-updated");
      socketService.off("game-started");
      socketService.off("show-start-quiz");
      socketService.off("host-changed");
    };
  }, []);

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
      Alert.alert("New Host", `${data.newHost.name} is now the room host`);
    });

    socketService.onError((error) => {
      console.error("Socket error:", error);
      Alert.alert("Error", error.message);
    });
  };

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

  const startGame = () => {
    if (roomInfo && currentRoom && roomInfo.isHost && roomInfo.questions) {
      // Check that all players are ready
      const allReady = currentRoom.players.every((p) => p.isReady);
      if (!allReady) {
        Alert.alert("Warning", "Not all players are ready for the game");
        return;
      }

      // Transform questions to socket format
      const socketQuestions = roomInfo.questions.map(
        (q: any, index: number) => ({
          id: index.toString(),
          question: q.question.en || q.question,
          options: [
            q.optionA.text.en || q.optionA.text,
            q.optionB.text.en || q.optionB.text,
            q.optionC.text.en || q.optionC.text,
            q.optionD.text.en || q.optionD.text,
          ],
          correctAnswer: q.correctAnswer?.en || q.correctAnswer,
          category: q.category || "general",
          difficulty: "medium" as const,
          timeLimit: 30,
        })
      );

      socketService.startGame(roomInfo.roomId, socketQuestions);
    }
  };

  // Admin goes to select category/topic
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
        <IconArrowBack />
      </TouchableOpacity>

      <View style={{ marginBottom: Gaps.g24 }}>
        <Logo size="small" />
      </View>

      <Text style={styles.roomTitle}>{currentRoom.name}</Text>
      <Text style={styles.roomId}>Room ID: {roomInfo.roomId}</Text>

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

        {roomInfo.isAdmin && !roomInfo.questions && (
          <ButtonPrimary 
            text="Go to Select Topic" 
            onPress={goToSelectCategory} 
          />
        )}

        {roomInfo.isAdmin && roomInfo.questions && (
          <ButtonPrimary 
            text="Start Game" 
            onPress={startGame} 
          />
        )}
      </View>
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
