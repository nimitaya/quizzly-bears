import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import CustomAlert from "./CustomAlert";

type NetworkAlertProviderProps = {
  children: React.ReactNode;
};

const NetworkAlertProvider: React.FC<NetworkAlertProviderProps> = ({
  children,
}) => {
  const [showNoInternetAlert, setShowNoInternetAlert] = useState(false);
  const router = useRouter();

  // Handler to navigate
  const handleGoToPlay = () => {
    setShowNoInternetAlert(false);
    setTimeout(() => {
      router.replace("/(tabs)/play");
    }, 100);
  };
  const handleHome = () => {
    setShowNoInternetAlert(false);
    setTimeout(() => {
      router.replace("/(tabs)/play");
    }, 100);
  };
  // Network connectivity check
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        setShowNoInternetAlert(true);
      }
    });

    // Initial check on component mount
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        setShowNoInternetAlert(true);
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  return (
    <>
      {children}

      <CustomAlert
        visible={showNoInternetAlert}
        onClose={handleHome}
        message="I'm sorry, but you've lost your internet connection."
        cancelText="Home"
        confirmText="Mini games"
        onConfirm={handleGoToPlay}
      />
    </>
  );
};

export default NetworkAlertProvider;
