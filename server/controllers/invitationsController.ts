import { Request, Response } from "express";
import { User } from "../models/User";
import {
  InviteRequest,
  IInviteRequestPopulated,
} from "../models/InviteRequests";
import { io } from "../server";

// ==================== Search user by email ====================
export const searchUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // we need the user input email and the current userId
    const { email, clerkUserId } = req.query;

    if (!email || !clerkUserId) {
      res
        .status(400)
        .json({ error: "Email address and current user id is required" });
      return;
    }

    // Find the requesting user
    const requestingUser = await User.findOne({ clerkUserId });
    if (!requestingUser) {
      res.status(404).json({ error: "Requesting user not found" });
      return;
    }

    // Find user by email (exclude the requesting user)
    const user = await User.findOne({
      email: email.toString().toLowerCase(),
      _id: { $ne: requestingUser._id },
    }).select("email bearPawIcon");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if invitation request already exists
    const existingRequest = await InviteRequest.findOne({
      $or: [
        { from: requestingUser._id, to: user._id },
        { from: user._id, to: requestingUser._id },
      ],
      status: "pending",
    });

    if (existingRequest) {
      res.status(400).json({ error: "Invitation already exists" });
      return;
    }

    // ----- Response -----
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bearPawIcon: user.bearPawIcon,
      },
    });
  } catch (error) {
    console.error("Error searching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Send invite request ====================
export const sendInvitationRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId, targetUserId, roomcode } = req.body;

    if (!clerkUserId || !targetUserId) {
      res
        .status(400)
        .json({ error: "clerkUserId and targetUserId are required" });
      return;
    }

    // Find the requesting user
    const requestingUser = await User.findOne({ clerkUserId });
    if (!requestingUser) {
      res.status(404).json({ error: "Requesting user not found" });
      return;
    }

    // Find the target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      res.status(404).json({ error: "Target user not found" });
      return;
    }

    // Check if trying to send request to self
    if (requestingUser._id.toString() === targetUser._id.toString()) {
      res.status(400).json({ error: "Cannot send invitation to yourself" });
      return;
    }

    // Check if invitation request already exists
    const existingRequest = await InviteRequest.findOne({
      $or: [
        { from: requestingUser._id, to: targetUser._id },
        { from: targetUser._id, to: requestingUser._id },
      ],
      status: "pending",
    });

    if (existingRequest) {
      res.status(400).json({ error: "Invitation already exists" });
      return;
    }

    // Create invitation request
    const inviteRequest = new InviteRequest({
      from: requestingUser._id,
      to: targetUser._id,
      roomcode: roomcode,
      status: "pending",
    });

    // Emit event to notify the target user about the new friend request
    io.emit("inviteRequestSent", {
      from: {
        _id: requestingUser._id,
        username: requestingUser.username,
        email: requestingUser.email,
      },
      to: {
        _id: targetUser._id,
        username: targetUser.username,
        email: targetUser.email,
      },
      status: inviteRequest.status,
      createdAt: inviteRequest.createdAt,
    });

    // Save request to database
    await inviteRequest.save();

    // TODO: Send push notification to target user

    // ----- Response -----
    res.status(201).json({
      message: "Invitation sent successfully",
      inviteRequest: {
        _id: inviteRequest._id,
        from: {
          _id: requestingUser._id,
          username: requestingUser.username,
          email: requestingUser.email,
        },
        to: {
          _id: targetUser._id,
          username: targetUser.username,
          email: targetUser.email,
        },
        roomcode: inviteRequest.roomcode,
        status: inviteRequest.status,
        createdAt: inviteRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Get received invite requests ====================
export const getReceivedInvitationRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      res.status(400).json({ error: "clerkUserId is required" });
      return;
    }

    // Find user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find received invitation requests for user
    const currInviteRequests = await InviteRequest.find({
      to: user?._id,
      status: "pending",
    }).populate("from", "username email bearPawIcon");

    // ----- Response -----
    res.json({ inviteRequests: currInviteRequests });
  } catch (error) {
    console.error("Error getting invite requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Get sent invite requests ====================
export const getSentInvitationRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      res.status(400).json({ error: "clerkUserId is required" });
      return;
    }

    // Find current user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find sent invitation requests with pending for user
    const sentRequests = await InviteRequest.find({
      from: user?._id,
      status: "pending",
    }).populate("to", "username email bearPawIcon");

    // ----- Response -----
    res.json({ inviteRequests: sentRequests });
  } catch (error) {
    console.error("Error getting sent friend requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Accept invite request ====================
export const acceptInvitationRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId, inviteRequestId } = req.body;

    if (!clerkUserId || !inviteRequestId) {
      res
        .status(400)
        .json({ error: "clerkUserId and inviteRequestId are required" });
      return;
    }

    // Find current user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find the invite request user wants to accept
    const inviteRequest = (await InviteRequest.findById(
      inviteRequestId
    ).populate("from to")) as IInviteRequestPopulated | null;
    if (!inviteRequest) {
      res.status(404).json({ error: "Invite request not found" });
      return;
    }

    // Verify that the current user is the recipient
    if (inviteRequest.to._id.toString() !== user._id.toString()) {
      res.status(403).json({ error: "Not authorized to accept this request" });
      return;
    }

    // Verify that the request is pending
    if (inviteRequest.status !== "pending") {
      res.status(400).json({ error: "Invite request is not pending" });
      return;
    }

    // Update invite request status
    inviteRequest.status = "accepted";
    await inviteRequest.save();
    // Emit event to notify both users about the accepted friend request
    io.emit("inviteRequestAccepted", {
      from: inviteRequest.from,
      to: inviteRequest.to,
    });

    // ----- Response -----
    res.json({ message: "Invitation accepted successfully" });
  } catch (error) {
    console.error("Error accepting Invitation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Decline invite request ====================
export const declineInvitationRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId, inviteRequestId } = req.body;

    if (!clerkUserId || !inviteRequestId) {
      res
        .status(400)
        .json({ error: "clerkUserId and inviteRequestId are required" });
      return;
    }

    // Find current user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find the request user want to decline
    const inviteRequest = await InviteRequest.findById(inviteRequestId);
    if (!inviteRequest) {
      res.status(404).json({ error: "Invite request not found" });
      return;
    }

    // Verify that the current user is the recipient
    if (inviteRequest.to.toString() !== user._id.toString()) {
      res.status(403).json({ error: "Not authorized to decline this request" });
      return;
    }

    // Verify that the request is pending
    if (inviteRequest.status !== "pending") {
      res.status(400).json({ error: "Invite request is not pending" });
      return;
    }
    // Emit event to notify the requester about the declined friend request
    io.emit("inviteRequestDeclined", {
      inviteId: inviteRequest._id,
      from: inviteRequest.from,
      to: inviteRequest.to,
    });

    // Remove invite request from invite request collection
    await InviteRequest.findByIdAndDelete(inviteRequestId);

    // ----- Response -----
    res.json({ message: "Invite request declined successfully" });
  } catch (error) {
    console.error("Error declining invite request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Get user's accepted invitation list ====================
export const getInvitationList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      res.status(400).json({ error: "clerkUserId is required" });
      return;
    }

    // Find current user and populate friends data
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find sent invitation requests with accepted for user
    const acceptedRequests = await InviteRequest.find({
      from: user?._id,
      status: "accepted",
    }).populate("to", "username email bearPawIcon");

    // ----- Response -----
    res.json({ invites: acceptedRequests });
  } catch (error) {
    console.error("Error getting invites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Remove invite ====================
export const removeInvitation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId, friendId } = req.body;

    if (!clerkUserId || !friendId) {
      res.status(400).json({ error: "clerkUserId and friendId are required" });
      return;
    }

    // Find current user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Delete the accepted invite request that created this invitation
    await InviteRequest.findOneAndDelete({
      from: user?._id,
      to: friendId,
      status: "accepted",
    });

    // Emit event to notify both users about the removed friendship
    io.emit("inviteRemoved", {
      user: user._id,
      friend: friendId,
    });

    // ----- Response -----
    res.json({ message: "Invite removed successfully" });
  } catch (error) {
    console.error("Error removing invite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Remove all invites ====================
export const removeAllInvitations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId } = req.body;

    if (!clerkUserId) {
      res.status(400).json({ error: "clerkUserId is required" });
      return;
    }

    // Find current user
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Delete all accepted invite requests of this user
    const deleteResult = await InviteRequest.deleteMany({
      from: user._id,
      status: "accepted",
    });

    io.emit("allInvitesRemoved", {
      user: user._id,
    });

    // ----- Response -----
    res.json({
      message: "All invites removed successfully",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error removing invite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
