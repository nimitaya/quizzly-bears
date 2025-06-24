// === mobile/api.ts ===
import axios from "axios";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// new user
export const createUser = async (userData: {
  username: string;
  email: string;
  clerkUserId: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/users`, userData);
  return response.data;
};

// clerk user
export const getUserByClerkId = async (clerkUserId: string) => {
  const response = await axios.get(`${API_BASE_URL}/users/${clerkUserId}`);
  return response.data;
};

// add friend
export const sendFriendRequest = async (fromId: string, toId: string) => {
  const response = await axios.post(`${API_BASE_URL}/friends/request`, {
    from: fromId,
    to: toId,
  });
  return response.data;
};

// accept friend request
export const acceptFriendRequest = async (requestId: string) => {
  const response = await axios.post(`${API_BASE_URL}/friends/accept`, {
    requestId,
  });
  return response.data;
};

// decline friend request
export const declineFriendRequest = async (requestId: string) => {
  const response = await axios.post(`${API_BASE_URL}/friends/decline`, {
    requestId,
  });
  return response.data;
};
