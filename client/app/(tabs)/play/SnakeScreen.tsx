import { useEffect } from 'react';
import { useRouter } from 'expo-router';

const SnakeScreen = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)/play/SnakeStartScreen');
  }, []);

  return null;
};

export default SnakeScreen; 