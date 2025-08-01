import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";
import { ChatProvider, useChat } from "@/providers/ChatProvider";
import ChatWindow from "@/components/Chat/ChatWindow";
import ChatFloatingButton from "@/components/Chat/ChatFloatingButton";
import { useRouter } from "expo-router";
import { ButtonPrimary, ButtonSecondary } from "@/components/Buttons";
import { Logo } from "@/components/Logos";
import { Colors, FontSizes, Gaps } from "@/styles/theme";
import { socketService, Player, QuizRoom } from "@/utilities/socketService";
import {
  loadCacheData,
  saveDataToCache,
  CACHE_KEY,
  clearCacheData,
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
  languages: string[];
  questions?: any[];
  isHost: boolean;
  isAdmin?: boolean;
  selectedCategory?: string;
  selectedTopic?: string;
}

// Create a LobbyChat component to wrap with ChatProvider
const LobbyChat: React.FC<{ roomId: string; currentUserId: string }> = ({
  roomId,
  currentUserId,
}) => {
  const {
    messages,
    sendMessage,
    typingUsers,
    setTyping,
    unreadCount,
    isChatVisible,
    toggleChat,
  } = useChat();

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handleTyping = (isTyping: boolean) => {
    setTyping(isTyping);
  };

  return (
    <>
      {/* Chat floating button - only visible when chat is not open */}
      <ChatFloatingButton
        onPress={toggleChat}
        unreadCount={unreadCount}
        isVisible={!isChatVisible}
      />

      {/* Chat window */}
      {isChatVisible && (
        <ChatWindow
          isVisible={true}
          onClose={toggleChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          typingUsers={typingUsers}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
};

const MultiplayerLobby = () => {
  const router = useRouter();
  const { userData } = useContext(UserContext);
  const { currentLanguage } = useLanguage();
  const roomRefreshIntervalRef = useRef<any>(null);

  // ====================== State Variables =====================
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [currentRoom, setCurrentRoom] = useState<QuizRoom | null>(null);
  const [allLanguages, setAllLanguages] = useState<string[]>([]);

  // CustomAlert states
  const [showNewHostAlert, setShowNewHostAlert] = useState(false);
  const [newHostName, setNewHostName] = useState("");
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
      .map((player) => player.language)
      .filter((lang): lang is string => lang !== undefined && lang !== null)
      .filter((lang, index, arr) => arr.indexOf(lang) === index); // Remove duplicates

    setAllLanguages(languages);

    // Update roomInfo with the collected languages
    if (
      roomInfo &&
      (!roomInfo.languages || !arraysEqual(roomInfo.languages, languages))
    ) {
      const updatedRoomInfo = {
        ...roomInfo,
        languages: languages,
      };
      setRoomInfo(updatedRoomInfo);
      saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
    }
  };

  // Helper function to compare arrays for equality
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
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
    } catch {
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
    } catch {}
  };

  // ====================== UseEffect =====================
  useEffect(() => {
    if (!isRejoining) {
      loadRoomInfo();
      setupSocketListeners();
      fetchInvites();
    }

    // Also listen for cache updates (when admin selects category)
    const interval = setInterval(async () => {
      const updatedRoomInfo = await loadCacheData(CACHE_KEY.currentRoom);
      if (updatedRoomInfo) {
        // Check if category or topic has changed
        if (
          updatedRoomInfo.selectedCategory !== roomInfo?.selectedCategory ||
          updatedRoomInfo.selectedTopic !== roomInfo?.selectedTopic
        ) {
          setRoomInfo(updatedRoomInfo);
        }

        // If we're missing category info but the host has already selected it, request the room state to get the latest info
        if (
          !roomInfo?.selectedCategory &&
          socketService.isConnected() &&
          roomInfo?.roomId &&
          !isRejoining
        ) {
          socketService.requestRoomState(roomInfo.roomId);
        }
      }
    }, 1000);

    // Add periodic room state refresh - stored in ref so it can be accessed from anywhere
    if (!roomRefreshIntervalRef.current) {
      roomRefreshIntervalRef.current = setInterval(() => {
        // Only request room state if not in game and connected
        if (
          roomInfo?.roomId &&
          socketService.isConnected() &&
          !isRejoining &&
          !gameStarted &&
          !socketService.isRoomGameStarted(roomInfo.roomId)
        ) {
          socketService.requestRoomState(roomInfo.roomId);
        } else if (
          roomInfo?.roomId &&
          (gameStarted || socketService.isRoomGameStarted(roomInfo.roomId))
        ) {
          // If game has started, clear the interval
          if (roomRefreshIntervalRef.current) {
            clearInterval(roomRefreshIntervalRef.current);
            roomRefreshIntervalRef.current = null;
          }
        }
      }, 3000) as unknown as NodeJS.Timeout;
    }

    return () => {
      clearInterval(interval);
      if (roomRefreshIntervalRef.current) {
        clearInterval(roomRefreshIntervalRef.current);
        roomRefreshIntervalRef.current = null;
      }
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
      socketService.off("categoryChanged");
      socketService.off("loading-state-changed");
      socketService.off("countdown-state-changed");
    };
  }, [roomInfo?.roomId, isRejoining, gameStarted]);

  // Watch for userData changes and attempt to rejoin if needed
  useEffect(() => {
    if (
      userData &&
      roomInfo &&
      !currentRoom &&
      !socketService.isConnected() &&
      !isRejoining
    ) {
      // Only rejoin if socket is not connected, we don't have current room data, and we're not already rejoining
      loadRoomInfo();
    }
  }, [userData, isRejoining]);

  // Monitor languages and update roomInfo
  useEffect(() => {
    if (roomInfo && allLanguages.length > 0) {
      const updatedRoomInfo = {
        ...roomInfo,
        languages: allLanguages,
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
        // Emit language update to server through rejoin-room event
        socketService.rejoinRoom(
          roomInfo.roomId,
          userData?.clerkUserId || currentPlayer.id,
          userData?.username || currentPlayer.name,
          currentLanguage.code
        );
      }
    }
  }, [currentLanguage, roomInfo, currentRoom]);

  // category changes
  useEffect(() => {
    if (
      roomInfo?.isAdmin &&
      roomInfo.selectedCategory &&
      roomInfo.roomId &&
      socketService.isConnected()
    ) {
      // Add a timestamp to track when we last emitted this event to prevent duplicates
      const now = Date.now();
      const lastEmit = (window as any).lastCategoryChangeEmit || 0;
      if (now - lastEmit > 2000) {
        socketService.emit("categoryChanged", {
          roomId: roomInfo.roomId,
          newCategory: roomInfo.selectedCategory,
          newTopic: roomInfo.selectedTopic || roomInfo.selectedCategory,
        });
        (window as any).lastCategoryChangeEmit = now;
      }
    }
  }, [roomInfo?.selectedCategory, roomInfo?.selectedTopic]);

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
          if (
            socketService.isConnected() &&
            cachedRoomInfo.room &&
            cachedRoomInfo.room.players
          ) {
            const currentPlayer = cachedRoomInfo.room.players.find(
              (p: Player) => p.id === playerId
            );
            if (
              currentPlayer &&
              currentPlayer.socketId === socketService.getSocketId()
            ) {
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
          }, 5000);

          // Store timeout ID so we can clear it if rejoin succeeds
          (window as any).rejoinTimeout = rejoinTimeout;

          // Ensure socket is connected before rejoining
          if (!socketService.isConnected()) {
            try {
              await socketService.connect();
            } catch (error) {
              setErrorMessage("Failed to connect to server");
              setShowErrorAlert(true);
              setIsRejoining(false);
              return;
            }
          }

          socketService.rejoinRoom(
            cachedRoomInfo.roomId,
            playerId,
            playerName,
            language
          );
        } else {
          setCurrentRoom(cachedRoomInfo.room);
          if (cachedRoomInfo.room) {
            collectAllLanguages(cachedRoomInfo.room);
          }
        }
      }
    } catch (error) {
      setIsRejoining(false);
    }
  };

  // ----- Setup Socket Listeners -----
  const setupSocketListeners = () => {
    socketService.onRoomJoined((data) => {
      // Clear rejoin timeout if it exists
      if ((window as any).rejoinTimeout) {
        clearTimeout((window as any).rejoinTimeout);
        (window as any).rejoinTimeout = null;
      }

      setCurrentRoom(data.room);
      collectAllLanguages(data.room);
      setIsRejoining(false);
      // Update room info with latest room data
      if (roomInfo) {
        const updatedRoomInfo = {
          ...roomInfo,
          room: data.room,
          // Use server-provided category if available, otherwise keep local values
          selectedCategory:
            data.room.selectedCategory || roomInfo.selectedCategory,
          selectedTopic:
            data.room.selectedTopic ||
            roomInfo.selectedTopic ||
            roomInfo.selectedCategory,
        };

        setRoomInfo(updatedRoomInfo);
        saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
      }
    });

    // Socket listener for category changes
    socketService.on(
      "categoryChanged",
      (data: { roomId: string; newCategory: string; newTopic?: string }) => {
        if (!roomInfo) {
          return;
        }

        // Create updated room info
        const updatedRoomInfo = {
          ...roomInfo,
          selectedCategory: data.newCategory,
          selectedTopic: data.newTopic || data.newCategory,
        };

        setRoomInfo(updatedRoomInfo);
        saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
      }
    );

    // Listener for loading state
    socketService.on(
      "loading-state-changed",
      (data: { roomId: string; isLoading: boolean }) => {
        if (roomInfo && data.roomId === roomInfo.roomId && !roomInfo.isHost) {
          // Only non-host players should react to this event
          setIsGeneratingQuestions(data.isLoading);
          setShowLocalLoader(data.isLoading);
        }
      }
    );

    // Listeners for countdown state
    socketService.on(
      "countdown-state-changed",
      (data: { roomId: string; showCountdown: boolean }) => {
        if (roomInfo && data.roomId === roomInfo.roomId && !roomInfo.isHost) {
          // Only non-host players should react to this event
          setShowCountdown(data.showCountdown);
          // If countdown is hidden, reset loading state as well
          if (!data.showCountdown) {
            setIsGeneratingQuestions(false);
            setShowLocalLoader(false);
          }
        }
      }
    );

    socketService.onRoomStateUpdated((data) => {
      // Check if there are actual changes before updating state
      const hasChanges =
        !currentRoom ||
        currentRoom.players.length !== data.room.players.length ||
        JSON.stringify(currentRoom.players) !==
          JSON.stringify(data.room.players);

      if (hasChanges) {
        setCurrentRoom(data.room);
        collectAllLanguages(data.room);

        // Update room info with latest room data
        if (roomInfo) {
          // Check if room data has category information
          const serverCategory = data.room.selectedCategory;
          const serverTopic = data.room.selectedTopic;
          const updatedRoomInfo = {
            ...roomInfo,
            room: data.room,
            // Use server category if available, otherwise keep local
            selectedCategory: serverCategory || roomInfo.selectedCategory,
            selectedTopic:
              serverTopic ||
              roomInfo.selectedTopic ||
              roomInfo.selectedCategory,
          };

          setRoomInfo(updatedRoomInfo);
          saveDataToCache(CACHE_KEY.currentRoom, updatedRoomInfo);
        }
      }
    });

    socketService.onPlayerJoined((data) => {
      setCurrentRoom(data.room);
      collectAllLanguages(data.room);

      // If we're the host/admin and have selected a category, share it with the new player
      if (roomInfo?.isAdmin && roomInfo.selectedCategory && roomInfo.roomId) {
        socketService.emit("categoryChanged", {
          roomId: roomInfo.roomId,
          newCategory: roomInfo.selectedCategory,
          newTopic: roomInfo.selectedTopic,
        });
      }

      // Refresh invites when a player joins to update the filtered list
      fetchInvites();
    });

    socketService.onPlayerRejoined((data) => {
      setCurrentRoom(data.room);
      collectAllLanguages(data.room);

      // If we're the host/admin and have selected a category, share it with the rejoined player
      if (roomInfo?.isAdmin && roomInfo.selectedCategory && roomInfo.roomId) {
        socketService.emit("categoryChanged", {
          roomId: roomInfo.roomId,
          newCategory: roomInfo.selectedCategory,
          newTopic: roomInfo.selectedTopic,
        });
      }

      // Refresh invites when a player rejoins
      fetchInvites();
    });

    socketService.onPlayerLeft((data) => {
      setCurrentRoom(data.room);
      collectAllLanguages(data.room);
      // Refresh invites when a player leaves
      fetchInvites();
    });

    socketService.onGameStarted(async (data) => {
      setGameStarted(true);

      // Mark the room as started in the socket service to prevent further room state requests
      if (roomInfo?.roomId) {
        socketService.markRoomGameStarted(roomInfo.roomId);
      }

      // If we received questions from the server, cache them locally
      if (data.questions && data.questions.length > 0) {
        // Determine available languages from the room data if available
        let availableLanguages: string[] = ["en"];

        // Extract languages from the room data if available
        if (data.room && data.room.players) {
          const languagesFromRoom = data.room.players
            .map((player) => player.language)
            .filter((lang): lang is string => !!lang)
            .filter((lang, index, arr) => arr.indexOf(lang) === index);

          if (languagesFromRoom.length > 0) {
            // Add any languages from the room that aren't already in our array
            languagesFromRoom.forEach((lang) => {
              if (!availableLanguages.includes(lang)) {
                availableLanguages.push(lang);
              }
            });
          }
        }

        // Create a function to generate language-specific fields dynamically
        const createLanguageFields = (content: string) => {
          const fields: Record<string, string> = {};

          // Add all detected languages with the content
          availableLanguages.forEach((lang) => {
            fields[lang] = content;
          });

          return fields;
        };

        // Transform questions from socket format to the format expected by useQuizLogic
        const transformedQuestions = {
          questionArray: data.questions.map((q: any) => {
            // Check if we have the new format (with multilingual support)
            const hasNewFormat =
              q.options &&
              q.options[0] &&
              typeof q.options[0] === "object" &&
              q.options[0].content !== undefined;

            if (hasNewFormat) {
              // New format with multilingual support
              return {
                question: q.question,
                optionA: {
                  isCorrect: q.options[0].isCorrect,
                  ...q.options[0].content,
                },
                optionB: {
                  isCorrect: q.options[1].isCorrect,
                  ...q.options[1].content,
                },
                optionC: {
                  isCorrect: q.options[2].isCorrect,
                  ...q.options[2].content,
                },
                optionD: {
                  isCorrect: q.options[3].isCorrect,
                  ...q.options[3].content,
                },
              };
            } else {
              // Legacy format - fallback to previous behavior
              return {
                question: createLanguageFields(q.question),
                optionA: {
                  isCorrect: q.correctAnswer === q.options[0],
                  ...createLanguageFields(q.options[0]),
                },
                optionB: {
                  isCorrect: q.correctAnswer === q.options[1],
                  ...createLanguageFields(q.options[1]),
                },
                optionC: {
                  isCorrect: q.correctAnswer === q.options[2],
                  ...createLanguageFields(q.options[2]),
                },
                optionD: {
                  isCorrect: q.correctAnswer === q.options[3],
                  ...createLanguageFields(q.options[3]),
                },
              };
            }
          }),
        };

        // Cache the transformed questions
        const { saveDataToCache, CACHE_KEY } = await import(
          "@/utilities/cacheUtils"
        );
        await saveDataToCache(CACHE_KEY.aiQuestions, transformedQuestions);
      }

      // Go to quiz screen
      router.push("/(tabs)/play/QuizScreen");
    });

    socketService.onShowStartQuiz((data) => {
      // Go to StartQuizScreen
      router.push("/(tabs)/play/StartQuizScreen");
    });

    socketService.onHostChanged((data) => {
      setNewHostName(data.newHost.name);
      setShowNewHostAlert(true);
    });

    socketService.onError((error) => {
      setErrorMessage(error.message);
      setShowErrorAlert(true);

      // Clear rejoin timeout if it exists
      if ((window as any).rejoinTimeout) {
        clearTimeout((window as any).rejoinTimeout);
        (window as any).rejoinTimeout = null;
      }

      setIsRejoining(false);
    });

    // Listen for quiz settings from host
    socketService.onQuizSettingsSync(async (data) => {
      if (data.quizSettings && !roomInfo?.isHost) {
        await saveDataToCache(CACHE_KEY.quizSettings, data.quizSettings);
      }
    });

    socketService.onRoomDeleted((data) => {
      if (roomInfo && data.roomId === roomInfo.roomId) {
        socketService
          .deleteRoomChat(roomInfo.roomId)

          .catch(() => {});
      }
    });
  };

  // ----- Start Game -----
  const startGame = async () => {
    if (roomInfo && currentRoom && roomInfo.selectedCategory) {
      try {
        setIsGeneratingQuestions(true);
        setShowLocalLoader(true);

        // Emit loading state to all players
        if (roomInfo.isHost && roomInfo.roomId) {
          socketService.emit("loading-state-changed", {
            roomId: roomInfo.roomId,
            isLoading: true,
          });
        }

        // If user is host, sync quiz settings with all players
        if (roomInfo.isHost && roomInfo.roomId) {
          await syncQuizSettings(roomInfo.roomId);
        }

        // Load questions based on selected category
        const { loadCacheData } = await import("@/utilities/cacheUtils");
        const { generateMultiplayerQuestions } = await import(
          "@/utilities/api/quizApiGroup"
        );

        const cachedQuizSpecs = await loadCacheData(CACHE_KEY.quizSettings);
        if (!cachedQuizSpecs) {
          setErrorMessage("Quiz settings not found");
          setShowErrorAlert(true);
          setShowLocalLoader(false);
          setIsGeneratingQuestions(false);
          // Update other players that loading is done (with error)
          if (roomInfo.isHost && roomInfo.roomId) {
            socketService.emit("loading-state-changed", {
              roomId: roomInfo.roomId,
              isLoading: false,
            });
          }
          return;
        }

        const fetchedQuestions = await generateMultiplayerQuestions(
          cachedQuizSpecs.chosenTopic || cachedQuizSpecs.quizCategory,
          cachedQuizSpecs.quizLevel,
          10,
          allLanguages
        );

        setQuestionsData(fetchedQuestions);
        saveDataToCache(CACHE_KEY.aiQuestions, fetchedQuestions);

        if (
          !fetchedQuestions ||
          !fetchedQuestions.questionArray ||
          fetchedQuestions.questionArray.length === 0
        ) {
          setErrorMessage("Failed to load quiz questions");
          setShowErrorAlert(true);
          setShowLocalLoader(false);
          setIsGeneratingQuestions(false);
          // Update other players that loading is done (with error)
          if (roomInfo.isHost && roomInfo.roomId) {
            socketService.emit("loading-state-changed", {
              roomId: roomInfo.roomId,
              isLoading: false,
            });
          }
          return;
        }

        setShowLocalLoader(false);
        setIsGeneratingQuestions(false);
        setGameStarted(true);

        // Mark the room as started in the socket service to prevent further room state requests
        if (roomInfo?.roomId) {
          socketService.markRoomGameStarted(roomInfo.roomId);

          // Clear any existing room refresh interval
          if (roomRefreshIntervalRef.current) {
            clearInterval(roomRefreshIntervalRef.current);
            roomRefreshIntervalRef.current = null;
          }
        }
        setShowCountdown(true);

        // Emit countdown state to all players
        if (roomInfo.isHost && roomInfo.roomId) {
          socketService.emit("loading-state-changed", {
            roomId: roomInfo.roomId,
            isLoading: false,
          });

          socketService.emit("countdown-state-changed", {
            roomId: roomInfo.roomId,
            showCountdown: true,
          });
        }
      } catch (error) {
        setErrorMessage("Failed to start the game");
        setShowErrorAlert(true);
        setShowLocalLoader(false);
        setIsGeneratingQuestions(false);

        // Update other players that loading is done (with error)
        if (roomInfo?.isHost && roomInfo?.roomId) {
          socketService.emit("loading-state-changed", {
            roomId: roomInfo.roomId,
            isLoading: false,
          });
        }
      }
    }
  };

  // ----- Handle Countdown Complete -----
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setIsGeneratingQuestions(false);

    // Emit countdown state to all players
    if (roomInfo?.isHost && roomInfo?.roomId) {
      socketService.emit("countdown-state-changed", {
        roomId: roomInfo.roomId,
        showCountdown: false,
      });
    }

    if (roomInfo && roomInfo.roomId && questionsData) {
      // Start the game with the questions
      const socketQuestions = transformQuestionsForSocket(questionsData);
      socketService.startGame(roomInfo.roomId, socketQuestions);
    } else {
      setErrorMessage("Failed to start the game - room info missing");
      setShowErrorAlert(true);
    }
  };

  // ----- Sync quiz settings with other players -----
  const syncQuizSettings = async (roomId: string) => {
    try {
      const { loadCacheData } = await import("@/utilities/cacheUtils");
      const quizSettings = await loadCacheData(CACHE_KEY.quizSettings);

      if (quizSettings && socketService.isConnected()) {
        socketService.emit("sync-quiz-settings", {
          roomId: roomId,
          quizSettings: quizSettings,
        });
      }
    } catch {}
  };

  // ----- Transform questions to socket format -----
  const transformQuestionsForSocket = (questionsData: any) => {
    return questionsData.questionArray.map((q: any, index: number) => {
      // Find the correct answer by checking which option has isCorrect: true
      const correctOption = [q.optionA, q.optionB, q.optionC, q.optionD].find(
        (option) => option.isCorrect
      );

      // Prepare localized questions with all available languages
      // Extract isCorrect property and convert options to full localized format
      const optionA = { ...q.optionA };
      const optionB = { ...q.optionB };
      const optionC = { ...q.optionC };
      const optionD = { ...q.optionD };

      // Extract isCorrect from options for socket format
      const isCorrectA = optionA.isCorrect || false;
      const isCorrectB = optionB.isCorrect || false;
      const isCorrectC = optionC.isCorrect || false;
      const isCorrectD = optionD.isCorrect || false;
      delete optionA.isCorrect;
      delete optionB.isCorrect;
      delete optionC.isCorrect;
      delete optionD.isCorrect;

      // Get English versions for correctAnswer identification
      const optionAEn =
        optionA.en || (typeof optionA === "string" ? optionA : "");
      const optionBEn =
        optionB.en || (typeof optionB === "string" ? optionB : "");
      const optionCEn =
        optionC.en || (typeof optionC === "string" ? optionC : "");
      const optionDEn =
        optionD.en || (typeof optionD === "string" ? optionD : "");

      return {
        id: index.toString(),
        question: q.question,
        options: [
          { content: optionA, isCorrect: isCorrectA },
          { content: optionB, isCorrect: isCorrectB },
          { content: optionC, isCorrect: isCorrectC },
          { content: optionD, isCorrect: isCorrectD },
        ],
        // Keep English version for backward compatibility
        correctAnswer: isCorrectA
          ? optionAEn
          : isCorrectB
          ? optionBEn
          : isCorrectC
          ? optionCEn
          : isCorrectD
          ? optionDEn
          : "",
        category: q.category || "general",
        difficulty: "medium" as const,
        timeLimit: 30,
      };
    });
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
    // Set gameStarted to true to prevent any new requestRoomState calls
    setGameStarted(true);

    if (roomInfo && currentRoom) {
      // Get player ID
      const playerId = currentRoom.players.find(
        (p) => p.socketId === socketService.getSocketId()
      )?.id;

      // Clear the room refresh interval to prevent further requests
      if (roomRefreshIntervalRef.current) {
        clearInterval(roomRefreshIntervalRef.current);
        roomRefreshIntervalRef.current = null;
      }

      // Delete chat data when canceling room (if admin)
      if (roomInfo.isAdmin) {
        socketService.deleteRoomChat(roomInfo.roomId).catch(() => {});
      }

      // Continue with existing logic
      if (playerId) {
        socketService.leaveRoom(roomInfo.roomId, playerId);
      }
      saveDataToCache(CACHE_KEY.currentRoom, null);
      handleRemoveAllInvites();
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
        // Clear the room refresh interval to prevent further requests
        if (roomRefreshIntervalRef.current) {
          clearInterval(roomRefreshIntervalRef.current);
          roomRefreshIntervalRef.current = null;
        }

        // Set gameStarted to true to prevent any new requestRoomState calls
        setGameStarted(true);

        // Check if this is the last player in the room
        const isLastPlayer =
          currentRoom.players.length === 1 &&
          currentRoom.players[0]?.id === playerId;

        // If this is the last player, delete the chat data
        if (isLastPlayer) {
          socketService.deleteRoomChat(roomInfo.roomId).catch(() => {});
        }

        // Continue with existing logic
        socketService.leaveRoom(roomInfo.roomId, playerId);
        saveDataToCache(CACHE_KEY.currentRoom, null);
        clearCacheData(CACHE_KEY.quizSettings);
        handleRemoveAllInvites();
        router.push("/(tabs)/play");
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

          // Check if this player is the current user
          const isCurrentUser = player.socketId === socketService.getSocketId();

          // For current user, use userData if available
          if (isCurrentUser && userData) {
            displayName = userData.username || userData.email.split("@")[0];
          } else {
            // For other players:
            // First check if we can find this player in acceptedInvites
            const matchingInvite = acceptedInvites.find(
              (invite) =>
                invite.to.username === player.name ||
                invite.to.email.includes(player.name)
            );

            if (matchingInvite) {
              // Use the invite data for consistent display
              displayName =
                matchingInvite.to.username ||
                matchingInvite.to.email.split("@")[0];
            } else {
              // Fallback to cleaning up the display name
              displayName = player.name.includes("@")
                ? player.name.split("@")[0]
                : player.name;
            }
          }

          return {
            type: "player" as const,
            id: player.id,
            name: displayName,
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
      <Text style={styles.playerName}>{item.name}</Text>
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
        ) : (
          <IconAccept />
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

  const handleCancelRoomAlertClose = () => {
    setShowCancelRoomAlert(false);
  };

  // ================ Render Logic ================
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
        onComplete={() => {}}
        minDuration={1000}
        waitForExternal={true}
      />
    );
  }

  // Show countdown if it's active
  if (showCountdown) {
    return (
      <Countdown
        key={`countdown-${Date.now()}`}
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

        {/* Display selected category/topic */}
        {roomInfo.selectedCategory ? (
          <Text style={styles.selectedCategory}>
            Selected Topic:{" "}
            {roomInfo.selectedTopic || roomInfo.selectedCategory}
          </Text>
        ) : (
          <Text style={[styles.selectedCategory]}>
            Waiting for topic selection by admin
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
        visible={showCancelRoomAlert}
        title="Cancel Room"
        message="Are you sure you want to cancel the room?"
        onClose={handleCancelRoomAlertClose}
        cancelText="No"
        confirmText="Yes"
        onConfirm={handleCancelRoomConfirm}
        noInternet={false}
      />

      {userData && roomInfo && (
        <ChatProvider roomId={roomInfo.roomId}>
          <LobbyChat
            roomId={roomInfo.roomId}
            currentUserId={userData.clerkUserId || ""}
          />
        </ChatProvider>
      )}
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
    marginBottom: Gaps.g8,
    textAlign: "center",
  },
  roomId: {
    fontSize: FontSizes.TextMediumFs,
    marginBottom: Gaps.g32,
  },
  selectedCategory: {
    fontSize: FontSizes.TextLargeFs,
    marginBottom: Gaps.g32,
    borderColor: Colors.primaryLimo,
    borderWidth: 2,
    paddingVertical: Gaps.g16,
    paddingHorizontal: Gaps.g24,
    borderRadius: 50,
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
  readyText: {},
  buttonContainer: {
    width: "100%",
    gap: Gaps.g16,
    paddingVertical: Gaps.g16,
  },
  errorText: {
    fontSize: FontSizes.TextLargeFs,
  },
});

export default MultiplayerLobby;
