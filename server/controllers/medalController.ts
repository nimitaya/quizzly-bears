import { User } from "../models/User";
import { Request, Response } from "express";

export const sendMedal = async (req: Request, res: Response) => {
  try {
    const { clerkUserId, place } = req.body;
    if (!clerkUserId || !place) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // find user by clerkUserId
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Update medals
    if (place === 1) {
      user.medals.gold += 1;
    } else if (place === 2) {
      user.medals.silver += 1;
    } else if (place === 3) {
      user.medals.bronze += 1;
    }
    await user.save();
    return res
      .status(200)
      .json({ message: "Medal updated", data: user.medals });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update medal" });
  }
};
