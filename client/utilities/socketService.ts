import { io, Socket } from "socket.io-client";
import { navigationState } from "@/utilities/navigationStateManager";
import { getDatabase, ref, remove } from "firebase/database";

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
  selectedCategory?: string;
  selectedTopic?: string;
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
const PRODUCTION_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || "https://quizzly-bears.onrender.com";
const SOCKET_URL = PRODUCTION_URL;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private connectionRetries = 0;
  private maxRetries = 3;

  // Add these methods to your SocketService class

  private pendingUserOnline: { userId: string; clerkUserId: string } | null =
    null;

  setUserOnline(userId: string, clerkUserId: string): void {
    try {
      if (this.socket?.connected) {
        this.socket.emit("user-online", { userId, clerkUserId });
      } else {
        this.pendingUserOnline = { userId, clerkUserId };
      }
    } catch {}
  }

  getFriendsStatus(userId: string, friendIds: string[]): void {
    try {
      if (!this.socket?.connected) {
        return;
      }

      if (!friendIds || !Array.isArray(friendIds)) {
        return;
      }

      this.socket.emit("get-friends-status", {
        userId,
        friendIds: friendIds.filter((id) => id), // Filter out null/undefined
      });
    } catch {}
  }

  onFriendsStatus(callback: (data: { onlineFriends: string[] }) => void): void {
    this.on("friends-status", callback);
  }

  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
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
        timeout: 2000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 2,
        forceNew: true,
      });

      const timeout = setTimeout(() => {
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        reject(new Error("Connection timeout"));
      }, 2500);

      this.socket.on("connect", () => {
        clearTimeout(timeout);
        this.connectionRetries = 0;
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        clearTimeout(timeout);
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        reject(error);
      });

      this.socket.on("disconnect", () => {});
    });
  }

  // Simple method to check connection and reconnect if needed
  async ensureConnection(): Promise<boolean> {
    if (!this.socket || !this.socket.connected) {
      try {
        await this.connect();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  disconnect() {
    if (navigationState.isInAuthNavigation()) {
      return; // Don't disconnect during auth navigation
    }

    // Otherwise proceed with normal disconnect
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
    // Don't make requests for rooms where the game has started
    if (this.roomStateGameStarted[roomId]) {
      return;
    }

    const now = Date.now();
    const lastRequest = this.lastRoomStateRequest[roomId] || 0;

    // Throttle requests to prevent excessive calls (min 2 seconds between requests)
    if (now - lastRequest < 2000) {
      return;
    }

    // Update last request timestamp
    this.lastRoomStateRequest[roomId] = now;

    // Make the actual request
    if (this.socket) {
      this.socket.emit("get-room-state", { roomId });
    }

    // Add a direct error listener to catch any errors
    const errorListener = (error: any) => {
      this.off("error", errorListener);
    };
    this.on("error", errorListener);

    this.emit("get-room-state", { roomId });

    // Debug: check if the response is received
    const debugTimeout = setTimeout(() => {
      this.off("error", errorListener);
    }, 3000);
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
  playerAnswerSubmitted(
    roomId: string,
    playerId: string,
    questionIndex: number
  ) {
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
    const wrappedCallback = (data: { room: QuizRoom }) => {
      callback(data);
    };
    this.on("room-state-updated", wrappedCallback);
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

  // Listen for changes in loading state (when host is generating questions)
  onLoadingStateChanged(
    callback: (data: { roomId: string; isLoading: boolean }) => void
  ) {
    this.on("loading-state-changed", callback);
  }

  // Listen for changes in countdown state (when host starts the countdown)
  onCountdownStateChanged(
    callback: (data: { roomId: string; showCountdown: boolean }) => void
  ) {
    this.on("countdown-state-changed", callback);
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
    this.on("sync-quiz-settings", callback);
  }

  // Get game results of all players
  onGameResults(callback: (data: { finalScores: Player[] }) => void) {
    this.on("game-results", callback);
  }

  // Add these methods to socketService.ts
  private isInitializing = false;

  initialize(): Promise<void> {
    // If already connected, return immediately
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    // If already initializing, don't start another connection attempt
    if (this.isInitializing) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkInterval);
            resolve();
          } else if (!this.isInitializing) {
            clearInterval(checkInterval);
            reject(new Error("Socket initialization failed"));
          }
        }, 100);

        // Set a timeout to prevent infinite waiting
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!this.socket?.connected) {
            reject(new Error("Socket initialization timed out"));
          }
        }, 10000);
      });
    }

    this.isInitializing = true;

    return new Promise((resolve, reject) => {
      try {
        // Clean up existing socket if any
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }

        // Get socket URL from environment or use default
        const SOCKET_URL =
          process.env.EXPO_PUBLIC_SOCKET_URL ||
          "https://quizzly-bears.onrender.com";

        // Initialize the socket with proper options
        this.socket = io(SOCKET_URL, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 10,
          timeout: 20000,
        });

        // Handle connection
        this.socket.on("connect", () => {
          this.isInitializing = false;

          // Process any pending operations (like user online status)
          if (this.pendingUserOnline) {
            this.setUserOnline(
              this.pendingUserOnline.userId,
              this.pendingUserOnline.clerkUserId
            );
          }

          resolve();
        });

        // Handle connection error
        this.socket.on("connect_error", (error) => {
          // Don't reject - socket.io will retry automatically
        });

        // Handle disconnection
        this.socket.on("disconnect", (reason) => {});

        // Set a timeout for the initial connection
        const timeout = setTimeout(() => {
          if (!this.socket?.connected) {
            this.isInitializing = false;
            reject(new Error("Connection timed out"));
          }
        }, 20000);

        // Clear timeout on connect
        this.socket.on("connect", () => {
          clearTimeout(timeout);
        });
      } catch (error) {
        this.isInitializing = false;
        reject(error);
      }
    });
  }

  /**
   * Clears any pending operations (like user online status)
   */
  clearPendingOperations(): void {
    this.pendingUserOnline = null;
    // Add other pending operations here if you have any
  }

  /**
   * Deletes the Firebase chat data for a specific room
   * This is a completely separate method from your game socket logic
   * @param roomId The room ID for which chat data should be deleted
   * @returns Promise that resolves when deletion is complete
   */
  deleteRoomChat(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const db = getDatabase();

        // Delete chat messages
        const chatRef = ref(db, `chats/${roomId}`);
        remove(chatRef)
          .then(() => {
            // Delete typing indicators
            const typingRef = ref(db, `typing/${roomId}`);
            return remove(typingRef);
          })
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Registers a listener for room deletion events
   * @param callback Function to call when a room is deleted
   */
  onRoomDeleted(callback: (data: { roomId: string }) => void): void {
    this.on("room-deleted", callback);
  }
}

// Export singleton
export const socketService = new SocketService();
export default socketService;
