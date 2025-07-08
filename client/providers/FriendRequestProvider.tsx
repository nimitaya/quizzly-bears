import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  getFriends,
  getReceivedFriendRequests,
  getSentFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  searchUserByEmail,
  sendFriendRequest,
} from "@/utilities/friendRequestApi";
import { FriendsState, User } from "@/utilities/friendInterfaces";
import { UserContext } from "@/providers/UserProvider";

// ==== Type ====
type FriendRequestContextType = {
  searchState: {
    email: string;
    result: User | null;
    error: string;
  };
  setSearchState: React.Dispatch<
    React.SetStateAction<{
      email: string;
      result: User | null;
      error: string;
    }>
  >;
  friendsState: FriendsState;
  isLoading: boolean;
  searchUser: (email: string) => Promise<void>;
  sendRequest: (targetUserId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  removeFriendById: (friendId: string) => Promise<void>;
  fetchFriends: () => Promise<void>;
};

const FriendRequestContext = createContext<FriendRequestContextType>({
  searchState: {
    email: "",
    result: null,
    error: "",
  },
  setSearchState: () => {},
  friendsState: {
    friendList: { friends: [] },
    receivedFriendRequests: { friendRequests: [] },
    sentFriendRequests: { friendRequests: [] },
  },
  isLoading: false,
  searchUser: async () => {},
  sendRequest: async () => {},
  acceptRequest: async () => {},
  declineRequest: async () => {},
  removeFriendById: async () => {},
  fetchFriends: async () => {},
});

export const FriendRequestProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { userData } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  type SearchState = {
    email: string;
    result: User | null;
    error: string;
  };

  const [searchState, setSearchState] = useState<SearchState>({
    email: "",
    result: null,
    error: "",
  });
  const [friendsState, setFriendsState] = useState<FriendsState>({
    friendList: { friends: [] },
    receivedFriendRequests: { friendRequests: [] },
    sentFriendRequests: { friendRequests: [] },
  });

  const searchUser = async (email: string) => {
    if (!email.trim() || !userData) {
      setSearchState((prev) => ({
        ...prev,
        error: "Please enter a valid email",
      }));
      return;
    }

    try {
      setIsLoading(true);
      setSearchState((prev) => ({ ...prev, result: null, error: "" }));
      console.log("Searching for:", email);
      const result = await searchUserByEmail(email, userData.clerkUserId);
      setSearchState((prev) => ({ ...prev, result: result.user, email: "" }));
    } catch (error: any) {
      setSearchState((prev) => ({
        ...prev,
        result: null,
        error: "not a quizzly bear",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const sendRequest = async (targetUserId: string) => {
    if (!userData) return;

    try {
      setIsLoading(true);
      await sendFriendRequest(userData.clerkUserId, targetUserId);

      // Refresh the sent requests list
      const sent = await getSentFriendRequests(userData.clerkUserId);
      setFriendsState((prev) => ({
        ...prev,
        sentFriendRequests: sent,
      }));

      // Clear search result after sending request
      setSearchState((prev) => ({ ...prev, email: "", result: null }));
    } catch (error: any) {
      setSearchState((prev) => ({
        ...prev,
        error: error.message || "Failed to send friend request",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      if (!userData) return;
      await acceptFriendRequest(userData.clerkUserId, requestId);
      // Refresh the friends list after accepting
      const friends = await getFriends(userData.clerkUserId);
      const received = await getReceivedFriendRequests(userData.clerkUserId);
      const sent = await getSentFriendRequests(userData.clerkUserId);

      setFriendsState({
        friendList: friends,
        receivedFriendRequests: received,
        sentFriendRequests: sent,
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const declineRequest = async (requestId: string) => {
    try {
      if (!userData) return;
      await declineFriendRequest(userData.clerkUserId, requestId);
      // Refresh the friends list after declining
      const received = await getReceivedFriendRequests(userData.clerkUserId);
      setFriendsState((prev) => ({
        ...prev,
        receivedFriendRequests: received,
      }));
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  const removeFriendById = async (friendId: string) => {
    try {
      if (!userData) return;
      await removeFriend(userData.clerkUserId, friendId);
      // Refresh the friends list after removing
      const friends = await getFriends(userData.clerkUserId);
      setFriendsState((prev) => ({
        ...prev,
        friendList: friends,
      }));
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const clerkUserId = userData.clerkUserId;

      const friends = await getFriends(clerkUserId);
      const received = await getReceivedFriendRequests(clerkUserId);
      const sent = await getSentFriendRequests(clerkUserId);

      setFriendsState({
        friendList: friends,
        receivedFriendRequests: received,
        sentFriendRequests: sent,
      });
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  return (
    <FriendRequestContext.Provider
      value={{
        searchState,
        setSearchState,
        friendsState,
        isLoading,
        searchUser,
        sendRequest,
        acceptRequest,
        declineRequest,
        removeFriendById,
        fetchFriends,
      }}
    >
      {children}
    </FriendRequestContext.Provider>
  );
};

// ==== Hook ====
export const useFriendRequests = () => useContext(FriendRequestContext);
