import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { FontSizes, Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import IconCheckbox from "@/assets/icons/IconCheckbox";
import { useState, useEffect } from "react";
import { loadCacheData, saveDataToCache } from "@/utilities/cacheUtils";
import { generateMultipleQuizQuestions } from "@/utilities/api/quizApi";
import { Difficulty } from "@/utilities/types";
import { PlayStyle } from "@/utilities/quiz-logic/quizTypesInterfaces";
import { CACHE_KEY } from "@/utilities/cacheUtils";
import { useGlobalLoading } from "@/providers/GlobalLoadingProvider";
import { socketService } from "@/utilities/socketService";
import { useUser } from "@/providers/UserProvider";
import { QuizQuestion as SocketQuizQuestion } from "@/utilities/socketService";

const StartQuizScreen = () => {
  const router = useRouter();
  const cacheKey = CACHE_KEY.quizSettings;
  const cacheAi = CACHE_KEY.aiQuestions;
  const [level, setLevel] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");
  const [rounds, setRounds] = useState(10);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const { withLoading, isGloballyLoading } = useGlobalLoading();
  const { user } = useUser();
  const [isMultiplayerMode, setIsMultiplayerMode] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);

  // ---------- Functions ----------
  const fetchCachedQuizSpecs = async () => {
    try {
      const cachedQuizSpecs = await loadCacheData(cacheKey);
      if (cachedQuizSpecs) {
        console.log(cachedQuizSpecs);
        setCategory(cachedQuizSpecs.quizCategory);
        setLevel(cachedQuizSpecs.quizLevel);
        setTopic(cachedQuizSpecs.chosenTopic);
        setPlayStyle(cachedQuizSpecs.quizPlayStyle);
      }

      // Check if we're in multiplayer mode
      const cachedRoomInfo = await loadCacheData(CACHE_KEY.currentRoom);
      console.log("Cached room info:", cachedRoomInfo);
      if (cachedRoomInfo && (cachedRoomInfo.isAdmin || cachedRoomInfo.isHost)) {
        console.log("Setting multiplayer mode to true");
        setIsMultiplayerMode(true);
        setRoomInfo(cachedRoomInfo);
      } else {
        console.log("Not in multiplayer mode or not admin");
      }
    } catch (error) {
      console.error("Failed to load data from cache:", error);
    }
  };
  // IMPORTANT

  //Alte Code: diese Funktion hat Timing Probleme, da sie die Seite wechselt, bevor die Fragen generiert werden und deswegen werden die dummy data benutzt für die erste Frage
  /*const handleStartQuiz = async (
topic: string,
level: Difficulty,
rounds: number
) => {
try {
router.push("/(tabs)/play/QuizScreen");
const questions = await generateMultipleQuizQuestions(
topic,
level,
rounds
);
console.log("Generated Questions:", questions);
saveDataToCache(cacheAi, questions);
} catch (error) {}
};*/

  //neue Code, die Funktion von oben wurde geändert, damit sie die Fragen generiert, bevor die Seite gewechselt wird
  // IMPORTANT - Función handleStartQuiz corregida
  const handleStartQuiz = async (
    topic: string,
    level: Difficulty,
    rounds: number
  ) => {
    try {
      setIsGeneratingQuestions(true); // loading state

      // Get data from cache to obtain the topic
      const cachedInfo = await loadCacheData(cacheKey);
      const specificTopic = cachedInfo?.chosenTopic || topic;
      const currentPlayStyle = cachedInfo?.quizPlayStyle || playStyle;
      console.log(`Game mode: ${currentPlayStyle}`);
      console.log(
        `Generating questions for specific topic: "${specificTopic}"`
      );

      // IMPORTANT: AI must finish before continuing
      const questions = await generateMultipleQuizQuestions(
        specificTopic,
        level,
        rounds
      );

      console.log("Generated Questions:", questions);
      await saveDataToCache(cacheAi, questions); // Wait for save to complete

      // Choose action based on game mode
      if (isMultiplayerMode && roomInfo) {
        console.log("Multiplayer mode detected, roomInfo:", roomInfo);
        console.log("Socket connected:", socketService.isConnected());
        
        // For multiplayer admin, update room with questions and start quiz for all players
        await updateRoomWithQuestions(questions);
        
        // Notify all players to start the quiz
        if (socketService.isConnected()) {
          console.log("Sending startGame event to room:", roomInfo.roomId);
          const questionArray = questions.questionArray || questions;
          const socketQuestions = convertToSocketQuestions(questionArray);
          console.log("Converted questions:", socketQuestions.length, "questions");
          socketService.startGame(roomInfo.roomId, socketQuestions);
          console.log("StartGame event sent, navigating to QuizScreen");
        } else {
          console.error("Socket not connected, cannot start game");
          Alert.alert("Error", "Not connected to multiplayer server");
          return;
        }

        // Make sure admin is ready before starting
        if (socketService.isConnected() && roomInfo.roomId) {
          const adminPlayer = roomInfo.room?.players?.find((p: any) => p.socketId === socketService.getSocketId());
          if (adminPlayer && !adminPlayer.isReady) {
            console.log("Setting admin as ready before starting game");
            socketService.togglePlayerReady(roomInfo.roomId, adminPlayer.id);
          }
        }
        
        // Go directly to quiz screen
        router.push("/(tabs)/play/QuizScreen");
      } else if (currentPlayStyle === "solo") {
        // For solo mode, go directly to quiz
        router.push("/(tabs)/play/QuizScreen");
      } else if (currentPlayStyle === "duel" || currentPlayStyle === "group") {
        // For duel and group, create/join Socket.IO room
        // Convert AiQuestions to question array for Socket.IO
        const questionArray = questions.questionArray || [];
        await handleMultiplayerMode(
          currentPlayStyle,
          questionArray,
          specificTopic,
          level
        );
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      Alert.alert("Error", "Failed to generate questions. Please try again.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Handle multiplayer modes
  const handleMultiplayerMode = async (
    mode: "duel" | "group",
    questions: any[],
    topic: string,
    level: Difficulty
  ) => {
    try {
      // Connect to Socket.IO server
      await socketService.connect();

      // Create room settings
      const roomSettings = {
        questionCount: rounds,
        timePerQuestion: 30,
        categories: [category],
        difficulty: level as "easy" | "medium" | "hard",
      };

      // Create room (for now always create, later can add choice)
      const roomName = `${topic} - ${level}`;
      const hostName = user?.name || "Player";
      const hostId = user?.id || "anonymous";

      socketService.createRoom(roomName, hostName, hostId, roomSettings);

      // Subscribe to room creation
      socketService.onRoomCreated((data) => {
        console.log("Room created:", data);
        // Save room information and go to waiting screen
        saveRoomInfo(data.roomId, data.room, questions);
        router.push("/(tabs)/play/MultiplayerLobby");
      });

      socketService.onError((error) => {
        console.error("Socket error:", error);
        Alert.alert("Error", error.message);
      });
    } catch (error) {
      console.error("Error connecting to multiplayer:", error);
      Alert.alert("Error", "Failed to connect to multiplayer server");
    }
  };

  // Save room information
  const saveRoomInfo = async (roomId: string, room: any, questions: any[]) => {
    try {
      const roomData = {
        roomId,
        room,
        questions,
        isHost: true,
        isAdmin: true, // Add this for consistency
      };
      console.log("Saving room info:", roomData);
      await saveDataToCache(CACHE_KEY.currentRoom, roomData);
    } catch (error) {
      console.error("Error saving room info:", error);
    }
  };

  // Update room with questions for multiplayer
  const updateRoomWithQuestions = async (questions: any) => {
    try {
      const updatedRoomInfo = {
        ...roomInfo,
        questions: questions.questionArray || questions,
      };
      await saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
      setRoomInfo(updatedRoomInfo);

      // Notify all players that questions are ready
      if (socketService.isConnected()) {
        socketService.questionsReady(roomInfo.roomId);
      }
    } catch (error) {
      console.error("Error updating room info:", error);
    }
  };

  // Convert AI questions to Socket.IO format
  const convertToSocketQuestions = (aiQuestions: any[]): SocketQuizQuestion[] => {
    return aiQuestions.map((q, index) => ({
      id: `q_${index}`,
      question: q.question?.en || q.question?.de || '',
      options: [
        q.optionA?.en || q.optionA?.de || '',
        q.optionB?.en || q.optionB?.de || '',
        q.optionC?.en || q.optionC?.de || '',
        q.optionD?.en || q.optionD?.de || '',
      ],
      correctAnswer: q.optionA?.isCorrect ? q.optionA?.en || q.optionA?.de 
                   : q.optionB?.isCorrect ? q.optionB?.en || q.optionB?.de
                   : q.optionC?.isCorrect ? q.optionC?.en || q.optionC?.de
                   : q.optionD?.en || q.optionD?.de || '',
      category: category || 'General',
      difficulty: level,
      timeLimit: 30,
    }));
  };

  // ---------- USE EFFECT ----------
  // Fetch cached quiz specs to set information
  useEffect(() => {
    fetchCachedQuizSpecs();
    
    // Subscribe to socket events
    socketService.onError((error) => {
      console.error("Socket error in StartQuizScreen:", error);
      Alert.alert("Socket Error", error.message);
    });

    // Cleanup
    return () => {
      socketService.off("error");
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityLabel="Go back"
      >
        <IconArrowBack />
      </TouchableOpacity>
      <View style={{ marginBottom: Gaps.g40 }}>
        <Logo size="big" />
      </View>
      {/* Summary Container */}
      <View style={styles.summaryContainer}>
        <Text style={{ fontSize: FontSizes.H1Fs }}>That's the great!</Text>
        <View style={{ marginTop: Gaps.g16, gap: Gaps.g16 }}>
          <View style={styles.pointsRow}>
            <IconCheckbox />
            <Text style={styles.pointsText}>Chosen topic: {topic}</Text>
          </View>
          {category !== topic && (
            <View style={styles.pointsRow}>
              <IconCheckbox />
              <Text style={styles.pointsText}>
                Assigned category: {category}
              </Text>
            </View>
          )}
          <View style={styles.pointsRow}>
            <IconCheckbox />
            <Text style={styles.pointsText}>Chosen level: {level}</Text>
          </View>
          <View style={styles.pointsRow}>
            <IconCheckbox />
            <Text style={styles.pointsText}>
              10 questions, max 30 seconds each
            </Text>
          </View>
        </View>
      </View>
      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <ButtonPrimary
          text={
            isMultiplayerMode
              ? "Start Quiz for Everyone"
              : playStyle === "solo"
              ? "Start Solo Quiz"
              : playStyle === "duel"
              ? "Create Duel Room"
              : "Create Group Room"
          }
          onPress={() => {
            handleStartQuiz(topic, level, rounds);
          }}
        />
        {(playStyle === "duel" || playStyle === "group") &&
          !isMultiplayerMode && (
            <ButtonSecondary
              text="Join Existing Room"
              onPress={() => {
                // TODO: Add functionality to join an existing room
                Alert.alert(
                  "Coming Soon",
                  "Join existing room functionality will be added soon"
                );
              }}
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
  },
  backButton: {
    position: "absolute",
    top: -8,
    left: 16,
    zIndex: 10,
  },
  summaryContainer: {
    marginBottom: Gaps.g48,
    alignSelf: "flex-start",
    marginLeft: Gaps.g32,
  },
  button: {
    marginTop: Gaps.g32,
    alignSelf: "flex-end",
  },
  buttonContainer: {
    gap: Gaps.g32,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gaps.g8,
  },
  pointsText: {
    fontSize: FontSizes.TextLargeFs,
  },
});
export default StartQuizScreen;
