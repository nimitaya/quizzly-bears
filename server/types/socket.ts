// Type Script file for Socket.IO events
export interface SocketEvents {
  // Client -> Server
  "create-room": (data: CreateRoomData) => void;
  "join-room": (data: JoinRoomData) => void;
  "leave-room": (data: LeaveRoomData) => void;
  "player-ready": (data: PlayerReadyData) => void;
  "start-game": (data: StartGameData) => void;
  "next-question": (data: NextQuestionData) => void;
  "submit-answer": (data: SubmitAnswerData) => void;

  // Server -> Client
  "room-created": (data: RoomCreatedData) => void;
  "room-joined": (data: RoomJoinedData) => void;
  "player-joined": (data: PlayerJoinedData) => void;
  "player-left": (data: PlayerLeftData) => void;
  "player-ready-updated": (data: PlayerReadyUpdatedData) => void;
  "player-answered": (data: PlayerAnsweredData) => void;
  "host-changed": (data: HostChangedData) => void;
  "game-started": (data: GameStartedData) => void;
  question: (data: QuestionData) => void;
  "game-ended": (data: GameEndedData) => void;
  error: (data: ErrorData) => void;
}

// Types for main data structures
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
  createdAt: Date;
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
  score: number;
  isReady: boolean;
  language?: string;
  answers?: PlayerAnswer[];
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

export interface PlayerAnswer {
  questionId: string;
  answer: string;
  timeRemaining: number;
  isCorrect: boolean;
  pointsEarned: number;
}

// ТTypes for Socket.IO events - Client -> Server
export interface CreateRoomData {
  roomName: string;
  hostName: string;
  hostId: string;
  hostLanguage?: string;
  settings: QuizSettings;
}

export interface JoinRoomData {
  roomId: string;
  playerId: string;
  playerName: string;
  language?: string;
}

export interface LeaveRoomData {
  roomId: string;
  playerId: string;
}

export interface PlayerReadyData {
  roomId: string;
  playerId: string;
}

export interface StartGameData {
  roomId: string;
  questions: QuizQuestion[];
}

export interface NextQuestionData {
  roomId: string;
}

export interface SubmitAnswerData {
  roomId: string;
  playerId: string;
  answer: string;
  timeRemaining: number;
}

// Types for Socket.IO events - Server -> Client
export interface RoomCreatedData {
  roomId: string;
  room: QuizRoom;
}

export interface RoomJoinedData {
  room: QuizRoom;
}

export interface PlayerJoinedData {
  player: Player;
  room: QuizRoom;
}

export interface PlayerLeftData {
  playerId: string;
  playerName: string;
  room: QuizRoom;
}

export interface PlayerReadyUpdatedData {
  playerId: string;
  isReady: boolean;
  room: QuizRoom;
}

export interface PlayerAnsweredData {
  playerId: string;
  playerName: string;
  isCorrect: boolean;
  currentScores: Array<{
    id: string;
    name: string;
    score: number;
  }>;
}

export interface HostChangedData {
  newHost: Player;
}

export interface GameStartedData {
  room: QuizRoom;
}

export interface QuestionData {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
}

export interface GameEndedData {
  finalScores: Player[];
}

export interface ErrorData {
  message: string;
  code?: string;
}

// Status enum for room states
export enum RoomStatus {
  WAITING = "waiting",
  STARTING = "starting",
  IN_PROGRESS = "in_progress",
  FINISHED = "finished",
}

// Type for API responses
export interface RoomListResponse {
  rooms: Array<{
    id: string;
    name: string;
    playerCount: number;
    maxPlayers: number;
    isStarted: boolean;
    host: string;
  }>;
}

export interface RoomDetailResponse {
  room: QuizRoom;
}

export interface RoomExistsResponse {
  exists: boolean;
}
