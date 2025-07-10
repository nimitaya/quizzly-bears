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
import { useLanguage } from "@/providers/LanguageContext";
import IconPending from "@/assets/icons/IconPending";
import IconAccept from "@/assets/icons/IconAccept";
import IconDismiss from "@/assets/icons/IconDismiss";
import IconArrowBack from "@/assets/icons/IconArrowBack";
import Countdown from "@/components/Countdown";
import QuizLoader from "@/components/QuizLoader";

interface RoomInfo {
  roomId: string;
  room: QuizRoom;
  languages: string[]
  questions?: any[];
  isHost: boolean;
  isAdmin?: boolean;
  selectedCategory?: string;
  selectedTopic?: string;
}

const MultiplayerLobby = () => {
  const router = useRouter();
  const { userData } = useContext(UserContext);
  const { currentLanguage } = useLanguage();

  // ====================== State Variables =====================
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [currentRoom, setCurrentRoom] = useState<QuizRoom | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [allLanguages, setAllLanguages] = useState<string[]>([]);

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

  // Loading
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showLocalLoader, setShowLocalLoader] = useState(false);

  // Questions data
  const [questionsData, setQuestionsData] = useState<any>(null);
  
  // Rejoin state to prevent loops
  const [isRejoining, setIsRejoining] = useState(false);
  
  // Game state to control refresh
  const [gameStarted, setGameStarted] = useState(false);

  // ====================== Language Functions =====================
  // ----- Collect all unique languages from players -----
  const collectAllLanguages = (room: QuizRoom) => {
    const languages = room.players
      .map(player => player.language)
      .filter((lang): lang is string => lang !== undefined && lang !== null)
      .filter((lang, index, arr) => arr.indexOf(lang) === index); // Remove duplicates
    
    setAllLanguages(languages);
    
    // Update roomInfo with the collected languages
    if (roomInfo) {
      const updatedRoomInfo = {
        ...roomInfo,
        languages: languages
      };
      setRoomInfo(updatedRoomInfo);
      // Save to cache
      saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
      
    }
  };

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
    // Only initialize once
    if (!isRejoining) {
      loadRoomInfo();
      setupSocketListeners();
      fetchInvites();
    }

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

    // Add periodic room state refresh
    const roomRefreshInterval = setInterval(() => {
      if (roomInfo?.roomId && socketService.isConnected() && !isRejoining && !gameStarted) {
        socketService.requestRoomState(roomInfo.roomId);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(roomRefreshInterval);
      // Clean up listeners when component unmounts
      socketService.off("room-joined");
      socketService.off("room-state-updated");
      socketService.off("player-joined");
      socketService.off("player-rejoined");
      socketService.off("player-left");
      socketService.off("player-ready-updated");
      socketService.off("game-started");
      socketService.off("show-start-quiz");
      socketService.off("host-changed");
    };
  }, [roomInfo?.roomId, isRejoining, gameStarted]);

  // Watch for userData changes and attempt to rejoin if needed
  useEffect(() => {
    if (userData && roomInfo && !currentRoom && !socketService.isConnected() && !isRejoining) {
      // Only rejoin if socket is not connected, we don't have current room data, and we're not already rejoining
      console.log("UserData available, socket disconnected, attempting to rejoin room");
      loadRoomInfo();
    }
  }, [userData, isRejoining]);

  // Monitor languages and update roomInfo
  useEffect(() => {
    if (roomInfo && allLanguages.length > 0) {
      const updatedRoomInfo = {
        ...roomInfo,
        languages: allLanguages
      };
      setRoomInfo(updatedRoomInfo);
      saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
    }
  }, [allLanguages]);

  // Monitor current language changes and emit to server
  useEffect(() => {
    if (currentLanguage && roomInfo && currentRoom) {
      // Find current player and emit language update if needed
      const currentPlayer = currentRoom.players.find(
        (p) => p.socketId === socketService.getSocketId()
      );
      
      if (currentPlayer && currentPlayer.language !== currentLanguage.code) {
        // Could add a socket event to update player language ? TODO
        // socketService.updatePlayerLanguage(roomInfo.roomId, currentPlayer.id, currentLanguage.code);
        console.log(`Player ${currentPlayer.name} language changed to ${currentLanguage.code}`);
      }
    }
  }, [currentLanguage, roomInfo, currentRoom]);

  // ========================== Socket Functions ==========================
  // ----- Load Room Info -----
  const loadRoomInfo = async () => {
    try {
      const cachedRoomInfo = await loadCacheData(CACHE_KEY.currentRoom);
      if (cachedRoomInfo) {
        setRoomInfo(cachedRoomInfo);
        
        // Check if we need to rejoin or if we can use cached data
        const shouldRejoin = userData && cachedRoomInfo.roomId && !isRejoining;
        
        if (shouldRejoin) {
          const playerId = userData.clerkUserId;
          const playerName = userData.username || userData.email.split("@")[0];
          const language = currentLanguage?.code;
          
          // Check if we're already connected and have current room data
          if (socketService.isConnected() && cachedRoomInfo.room && cachedRoomInfo.room.players) {
            const currentPlayer = cachedRoomInfo.room.players.find(
              (p: Player) => p.id === playerId
            );
            if (currentPlayer && currentPlayer.socketId === socketService.getSocketId()) {
              setCurrentRoom(cachedRoomInfo.room);
              collectAllLanguages(cachedRoomInfo.room);
              return;
            }
          }
          
          setIsRejoining(true);
          
          // Set a timeout to reset rejoin state if no response
          const rejoinTimeout = setTimeout(() => {
            setIsRejoining(false);
            setCurrentRoom(cachedRoomInfo.room);
            if (cachedRoomInfo.room) {
              collectAllLanguages(cachedRoomInfo.room);
            }
          }, 5000); // 5 second timeout
          
          // Store timeout ID so we can clear it if rejoin succeeds
          (window as any).rejoinTimeout = rejoinTimeout;
          
          // Ensure socket is connected before rejoining
          if (!socketService.isConnected()) {
            try {
              await socketService.connect();
            } catch (error) {
              console.error("Failed to connect socket:", error);
              setErrorMessage("Failed to connect to server");
              setShowErrorAlert(true);
              setIsRejoining(false);
              return;
            }
          }
          
          socketService.rejoinRoom(cachedRoomInfo.roomId, playerId, playerName, language);
        } else {
          // No need to rejoin, use cached data
          setCurrentRoom(cachedRoomInfo.room);
          if (cachedRoomInfo.room) {
            collectAllLanguages(cachedRoomInfo.room);
          }
        }
      }
    } catch (error) {
      console.error("Error loading room info:", error);
      setIsRejoining(false);
    }
  };

  // ----- Setup Socket Listeners -----
  const setupSocketListeners = () => {
    socketService.onRoomJoined((data) => {
      console.log("Room joined/rejoined successfully");
      
      // Clear rejoin timeout if it exists
      if ((window as any).rejoinTimeout) {
        clearTimeout((window as any).rejoinTimeout);
        (window as any).rejoinTimeout = null;
      }
      
      setCurrentRoom(data.room);
      collectAllLanguages(data.room);
      setIsRejoining(false); // Reset rejoin flag
      
      // Update room info with latest room data
      if (roomInfo) {
        const updatedRoomInfo = {
          ...roomInfo,
          room: data.room
        };
        setRoomInfo(updatedRoomInfo);
        saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
      }
    });

    socketService.onRoomStateUpdated((data) => {
      // Check if there are actual changes before updating state
      const hasChanges = !currentRoom || 
        currentRoom.players.length !== data.room.players.length ||
        JSON.stringify(currentRoom.players) !== JSON.stringify(data.room.players);
      
      if (hasChanges) {
        setCurrentRoom(data.room);
        collectAllLanguages(data.room);
        
        // Update room info with latest room data
        if (roomInfo) {
          const updatedRoomInfo = {
            ...roomInfo,
            room: data.room
          };
          setRoomInfo(updatedRoomInfo);
          saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
        }
      }
    });

    socketService.onPlayerJoined((data) => {
      console.log("Player joined:", data.player.name);
      setCurrentRoom(data.room);
      collectAllLanguages(data.room);
      // Refresh invites when a player joins to update the filtered list
      fetchInvites();
    });

    socketService.onPlayerRejoined((data) => {
      console.log("Player rejoined:", data.player.name);
      setCurrentRoom(data.room);
      collectAllLanguages(data.room);
      // Refresh invites when a player rejoins
      fetchInvites();
    });

    socketService.onPlayerLeft((data) => {
      console.log("Player left:", data.playerName);
      setCurrentRoom(data.room);
      collectAllLanguages(data.room);
      // Refresh invites when a player leaves
      fetchInvites();
    });

    socketService.onPlayerReadyUpdated((data) => {
      setCurrentRoom(data.room);
    });

    socketService.onGameStarted(async (data) => {
      console.log("Game started!");
      setGameStarted(true); // Stop room refresh when game starts

      // If we received questions from the server, cache them locally
      if (data.questions && data.questions.length > 0) {
        // Transform questions from socket format to the format expected by useQuizLogic
        const transformedQuestions = {
          questionArray: data.questions.map((q: any) => ({
            question: {
              en: q.question,
              de: q.question, // For now, use English as fallback for other languages
              es: q.question,
              fr: q.question,
            },
            optionA: {
              isCorrect: q.correctAnswer === q.options[0],
              en: q.options[0],
              de: q.options[0],
              es: q.options[0],
              fr: q.options[0],
            },
            optionB: {
              isCorrect: q.correctAnswer === q.options[1],
              en: q.options[1],
              de: q.options[1],
              es: q.options[1],
              fr: q.options[1],
            },
            optionC: {
              isCorrect: q.correctAnswer === q.options[2],
              en: q.options[2],
              de: q.options[2],
              es: q.options[2],
              fr: q.options[2],
            },
            optionD: {
              isCorrect: q.correctAnswer === q.options[3],
              en: q.options[3],
              de: q.options[3],
              es: q.options[3],
              fr: q.options[3],
            },
          })),
        };

        // Cache the transformed questions
        const { saveDataToCache, CACHE_KEY } = await import(
          "@/utilities/cacheUtils"
        );
        await saveDataToCache(CACHE_KEY.aiQuestions, transformedQuestions);
        console.log("Questions cached successfully");
      }

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
      
      // Clear rejoin timeout if it exists
      if ((window as any).rejoinTimeout) {
        clearTimeout((window as any).rejoinTimeout);
        (window as any).rejoinTimeout = null;
      }
      
      setIsRejoining(false); // Reset rejoin flag on error
    });

    // Listen for quiz settings from host
    socketService.onQuizSettingsSync(async (data) => {
      if (data.quizSettings && !roomInfo?.isHost) {
        console.log("Received quiz settings from host:", data.quizSettings);
        await saveDataToCache(CACHE_KEY.quizSettings, data.quizSettings);
        console.log("Quiz settings saved to cache");
      }
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
      roomInfo.selectedCategory
    ) {
      // Check that all players are ready
      const allReady = currentRoom.players.every((p) => p.isReady);
      if (!allReady) {
        setShowWarningAlert(true);
        return;
      }

      try {
        console.log("Starting quiz generation...");
        setIsGeneratingQuestions(true);
        setShowLocalLoader(true);
        
        // If user is host, sync quiz settings with all players
        if (roomInfo.isHost && roomInfo.roomId) {
          await syncQuizSettings(roomInfo.roomId);
        }
        
        // Load questions based on selected category
        const { loadCacheData } = await import("@/utilities/cacheUtils");
        const { generateMultipleQuizQuestions } = await import(
          "@/utilities/api/quizApi"
        );

        const cachedQuizSpecs = await loadCacheData(CACHE_KEY.quizSettings);
        if (!cachedQuizSpecs) {
          setErrorMessage("Quiz settings not found");
          setShowErrorAlert(true);
          setShowLocalLoader(false);
          setIsGeneratingQuestions(false);
          return;
        }

        const fetchedQuestions = await generateMultipleQuizQuestions(
          cachedQuizSpecs.chosenTopic || cachedQuizSpecs.quizCategory,
          cachedQuizSpecs.quizLevel,
          10 // question count
        );

        setQuestionsData(fetchedQuestions);
        saveDataToCache(CACHE_KEY.aiQuestions, fetchedQuestions);

        if (!fetchedQuestions ||
          !fetchedQuestions.questionArray ||
          fetchedQuestions.questionArray.length === 0
        ) {
          setErrorMessage("Failed to load quiz questions");
          setShowErrorAlert(true);
          setShowLocalLoader(false);
          setIsGeneratingQuestions(false);
          return;
        }

        // Transform questions to socket format
        const socketQuestions = transformQuestionsForSocket(fetchedQuestions);
        setShowLocalLoader(false);
        setIsGeneratingQuestions(false);
        setGameStarted(true); // Stop room refresh when game starts
        // setShowCountdown(true);
        socketService.startGame(roomInfo.roomId, socketQuestions);
      } catch (error) {
        console.error("Error starting game:", error);
        setErrorMessage("Failed to start the game");
        setShowErrorAlert(true);
        setShowLocalLoader(false);
        setIsGeneratingQuestions(false);
      }
    }
  };

  // ----- Handle Countdown Complete -----
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setIsGeneratingQuestions(false);
    if (roomInfo && roomInfo.roomId && questionsData) {
      // Start the game with the questions
      const socketQuestions = transformQuestionsForSocket(questionsData);
      socketService.startGame(roomInfo.roomId, socketQuestions);
    } else {
      console.error("Room info is not available to start the game");
      setErrorMessage("Failed to start the game - room info missing");
      setShowErrorAlert(true);
    }
  };

  // ----- Transform questions to socket format -----
  const transformQuestionsForSocket = (questionsData: any) => {
    return questionsData.questionArray.map(
      (q: any, index: number) => {
        // Find the correct answer by checking which option has isCorrect: true
        const correctOption = [
          q.optionA,
          q.optionB,
          q.optionC,
          q.optionD,
        ].find((option) => option.isCorrect);

        return {
          id: index.toString(),
          question: q.question.en || q.question,
          options: [
            q.optionA.en || q.optionA,
            q.optionB.en || q.optionB,
            q.optionC.en || q.optionC,
            q.optionD.en || q.optionD,
          ],
          correctAnswer: correctOption?.en || correctOption || "",
          category: q.category || "general",
          difficulty: "medium" as const,
          timeLimit: 30,
        };
      }
    );
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
        router.push("/(tabs)/play");
      }
    }
  };

  // ----- Sync Quiz Settings -----
  const syncQuizSettings = async (roomId: string) => {
    try {
      const quizSettings = await loadCacheData(CACHE_KEY.quizSettings);
      if (quizSettings) {
        // Emit quiz settings to all players in the room
        socketService.emit("sync-quiz-settings", { roomId, quizSettings });
        console.log("Quiz settings emitted to all players:", quizSettings);
      }
    } catch (error) {
      console.error("Error syncing quiz settings:", error);
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

  if (!roomInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading room...</Text>
      </View>
    );
  }

  if (!currentRoom) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          {isRejoining ? "Rejoining room..." : "Loading room..."}
        </Text>
      </View>
    );
  }

  // ==================== Render Component ====================
  // Show the local loader when AI is generating questions
  if (showLocalLoader && isGeneratingQuestions) {
    return (
      <QuizLoader
        key={`ai-questions-loader-${Date.now()}`}
        onComplete={() => {
          console.log(
            "QuizLoader animation cycle completed, but waiting for AI..."
          );
        }}
        minDuration={1000} // Minimum display duration for the loader
        waitForExternal={true} // Wait for external signal (AI generation completion)
      />
    );
  }

  // Zeige den Countdown wenn aktiv
  if (showCountdown) {
    return (
      <Countdown
        key={`countdown-${Date.now()}`} // Eindeutiger key für jeden Countdown
        onComplete={handleCountdownComplete}
        startNumber={3}
        duration={1500}
      />
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

        {/* =========== TODO Display collected languages ============= */}
        {allLanguages.length > 0 && (
          <Text style={styles.languagesDisplay}>
            Languages: {allLanguages.join(", ")}
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
  // ============== TODO
  languagesDisplay: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g16,
    color: "#2196f3",
    fontWeight: "500",
    textAlign: "center",
  },
  // ==============
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
  }
});

export default MultiplayerLobby;
