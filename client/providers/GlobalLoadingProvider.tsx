import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useUser, useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingOverlay from "../app/Loading";

type GlobalLoadingContextType = {
  isGloballyLoading: boolean;
  isAuthenticated: boolean;
  refreshGlobalState: () => Promise<void>;
  showLoading: (show: boolean) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
};

// type assertion
const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
  isGloballyLoading: true,
  isAuthenticated: false,
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
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;

    try {
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

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("Error refreshing global state:", error);
    } finally {
      safeSetState(setIsGloballyLoading, false);
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

    if (userLoaded && authLoaded) {
      initializeApp();
    }
  }, [userLoaded, authLoaded, isSignedIn]);

  const contextValue = {
    isGloballyLoading,
    isAuthenticated,
    refreshGlobalState,
    showLoading,
    withLoading,
  };

  // Show loading overlay when either global loading or manual loading is active
  const shouldShowLoading = isGloballyLoading || manualLoading;

  return (
    <GlobalLoadingContext.Provider value={contextValue}>
      {children}
      {shouldShowLoading && <LoadingOverlay />}
    </GlobalLoadingContext.Provider>
  );
};
