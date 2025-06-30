import React, { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import CustomAlert from "../components/CustomAlert";

type NetworkAlertProviderProps = {
  children: React.ReactNode;
};

const NetworkAlertProvider: React.FC<NetworkAlertProviderProps> = ({
  children,
}) => {
  const [showNoInternetAlert, setShowNoInternetAlert] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = "/" + segments.join("/");

  // Define exempt routes
  const EXEMPT_ROUTES = ["/(tabs)/play", "/(tabs)/offline-game"];

  // Check if current route is exempt
  const isExemptRoute = EXEMPT_ROUTES.some((route) =>
    currentRoute.startsWith(route)
  );

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
      if (state.isConnected === false && !isExemptRoute) {
        setShowNoInternetAlert(true);
      }
    });

    // Initial check on component mount
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false && !isExemptRoute) {
        setShowNoInternetAlert(true);
      }
    });

    // Clean up subscription
    return () => unsubscribe();
  }, [isExemptRoute, segments]);

  return (
    <>
      {children}

      <CustomAlert
        visible={showNoInternetAlert && !isExemptRoute}
        onClose={handleHome}
        message="I'm sorry, but you've lost your internet connection."
        cancelText="Home"
        confirmText="Mini games"
        onConfirm={handleGoToPlay}
        noInternet={true}
      />
    </>
  );
};

export default NetworkAlertProvider;
