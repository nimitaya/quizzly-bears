// MusicContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Audio } from "expo-av";
import { useStatistics } from "@/providers/UserProvider";
import { Platform } from "react-native";

type MusicContextType = {
  musicEnabled: boolean;
  toggleMusic: (enabled: boolean) => Promise<void>;
};

const MusicContext = createContext<MusicContextType>({
  musicEnabled: false,
  toggleMusic: async () => {},
});

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const musicRef = useRef<Audio.Sound | null>(null);
  const { userData, updateUserSettings, loading } = useStatistics();
  const [musicEnabled, setMusicEnabled] = useState(false);

  useEffect(() => {
    let handled = false;

    const handleInteraction = () => {
      if (handled) return;
      handled = true;

      if (!loading && userData?.settings?.music !== undefined) {
        setMusicEnabled(userData.settings.music);
      }

      if (Platform.OS === "web") {
        window.removeEventListener("mousedown", handleInteraction);
        window.removeEventListener("touchstart", handleInteraction);
      }
    };

    if (Platform.OS === "web") {
      window.addEventListener("mousedown", handleInteraction);
      window.addEventListener("touchstart", handleInteraction);
    } else {
      // Expo / native — we assume initial mount = user interaction
      handleInteraction(); // Immediately trigger on mount
    }

    return () => {
      if (Platform.OS === "web") {
        window.removeEventListener("mousedown", handleInteraction);
        window.removeEventListener("touchstart", handleInteraction);
      }
    };
  }, [userData, loading]);

  useEffect(() => {
    async function updateMusic() {
      if (musicEnabled) {
        if (musicRef.current) {
          await musicRef.current.unloadAsync();
          musicRef.current = null;
        }
        try {
          const { sound } = await Audio.Sound.createAsync(
            {
              uri: "https://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/soundtrack.ogg",
            },
            {
              shouldPlay: true,
              isLooping: true,
            }
          );
          musicRef.current = sound;
        } catch (err) {
          console.error("Failed to play music:", err);
        }
      } else {
        if (musicRef.current) {
          await musicRef.current.stopAsync();
          await musicRef.current.unloadAsync();
          musicRef.current = null;
        }
      }
    }
    updateMusic();

    return () => {
      if (musicRef.current) {
        musicRef.current.unloadAsync();
        musicRef.current = null;
      }
    };
  }, [musicEnabled]);

  const toggleMusic = async (enabled: boolean) => {
    setMusicEnabled(enabled);
    await updateUserSettings({ music: enabled });
  };

  return (
    <MusicContext.Provider value={{ musicEnabled, toggleMusic }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
