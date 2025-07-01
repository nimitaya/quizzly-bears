import express, { Router, Request, Response } from "express";
import { User } from "../models/User";
import { Webhook } from "svix";

const router = Router();

router.post("/clerk-webhook", async (req: Request, res: Response) => {
  console.log("Webhook received:", req.body);

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
      console.log("User deleted:", clerkUser.id);

      await User.findOneAndDelete({ clerkUserId: clerkUser.id });
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Webhook processing error" });
  }
});

export default router;
