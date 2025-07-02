import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { saveDataToCache, CACHE_KEY } from "@/utilities/cacheUtils";
import { QuizSettings, PlayStyle } from "@/utilities/quiz-logic/quizTypesInterfaces";
import { socketService } from "@/utilities/socketService";
import { useUser } from "@/providers/UserProvider";

// Use the cache key for quiz settings
const cacheKey = CACHE_KEY.quizSettings; 

const QuizTypeSelectionScreen = () => {
  const router = useRouter();
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");
  const { user } = useUser();

  // ---------- FUNCTIONS ----------
  // send selected Playstyle to cache
  const sendInformationToCache = async (style: PlayStyle) => {
    const chosenSpecs: QuizSettings = {
      quizCategory: "",
      quizLevel: "medium",
      quizPlayStyle: style,
      chosenTopic: "",
    };    
    try {
      await saveDataToCache(cacheKey, chosenSpecs);      
    } catch (error) {
      console.error("Failed to save specs:", error);
    }
  };

  // Handle play style choice
  const handlePlayStyleChoice = async (style: PlayStyle) => {
    setPlayStyle(style);
    await sendInformationToCache(style);
    
    if (style === "solo") {
      // For solo mode, go to category selection as before
      router.push("/(tabs)/play/CategoryScreen");
    } else if (style === "duel" || style === "group") {
      // For multiplayer modes, create room and go to invite friends screen
      await createMultiplayerRoom(style);
    }
  };

  // Create multiplayer room
  const createMultiplayerRoom = async (mode: "duel" | "group") => {
    try {
      // Connect to Socket.IO server
      await socketService.connect();

      // Create room settings (will be updated later by admin)
      const roomSettings = {
        questionCount: 10,
        timePerQuestion: 30,
        categories: [],
        difficulty: "medium" as const,
      };

      // Create room
      const roomName = `${user?.name || "Player"}'s ${mode} room`;
      const hostName = user?.name || "Player";
      const hostId = user?.id || "anonymous";

      socketService.createRoom(roomName, hostName, hostId, roomSettings);

      // Subscribe to room creation
      socketService.onRoomCreated((data) => {
        console.log("Room created:", data);
        // Save room information
        saveRoomInfo(data.roomId, data.room);
        // Go to invite friends screen
        router.push("/(tabs)/play/InviteFriendsScreen");
      });

      socketService.onError((error) => {
        console.error("Socket error:", error);
        Alert.alert("Error", error.message);
      });
    } catch (error) {
      console.error("Error creating multiplayer room:", error);
      Alert.alert("Error", "Failed to create multiplayer room");
    }
  };

  // Save room information
  const saveRoomInfo = async (roomId: string, room: any) => {
    try {
      await saveDataToCache(CACHE_KEY.currentRoom, {
        roomId,
        room,
        isHost: true,
        isAdmin: true,
      });
    } catch (error) {
      console.error("Error saving room info:", error);
    }
  };
// ----------------------------------------

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
      <View style={styles.buttonContainer}>
        <ButtonPrimary
          text="Play alone"
          onPress={() => handlePlayStyleChoice("solo")}
        />
        <ButtonPrimary
          text="Play a duel"
          onPress={() => handlePlayStyleChoice("duel")}
        />
        <ButtonPrimary
          text="Play in group"
          onPress={() => handlePlayStyleChoice("group")}
        />
        <ButtonSecondary text="Mini games" />
      </View>
    </View>
  );
};
export default QuizTypeSelectionScreen;

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
  buttonContainer: {
    gap: Gaps.g32,
  },
});
