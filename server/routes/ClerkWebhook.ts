import express, { Router, Request, Response } from "express";
import { User } from "../models/User";
import { FriendRequest } from "../models/FriendRequest";
import { InviteRequest } from "../models/InviteRequests";
import { Webhook } from "svix";
import { io } from "../server";

declare global {
  var io: any;
}

const router = Router();

router.post("/clerk-webhook", async (req: Request, res: Response) => {
  (global as any).io = io;
  const event = req.body;
  const clerkUser = event.data;
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

  const headers = req.headers;
  const payload = JSON.stringify(req.body);
  const svix_id = headers["svix-id"] as string;
  const svix_timestamp = headers["svix-timestamp"] as string;
  const svix_signature = headers["svix-signature"] as string;

  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  try {
    if (event.type === "user.created") {
      await User.create({
        clerkUserId: clerkUser.id,
        email: clerkUser.email_addresses?.[0]?.email_address,
        username: clerkUser.username || undefined,
      });
      return res.status(200).json({ success: true });
    }

    if (event.type === "user.deleted") {
      // First, find the user so we have their MongoDB _id
      const deletedUser = await User.findOne({ clerkUserId: clerkUser.id });

      if (!deletedUser) {
        return res.status(200).json({ message: "No user found to delete" });
      }

      const userId = deletedUser._id;

      // Clean up tasks in parallel for better performance
      const cleanupTasks = [
        // 1. Remove user from friends lists of all users
        User.updateMany(
          { friends: userId },
          { $pull: { friends: userId } }
        ).then((result) => {}),

        // 2. Delete all friend requests involving this user
        FriendRequest.deleteMany({
          $or: [{ senderId: userId }, { recipientId: userId }],
        }).then((result) => {}),

        // 3. Delete all invite requests involving this user
        InviteRequest.deleteMany({
          $or: [{ senderId: userId }, { recipientId: userId }],
        }).then((result: { deletedCount?: number }) => {}),

        // 5. Finally delete the user
        User.findByIdAndDelete(userId).then(() => {}),
      ];

      // Wait for all cleanup tasks to complete
      await Promise.all(cleanupTasks);

      // If you have a socket server set up, notify all clients
      if (global.io) {
        global.io.emit("user-deleted", {
          userId: userId.toString(),
          clerkUserId: clerkUser.id,
        });
      }

      return res.status(200).json({
        success: true,
        message: "User and all related data deleted successfully",
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Webhook processing error" });
  }
});

export default router;
