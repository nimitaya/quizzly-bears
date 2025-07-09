import { Request, Response } from "express";
import { User, IUser } from "../models/User";
import { FriendRequest, IFriendRequest } from "../models/FriendRequest";
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
    const requestingUser = (await User.findOne({ clerkUserId })) as IUser;
    if (!requestingUser) {
      res.status(404).json({ error: "Requesting user not found" });
      return;
    }

    // Find user by email (exclude the requesting user)
    const user = (await User.findOne({
      email: email.toString().toLowerCase(),
      _id: { $ne: requestingUser._id },
    }).select("email bearPawIcon")) as IUser;

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if already friends
    const isAlreadyFriend = requestingUser.friends.some(
      (friendId) => friendId.toString() === user._id.toString()
    );
    if (isAlreadyFriend) {
      res.status(400).json({ error: "Already friends with this user" });
      return;
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: requestingUser._id, to: user._id },
        { from: user._id, to: requestingUser._id },
      ],
      status: "pending",
    });

    if (existingRequest) {
      res.status(400).json({ error: "Friend request already exists" });
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

// ==================== Send friend request ====================
export const sendRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId, targetUserId } = req.body;

    if (!clerkUserId || !targetUserId) {
      res
        .status(400)
        .json({ error: "clerkUserId and targetUserId are required" });
      return;
    }

    // Find the requesting user
    const requestingUser = (await User.findOne({ clerkUserId })) as IUser;
    if (!requestingUser) {
      res.status(404).json({ error: "Requesting user not found" });
      return;
    }

    // Find the target user
    const targetUser = (await User.findById(targetUserId)) as IUser;
    if (!targetUser) {
      res.status(404).json({ error: "Target user not found" });
      return;
    }

    // Check if trying to send request to self
    if (requestingUser._id.toString() === targetUser._id.toString()) {
      res.status(400).json({ error: "Cannot send friend request to yourself" });
      return;
    }

    // Check if already friends
    const isAlreadyFriend = requestingUser.friends.some(
      (friendId) => friendId.toString() === targetUser._id.toString()
    );
    if (isAlreadyFriend) {
      res.status(400).json({ error: "Already friends with this user" });
      return;
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { from: requestingUser._id, to: targetUser._id },
        { from: targetUser._id, to: requestingUser._id },
      ],
      status: "pending",
    });

    if (existingRequest) {
      res.status(400).json({ error: "Friend request already exists" });
      return;
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      from: requestingUser._id,
      to: targetUser._id,
      status: "pending",
    });

    // Save request to database
    await friendRequest.save();
    // Add friend request to target user's friendRequests array
    await User.findByIdAndUpdate(targetUser._id, {
      $push: { friendRequests: friendRequest._id },
    });

    // Emit event to notify the target user about the new friend request
    io.emit("friendRequestSent", {
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
      status: friendRequest.status,
      createdAt: friendRequest.createdAt,
    });

    // TODO: Send push notification to target user

    // ----- Response -----
    res.status(201).json({
      message: "Friend request sent successfully",
      friendRequest: {
        _id: friendRequest._id,
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
        status: friendRequest.status,
        createdAt: friendRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Get received friend requests ====================
export const getReceivedRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId } = req.query;

    if (!clerkUserId) {
      res.status(400).json({ error: "clerkUserId is required" });
      return;
    }

    // Find received friend requests for user
    const user = await User.findOne({ clerkUserId }).populate({
      path: "friendRequests",
      match: { status: "pending" },
      populate: {
        path: "from",
        select: "username email bearPawIcon",
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // ----- Response -----
    res.json({ friendRequests: user.friendRequests });
  } catch (error) {
    console.error("Error getting friend requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Get sent friend requests ====================
export const getSentRequests = async (
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
    const user = (await User.findOne({ clerkUserId })) as IUser;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find sent & pending friend requests by user
    const sentRequests = await FriendRequest.find({
      from: user._id,
      status: "pending",
    }).populate("to", "username email bearPawIcon");

    // ----- Response -----
    res.json({ friendRequests: sentRequests });
  } catch (error) {
    console.error("Error getting sent friend requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Accept friend request ====================
export const acceptRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId, friendRequestId } = req.body;

    if (!clerkUserId || !friendRequestId) {
      res
        .status(400)
        .json({ error: "clerkUserId and friendRequestId are required" });
      return;
    }

    // Find current user
    const user = (await User.findOne({ clerkUserId })) as IUser;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find the friend request user wants to accept
    const friendRequest = (await FriendRequest.findById(
      friendRequestId
    ).populate("from to")) as IFriendRequest;
    if (!friendRequest) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }

    // Verify that the current user is the recipient
    if (friendRequest.to._id.toString() !== user._id.toString()) {
      res.status(403).json({ error: "Not authorized to accept this request" });
      return;
    }

    // Verify that the request is pending
    if (friendRequest.status !== "pending") {
      res.status(400).json({ error: "Friend request is not pending" });
      return;
    }

    // Update friend request status
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user to the other's friends list
    await User.findByIdAndUpdate(friendRequest.from._id, {
      $push: { friends: friendRequest.to._id },
    });

    await User.findByIdAndUpdate(friendRequest.to._id, {
      $push: { friends: friendRequest.from._id },
    });

    // Remove friend request from user's friendRequests array
    await User.findByIdAndUpdate(user._id, {
      $pull: { friendRequests: friendRequestId },
    });

    // Emit event to notify both users about the accepted friend request
    io.emit("friendRequestAccepted", {
      from: friendRequest.from,
      to: friendRequest.to,
    });

    // TODO: Send push notification to the requester?

    // ----- Response -----
    res.json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Decline friend request ====================
export const declineRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkUserId, friendRequestId } = req.body;

    if (!clerkUserId || !friendRequestId) {
      res
        .status(400)
        .json({ error: "clerkUserId and friendRequestId are required" });
      return;
    }

    // Find current user
    const user = (await User.findOne({ clerkUserId })) as IUser;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find the request user want to decline
    const friendRequest = (await FriendRequest.findById(
      friendRequestId
    )) as IFriendRequest;
    if (!friendRequest) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }

    // Verify that the current user is the recipient
    if (friendRequest.to.toString() !== user._id.toString()) {
      res.status(403).json({ error: "Not authorized to decline this request" });
      return;
    }

    // Verify that the request is pending
    if (friendRequest.status !== "pending") {
      res.status(400).json({ error: "Friend request is not pending" });
      return;
    }

    // Remove friend request from friend request collection
    await FriendRequest.findByIdAndDelete(friendRequestId);

    // Remove friend request from user's friendRequests array
    await User.findByIdAndUpdate(user._id, {
      $pull: { friendRequests: friendRequestId },
    });

    // Emit event to notify the requester about the declined friend request
    io.emit("friendRequestDeclined", {
      from: friendRequest.from,
      to: friendRequest.to,
    });

    // ----- Response -----
    res.json({ message: "Friend request declined successfully" });
  } catch (error) {
    console.error("Error declining friend request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Get user's friends list ====================
export const getFriendList = async (
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
    const user = await User.findOne({ clerkUserId }).populate(
      "friends",
      "username email bearPawIcon points.totalPoints clerkUserId"
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // ----- Response -----
    res.json({ friends: user.friends });
  } catch (error) {
    console.error("Error getting friends:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ==================== Remove friend ====================
export const removeFriend = async (
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
    const user = (await User.findOne({ clerkUserId })) as IUser;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find friend
    const friend = (await User.findById(friendId)) as IUser;
    if (!friend) {
      res.status(404).json({ error: "Friend not found" });
      return;
    }

    // Remove each user from the other's friends list
    await User.findByIdAndUpdate(user._id, { $pull: { friends: friendId } });

    await User.findByIdAndUpdate(friendId, { $pull: { friends: user._id } });

    // Delete the accepted friend request that created this friendship
    await FriendRequest.findOneAndDelete({
      $or: [
        { from: user._id, to: friendId, status: "accepted" },
        { from: friendId, to: user._id, status: "accepted" },
      ],
    });

    // Emit event to notify both users about the removed friendship
    io.emit("friendRemoved", {
      user: user._id,
      friend: friend._id,
    });

    // ----- Response -----
    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
