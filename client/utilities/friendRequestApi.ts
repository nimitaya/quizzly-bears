import {
  SearchUserResponse,
  FriendRequestResponse,
  FriendRequestsResponse,
  FriendsResponse,
} from "./friendInterfaces";
import axios from "axios";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "https://quizzly-bears.onrender.com/api";

// ======================================== Search for user by email ========================================
export const searchUserByEmail = async (
  email: string,
  clerkUserId: string
): Promise<SearchUserResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/friend-request/search`, {
      params: {
        email,
        clerkUserId,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to search user");
  }
};

// ======================================== Send friend request ========================================
export const sendFriendRequest = async (
  clerkUserId: string,
  targetUserId: string
): Promise<FriendRequestResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/friend-request/send`, {
      clerkUserId,
      targetUserId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to send friend request");
  }
};

// ======================================== Get received friend requests ========================================
export const getReceivedFriendRequests = async (
  clerkUserId: string
): Promise<FriendRequestsResponse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/friend-request/received`,
      { params: { clerkUserId } }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to get received friend requests");
  }
};

// ======================================== Get sent friend requests ========================================
export const getSentFriendRequests = async (
  clerkUserId: string
): Promise<FriendRequestsResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/friend-request/sent`, {
      params: { clerkUserId },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to get sent friend requests");
  }
};

// ======================================== Accept friend request ========================================
export const acceptFriendRequest = async (
  clerkUserId: string,
  friendRequestId: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/friend-request/accept`, {
      clerkUserId,
      friendRequestId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to accept friend request");
  }
};

// ======================================== Decline friend request ========================================
export const declineFriendRequest = async (
  clerkUserId: string,
  friendRequestId: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/friend-request/decline`,
      { clerkUserId, friendRequestId }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to decline friend request");
  }
};

// ======================================== Get user's friends list ========================================
export const getFriends = async (
  clerkUserId: string
): Promise<FriendsResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/friend-request/friends`, {
      params: { clerkUserId },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to get friends");
  }
};

// ======================================== Remove a friend ========================================
export const removeFriend = async (
  clerkUserId: string,
  friendId: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/friend-request/remove`,
      {
        data: {
          clerkUserId,
          friendId,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to remove friend");
  }
};

//================================= Search emails for autocomplete ========================================


export const searchEmailsAutocomplete = async (
  query: string,
  clerkUserId: string
): Promise<{ users: Array<{ _id: string; email: string }> }> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/friend-request/search-emails?query=${encodeURIComponent(query)}&clerkUserId=${clerkUserId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to search emails");
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching emails:", error);
    throw error;
  }
};