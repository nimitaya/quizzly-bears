import express, { Router, Request, Response } from "express";
import { User } from "../models/User";
import { Webhook } from "svix";

const router = Router();

router.post("/clerk-webhook", async (req: Request, res: Response) => {
  console.log("Webhook received:", req.body);

  const event = req.body;

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

  if (event.type === "user.created") {
    const clerkUser = event.data;

    try {
      await User.create({
        clerkUserId: clerkUser.id,
        email: clerkUser.email_addresses?.[0]?.email_address,
        username: clerkUser.username || undefined,
        // Add other fields as needed, based on your User model
      });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("User creation error:", err);
      return res.status(500).json({ error: "Failed to create user" });
    }
  }

  res.status(200).json({ received: true });
});

export default router;
