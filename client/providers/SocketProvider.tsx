import React, { createContext, useContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useStatistics } from "./UserProvider"; // ваш refetch

const socket = io("https://quizzly-bears.onrender.com");

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { refetch, topPlayers } = useStatistics();

  useEffect(() => {
    socket.on("pointsUpdated", () => {
      if (Array.isArray(refetch)) {
        refetch.forEach((fn, idx) => {
          console.log(`Calling refetch[${idx}]`);
          fn?.(); // Trigger fetchTopPlayers
        });
      } else if (typeof refetch === "object" && refetch !== null) {
        (refetch as any).userData?.();
        (refetch as any).topPlayers?.();
        console.log("🔁 pointsUpdated received- second if");
      }
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
