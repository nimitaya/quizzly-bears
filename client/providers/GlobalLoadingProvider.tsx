import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the context type
type GlobalLoadingContextType = {
  isGloballyLoading: boolean;
  isAuthenticated: boolean;
  refreshGlobalState: () => void;
};

// Create the context
const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
  isGloballyLoading: true,
  isAuthenticated: false,
  refreshGlobalState: () => {},
});

// Custom hook to use the context
export const useGlobalLoading = () => useContext(GlobalLoadingContext);

export const GlobalLoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const [isGloballyLoading, setIsGloballyLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mongoDbConnected, setMongoDbConnected] = useState(false);
  const router = useRouter();

  // Function to refresh the global state
  const refreshGlobalState = async () => {
    setIsGloballyLoading(true);

    try {
      // Check MongoDB connection if needed
      await checkMongoDbConnection();

      // Check if authentication is loaded
      if (userLoaded && authLoaded) {
        setIsAuthenticated(!!isSignedIn);
      }
    } catch (error) {
      console.error("Error refreshing global state:", error);
    } finally {
      setIsGloballyLoading(false);
    }
  };

  // Check MongoDB connection
  const checkMongoDbConnection = async () => {
    try {
      // Simulate MongoDB connection check or actually check it
      // For example check if a token exists
      const dbConnected = await AsyncStorage.getItem("mongodb_connected");
      setMongoDbConnected(dbConnected === "true");
      return dbConnected === "true";
    } catch (error) {
      console.error("MongoDB connection check failed:", error);
      return false;
    }
  };

  // Effect to handle initial loading and authentication state
  useEffect(() => {
    const initializeApp = async () => {
      if (!userLoaded || !authLoaded) {
        return; // Auth not ready yet
      }

      try {
        // Check MongoDB connection
        await checkMongoDbConnection();

        // Set authentication state
        setIsAuthenticated(!!isSignedIn);

        // Wait for a small delay to ensure everything is loaded
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error during app initialization:", error);
      } finally {
        // Finish loading
        setIsGloballyLoading(false);
      }
    };

    initializeApp();
  }, [userLoaded, authLoaded, isSignedIn]);

  // Route to Loading screen when globally loading
  useEffect(() => {
    if (isGloballyLoading) {
      router.replace("/Loading");
    }
  }, [isGloballyLoading, router]);

  // Provide the context values
  const contextValue = {
    isGloballyLoading,
    isAuthenticated,
    refreshGlobalState,
  };

  return (
    <GlobalLoadingContext.Provider value={contextValue}>
      {children}
    </GlobalLoadingContext.Provider>
  );
};
