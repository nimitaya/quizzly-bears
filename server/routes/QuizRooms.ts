import { Router } from "express";

const router = Router();

// Since we don't have direct access to quizRooms,
// we will pass a reference to the Map through a function parameter
let roomsRef: Map<string, any> | null = null;

export const setRoomsReference = (rooms: Map<string, any>) => {
  roomsRef = rooms;
};

// Get all active rooms
router.get("/rooms", (req, res) => {
  if (!roomsRef) {
    return res.status(500).json({ message: "Rooms reference not set" });
  }

  const rooms = Array.from(roomsRef.values()).map((room) => ({
    id: room.id,
    name: room.name,
    playerCount: room.players.length,
    maxPlayers: room.maxPlayers,
    isStarted: room.isStarted,
    host: room.players.find((p: any) => p.id === room.host)?.name || "Unknown",
  }));

  res.json({ rooms });
});

// Get information about a specific room
router.get("/rooms/:roomId", (req, res) => {
  if (!roomsRef) {
    return res.status(500).json({ message: "Rooms reference not set" });
  }

  const room = roomsRef.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  res.json({ room });
});

// Check if the room exists
router.get("/rooms/:roomId/exists", (req, res) => {
  if (!roomsRef) {
    return res.status(500).json({ message: "Rooms reference not set" });
  }

  const exists = roomsRef.has(req.params.roomId);
  res.json({ exists });
});

export default router;
