// backend/routes/UserRoutes.ts
import express, { Request, Response } from "express";
import { User } from "../models/User";

const router = express.Router();

// GET /api/users/:clerkUserId
router.get("/users/:clerkUserId", async (req: Request, res: Response) => {
  try {
    const { clerkUserId } = req.params;
    const user = await User.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by Clerk ID:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
