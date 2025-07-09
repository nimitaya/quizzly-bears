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

// Configuration
// Platform-specific URLs for React Native development
const getSocketUrls = () => {
  // ========== No hardcoded IP address anymore, needed to be added to be used on different IP addresses ==========
  // Common IP ranges to try - covers most home/office networks
  const commonIPs = [
    "192.168.178.21", // Sonja current IP
    "192.168.0.226", // Natallia IP
    "192.168.1.100",  // Common router range (192.168.1.x)
    "192.168.0.100",  // Common router range (192.168.0.x) 
    "192.168.2.100",  // Another common range
    "10.0.0.100",     // Some routers use 10.x.x.x
  ];
  
  if (Platform.OS === "android") {
    return [
      ...commonIPs.map(ip => `http://${ip}:3000`), // Try common IPs for real device
      "http://10.0.2.2:3000", // Android emulator
    ];
  } else if (Platform.OS === "ios") {
    return [
      // "http://192.168.0.226:3000", // Current local IP for real device (primary for Expo Go)
      // Uncomment below for iOS simulator testing:
      // "http://localhost:3000", // iOS simulator
      // "http://127.0.0.1:3000", // iOS simulator fallback
      ...commonIPs.map(ip => `http://${ip}:3000`), // Try common IPs for real device
      "http://localhost:3000", // iOS simulator
      "http://127.0.0.1:3000", // iOS simulator fallback
    ];
  } else {
    return [
      "http://localhost:3000", // Web (primary)
      "http://127.0.0.1:3000", // Web fallback
      ...commonIPs.map(ip => `http://${ip}:3000`), // Network fallbacks
    ];
  }
};

const SOCKET_URLS = getSocketUrls();

// Best practice: Use environment variables for production URL
const PRODUCTION_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "https://quizzly-bears.onrender.com";

const SOCKET_URL = __DEV__ ? SOCKET_URLS[0] : PRODUCTION_URL;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (__DEV__) {
        // In development, try multiple URLs
        for (const url of SOCKET_URLS) {
          try {
            console.log(`Trying to connect to Socket.IO at ${url}...`);
            await this.connectToUrl(url);
            console.log(`Successfully connected to Socket.IO at ${url}`);
            resolve();
            return;
          } catch (error) {
            console.warn(`Failed to connect to ${url}:`, error);
            continue;
          }
        }
        reject(new Error("Could not connect to any Socket.IO server"));
      } else {
        // In production, use the configured URL
        try {
          await this.connectToUrl(SOCKET_URL);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  private connectToUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        transports: ["websocket", "polling"], // Try both transports
        timeout: 5000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 3,
      });

      const timeout = setTimeout(() => {
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        reject(new Error("Connection timeout"));
      }, 6000);

      this.socket.on("connect", () => {
        clearTimeout(timeout);
        console.log(`Connected to Socket.IO server at ${url}`);
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
        console.log("Disconnected from Socket.IO server");
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
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
    settings: QuizSettings
  ) {
    this.emit("create-room", { roomName, hostName, hostId, settings });
  }

  joinRoom(roomId: string, playerId: string, playerName: string) {
    this.emit("join-room", { roomId, playerId, playerName });
  }

  leaveRoom(roomId: string, playerId: string) {
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

  // Universal methods for working with events
  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
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

  onGameStarted(callback: (data: { room: QuizRoom; questions?: QuizQuestion[] }) => void) {
    this.on("game-started", callback);
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

  onGameEnded(callback: (data: { finalScores: Player[] }) => void) {
    this.on("game-ended", callback);
  }

  onError(callback: (data: { message: string; code?: string }) => void) {
    this.on("error", callback);
  }
}

// Export singleton
export const socketService = new SocketService();
export default socketService;
