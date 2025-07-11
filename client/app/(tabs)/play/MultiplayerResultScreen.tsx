import React, { useState, useEffect, useContext } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Colors, FontSizes, FontWeights, Gaps } from "@/styles/theme";
import { Logo } from "@/components/Logos";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UserContext } from "@/providers/UserProvider";
import { loadCacheData, clearCacheData, CACHE_KEY } from "@/utilities/cacheUtils";
import socketService, { Player } from "@/utilities/socketService";
import IconCheckbox from "@/assets/icons/IconCheckbox";
import IconClose from "@/assets/icons/IconClose";
import IconBearTab from "@/assets/icons/IconBearTab";
import IconTrophy from "@/assets/icons/IconTrophy";

const MultiplayerResultScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userData } = useContext(UserContext);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState<any>(null);

// ========== useEffect ==========

  useEffect(() => {
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
      } catch (error) {
        console.error("Error loading room information:", error);
        setIsLoading(false);
      }
    };

    loadRoom();

    return () => {
      socketService.off("game-results");
    };
  }, []);

  // ========== Functions ==========
  const handlePlayAgain = async () => {
    if (roomInfo && userData) {
      // Clear cache data except for the current room
      clearCacheData(CACHE_KEY.aiQuestions);     
      // Signal readiness for another game
      socketService.togglePlayerReady(roomInfo.roomId, userData.clerkUserId);
      router.push("./MultiPlayerLobby");
    }
  };

  const handleHome = async () => {
    // Clear all cache data
    clearCacheData(CACHE_KEY.aiQuestions);
    clearCacheData(CACHE_KEY.gameData);
    clearCacheData(CACHE_KEY.quizSettings);
    
    // Leave the socket room and wait for acknowledgment before navigating
    if (roomInfo && userData) {
      // Add an event listener for room deletion confirmation
      const onRoomLeft = () => {
        // Once we receive confirmation, navigate and clean up
        clearCacheData(CACHE_KEY.currentRoom);
        router.push("./");
      };
      
      // Listen for error events that might occur when accessing a deleted room
      socketService.on("error", (data: { message: string }) => {
        if (data.message === "Room not found") {
          clearCacheData(CACHE_KEY.currentRoom);
          router.push("./");
        }
      });
      
      // First leave the room
      socketService.leaveRoom(roomInfo.roomId, userData.clerkUserId);
      
      // Clean up listeners and navigate after a short delay
      // This ensures server has time to process the leave-room event
      setTimeout(() => {
        socketService.off("error");
        clearCacheData(CACHE_KEY.currentRoom);
        router.push("./");
      }, 300);
    } else {
      // If no room info, just navigate home
      router.push("./");
    }
  };

  // Render the trophy icon for top players (1st, 2nd, 3rd place)
  //  ============================= IMPORTANT TODO Hier MARTINS Medallien einfügen!!!! ========================================
  const renderTrophy = (index: number) => {
    if (index === 0) {
      return <IconTrophy style={styles.trophyGold} />;
    } else if (index === 1) {
      return <IconTrophy style={styles.trophySilver} />;
    } else if (index === 2) {
      return <IconTrophy style={styles.trophyBronze} />;
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
        <Text style={styles.title}>Quizzly Leaderboard</Text>
        
        {isLoading ? (
          <Text style={styles.loadingText}>Loading results...</Text>
        ) : (
          <>
            {/* Player Rankings */}
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerCard}>
                <View style={styles.playerRankRow}>
                  {renderTrophy(index)}
                  <View style={styles.playerIcon}>
                    <IconBearTab />
                  </View>
                  <Text style={styles.playerName}>
                    {player.name} {player.id === userData?.clerkUserId ? "(You)" : ""}
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
                      Total Quizzly Points: {player.gamePoints?.total || 0} points
                    </Text>
                  </View>
                  <View style={styles.pointsRow}>
                    <IconCheckbox />
                    <Text style={styles.pointsText}>
                      Correct: {player.gamePoints?.chosenCorrect || 0}/{player.gamePoints?.totalAnswers || 0}
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
    right: 16,
    zIndex: 10,
  },
  title: {
    fontSize: FontSizes.H1Fs,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: Gaps.g24,
  },
  loadingText: {
    fontSize: FontSizes.TextLargeFs,
    textAlign: "center",
    marginVertical: Gaps.g32,
  },
  resultsContainer: {
    alignItems: "center",
    gap: Gaps.g16,
    paddingVertical: Gaps.g32,
  },
  playerCard: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Gaps.g16,
    marginBottom: Gaps.g16,
    shadowColor: Colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
    fontWeight: "bold",
    flexGrow: 1,
  },
  scoreDetails: {
    marginLeft: Gaps.g32,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Gaps.g8,
    marginBottom: Gaps.g8,
  },
  pointsText: {
    fontSize: FontSizes.TextMediumFs,
  },
  trophyGold: {
    color: "#FFD700",
    marginRight: Gaps.g8,
  },
  trophySilver: {
    color: "#C0C0C0",
    marginRight: Gaps.g8,
  },
  trophyBronze: {
    color: "#CD7F32",
    marginRight: Gaps.g8,
  },
  buttonsContainer: {
    gap: Gaps.g16,
    marginTop: Gaps.g16,
  },
});

export default MultiplayerResultScreen;
