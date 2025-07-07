import axios from "axios";
import { SearchUserResponse } from "./friendInterfaces";
import { InviteRequestResponse, InviteRequestsResponse } from "./invitationInterfaces";

const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "https://quizzly-bears.onrender.com/api";

// ======================================== Search for user by email ========================================
export const searchUserByEmail = async (
  email: string,
  clerkUserId: string
): Promise<SearchUserResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/invite-request/search`, {
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

// ======================================== Send invite request ========================================
export const sendInviteRequest = async (
  clerkUserId: string,
  targetUserId: string,
  roomcode: string
): Promise<InviteRequestResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/invite-request/send`, {
      clerkUserId,
      targetUserId,
      roomcode,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to send invite request");
  }
};

// ======================================== Get received invite requests ========================================
export const getReceivedInviteRequests = async (
  clerkUserId: string
): Promise<InviteRequestsResponse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/invite-request/received`,
      { params: { clerkUserId } }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to get received invitation requests");
  }
};

// ======================================== Get sent invite requests ========================================
export const getSentInviteRequests = async (
  clerkUserId: string
): Promise<InviteRequestsResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/invite-request/sent`, {
      params: { clerkUserId },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to get sent invite requests");
  }
};

// ======================================== Accept invite request ========================================
export const acceptInviteRequest = async (
  clerkUserId: string,
  inviteRequestId: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/invite-request/accept`, {
      clerkUserId,
      inviteRequestId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to accept invite request");
  }
};

// ======================================== Decline invite request ========================================
export const declineInviteRequest = async (
  clerkUserId: string,
  inviteRequestId: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/invite-request/decline`,
      { clerkUserId, inviteRequestId }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to decline invite request");
  }
};

// ======================================== Get user's accepted invitations list ========================================
export const getAcceptedInvites = async (
  clerkUserId: string
): Promise<InviteRequestsResponse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/invite-request/invitations`,
      {
        params: { clerkUserId },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to get invites");
  }
};

// ======================================== Remove an invite ========================================
export const removeInvite = async (
  clerkUserId: string,
  friendId: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/invite-request/remove`,
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
    throw new Error("Failed to remove invitation");
  }
};

// ======================================== Remove all invites ========================================
export const removeAllInvitea = async (
  clerkUserId: string
): Promise<{ message: string; deletedCount: number }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/invite-request/remove`,
      {
        data: {
          clerkUserId,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to remove invitation");
  }
};
