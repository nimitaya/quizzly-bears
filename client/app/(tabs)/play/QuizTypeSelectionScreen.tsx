import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { Gaps } from "@/styles/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  saveDataToCache,
  CACHE_KEY,
  loadCacheData,
} from "@/utilities/cacheUtils";
import {
  QuizSettings,
  PlayStyle,
} from "@/utilities/quiz-logic/quizTypesInterfaces";
import { socketService } from "@/utilities/socketService";
import { useUser } from "@clerk/clerk-expo";
import { useLanguage } from "@/providers/LanguageContext";

// Use the cache key for quiz settings
const cacheKey = CACHE_KEY.quizSettings;

const QuizTypeSelectionScreen = () => {
  const router = useRouter();
  const [playStyle, setPlayStyle] = useState<PlayStyle>("solo");
  const { user } = useUser();
  const { currentLanguage } = useLanguage();

  // ---------- FUNCTIONS ----------
  // send selected Playstyle to cache
  const sendInformationToCache = async (selectedPlayStyle: PlayStyle) => {
    const chosenSpecs: QuizSettings = {
      quizCategory: "",
      quizLevel: "medium",
      quizPlayStyle: selectedPlayStyle,
      chosenTopic: "",
    };
    try {
      await saveDataToCache(cacheKey, chosenSpecs);
    } catch {}
  };

  // Create multiplayer room
  const createMultiplayerRoom = async (style: PlayStyle) => {
    try {
      // Connect to socket if not connected
      if (!socketService.isConnected()) {
        await socketService.connect();
      }

      const roomName = style === "duel" ? "Duel Room" : "Group Room";
      const hostName =
        user?.username ||
        user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
        "Player";
      const hostId = user?.id || "anonymous-" + Date.now();

      const roomSettings = {
        questionCount: 10,
        timePerQuestion: 30,
        categories: ["General"],
        difficulty: "medium" as const,
      };

      // Set up room creation listener
      socketService.onRoomCreated(async (data) => {
        // Save room info to cache
        const roomInfo = {
          roomId: data.roomId,
          room: data.room,
          isHost: true,
          isAdmin: true,
        };
        await saveDataToCache(CACHE_KEY.currentRoom, roomInfo);

        // Navigate to invite friends screen first
        router.push("/(tabs)/play/InviteFriendsScreen");
      });

      socketService.onError((error) => {
        Alert.alert("Error", error.message);
      });

      // Create the room
      // Get host's language from context or cache
      let hostLanguage = currentLanguage?.code;
      if (!hostLanguage) {
        const cachedLanguage = await loadCacheData("selected_language");
        hostLanguage = cachedLanguage || "en";
      }

      socketService.createRoom(
        roomName,
        hostName,
        hostId,
        roomSettings,
        hostLanguage
      );
    } catch {}
  };

  // set the selected Playstyle, call cache function and navigate accordingly
  const handlePlayStyleChoice = async (style: PlayStyle) => {
    setPlayStyle(style);
    await sendInformationToCache(style);

    if (style === "solo") {
      // Clear any previous room data for solo mode
      try {
        await saveDataToCache(CACHE_KEY.currentRoom, null);
      } catch {}
      // For solo mode, go directly to category selection
      router.push("/(tabs)/play/CategoryScreen");
    } else if (style === "duel" || style === "group") {
      // For multiplayer modes, create a room first
      await createMultiplayerRoom(style);
    }
  };

  // ----------------------------------------

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
        accessibilityLabel="Go back to home"
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
        <ButtonSecondary
          text="Mini games"
          onPress={() => router.push("/(tabs)/play/MiniGamesScreen")}
        />
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
