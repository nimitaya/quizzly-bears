import { Colors } from "@/styles/theme";
import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { useSound } from "@/providers/SoundProvider";

interface TimerBarProps {
  duration?: number; // Total duration in seconds
  delay?: number; // Delay before start in seconds
  onTimeUp?: () => void; // Callback when time is up
  width?: number; // Width of the bar
  height?: number; // Height of the bar
  isPaused?: boolean; // Pauses the animation
}

const TimerBar: React.FC<TimerBarProps> = ({
  duration = 30,
  delay = 0,
  onTimeUp,
  width = 300,
  height = 10,
  isPaused = false,
}) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const timerSound = useRef<Audio.Sound | null>(null);
  const { soundEnabled } = useSound();
  const [soundLoaded, setSoundLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load timer sound once when component mounts
  useEffect(() => {
    const loadTimerSound = async () => {
      try {
        console.log('TimerBar: Loading timer sound, soundEnabled:', soundEnabled);
        
        // Initialize audio mode for mobile devices
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/Sounds/time-01.mp3'),
          { 
            isLooping: true, 
            volume: 0.6,
            shouldPlay: false
          }
        );
        
        timerSound.current = sound;
        setSoundLoaded(true);
        console.log('TimerBar: Timer sound loaded successfully');
      } catch (error) {
        console.error('TimerBar: Error loading timer sound:', error);
        timerSound.current = null;
        setSoundLoaded(false);
      }
    };

    loadTimerSound();

    // Cleanup function
    return () => {
      console.log('TimerBar: Cleaning up timer sound');
      if (timerSound.current) {
        timerSound.current.stopAsync().catch(() => {});
        timerSound.current.unloadAsync().catch(() => {});
        timerSound.current = null;
      }
      setSoundLoaded(false);
      setIsPlaying(false);
    };
  }, []); // Remove soundEnabled dependency to load sound only once

  // Start/stop timer sound based on animation state
  const startTimerSound = async () => {
    // TEMPORARY DEBUG: Always try to play sound regardless of settings
    if (!timerSound.current || !soundLoaded || isPlaying) {
      console.log('TimerBar: Cannot start sound - soundLoaded:', soundLoaded, 'isPlaying:', isPlaying);
      return;
    }
    
    try {
      console.log('TimerBar: Starting timer sound (DEBUG MODE - ignoring soundEnabled)');
      await timerSound.current.setPositionAsync(0);
      await timerSound.current.playAsync();
      setIsPlaying(true);
      console.log('TimerBar: Timer sound started successfully');
    } catch (error) {
      console.error('TimerBar: Error starting timer sound:', error);
    }
  };

  const stopTimerSound = async () => {
    if (!timerSound.current || !isPlaying) {
      return;
    }
    
    try {
      console.log('TimerBar: Stopping timer sound');
      await timerSound.current.stopAsync();
      setIsPlaying(false);
      console.log('TimerBar: Timer sound stopped successfully');
    } catch (error) {
      console.error('TimerBar: Error stopping timer sound:', error);
    }
  };

  useEffect(() => {
    console.log('TimerBar: Animation effect triggered');
    // Reset animation values
    progressAnimation.setValue(0);

    // Start animation immediately - no delay
    const animation = Animated.timing(progressAnimation, {
      toValue: 1,
      duration: duration * 1000, // Use the duration parameter
      useNativeDriver: false,
    });

    // TEMPORARY DEBUG: Start timer sound when animation starts (regardless of sound settings)
    if (soundLoaded) {
      console.log('TimerBar: Attempting to start sound (DEBUG MODE)');
      startTimerSound();
    } else {
      console.log('TimerBar: Sound not loaded yet, cannot start');
    }

    animation.start(({ finished }) => {
      console.log('TimerBar: Animation finished:', finished);
      // Stop timer sound when animation finishes
      stopTimerSound();
      
      if (finished && onTimeUp) {
        onTimeUp();
      }
    });

    return () => {
      console.log('TimerBar: Animation cleanup');
      progressAnimation.stopAnimation();
      // Stop timer sound when component unmounts or animation is interrupted
      stopTimerSound();
    };
  }, [duration, onTimeUp, soundLoaded]); // Remove soundEnabled dependency for debug

  useEffect(() => {
    console.log('TimerBar: Pause effect triggered, isPaused:', isPaused);
    if (isPaused) {
      progressAnimation.stopAnimation();
      // Stop timer sound when paused
      stopTimerSound();
    }
  }, [isPaused]);

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
        },
      ]}
    >
      {/* Background bar (green) */}
      <View
        style={[
          styles.barBase,
          styles.backgroundBar,
          { backgroundColor: Colors.primaryLimo },
        ]}
      />

      {/* Progress bar (gray, grows from left to right) */}
      <Animated.View
        style={[
          styles.barBase,
          styles.progressBar,
          {
            backgroundColor: Colors.disable,
            width: progressAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderRadius: 5,
    overflow: "hidden",
  },
  barBase: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 5,
  },
  backgroundBar: {
    right: 0,
  },
  progressBar: {
    // Inherits barBase styles
  },
});

export default TimerBar;
