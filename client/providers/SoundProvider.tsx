import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Audio } from "expo-av";
import { useStatistics } from "@/providers/UserProvider";
import { useUser } from "@clerk/clerk-expo";

type SoundContextType = {
  soundEnabled: boolean;
  playSound: (name: SoundName) => Promise<void>;
  toggleSound: (enabled: boolean) => Promise<void>;
};

type SoundName = "click" | "correct" | "wrong" | "notification" | "custom";

const soundFiles: Record<SoundName, string> = {
  click:
    "https://commondatastorage.googleapis.com/codeskulptor-assets/Evillaugh.ogg",
  correct:
    "https://commondatastorage.googleapis.com/codeskulptor-assets/Evillaugh.ogg",
  wrong:
    "https://commondatastorage.googleapis.com/codeskulptor-assets/Evillaugh.ogg",
  notification:
    "https://commondatastorage.googleapis.com/codeskulptor-assets/Evillaugh.ogg",
  custom: "https://rpg.hamsterrepublic.com/wiki-images/d/d7/Oddbounce.ogg",
};

const SoundContext = createContext<SoundContextType>({
  soundEnabled: false,
  playSound: async () => {},
  toggleSound: async () => {},
});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userData, updateUserSettings, loading } = useStatistics();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!loading && userData?.settings?.sounds !== undefined) {
      setSoundEnabled(userData.settings.sounds);
    } else if (!loading && userData) {
      // Wenn keine Einstellungen vorhanden sind, setze Sound auf true (eingeschaltet)
      setSoundEnabled(true);
    }
  }, [userData, loading]);

  const toggleSound = async (enabled: boolean) => {
    setSoundEnabled(enabled);
    if (!user) return;
    await updateUserSettings({ sounds: enabled });
  };

  const playSound = async (name: SoundName) => {
    if (!soundEnabled) return;

    try {
      const uri = soundFiles[name];
      if (!uri) return;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (err) {
      console.error(`Failed to play sound (${name})`, err);
    }
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
