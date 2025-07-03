import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";

const API_BASE_URL = "https://quizzly-bears.onrender.com/api";

type UserContextType = {
  userData: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

const UserContext = createContext<UserContextType>({
  userData: null,
  loading: true,
  error: null,
  refetch: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <UserContext.Provider
      value={{ userData, loading, error, refetch: fetchUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useStatistics = () => useContext(UserContext);
