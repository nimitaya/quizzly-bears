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

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify concrete domains
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/api/clerk-webhook", cors());
app.use("/api", clerkWebhookRouter);
app.use("/api/friend-request", friendRequestRouter);
app.use("/api/invite-request", invitationsRouter)
app.use("/api/quiz", quizRoomsRouter);
app.use("/api", userRoutes);
app.use("/api/points", pointsRouter);
app.get("/", (req, res) => {
  res.send("API is running...");
});
// ==========NEW=======================Socket.IO Server Setup========
// Types for quiz rooms
interface QuizRoom {
  id: string;
  name: string;
  host: string;
  hostSocketId: string;
  players: Player[];
  maxPlayers: number;
  isStarted: boolean;
  currentQuestion?: number;
  questions?: any[];
  settings: {
    questionCount: number;
    timePerQuestion: number;
    categories: string[];
  };
}

interface Player {
  id: string;
  name: string;
  socketId: string;
  score: number;
  isReady: boolean;
}

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
          },
        ],
        maxPlayers: 6,
        isStarted: false,
        settings: data.settings,
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
    (data: { roomId: string; playerId: string; playerName: string }) => {
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
    const allReady = room.players.every((p) => p.isReady);
    console.log(`All players ready: ${allReady}`);
    if (!allReady) {
      socket.emit("error", { message: "Not all players are ready" });
      return;
    }

    room.isStarted = true;
    room.currentQuestion = 0;
    room.questions = data.questions;

    console.log(
      `Emitting game-started to room ${data.roomId} with ${room.players.length} players`
    );
    io.to(data.roomId).emit("game-started", { room });
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

  // Send next question
  socket.on("next-question", (data: { roomId: string }) => {
    const room = quizRooms.get(data.roomId);
    if (!room || room.hostSocketId !== socket.id) return;

    if (!room.questions || room.currentQuestion === undefined) return;

    if (room.currentQuestion < room.questions.length) {
      const question = room.questions[room.currentQuestion];
      io.to(data.roomId).emit("question", {
        question,
        questionNumber: room.currentQuestion + 1,
        totalQuestions: room.questions.length,
      });
    } else {
      // Game ended
      io.to(data.roomId).emit("game-ended", {
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

      if (isCorrect) {
        // Award points (more for quick answer)
        const timeBonus = Math.floor(data.timeRemaining / 1000);
        player.score += 100 + timeBonus;
      }

      // Notify everyone about the player's answer
      io.to(data.roomId).emit("player-answered", {
        playerId: data.playerId,
        playerName: player.name,
        isCorrect,
        currentScores: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          score: p.score,
        })),
      });
    }
  );

  // Leave room
  socket.on("leave-room", (data: { roomId: string; playerId: string }) => {
    leaveRoom(socket, data.roomId, data.playerId);
  });

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

function leaveRoom(socket: any, roomId: string, playerId: string) {
  const room = quizRooms.get(roomId);
  if (!room) return;

  const playerIndex = room.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return;

  const player = room.players[playerIndex];
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
