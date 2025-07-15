import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";

// Types (can be moved to a separate file)
export interface QuizRoom {
  id: string;
  name: string;
  host: string;
  hostSocketId: string;
  players: Player[];
  maxPlayers: number;
  isStarted: boolean;
  currentQuestion?: number;
  questions?: QuizQuestion[];
  settings: QuizSettings;
  createdAt?: Date;
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
  score: number;
  isReady: boolean;
  language?: string;
  gamePoints?: GamePoints;
}

export interface GamePoints {
  score: number;
  timePoints: number;
  perfectGame: number;
  total: number;
  chosenCorrect: number;
  totalAnswers: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
}

export interface QuizSettings {
  questionCount: number;
  timePerQuestion: number;
  categories: string[];
  difficulty: "easy" | "medium" | "hard" | "mixed";
}

// Chat-related types
export interface ChatMessage {
  id: string;
  roomId: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  isOwnMessage?: boolean;
}

export interface SendChatMessageData {
  roomId: string;
  playerId: string;
  message: string;
}

export interface PlayerTypingData {
  roomId: string;
  playerId: string;
  isTyping: boolean;
}

export interface ChatMessageReceivedData {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

export interface PlayerTypingStatusData {
  playerId: string;
  playerName: string;
  isTyping: boolean;
}

// Configuration

// ========== IMPORTANT not needed anymore ==========
// Platform-specific URLs for React Native development 
// const getSocketUrls = () => {
//   // Priority 1: Platform-specific primary URLs (fastest and most reliable)
//   const primaryUrls = [];
//   if (Platform.OS === "android") {
//     primaryUrls.push("http://10.0.2.2:3000"); // Android emulator
//   } else if (Platform.OS === "ios") {
//     primaryUrls.push("http://localhost:3000"); // iOS simulator
//   } else {
//     primaryUrls.push("http://localhost:3000"); // Web
//   }

//   // Priority 2: Smart IP detection - try to find the development server
//   // This works by testing common development IP patterns in the current network
//   const smartDetectionUrls: string[] = [];

//   // Try to detect current network range by testing common router IPs
//   const networkRanges = [
//     "192.168.0",
//     "192.168.2",
//     "192.168.178",
//     "192.168.1",
//     // "10.0.0",
//     // "10.0.1",
//     // "172.16.0",
//   ];

//   // Common development server IPs within each network (most likely first)
//   const commonDevHosts = [
//     // Team-specific IPs (most likely)
//     21, 226, 113, 3, 34,
//   ];

//   // Generate smart detection URLs
//   networkRanges.forEach((range) => {
//     commonDevHosts.forEach((host) => {
//       smartDetectionUrls.push(`http://${range}.${host}:3000`);
//     });
//   });

//   // Priority 3: Try additional common patterns
//   const additionalUrls = ["http://127.0.0.1:3000", "http://0.0.0.0:3000"];

//   // Create final URL list with smart priority
//   const finalUrls = [
//     ...primaryUrls, // Platform-specific (localhost, 10.0.2.2)
//     ...smartDetectionUrls.slice(0, 20), // First 20 most likely IPs
//     ...additionalUrls, // Additional common patterns
//   ];
//   return finalUrls;
// };

// const SOCKET_URLS = getSocketUrls();
// ========== IMPORTANT not needed anymore ==========

const PRODUCTION_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || "https://quizzly-bears.onrender.com";
const SOCKET_URL = PRODUCTION_URL;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connectionRetries = 0;
  private maxRetries = 3;

  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // ========== IMPORTANT not needed anymore ==========
      // if (__DEV__) {
      //   const urls = SOCKET_URLS;
      //   console.log(`🔌 Platform: ${Platform.OS}`);
      //   console.log(`🔌 Trying ${urls.length} auto-generated URLs...`);

      //   // Try priority URLs first (platform-specific + first few smart detection)
      //   const priorityUrls = urls.slice(0, 10); // localhost + first 9 smart detection URLs (увеличено с 6)
      //   console.log(`Priority URLs: ${JSON.stringify(priorityUrls)}`);

      //   for (let i = 0; i < priorityUrls.length; i++) {
      //     try {
      //       console.log(
      //         ` Priority ${i + 1}/${priorityUrls.length}: ${priorityUrls[i]}...`
      //       );
      //       await this.connectToUrl(priorityUrls[i]);
      //       console.log(`Connected via priority: ${priorityUrls[i]}`);
      //       resolve();
      //       return;
      //     } catch (error) {
      //       console.warn(`Priority failed: ${priorityUrls[i]}`);
      //       continue;
      //     }
      //   }

      //   // Try remaining URLs if priority fails
      //   const remainingUrls = urls.slice(10);
      //   console.log(`Trying ${remainingUrls.length} fallback URLs...`);

