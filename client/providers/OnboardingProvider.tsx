import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_COMPLETED_KEY = "@onboarding_completed";

// Helper function to check if onboarding should be shown
export const shouldShowOnboarding = async (): Promise<boolean> => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed !== "true";
  } catch (error) {
    console.error("Error checking onboarding state:", error);
    return true; // Show onboarding by default if there's an error
  }
};

// Helper function to reset onboarding (for testing purposes)
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error("Error resetting onboarding state:", error);
  }
};

interface OnboardingContextType {
  shouldShowOnboarding: boolean;
  isLoading: boolean;
  markOnboardingCompleted: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const shouldShowOnboardingScreen = await shouldShowOnboarding();
      setShouldShow(shouldShowOnboardingScreen);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setShouldShow(true); // Show onboarding by default on error
    } finally {
      setIsLoading(false);
    }
  };

  const markOnboardingCompleted = () => {
    setShouldShow(false);
  };

  const value: OnboardingContextType = {
    shouldShowOnboarding: shouldShow,
    isLoading,
    markOnboardingCompleted,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
