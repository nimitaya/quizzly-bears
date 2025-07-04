import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";

//const API_BASE_URL = "http://localhost:3000/api";
const API_BASE_URL = "https://quizzly-bears.onrender.com/api";

type UserContextType = {
  updateUserSettings: (newSettings: {
    music?: boolean;
    sounds?: boolean;
  }) => Promise<void>;
  setOnChanges: React.Dispatch<React.SetStateAction<boolean>>;
  currentUsername: string | null;
  userRank: number | null;
  totalUsers: number | null;
  topPlayers: TopPlayer[];
  userData: any;
  loading: boolean;
  error: string | null;
  refetch: Array<() => void>;
};

const UserContext = createContext<UserContextType>({
  updateUserSettings: async () => {},
  setOnChanges: () => {},
  currentUsername: null,
  userRank: null,
  totalUsers: null,
  topPlayers: [],
  userData: null,
  loading: true,
  error: null,
  refetch: [],
});

type TopPlayer = { username?: string; email: string; totalPoints: number };

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  const [onChanges, setOnChanges] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [loadingTopPlayers, setLoadingTopPlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error("Failed to load user data", err);
      setUserData(null);
      setError("Failed to load user data");
    } finally {
      setLoadingUserData(false);
      setOnChanges(false);
    }
  };

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
      setOnChanges(false);
    } finally {
      setLoadingTopPlayers(false);
      setOnChanges(false);
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

  useEffect(() => {
    fetchUserData();
  }, [user, onChanges]);

  useEffect(() => {
    fetchTopPlayers();
  }, [userEmail, onChanges]);

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
        setOnChanges,
        updateUserSettings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useStatistics = () => useContext(UserContext);
