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
import {
  ChatMessage,
  SendChatMessageData,
  PlayerTypingData,
  ChatMessageReceivedData,
  PlayerTypingStatusData,
  QuizRoom, Player
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
app.get("/", (req, res) => {
  res.send("API is running...");
});
// ======Socket.IO Server Setup======

// Room storage (in production, better to use Redis)
const quizRooms = new Map<string, QuizRoom>();

// Socket.IO handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

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
      console.log(`Room created: ${roomId} by host ${data.hostName}`);
    }
  );

  // Join room
  socket.on(
    "join-room",
    (data: { roomId: string; playerId: string; playerName: string; language?: string }) => {
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
      console.log(`${data.playerName} joined room ${data.roomId}`);
    }
  );

  // Rejoin room (for users returning from another screen)
  socket.on(
    "rejoin-room",
    (data: { roomId: string; playerId: string; playerName: string; language?: string }) => {
      console.log(`Rejoin room request: ${data.playerId} wants to rejoin ${data.roomId}`);
      const room = quizRooms.get(data.roomId);

      if (!room) {
        console.log(`Room ${data.roomId} not found for rejoin`);
        socket.emit("error", { message: "Room not found" });
        return;
      }

      console.log(`Room ${data.roomId} current players:`, room.players.map(p => ({ id: p.id, name: p.name, language: p.language })));

      // Check if player is already in the room
      const existingPlayer = room.players.find((p) => p.id === data.playerId);
      if (existingPlayer) {
        console.log(`Player ${data.playerId} found in room, updating socket ID and language`);
        // Update the socket ID and language for the existing player
        existingPlayer.socketId = socket.id;
        if (data.language) {
          existingPlayer.language = data.language;
        }
        
        // Join the socket room
        socket.join(data.roomId);

        // Update host socket ID if this player is the host
        if (room.host === data.playerId) {
          console.log(`Updating host socket ID for ${data.playerId}`);
          room.hostSocketId = socket.id;
        }

        console.log(`Sending room state to rejoining player. Room has ${room.players.length} players`);
        room.players.forEach((p, index) => {
          console.log(`Player ${index + 1}: ${p.name}, Language: ${p.language}, ID: ${p.id}`);
        });

        // Send current room state to rejoining player
        socket.emit("room-joined", { room });
        
        // Notify all players about the updated room state
        io.to(data.roomId).emit("player-rejoined", {
          player: existingPlayer,
          room: room,
        });

        console.log(`${data.playerName} rejoined room ${data.roomId}`);
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
        console.log(`${data.playerName} joined room ${data.roomId} (via rejoin)`);
      }
    }
  );

  // Get current room state
  socket.on("get-room-state", (data: { roomId: string }) => {
    console.log(`Room state request for room ${data.roomId}`);
    const room = quizRooms.get(data.roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    console.log(`Sending room state for ${data.roomId} with ${room.players.length} players`);
    room.players.forEach((p, index) => {
      console.log(`Player ${index + 1}: ${p.name}, Language: ${p.language}, ID: ${p.id}`);
    });

    // Send current room state
    socket.emit("room-state-updated", { room });
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
    console.log(
      `Start game request for room ${data.roomId} from socket ${socket.id}`
    );
    const room = quizRooms.get(data.roomId);

    if (!room) {
      console.log(`Room ${data.roomId} not found`);
      socket.emit("error", { message: "Room not found" });
      return;
    }

    console.log(
      `Room host: ${room.hostSocketId}, requesting socket: ${socket.id}`
    );
    if (room.hostSocketId !== socket.id) {
      console.log(
        `Only host can start game. Host: ${room.hostSocketId}, Socket: ${socket.id}`
      );
      socket.emit("error", { message: "Only host can start game" });
      return;
    }

    // Check that all players are ready
    // IMPORTANT TODO: May be deleted, don't need this currently
    // const allReady = room.players.every((p) => p.isReady);
    // console.log(`All players ready: ${allReady}`);
    // if (!allReady) {
    //   socket.emit("error", { message: "Not all players are ready" });
    //   return;
    // }

    room.isStarted = true;
    room.currentQuestion = 0;
    room.questions = data.questions;

    console.log(
      `Emitting game-started to room ${data.roomId} with ${room.players.length} players`
    );
    io.to(data.roomId).emit("game-started", { room, questions: data.questions });
    console.log(`Game started in room ${data.roomId}`);
  });

  // Admin selected topic and questions are ready
  socket.on("questions-ready", (data: { roomId: string }) => {
    const room = quizRooms.get(data.roomId);
    if (!room || room.hostSocketId !== socket.id) return;

    // Notify all players that admin has selected topic and they should see StartQuizScreen
    io.to(data.roomId).emit("show-start-quiz", { room });
    console.log(
      `Questions ready in room ${data.roomId}, showing StartQuizScreen to all players`
    );
  });

  // Sync quiz settings from host to all players
  socket.on("sync-quiz-settings", (data: { roomId: string; quizSettings: any }) => {
    const room = quizRooms.get(data.roomId);
    if (!room || room.hostSocketId !== socket.id) {
      console.log(`Unauthorized quiz settings sync attempt from non-host: ${socket.id}`);
      return;
    }
    
    console.log(`Quiz settings synced from host in room ${data.roomId}:`, data.quizSettings);
    // Send quiz settings to all players in the room
    io.to(data.roomId).emit("quiz-settings-sync", { quizSettings: data.quizSettings });
  });

  // Send next question
  socket.on("next-question", (data: { roomId: string }) => {
    const room = quizRooms.get(data.roomId);
    if (!room) {
      console.log(`Room ${data.roomId} not found`);
      return;
    }
    
    // Allow any player to request next question (not just host)
    console.log(`Next question request received for room ${data.roomId}`);

    if (!room.questions || room.currentQuestion === undefined) {
      console.log(`Room ${data.roomId} has no questions or currentQuestion is undefined`);
      return;
    }

    // We always proceed to next question regardless of answers
    // This ensures that even if there's any issue with tracking answers, the game will still progress when a player requests the next question
    console.log(`Current question: ${room.currentQuestion}, Total questions: ${room.questions.length}`);
      
    if (room.currentQuestion < room.questions.length - 1) {
      // Increment the question index
      const nextQuestionIndex = room.currentQuestion + 1;
      room.currentQuestion = nextQuestionIndex;
      
      const question = room.questions[nextQuestionIndex];
      console.log(`Sending question ${nextQuestionIndex + 1} to room ${data.roomId}`);
      
      // First emit the next-question event to signal clients to prepare
      io.to(data.roomId).emit("next-question");
      
      // Then emit the actual question content
      io.to(data.roomId).emit("question", {
        question,
        questionNumber: nextQuestionIndex + 1,
        totalQuestions: room.questions.length,
      });
    } else if (room.currentQuestion === room.questions.length - 1) {
      // This was the last question, game ended
      console.log(`Game ended in room ${data.roomId}`);
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
      const allPlayersAnswered = room.players.every(p => 
        p.answers && p.answers.some(a => 
          a.questionId === (currentQ.id || `q${room.currentQuestion}`)));

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
      if (allPlayersAnswered && 
          room.currentQuestion !== undefined && 
          room.questions && 
          room.currentQuestion < room.questions.length - 1) {
        setTimeout(() => {
          console.log(`All players answered in room ${data.roomId}, auto-advancing to next question`);
          
          // Reuse the next-question event handler logic to avoid duplication
          // The server handles moving to the next question through this event
          socket.emit("next-question", { roomId: data.roomId });
        }, 3000); // 3 seconds delay before next question
      }
    }
  );

  // Submit game results
  socket.on("submit-game-results", (data: { 
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
    }
  }) => {
    const room = quizRooms.get(data.roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === data.playerId);
    if (player) {
      // Store the detailed game points
      player.gamePoints = data.gamePoints;
      // Update the player's score (used for sorting)
      player.score = data.gamePoints.total;

      // Broadcast updated results to all players in the room with sorted scores
      io.to(data.roomId).emit("game-results", {
        finalScores: [...room.players].sort((a, b) => (b.gamePoints?.total || 0) - (a.gamePoints?.total || 0))
      });
    }
  });

  // Get game results
  socket.on("get-game-results", (data: { roomId: string }) => {
    const room = quizRooms.get(data.roomId);
    if (room) {
      // Sort players by their total score in descending order for consistency with submit-game-results
      socket.emit("game-results", {
        finalScores: [...room.players].sort((a, b) => (b.gamePoints?.total || b.score || 0) - (a.gamePoints?.total || a.score || 0))
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

    console.log(
      `Chat message from ${player.name} in room ${data.roomId}: ${data.message}`
    );
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

    console.log(
      `${player.name} is ${
        data.isTyping ? "typing" : "stopped typing"
      } in room ${data.roomId}`
    );
  });

  // ========== END CHAT FUNCTIONALITY ==========

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

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
  });
});

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
    console.log(`Room ${roomId} deleted`);
  } else {
    // Notify other players
    io.to(roomId).emit("player-left", {
      playerId: player.id,
      playerName: player.name,
      room: room,
    });
  }

  console.log(`${player.name} left room ${roomId}`);
}

// ==========Database Setup========
const startDatabase = async () => {
  try {
    await connectDB();
    console.log("Database connected successfully");
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
          console.log(
            `Port ${port} is busy, trying port ${Number(port) + 1}...`
          );
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
