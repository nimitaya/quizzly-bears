import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { getReceivedInviteRequests } from "@/utilities/invitationApi";
import { getReceivedFriendRequests } from "@/utilities/friendRequestApi";
import socketService from "@/utilities/socketService";
import { useSocket } from "./SocketProvider";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type UserContextType = {
  updateUserSettings: (newSettings: {
    music?: boolean;
    sounds?: boolean;
  }) => Promise<void>;
  currentUsername: string | null;
  userRank: number | null;
  totalUsers: number | null;
  topPlayers: TopPlayer[];
  userData: any;
  loading: boolean;
  error: string | null;
  refetch: Array<() => void>;
  receivedRequestsCount?: number;
  setReceivedRequestsCount: React.Dispatch<React.SetStateAction<number>>;
  receivedInviteRequests?: number;
  setReceivedInviteRequests?: React.Dispatch<React.SetStateAction<number>>;
  refreshFriendRequestCount?: () => Promise<void>;
  refreshInvitationCount?: () => Promise<void>;
  onlineFriends: string[];
};

export const UserContext = createContext<UserContextType>({
  updateUserSettings: async () => {},
  currentUsername: null,
  userRank: null,
  totalUsers: null,
  topPlayers: [],
  userData: null,
  loading: true,
  error: null,
  refetch: [],
  receivedRequestsCount: 0,
  setReceivedRequestsCount: () => {},
  receivedInviteRequests: 0,
  setReceivedInviteRequests: () => {},
  refreshFriendRequestCount: async () => {},
  refreshInvitationCount: async () => {},
  onlineFriends: [],
});

type TopPlayer = { username?: string; email: string; totalPoints: number };

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  const [userData, setUserData] = useState<any>(null);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [loadingTopPlayers, setLoadingTopPlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receivedRequestsCount, setReceivedRequestsCount] = useState(0);
  const [receivedInviteRequests, setReceivedInviteRequests] = useState(0);
  const [onlineFriends, setOnlineFriends] = useState<string[]>([]);

  const fetchUserData = async () => {
    if (!user) {
      setUserData(null);
      setLoadingUserData(false);
      return;
    }

    try {
      setLoadingUserData(true);
      const res = await axios.get(`${API_BASE_URL}/users/${user.id}`);
      setUserData(res.data);
      setReceivedRequestsCount(res.data.friendRequests.length);
    } catch (err) {
      console.error("Failed to load user data", err);
      setUserData(null);
      setError("Failed to load user data");
    } finally {
      setLoadingUserData(false);
    }
  };

  useEffect(() => {
    const fetchInviteRequests = async () => {
      if (!userData?.clerkUserId) return;

      try {
        const response = await getReceivedInviteRequests(userData.clerkUserId);
        const allInvites = response?.inviteRequests ?? [];
        const pendingInvites = allInvites.filter((i) => i.status === "pending");

        setReceivedInviteRequests(pendingInvites.length);
        console.log("📩 Pending invite requests:", pendingInvites.length);
      } catch (error) {
        console.error("❌ Failed to fetch invite requests:", error);
      }
    };

    fetchInviteRequests();
  }, [userData?.clerkUserId]);

  const fetchTopPlayers = async () => {
    try {
      setLoadingTopPlayers(true);
      const url = userEmail
        ? `${API_BASE_URL}/top-players?email=${encodeURIComponent(userEmail)}`
        : `${API_BASE_URL}/top-players`;

      const res = await axios.get(url);
      setTopPlayers(
        Array.isArray(res.data.topPlayers) ? res.data.topPlayers : []
      );
      setTotalUsers(
        typeof res.data.totalUsers === "number" ? res.data.totalUsers : null
      );
      setUserRank(
        typeof res.data.userRank === "number" ? res.data.userRank : null
      );
      setCurrentUsername(res.data.currentUsername ?? null);
    } catch (err) {
      console.error("Failed to load top players", err);
      setTopPlayers([]);
      setTotalUsers(null);
      setUserRank(null);
      setCurrentUsername(null);
      setError("Failed to load top players");
    } finally {
      setLoadingTopPlayers(false);
    }
  };

  const updateUserSettings = async (newSettings: {
    music?: boolean;
    sounds?: boolean;
  }) => {
    if (!user) return;

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/users/${user.id}/settings`,
        newSettings
      );
      setUserData(res.data);
    } catch (error) {
      console.error("Failed to update user settings", error);
    }
  };

  const refreshFriendRequestCount = async () => {
    if (!userData?.clerkUserId) return;

    try {
      const received = await getReceivedFriendRequests(userData.clerkUserId);
      const pendingRequests = received.friendRequests.filter(
        (request) => request.status === "pending"
      );
      setReceivedRequestsCount(pendingRequests.length);
      console.log("🔄 Friend request count refreshed:", pendingRequests.length);
    } catch (error) {
      console.error("❌ Error refreshing friend requests:", error);
    }
  };

  const refreshInvitationCount = async () => {
    if (!userData?.clerkUserId) return;

    try {
      const response = await getReceivedInviteRequests(userData.clerkUserId);
      if (!response?.inviteRequests) return;

      const pendingInvites = response.inviteRequests.filter(
        (invite) => invite.status === "pending"
      );
      setReceivedInviteRequests(pendingInvites.length);
      console.log("🔄 Invitation count refreshed:", pendingInvites.length);
    } catch (error) {
      console.error("❌ Error refreshing invitations:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  useEffect(() => {
    fetchTopPlayers();
  }, [userEmail]);

  // Get socket state from context
  const { isConnected: isSocketConnected } = useSocket();

  // Use isSocketConnected in your useEffect for online status
  useEffect(() => {
    if (!userData || !userData._id || !isSocketConnected) {
      return; // Exit if user data is missing or socket isn't connected
    }

    console.log("Setting user online status");
    socketService.setUserOnline(userData._id, userData.clerkUserId);

    // Set up socket listeners for friends status
    socketService.on("friends-status", (data: any) => {
      console.log(
        "Received friends status update:",
        data.onlineFriends?.length || 0,
        "online friends"
      );
      setOnlineFriends(data.onlineFriends || []);
    });

    return () => {
      socketService.off("friends-status");
    };
  }, [userData, isSocketConnected]); // Depend on socket connection state

  return (
    <UserContext.Provider
      value={{
        currentUsername,
        userRank,
        totalUsers,
        topPlayers,
        userData,
        loading: loadingUserData || loadingTopPlayers,
        error,
        refetch: [fetchUserData, fetchTopPlayers],
        updateUserSettings,
        receivedRequestsCount,
        setReceivedRequestsCount,
        receivedInviteRequests,
        setReceivedInviteRequests,
        refreshFriendRequestCount,
        refreshInvitationCount,
        onlineFriends,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useStatistics = () => useContext(UserContext);
