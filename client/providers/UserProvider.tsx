import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { getReceivedInviteRequests } from "@/utilities/invitationApi";
import { getReceivedFriendRequests } from "@/utilities/friendRequestApi";
import socketService from "@/utilities/socketService";
import { useSocket } from "./SocketProvider";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type UserContextType = {
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
  triggerUsernameUpdate: () => void;
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
  triggerUsernameUpdate: () => {},
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

  // Add a new state to track username updates
  const [usernameVersion, setUsernameVersion] = useState(0);

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
      // Trigger username refetch when user data changes
      setUsernameVersion((prev) => prev + 1);
    } catch {
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
      } catch {}
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
    } catch (error) {}
  };

  const refreshFriendRequestCount = async () => {
    if (!userData?.clerkUserId) return;

    try {
      const received = await getReceivedFriendRequests(userData.clerkUserId);
      const pendingRequests = received.friendRequests.filter(
        (request) => request.status === "pending"
      );
      setReceivedRequestsCount(pendingRequests.length);
    } catch {}
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
    } catch {}
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
      return;
    }

    socketService.setUserOnline(userData._id, userData.clerkUserId);

    // Set up socket listeners for friends status
    socketService.on("friends-status", (data: any) => {
      setOnlineFriends(data.onlineFriends || []);
    });

    return () => {
      socketService.off("friends-status");
    };
  }, [userData, isSocketConnected]);

  // Add separate effect for username updates
  useEffect(() => {
    const updateUsername = async () => {
      if (!userEmail) return;

      try {
        const url = `${API_BASE_URL}/top-players?email=${encodeURIComponent(
          userEmail
        )}`;
        const res = await axios.get(url);
        setCurrentUsername(res.data.currentUsername ?? null);
      } catch {
        setCurrentUsername(null);
      }
    };

    updateUsername();
  }, [userEmail, usernameVersion]); // Add usernameVersion as dependency

  // Modify the context value to include username update trigger
  const contextValue = {
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
    triggerUsernameUpdate: () => setUsernameVersion((prev) => prev + 1),
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useStatistics = () => useContext(UserContext);
