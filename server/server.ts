import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./database/connectDB";
import clerkWebhookRouter from "./routes/ClerkWebhook";
import friendRequestRouter from "./routes/friendRequestRoutes";
import quizRoomsRouter, { setRoomsReference } from "./routes/QuizRooms";
import userRoutes from "./routes/UserStats";
import pointsRouter from "./routes/PointsRoutes";
import invitationsRouter from "./routes/InvitationsRoutes";
import medalsRouter from "./routes/MedalsRoutes";
import {
  ChatMessage,
  SendChatMessageData,
  PlayerTypingData,
  QuizRoom,
  Player,
} from "./types/socket";

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify concrete domains
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/clerk-webhook", cors());
app.use("/api", clerkWebhookRouter);
app.use("/api/friend-request", friendRequestRouter);
app.use("/api/invite-request", invitationsRouter);
app.use("/api/quiz", quizRoomsRouter);
app.use("/api", userRoutes);
app.use("/api/points", pointsRouter);
app.use("/api/medals", medalsRouter);
app.get("/", (req, res) => {
  res.send("API is running...");
});
// ======Socket.IO Server Setup======

// Room storage
const quizRooms = new Map<string, QuizRoom>();

// Track player answers for each room and question
const roomAnswerTracking = new Map<string, Map<number, Set<string>>>();

// Online users map
const onlineUsers = new Map<string, string>(); // userId -> socketId

