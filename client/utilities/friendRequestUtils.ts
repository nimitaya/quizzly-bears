import { User, FriendRequest, SearchUserResponse, FriendRequestResponse, FriendRequestsResponse, FriendsResponse } from "./friendInterfaces";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

// ======================================== Search for user by email ========================================
export const searchUserByEmail = async (
  email: string,
  clerkUserId: string
): Promise<SearchUserResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/friend-request/search?email=${encodeURIComponent(email)}&clerkUserId=${clerkUserId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to search user");
  }

  return response.json();
};

// ======================================== Send friend request ========================================
export const sendFriendRequest = async (
  clerkUserId: string,
  targetUserId: string
): Promise<FriendRequestResponse> => {
  const response = await fetch(`${API_BASE_URL}/friend-request/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkUserId,
      targetUserId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send friend request");
  }

  return response.json();
};

// ======================================== Get received friend requests ========================================
export const getReceivedFriendRequests = async (
  clerkUserId: string
): Promise<FriendRequestsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/friend-request/received?clerkUserId=${clerkUserId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get friend requests");
  }

  return response.json();
};

// ======================================== Get sent friend requests ========================================
export const getSentFriendRequests = async (
  clerkUserId: string
): Promise<FriendRequestsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/friend-request/sent?clerkUserId=${clerkUserId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get sent friend requests");
  }

  return response.json();
};

// ======================================== Accept friend request ========================================
export const acceptFriendRequest = async (
  clerkUserId: string,
  friendRequestId: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/friend-request/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkUserId,
      friendRequestId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to accept friend request");
  }

  return response.json();
};

// ======================================== Decline friend request ========================================
export const declineFriendRequest = async (
  clerkUserId: string,
  friendRequestId: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/friend-request/decline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkUserId,
      friendRequestId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to decline friend request");
  }

  return response.json();
};

// ======================================== Get user's friends list ========================================
export const getFriends = async (clerkUserId: string): Promise<FriendsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/friend-request/friends?clerkUserId=${clerkUserId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get friends");
  }

  return response.json();
};

// ======================================== Remove a friend ========================================
export const removeFriend = async (
  clerkUserId: string,
  friendId: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/friend-request/remove`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clerkUserId,
      friendId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to remove friend");
  }

  return response.json();
};