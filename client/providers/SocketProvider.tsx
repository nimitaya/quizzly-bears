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
    if (initializationRef.current) {
      return initializationRef.current;
    }

    if (socketService.isConnected()) {
      setIsConnected(true);
      return Promise.resolve();
    }

    // Create and store the connection promise
    initializationRef.current = socketService
      .initialize()
      .then(() => {
        setIsConnected(true);
        globalSocketInitialized = true;
      })
      .catch((error) => {
        setIsConnected(false);
        throw error;
      })
      .finally(() => {
        setTimeout(() => {
          initializationRef.current = null;
        }, 100);
      });

    return initializationRef.current;
  };

  // Handle socket connection events
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);

      // Only attempt automatic reconnection if it's not due to explicit client disconnect
      if (reason !== "io client disconnect" && reason !== "transport close") {
        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        // Set a new reconnect timeout (with a delay to avoid reconnection loops)
        reconnectTimeoutRef.current = setTimeout(() => {
          initialize().catch();
        }, 1000);
      }
    };

    socketService.on("connect", handleConnect);
    socketService.on("disconnect", handleDisconnect);

    return () => {
      socketService.off("connect", handleConnect);
      socketService.off("disconnect", handleDisconnect);

      // Clear any pending timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // IMPORTANT: Only disconnect if not navigating to auth
    };
  }, []);

  // Initialize once when component mounts
  useEffect(() => {
    // Check if we need initial connection
    if (!globalSocketInitialized && !socketService.isConnected()) {
      initialize().catch();
    } else {
      setIsConnected(socketService.isConnected());
    }

    return () => {
      // IMPORTANT: Do NOT disconnect the socket here
    };
  }, []);

  // Handle auth state changes - reconnect if needed after login
  useEffect(() => {
    if (wasSignedIn.current === null) {
      wasSignedIn.current = !!isSignedIn;
      return;
    }

    // User just signed in
    if (isSignedIn && !wasSignedIn.current) {
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Schedule reconnection with delay
      reconnectTimeoutRef.current = setTimeout(() => {
        // Check if we actually need to reconnect
        if (!socketService.isConnected()) {
          initialize().catch();
        }
      }, 800);
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
        if (!socketService.isConnected()) {
          initialize().catch();
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
