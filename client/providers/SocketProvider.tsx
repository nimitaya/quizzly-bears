import React, { createContext, useContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useStatistics } from "./UserProvider"; // ваш refetch

const socket = io("https://quizzly-bears.onrender.com");

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { refetch, topPlayers } = useStatistics();

  useEffect(() => {
    socket.on("pointsUpdated", () => {
      refetch && refetch.forEach((fn) => fn());
      console.log("🔁 pointsUpdated received");
    });

    return () => {
      socket.off("pointsUpdated");
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
