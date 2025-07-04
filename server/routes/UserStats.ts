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
router.put("/users/:clerkId", async (req: Request, res: Response) => {
  const { clerkId } = req.params;
  const { username } = req.body;

  if (!username) return res.status(400).json({ message: "Username required" });

  try {
    const updated = await User.findOneAndUpdate(
      { clerkUserId: clerkId },
      { username },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json(updated);
  } catch (err) {
    console.error("Update username failed", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch(
  "/users/:clerkUserId/settings",
  async (req: Request, res: Response) => {
    const { clerkUserId } = req.params;
    const { music, sounds } = req.body;
    try {
      const updateFields: any = {};
      if (music !== undefined) updateFields["settings.music"] = music;
      if (sounds !== undefined) updateFields["settings.sounds"] = sounds;

      const updatedUser = await User.findOneAndUpdate(
        { clerkUserId },
        updateFields,
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Failed to update settings", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  }
);

router.get("/top-players", async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $project: {
          email: 1,
          username: 1,
          totalPoints: "$points.totalPoints",
          emailName: { $arrayElemAt: [{ $split: ["$email", "@"] }, 0] },
        },
      },
      { $sort: { totalPoints: -1, emailName: 1 } },
    ]);
    const totalUsers = await User.countDocuments();
    const topPlayers = users
      .map((u) => ({
        email: u.email,
        totalPoints: u.totalPoints,
      }))
      .slice(0, 10);

    let userRank = null;
    let currentUsername = null;
    const email = req.query.email as string | undefined;
    if (email) {
      const idx = users.findIndex((u) => u.email === email);
      if (idx !== -1) {
        userRank = idx + 1;
      }
      currentUsername =
        users.find((u) => u.email === req.query.email)?.username || null;
    }
    res.json({
      topPlayers,
      totalUsers,
      userRank,
      currentUsername,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