      //   for (let i = 0; i < remainingUrls.length; i++) {
      //     try {
      //       console.log(
      //         `Fallback ${i + 1}/${remainingUrls.length}: ${
      //           remainingUrls[i]
      //         }...`
      //       );
      //       await this.connectToUrl(remainingUrls[i]);
      //       console.log(`Connected via fallback: ${remainingUrls[i]}`);
      //       resolve();
      //       return;
      //     } catch (error) {
      //       console.warn(`Fallback failed: ${remainingUrls[i]}`);
      //       continue;
      //     }
      //   }

      //   reject(new Error("Could not connect to any Socket.IO server"));
      // } else {
      // ========== IMPORTANT not needed anymore ==========
        try {
          await this.connectToUrl(SOCKET_URL);
          resolve();
        } catch (error) {
          reject(error);
        }
      // }
    });
  }

  private connectToUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        transports: ["websocket", "polling"],
        timeout: 2000, // Very fast timeout for quick fallback
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 2, // Reduced for faster fallback
        forceNew: true,
      });

      const timeout = setTimeout(() => {
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        reject(new Error("Connection timeout"));
      }, 2500); // Very fast timeout for quick fallback

      this.socket.on("connect", () => {
        clearTimeout(timeout);
        console.log(`✅ Connected to Socket.IO server at ${url}`);
        this.connectionRetries = 0;
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        console.warn(`Socket.IO connection failed for ${url}:`, error.message);
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        reject(error);
      });

      this.socket.on("disconnect", () => {
        console.log("🔌 Disconnected from Socket.IO server");
      });
    });
  }

  // Simple method to check connection and reconnect if needed
  async ensureConnection(): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      try {
        console.log("Socket not connected, attempting to reconnect...");
        await this.connect();
        return true;
      } catch (err) {
        console.error("Reconnection failed:", err);
        return false;
      }
    }
    return true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();

    // Clear all room state tracking
    this.lastRoomStateRequest = {};
    this.roomStateGameStarted = {};
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Methods for working with rooms
  createRoom(
    roomName: string,
    hostName: string,
    hostId: string,
    settings: QuizSettings,
    hostLanguage?: string
  ) {
    this.emit("create-room", {
      roomName,
      hostName,
      hostId,
      hostLanguage,
      settings,
    });
  }

  joinRoom(
    roomId: string,
    playerId: string,
    playerName: string,
    language?: string
  ) {
    this.emit("join-room", { roomId, playerId, playerName, language });
  }

  // Add method to rejoin a room (for when user returns from another screen)
  rejoinRoom(
    roomId: string,
    playerId: string,
    playerName: string,
    language?: string
  ) {
    // Emit rejoin event to update server state and socket room
    this.emit("rejoin-room", { roomId, playerId, playerName, language });
  }

  // Add method to request current room state with throttling to prevent excessive calls
  private lastRoomStateRequest: Record<string, number> = {};
  private roomStateGameStarted: Record<string, boolean> = {};

  requestRoomState(roomId: string) {
    // Debug logging for room state requests in dev mode
    if (__DEV__) {
      console.log(
        `[SocketService] Room state request attempted for: ${roomId}`
      );

      if (this.roomStateGameStarted[roomId]) {
        console.log(
          `[SocketService] Blocked room state request - game already started for room: ${roomId}`
        );
        return;
      }
    }

    // Don't make requests for rooms where the game has started
    if (this.roomStateGameStarted[roomId]) {
      return;
    }

    const now = Date.now();
    const lastRequest = this.lastRoomStateRequest[roomId] || 0;

    // Throttle requests to prevent excessive calls (min 2 seconds between requests)
    if (now - lastRequest < 2000) {
      if (__DEV__) {
        console.log(
          `[SocketService] Throttled room state request - too soon (${
            now - lastRequest
          }ms since last request)`
        );
      }
      return;
    }

    // Update last request timestamp
    this.lastRoomStateRequest[roomId] = now;

    // Make the actual request
    if (__DEV__) {
      console.log(
        `[SocketService] Sending room state request for room: ${roomId}`
      );
    }
    this.emit("get-room-state", { roomId });
  }

  // Method to mark a room as having started a game (to prevent further state requests)
  markRoomGameStarted(roomId: string) {
    this.roomStateGameStarted[roomId] = true;
  }

  // Method to check if a game has started for a specific room
  isRoomGameStarted(roomId: string): boolean {
    return !!this.roomStateGameStarted[roomId];
  }

  leaveRoom(roomId: string, playerId: string) {
    // Clean up room state tracking for this room
    delete this.lastRoomStateRequest[roomId];
    delete this.roomStateGameStarted[roomId];

    this.emit("leave-room", { roomId, playerId });
  }

  togglePlayerReady(roomId: string, playerId: string) {
    this.emit("player-ready", { roomId, playerId });
  }

  startGame(roomId: string, questions: QuizQuestion[]) {
    this.emit("start-game", { roomId, questions });
  }

  questionsReady(roomId: string) {
    this.emit("questions-ready", { roomId });
  }

  nextQuestion(roomId: string) {
    this.emit("next-question", { roomId });
  }

  submitAnswer(
    roomId: string,
    playerId: string,
    answer: string,
    timeRemaining: number
  ) {
    this.emit("submit-answer", { roomId, playerId, answer, timeRemaining });
  }

  // send game results of every player
  submitGameResults(
    roomId: string,
    playerId: string,
    playerName: string,
    gamePoints: GamePoints
  ) {
    this.emit("submit-game-results", {
      roomId,
      playerId,
      playerName,
      gamePoints,
    });
  }

  // ========== CHAT FUNCTIONALITY ==========
  // Send chat message
  sendChatMessage(roomId: string, playerId: string, message: string) {
    this.emit("send-chat-message", { roomId, playerId, message });
  }

  // Send typing status
  sendTypingStatus(roomId: string, playerId: string, isTyping: boolean) {
    this.emit("player-typing", { roomId, playerId, isTyping });
  }
  // ========== END CHAT FUNCTIONALITY ==========

  // Universal methods for working with events
  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Notify the server that a player has submitted their answer
  playerAnswerSubmitted(roomId: string, playerId: string, questionIndex: number) {
    this.emit("player-answer-submitted", { roomId, playerId, questionIndex });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index !== -1) {
          eventListeners.splice(index, 1);
        }
      }
      if (this.socket) {
        this.socket.off(event, callback as any);
      }
    } else {
      // Remove all listeners for the event
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  // Specific methods for subscribing to events
  onRoomCreated(callback: (data: { roomId: string; room: QuizRoom }) => void) {
    this.on("room-created", callback);
  }

  onRoomJoined(callback: (data: { room: QuizRoom }) => void) {
    this.on("room-joined", callback);
  }

  onPlayerJoined(callback: (data: { player: Player; room: QuizRoom }) => void) {
    this.on("player-joined", callback);
  }

  onPlayerRejoined(
    callback: (data: { player: Player; room: QuizRoom }) => void
  ) {
    this.on("player-rejoined", callback);
  }

  onRoomStateUpdated(callback: (data: { room: QuizRoom }) => void) {
    this.on("room-state-updated", callback);
  }

  onPlayerLeft(
    callback: (data: {
      playerId: string;
      playerName: string;
      room: QuizRoom;
    }) => void
  ) {
    this.on("player-left", callback);
  }

  onPlayerReadyUpdated(
    callback: (data: {
      playerId: string;
      isReady: boolean;
      room: QuizRoom;
    }) => void
  ) {
    this.on("player-ready-updated", callback);
  }

  onPlayerAnswered(
    callback: (data: {
      playerId: string;
      playerName: string;
      isCorrect: boolean;
      currentScores: any[];
    }) => void
  ) {
    this.on("player-answered", callback);
  }

  onHostChanged(callback: (data: { newHost: Player }) => void) {
    this.on("host-changed", callback);
  }

  onGameStarted(
    callback: (data: { room: QuizRoom; questions?: QuizQuestion[] }) => void
  ) {
    // Create a wrapper that automatically marks the room as started
    const wrappedCallback = (data: {
      room: QuizRoom;
      questions?: QuizQuestion[];
    }) => {
      if (data.room && data.room.id) {
        this.markRoomGameStarted(data.room.id);
      }
      callback(data);
    };

    this.on("game-started", wrappedCallback);
  }

  onShowStartQuiz(callback: (data: { room: QuizRoom }) => void) {
    this.on("show-start-quiz", callback);
  }

  onQuestion(
    callback: (data: {
      question: QuizQuestion;
      questionNumber: number;
      totalQuestions: number;
    }) => void
  ) {
    this.on("question", callback);
  }

  // Deprecated - use onGameResults instead
  onGameEnded(callback: (data: { finalScores: Player[] }) => void) {
    console.warn("onGameEnded is deprecated, use onGameResults instead");
    this.on("game-results", callback);
  }

  // ========== CHAT EVENT LISTENERS ==========

  onChatMessageReceived(callback: (data: ChatMessageReceivedData) => void) {
    this.on("chat-message-received", callback);
  }

  onPlayerTypingStatus(callback: (data: PlayerTypingStatusData) => void) {
    this.on("player-typing-status", callback);
  }

  // ========== END CHAT EVENT LISTENERS ==========

  onError(callback: (data: { message: string; code?: string }) => void) {
    this.on("error", callback);
  }

  // Quiz settings synchronization
  onQuizSettingsSync(callback: (data: { quizSettings: any }) => void) {
    this.on("quiz-settings-sync", callback);
  }

  // Get game results of all players
  onGameResults(callback: (data: { finalScores: Player[] }) => void) {
    this.on("game-results", callback);
  }
}

// Export singleton
export const socketService = new SocketService();
export default socketService;
