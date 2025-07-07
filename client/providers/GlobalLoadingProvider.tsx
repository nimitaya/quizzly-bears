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
  shouldShowLoading: boolean; // Combined state for showing loading
  refreshGlobalState: () => Promise<void>;
  showLoading: (show: boolean) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
};

// type assertion for the context value
const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
  isGloballyLoading: true,
  isAuthenticated: false,
  shouldShowLoading: true,
  refreshGlobalState: async () => {},
  showLoading: () => {},
  withLoading: (async (promise) => promise) as <T>(
    promise: Promise<T>
  ) => Promise<T>,
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
  const [manualLoading, setManualLoading] = useState(false);

  // Use refs to prevent infinite loops

  const isRefreshingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Set isMounted to false on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Helper function to safely update state only when mounted
  const safeSetState = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    value: any
  ) => {
    if (isMountedRef.current) {
      setter(value);
    }
  };

  // Helper function to manually show/hide loading
  const showLoading = (show: boolean) => {
    safeSetState(setManualLoading, show);
  };

  // Helper function to wrap any Promise with loading state - fix implementation
  const withLoading = async <T,>(promise: Promise<T>): Promise<T> => {
    safeSetState(setManualLoading, true);
    try {
      const result = await promise;
      return result;
    } finally {
      safeSetState(setManualLoading, false);
    }
  };

  const refreshGlobalState = async () => {
    // Prevent concurrent refreshes

    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;

    try {
      // Only set loading if we're not already initializing

      if (!isInitializing) {
        safeSetState(setIsGloballyLoading, true);
      }

      // check for password reset flag
      const resetFlag = await AsyncStorage.getItem("password_recently_reset");
      if (resetFlag === "true") {
        safeSetState(setIsAuthenticated, true);
      } else if (userLoaded && authLoaded) {
        safeSetState(setIsAuthenticated, !!isSignedIn);
      }

      // Small delay for stability

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error refreshing global state:", error);
    } finally {
      safeSetState(setIsGloballyLoading, false);
      isRefreshingRef.current = false;
    }
  };

  // Effect to handle initial loading and authentication state

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (!userLoaded || !authLoaded) {
          return;
        }

        // Set authentication based on Clerk state
        setIsAuthenticated(!!isSignedIn);

        // Wait to ensure everything is loaded

        //check for password reset flag during initialization
        const resetFlag = await AsyncStorage.getItem("password_recently_reset");
        if (resetFlag === "true") {
          safeSetState(setIsAuthenticated, true);
        } else {
          safeSetState(setIsAuthenticated, !!isSignedIn);
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error("Error during app initialization:", error);
      } finally {
        if (isMountedRef.current) {
          safeSetState(setIsGloballyLoading, false);
          safeSetState(setIsInitializing, false);
        }
      }
    };

    // Only initialize if both userLoaded and authLoaded are true
    if (userLoaded && authLoaded) {
      initializeApp();
    }
  }, [userLoaded, authLoaded, isSignedIn]);

  // CRITICAL FIX: Remove the automatic router.replace to Loading
  // This was causing an infinite loop

  // Объединенное состояние для показа загрузки
  const shouldShowLoading = isGloballyLoading || manualLoading;

  const contextValue = {
    isGloballyLoading,
    isAuthenticated,
    shouldShowLoading,
    refreshGlobalState,
    showLoading,
    withLoading,
  };

  return (
    <GlobalLoadingContext.Provider value={contextValue}>
      {children}
    </GlobalLoadingContext.Provider>
  );
};
