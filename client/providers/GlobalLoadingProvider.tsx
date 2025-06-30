import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
type GlobalLoadingContextType = {
  isGloballyLoading: boolean;
  isAuthenticated: boolean;
  refreshGlobalState: () => Promise<void>;
};

const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
  isGloballyLoading: true,
  isAuthenticated: false,
  refreshGlobalState: async () => {},
});

export const useGlobalLoading = () => useContext(GlobalLoadingContext);

export const GlobalLoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const [isGloballyLoading, setIsGloballyLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const isRefreshingRef = useRef(false);

  const refreshGlobalState = async () => {
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;

    try {
      if (!isInitializing) {
        setIsGloballyLoading(true);
      }

      // check for password reset flag
      const resetFlag = await AsyncStorage.getItem("password_recently_reset");
      if (resetFlag === "true") {
        setIsAuthenticated(true);
      } else if (userLoaded && authLoaded) {
        setIsAuthenticated(!!isSignedIn);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error refreshing global state:", error);
    } finally {
      setIsGloballyLoading(false);
      isRefreshingRef.current = false;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (!userLoaded || !authLoaded) {
          return;
        }

        //check for password reset flag during initialization
        const resetFlag = await AsyncStorage.getItem("password_recently_reset");
        if (resetFlag === "true") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(!!isSignedIn);
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error("Error during app initialization:", error);
      } finally {
        setIsGloballyLoading(false);
        setIsInitializing(false);
      }
    };

    if (userLoaded && authLoaded) {
      initializeApp();
    }
  }, [userLoaded, authLoaded, isSignedIn]);

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
