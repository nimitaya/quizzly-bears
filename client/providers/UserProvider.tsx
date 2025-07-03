import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";

//const API_BASE_URL = "http://localhost:3000/api";
const API_BASE_URL = "https://quizzly-bears.onrender.com/api";

type UserContextType = {
  userRank: number | null;
  totalUsers: number | null;
  topPlayers: TopPlayer[];
  userData: any;
  loading: boolean;
  error: string | null;
  refetch: Array<() => void>;
};

const UserContext = createContext<UserContextType>({
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
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [onChanges, setOnChanges] = useState<boolean>(false);

  const fetchUserData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/users/${user.id}`);
      setUserData(res.data);
    } catch (err: any) {
      setError("Failed to load user data");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    setOnChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, onChanges]);

  const fetchTopPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/top-players`);
      setTopPlayers(
        Array.isArray(res.data.topPlayers) ? res.data.topPlayers : []
      );
      setTotalUsers(
        typeof res.data.totalUsers === "number" ? res.data.totalUsers : null
      );
      setUserRank(
        typeof res.data.userRank === "number" ? res.data.userRank : null
      );
    } catch (err) {
      setError("Failed to load top players");
      setTopPlayers([]);
      setTotalUsers(null);
      setUserRank(null);
    } finally {
      setLoading(false);
    }
  };

  const { user: currentUser } = useUser();
  const userEmail = currentUser?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    if (!userEmail) return;
    axios
      .get(`${API_BASE_URL}/top-players?email=${encodeURIComponent(userEmail)}`)
      .then((res) => {
        setTopPlayers(res.data.topPlayers);
        setUserRank(res.data.userRank);
        setTotalUsers(res.data.totalUsers);
        setOnChanges(false);
      })
      .catch(() => {
        setTopPlayers([]);
        setUserRank(null);
        setTotalUsers(null);
      });
  }, [userEmail, onChanges]);

  return (
    <UserContext.Provider
      value={{
        userRank,
        totalUsers,
        topPlayers,
        userData,
        loading,
        error,
        refetch: [fetchUserData, fetchTopPlayers],
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useStatistics = () => useContext(UserContext);
