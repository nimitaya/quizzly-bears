import express, { Request, Response } from "express";
import { User, IUser } from "../models/User";

const pointsRouter = express.Router();

const sendPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clerkUserId, totalPoints, correctAnswers, totalAnswers, category } =
      req.body;

    // Validate required fields
    if (
      !clerkUserId ||
      totalPoints === undefined ||
      correctAnswers === undefined ||
      totalAnswers === undefined ||
      !category
    ) {
      res.status(400).json({
        error:
          "ClerkUserId, totalPoints, correctAnswers, totalAnswers and category are required",
      });
      return;
    }

    // Validate that the numbers are non-negative
    if (totalPoints < 0 || correctAnswers < 0 || totalAnswers < 0) {
      res.status(400).json({
        error: "Points and answer counts must be non-negative numbers",
      });
      return;
    }

    // Validate that correctAnswers <= totalAnswers
    if (correctAnswers > totalAnswers) {
      res.status(400).json({
        error: "Correct answers cannot exceed total answers",
      });
      return;
    }

    // Find current user
    const user = (await User.findOne({ clerkUserId })) as IUser;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Update user's total points and answer statistics
    user.points.totalPoints += totalPoints;
    user.points.correctAnswers += correctAnswers;
    user.points.totalAnswers += totalAnswers;

    // Find and update the specific category statistics
    const categoryIndex = user.categoryStats.findIndex(
      (stat) => stat.categoryName === category
    );

    if (categoryIndex !== -1) {
      // Category exists, update it
      user.categoryStats[categoryIndex].correctAnswers += correctAnswers;
      user.categoryStats[categoryIndex].totalAnswers += totalAnswers;
    } else {
      // Category doesn't exist, add it (though this shouldn't happen with default categories)
      user.categoryStats.push({
        categoryName: category,
        correctAnswers: correctAnswers,
        totalAnswers: totalAnswers,
      });
    }

    // Save the updated user
    await user.save();

    // Return success response with updated data
    res.status(200).json({
      message: "Points updated successfully",
      data: {
        totalPoints: user.points.totalPoints,
        correctAnswers: user.points.correctAnswers,
        totalAnswers: user.points.totalAnswers,
        categoryStats: user.categoryStats.find(
          (stat) => stat.categoryName === category
        ),
      },
    });
  } catch (error) {
    console.error("Error updating points:", error);
    res.status(500).json({
      error: "Internal server error while updating points",
    });
  }
};

pointsRouter.post("/send", sendPoints);

export default pointsRouter;