// Socket.IO handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User online status
  socket.on("user-online", (data: { userId: string; clerkUserId: string }) => {
    try {
      // Store both IDs for flexibility
      if (data.userId) onlineUsers.set(data.userId, socket.id);
      if (data.clerkUserId) onlineUsers.set(data.clerkUserId, socket.id);
    } catch (error) {
      console.error("Error in user-online handler:", error);
    }
  });

  // Get friends' online status
  socket.on(
    "get-friends-status",
    async (data: { userId: string; friendIds: string[] }) => {
      try {
        // Filter for online friends
        const onlineFriends = data.friendIds.filter((id) =>
          onlineUsers.has(id)
        );

        socket.emit("friends-status", { onlineFriends });
      } catch (error) {
        console.error("Error in get-friends-status handler:", error);
      }
    }
  );

  // Room creation
  socket.on(
    "create-room",
    (data: {
      roomName: string;
      hostName: string;
      hostId: string;
      hostLanguage?: string;
      settings: any;
    }) => {
      const roomId = generateRoomId();
      const room: QuizRoom = {
        id: roomId,
        name: data.roomName,
        host: data.hostId,
        hostSocketId: socket.id,
        players: [
          {
            id: data.hostId,
            name: data.hostName,
            socketId: socket.id,
            score: 0,
            isReady: true,
            language: data.hostLanguage,
          },
        ],
        maxPlayers: 6,
        isStarted: false,
        createdAt: new Date(),
        settings: data.settings,
        // Chat functionality
        chatMessages: [],
        typingPlayers: new Set(),
      };

      quizRooms.set(roomId, room);
      socket.join(roomId);

      socket.emit("room-created", { roomId, room });
    }
  );

  // Join room
  socket.on(
    "join-room",
    (data: {
      roomId: string;
      playerId: string;
      playerName: string;
      language?: string;
    }) => {
      const room = quizRooms.get(data.roomId);

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.isStarted) {
        socket.emit("error", { message: "Game already started" });
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit("error", { message: "Room is full" });
        return;
      }

      // Check if player is already connected
      const existingPlayer = room.players.find((p) => p.id === data.playerId);
      if (existingPlayer) {
        socket.emit("error", { message: "You are already in this room" });
        return;
      }

      const newPlayer: Player = {
        id: data.playerId,
        name: data.playerName,
        socketId: socket.id,
        score: 0,
        isReady: false,
        language: data.language,
      };

      room.players.push(newPlayer);
      socket.join(data.roomId);

      // Notify all players in the room about the new player
      io.to(data.roomId).emit("player-joined", {
        player: newPlayer,
        room: room,
      });

      socket.emit("room-joined", { room });

      // If the room has category information, also emit the categoryChanged event
      if (room.selectedCategory) {
        socket.emit("categoryChanged", {
          roomId: data.roomId,
          newCategory: room.selectedCategory,
          newTopic: room.selectedTopic || room.selectedCategory,
        });
      }
    }
  );

  // Rejoin room (for users returning from another screen)
  socket.on(
    "rejoin-room",
    (data: {
      roomId: string;
      playerId: string;
      playerName: string;
      language?: string;
    }) => {
      const room = quizRooms.get(data.roomId);

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // Check if player is already in the room
      const existingPlayer = room.players.find((p) => p.id === data.playerId);
      if (existingPlayer) {
        // Update the socket ID and language for the existing player
        existingPlayer.socketId = socket.id;
        if (data.language) {
          existingPlayer.language = data.language;
        }

        // Join the socket room
        socket.join(data.roomId);

        // Update host socket ID if this player is the host
        if (room.host === data.playerId) {
          room.hostSocketId = socket.id;
        }

        room.players.forEach((p, index) => {});

        // Send current room state to rejoining player
        socket.emit("room-joined", { room });

        // If the room has category information, also emit the categoryChanged event
        if (room.selectedCategory) {
          socket.emit("categoryChanged", {
            roomId: data.roomId,
            newCategory: room.selectedCategory,
            newTopic: room.selectedTopic || room.selectedCategory,
          });
        }
      } else {
        // Player not in room, treat as new join
        if (room.isStarted) {
          socket.emit("error", { message: "Game already started" });
          return;
        }

        if (room.players.length >= room.maxPlayers) {
          socket.emit("error", { message: "Room is full" });
          return;
        }

        const newPlayer: Player = {
          id: data.playerId,
          name: data.playerName,
          socketId: socket.id,
          score: 0,
          isReady: false,
          language: data.language,
        };

        room.players.push(newPlayer);
        socket.join(data.roomId);

        // Notify all players in the room about the new player
        io.to(data.roomId).emit("player-joined", {
          player: newPlayer,
          room: room,
        });

        socket.emit("room-joined", { room });
      }
    }
  );

  // Get current room state
  socket.on("get-room-state", (data: { roomId: string }) => {
    try {
      if (!data || !data.roomId) {
        console.error("Invalid data format received:", data);
        socket.emit("error", { message: "Invalid room data" });
        return;
      }

      const room = quizRooms.get(data.roomId);

      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // Send current room state
      socket.emit("room-state-updated", { room });

      // If the room has category information, also emit the categoryChanged event
      if (room.selectedCategory) {
        socket.emit("categoryChanged", {
          roomId: data.roomId,
          newCategory: room.selectedCategory,
          newTopic: room.selectedTopic || room.selectedCategory,
        });
      }
    } catch (err) {
      console.error("Error handling get-room-state event:", err);
      socket.emit("error", { message: "Server error processing room state" });
    }
  });

  // Player ready status
  socket.on("player-ready", (data: { roomId: string; playerId: string }) => {
    const room = quizRooms.get(data.roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === data.playerId);
    if (player) {
      player.isReady = !player.isReady;
      io.to(data.roomId).emit("player-ready-updated", {
        playerId: data.playerId,
        isReady: player.isReady,
        room: room,
      });
    }
  });

  // Start game (only host can start)
  socket.on("start-game", (data: { roomId: string; questions: any[] }) => {
    const room = quizRooms.get(data.roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    if (room.hostSocketId !== socket.id) {
      socket.emit("error", { message: "Only host can start game" });
      return;
    }

    room.isStarted = true;
    room.currentQuestion = 0;
    room.questions = data.questions;

    io.to(data.roomId).emit("game-started", {
      room,
      questions: data.questions,
    });
  });

  // Admin selected topic and questions are ready
  socket.on("questions-ready", (data: { roomId: string }) => {
    const room = quizRooms.get(data.roomId);
    if (!room || room.hostSocketId !== socket.id) return;

    // Notify all players that admin has selected topic and they should see StartQuizScreen
    io.to(data.roomId).emit("show-start-quiz", { room });
  });

  // Sync quiz settings from host to all players
  socket.on(
    "sync-quiz-settings",
    (data: { roomId: string; quizSettings: any }) => {
      const room = quizRooms.get(data.roomId);
      if (room) {
        io.to(data.roomId).emit("sync-quiz-settings", {
          roomId: data.roomId,
          quizSettings: data.quizSettings,
        });
      }
    }
  );

  // Handle category change event
  socket.on(
    "categoryChanged",
    (data: { roomId: string; newCategory: string; newTopic?: string }) => {
      try {
        const room = quizRooms.get(data.roomId);
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Update the room with category information
        room.selectedCategory = data.newCategory;
        room.selectedTopic = data.newTopic || data.newCategory;

        // Broadcast the category change to all players in the room
        io.to(data.roomId).emit("categoryChanged", {
          roomId: data.roomId,
          newCategory: data.newCategory,
          newTopic: data.newTopic || data.newCategory,
        });

        // Also update all clients with the updated room state
        io.to(data.roomId).emit("room-state-updated", { room });
      } catch (err) {
        console.error("Error handling categoryChanged event:", err);
        socket.emit("error", {
          message: "Server error processing category change",
        });
      }
    }
  );

  // Handle loading state changes
  socket.on(
    "loading-state-changed",
    (data: { roomId: string; isLoading: boolean }) => {
      const room = quizRooms.get(data.roomId);
      if (room) {
        io.to(data.roomId).emit("loading-state-changed", {
          roomId: data.roomId,
          isLoading: data.isLoading,
        });
      }
    }
  );

  // Handle countdown state changes
  socket.on(
    "countdown-state-changed",
    (data: { roomId: string; showCountdown: boolean }) => {
      const room = quizRooms.get(data.roomId);
      if (room) {
        io.to(data.roomId).emit("countdown-state-changed", {
          roomId: data.roomId,
          showCountdown: data.showCountdown,
        });
      }
    }
  );

  socket.on("next-question", (data: { roomId: string }) => {
    const room = quizRooms.get(data.roomId);
    if (!room) {
      return;
    }
    // Allow any player to request next question (not just host)
    if (!room.questions || room.currentQuestion === undefined) {
      return;
    }
    // We always proceed to next question regardless of answers
    // This ensures that even if there's any issue with tracking answers, the game will still progress when a player requests the next question
    if (room.currentQuestion < room.questions.length - 1) {
      // Increment the question index
      const nextQuestionIndex = room.currentQuestion + 1;
      room.currentQuestion = nextQuestionIndex;

      const question = room.questions[nextQuestionIndex];

      // First emit the next-question event to signal clients to prepare
      io.to(data.roomId).emit("next-question");

      // Then emit the actual question content
      io.to(data.roomId).emit("question", {
        question,
        questionNumber: nextQuestionIndex + 1,
        totalQuestions: room.questions.length,
      });
    } else if (room.currentQuestion === room.questions.length - 1) {
      // Send initial results that will be updated as players submit their final scores
      io.to(data.roomId).emit("game-results", {
        finalScores: room.players.sort((a, b) => b.score - a.score),
      });
    }
  });

  // Player answer
  socket.on(
    "submit-answer",
    (data: {
      roomId: string;
      playerId: string;
      answer: string;
      timeRemaining: number;
    }) => {
      const room = quizRooms.get(data.roomId);
      if (!room || !room.questions || room.currentQuestion === undefined)
        return;

      const player = room.players.find((p) => p.id === data.playerId);
      if (!player) return;

      const currentQ = room.questions[room.currentQuestion];
      const isCorrect = data.answer === currentQ.correctAnswer;

      // Track that this player has answered the current question
      if (!player.answers) {
        player.answers = [];
      }

      player.answers.push({
        questionId: currentQ.id || `q${room.currentQuestion}`,
        answer: data.answer,
        timeRemaining: data.timeRemaining,
        isCorrect,
        pointsEarned: 0, // We'll update this when final scores are submitted
      });

      // Check if all players have answered
      const allPlayersAnswered = room.players.every(
        (p) =>
          p.answers &&
          p.answers.some(
            (a) => a.questionId === (currentQ.id || `q${room.currentQuestion}`)
          )
      );

      // Notify everyone about the player's answer
      io.to(data.roomId).emit("player-answered", {
        playerId: data.playerId,
        playerName: player.name,
        isCorrect,
        currentScores: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          // No score field here since we'll get the final scores at the end
        })),
      });

      // If all players have answered, automatically move to next question after delay
      if (
        allPlayersAnswered &&
        room.currentQuestion !== undefined &&
        room.questions &&
        room.currentQuestion < room.questions.length - 1
      ) {
        setTimeout(() => {
          // Reuse the next-question event handler logic to avoid duplication
          // The server handles moving to the next question through this event
          socket.emit("next-question", { roomId: data.roomId });
        }, 3000); // 3 seconds delay before next question
      }
    }
  );

  // Submit game results
  socket.on(
    "submit-game-results",
    (data: {
      roomId: string;
      playerId: string;
      playerName: string;
      gamePoints: {
        score: number;
        timePoints: number;
        perfectGame: number;
        total: number;
        chosenCorrect: number;
        totalAnswers: number;
      };
    }) => {
      const room = quizRooms.get(data.roomId);
      if (!room) return;

      const player = room.players.find((p) => p.id === data.playerId);
      if (player) {
        // Store the detailed game points
        player.gamePoints = data.gamePoints;
        // Update the player's score (used for sorting)
        player.score = data.gamePoints.total;

        // Broadcast updated results to all players in the room with sorted scores
        io.to(data.roomId).emit("game-results", {
          finalScores: [...room.players].sort(
            (a, b) => (b.gamePoints?.total || 0) - (a.gamePoints?.total || 0)
          ),
        });
      }
    }
  );

  // Get game results
  socket.on("get-game-results", (data: { roomId: string }) => {
    const room = quizRooms.get(data.roomId);
    if (room) {
      // Sort players by their total score in descending order for consistency with submit-game-results
      socket.emit("game-results", {
        finalScores: [...room.players].sort(
          (a, b) =>
            (b.gamePoints?.total || b.score || 0) -
            (a.gamePoints?.total || a.score || 0)
        ),
      });
    }
  });

  // Leave room
  socket.on("leave-room", (data: { roomId: string; playerId: string }) => {
    leaveRoom(socket, data.roomId, data.playerId);
  });

  // ========== CHAT FUNCTIONALITY ==========

  // Send chat message
  socket.on("send-chat-message", (data: SendChatMessageData) => {
    const room = quizRooms.get(data.roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    // Find the player
    const player = room.players.find((p) => p.id === data.playerId);
    if (!player) {
      socket.emit("error", { message: "Player not found in room" });
      return;
    }

    // Validate message
    if (!data.message || data.message.trim().length === 0) {
      socket.emit("error", { message: "Message cannot be empty" });
      return;
    }

    // Limit message length
    if (data.message.length > 500) {
      socket.emit("error", { message: "Message too long" });
      return;
    }

    // Create chat message
    const chatMessage: ChatMessage = {
      id: generateMessageId(),
      roomId: data.roomId,
      playerId: data.playerId,
      playerName: player.name,
      message: data.message.trim(),
      timestamp: new Date(),
    };

    // Initialize chatMessages if not exists
    if (!room.chatMessages) {
      room.chatMessages = [];
    }

    // Add to room's chat history (keep last 50 messages)
    room.chatMessages.push(chatMessage);
    if (room.chatMessages.length > 50) {
      room.chatMessages.shift(); // Remove oldest message
    }

    // Broadcast message to all players in the room
    io.to(data.roomId).emit("chat-message-received", {
      id: chatMessage.id,
      playerId: chatMessage.playerId,
      playerName: chatMessage.playerName,
      message: chatMessage.message,
      timestamp: chatMessage.timestamp,
    });
  });

  // Player typing status
  socket.on("player-typing", (data: PlayerTypingData) => {
    const room = quizRooms.get(data.roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    // Find the player
    const player = room.players.find((p) => p.id === data.playerId);
    if (!player) {
      socket.emit("error", { message: "Player not found in room" });
      return;
    }

    // Initialize typingPlayers if not exists
    if (!room.typingPlayers) {
      room.typingPlayers = new Set();
    }

    // Update typing status
    if (data.isTyping) {
      room.typingPlayers.add(data.playerId);
    } else {
      room.typingPlayers.delete(data.playerId);
    }

    // Broadcast typing status to other players (not the sender)
    socket.to(data.roomId).emit("player-typing-status", {
      playerId: data.playerId,
      playerName: player.name,
      isTyping: data.isTyping,
    });
  });

  // ========== END CHAT FUNCTIONALITY ==========

  // Disconnect
  socket.on("disconnect", () => {
    try {
      console.log(`User disconnected: ${socket.id}`);

      // Remove from online users map
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
        }
      }

      // Find and remove player from all rooms
      for (const [roomId, room] of quizRooms.entries()) {
        const playerIndex = room.players.findIndex(
          (p) => p.socketId === socket.id
        );
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          leaveRoom(socket, roomId, player.id);
          break;
        }
      }
    } catch (error) {
      console.error("Error in disconnect handler:", error);
    }
  });
});
// =======================

