import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import socketService from "@/utilities/socketService";
import { useAuth } from "@clerk/clerk-expo";
import { navigationState } from "@/utilities/navigationStateManager";

// Define a global variable to track socket initialization outside React lifecycle
// This ensures persistence across component remounts
let globalSocketInitialized = false;

// Socket context for global state
const SocketContext = createContext<{
  isConnected: boolean;
  initialize: () => Promise<void>;
}>({
  isConnected: false,
  initialize: async () => {},
});

export const useSocket = () => useContext(SocketContext);

/**
 * This provider ensures socket connection persists across navigation
 * and reconnects on login if needed
 */
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  const { isSignedIn } = useAuth();
  const initializationRef = useRef<Promise<void> | null>(null);
  const wasSignedIn = useRef<boolean | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Function to initialize socket with memoization
  const initialize = async () => {
    // If already connecting, return existing promise
    if (initializationRef.current) {
      console.log(
        "🔄 Socket initialization already in progress, reusing promise"
      );
      return initializationRef.current;
    }

    // If already connected, just return resolved promise
    if (socketService.isConnected()) {
      console.log("✅ Socket already connected");
      setIsConnected(true);
      return Promise.resolve();
    }

    console.log("🔄 SocketProvider: Initializing socket connection");

    // Create and store the connection promise
    initializationRef.current = socketService
      .initialize()
      .then(() => {
        console.log("✅ SocketProvider: Socket connected successfully");
        setIsConnected(true);
        globalSocketInitialized = true;
      })
      .catch((error) => {
        console.error("❌ SocketProvider: Socket connection failed:", error);
        setIsConnected(false);
        throw error;
      })
      .finally(() => {
        // Clear the reference when done (with slight delay to prevent race conditions)
        setTimeout(() => {
          initializationRef.current = null;
        }, 100);
      });

    return initializationRef.current;
  };

  // Handle socket connection events
  useEffect(() => {
    const handleConnect = () => {
      console.log("🔄 SocketProvider: Socket connected event");
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      console.log(`🔌 SocketProvider: Socket disconnected: ${reason}`);
      setIsConnected(false);

      // Only attempt automatic reconnection if it's not due to explicit client disconnect
      if (reason !== "io client disconnect" && reason !== "transport close") {
        console.log(
          "🔄 SocketProvider: Attempting reconnection due to unexpected disconnect"
        );

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Set a new reconnect timeout (with a delay to avoid reconnection loops)
        reconnectTimeoutRef.current = setTimeout(() => {
          initialize().catch((err) =>
            console.error("Auto-reconnect failed:", err)
          );
        }, 1000);
      }
    };

    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);

    return () => {
      console.log("🛑 SocketProvider cleanup");
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);

      // Clear any pending timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // IMPORTANT: Only disconnect if not navigating to auth
      if (navigationState.isInAuthNavigation()) {
        console.log("⚡ Preserving socket during auth navigation");
        // Don't disconnect
      } else {
        // Only disconnect on app shutdown or explicit logout
        // Note: You may want to keep this commented out anyway
        // console.log("🔌 Disconnecting socket on unmount");
        // socketService.disconnect();
      }
    };
  }, []);

  // Initialize once when component mounts
  useEffect(() => {
    console.log("🚀 SocketProvider mounted");

    // Check if we need initial connection
    if (!globalSocketInitialized && !socketService.isConnected()) {
      console.log("🔄 Initial socket connection");
      initialize().catch((err) =>
        console.log("Initial connection failed:", err)
      );
    } else {
      console.log("⚠️ Socket already initialized globally, skipping");
      // Still update the connected state
      setIsConnected(socketService.isConnected());
    }

    return () => {
      console.log("🛑 SocketProvider unmounting");
      // IMPORTANT: Do NOT disconnect the socket here
    };
  }, []);

  // Handle auth state changes - reconnect if needed after login
  useEffect(() => {
    // Skip initial render
    if (wasSignedIn.current === null) {
      wasSignedIn.current = !!isSignedIn;
      return;
    }

    // User just signed in
    if (isSignedIn && !wasSignedIn.current) {
      console.log("🔑 User signed in - scheduling socket connection");

      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Schedule reconnection with delay
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("🔄 Executing scheduled connection after login");

        // Check if we actually need to reconnect
        if (!socketService.isConnected()) {
          console.log("Socket not connected, initializing...");
          initialize().catch((err) =>
            console.error("Login reconnect failed:", err)
          );
        } else {
          console.log(
            "Socket already connected after login, no need to reconnect"
          );
        }
      }, 800); // Delay to let auth state settle
    }

    wasSignedIn.current = !!isSignedIn;
  }, [isSignedIn]);

  // Handle app state changes
  useEffect(() => {
    let currentAppState = AppState.currentState;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        currentAppState.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("🔄 App resumed — checking socket connection");
        if (!socketService.isConnected()) {
          initialize().catch((err) =>
            console.error("Failed to reconnect on app resume:", err)
          );
        }
      }

      currentAppState = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, initialize }}>
      {children}
    </SocketContext.Provider>
  );
};
