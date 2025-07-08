import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

const PingPongScreen = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new start screen
    router.replace("/(tabs)/play/PingPongStartScreen");
  }, []);

  return null;
};

export default PingPongScreen; 