// Helper functions
function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function leaveRoom(socket: any, roomId: string, playerId: string) {
  const room = quizRooms.get(roomId);
  if (!room) return;

  const playerIndex = room.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return;

  const player = room.players[playerIndex];

  // Remove from typing players if they were typing (chat functionality)
  if (room.typingPlayers) {
    room.typingPlayers.delete(playerId);
  }

  room.players.splice(playerIndex, 1);
  socket.leave(roomId);

  // If this was the host and there are other players in the room
  if (player.id === room.host && room.players.length > 0) {
    // Transfer host to the next player
    room.host = room.players[0].id;
    room.hostSocketId = room.players[0].socketId;
    io.to(roomId).emit("host-changed", { newHost: room.players[0] });
  }

  // If room is empty, delete it
  if (room.players.length === 0) {
    quizRooms.delete(roomId);
    // Clean up answer tracking for this room
    roomAnswerTracking.delete(roomId);
    console.log(`Room ${roomId} deleted`);
  } else {
    // Notify other players
    io.to(roomId).emit("player-left", {
      playerId: player.id,
      playerName: player.name,
      room: room,
    });
  }
}

// ==========Database Setup========
const startDatabase = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

// ==========Socket.IO Server Setup========
const startSocketServer = async () => {
  try {
    // Pass rooms reference to routes
    setRoomsReference(quizRooms);

    return new Promise((resolve, reject) => {
      const server = httpServer.listen(port, () => {
        console.log("Socket.IO Server running on port:", port);
        resolve(server);
      });

      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          const newPort = Number(port) + 1;
          httpServer.listen(newPort, () => {
            console.log("Socket.IO Server running on port:", newPort);
            resolve(server);
          });
        } else {
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error("Failed to start Socket.IO server:", error);
    process.exit(1);
  }
};

// ==========Main Server Startup========
const startServer = async () => {
  try {
    // Start database connection
    await startDatabase();

    // Start Socket.IO server
    await startSocketServer();

    console.log("All services started successfully");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
