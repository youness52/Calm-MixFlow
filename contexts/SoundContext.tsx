import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Audio } from "expo-av";
import { Platform } from "react-native";
import { soundData } from "@/constants/sounds";

interface SoundState {
  volumes: Record<string, number>;
  isPlaying: Record<string, boolean>;
  setVolume: (soundId: string, volume: number) => void;
  toggleSound: (soundId: string) => void;
  audioInitialized: boolean;
  initializeAudio: () => Promise<void>;
}

export const [SoundProvider, useSounds] = createContextHook<SoundState>(() => {
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [audioInitialized, setAudioInitialized] = useState(false);
  const soundObjects = useRef<Record<string, Audio.Sound>>({});
  const audioElements = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Setup audio mode for mobile
    if (Platform.OS !== "web") {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });
    }

    return () => {
      // Cleanup all sounds
      const currentSoundObjects = soundObjects.current;
      const currentAudioElements = audioElements.current;
      
      Object.values(currentSoundObjects).forEach(sound => {
        sound.unloadAsync();
      });
      Object.values(currentAudioElements).forEach(audio => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  const initializeAudio = useCallback(async () => {
    if (Platform.OS === "web" && !audioInitialized) {
      try {
        // Create a silent audio context to initialize web audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        setAudioInitialized(true);
      } catch (error) {
        console.log('Audio initialization failed:', error);
      }
    } else if (Platform.OS !== "web") {
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  const setVolume = useCallback((soundId: string, volume: number) => {
    setVolumes(prev => ({ ...prev, [soundId]: volume }));
    
    // Update volume for playing sounds
    if (Platform.OS === "web") {
      if (audioElements.current[soundId]) {
        audioElements.current[soundId].volume = volume / 100;
      }
    } else {
      if (soundObjects.current[soundId]) {
        soundObjects.current[soundId].setVolumeAsync(volume / 100);
      }
    }
  }, []);

  const playSound = useCallback(async (soundId: string) => {
    const sound = soundData.find(s => s.id === soundId);
    if (!sound) return;

    try {
      if (Platform.OS === "web") {
        // Initialize audio on first user interaction
        await initializeAudio();
        
        // Web implementation
        if (!audioElements.current[soundId]) {
          const audio = new window.Audio(sound.url);
          audio.loop = true;
          audio.volume = (volumes[soundId] || 50) / 100;
          audioElements.current[soundId] = audio;
        }
        
        const audio = audioElements.current[soundId];
        audio.volume = (volumes[soundId] || 50) / 100;
        await audio.play();
        setIsPlaying(prev => ({ ...prev, [soundId]: true }));
      } else {
        // Mobile implementation
        if (!soundObjects.current[soundId]) {
          const { sound: audioSound } = await Audio.Sound.createAsync(
            { uri: sound.url },
            { 
              isLooping: true, 
              volume: (volumes[soundId] || 50) / 100,
              shouldPlay: true
            }
          );
          soundObjects.current[soundId] = audioSound;
        } else {
          await soundObjects.current[soundId].playAsync();
        }
        setIsPlaying(prev => ({ ...prev, [soundId]: true }));
      }
    } catch (error) {
      console.error(`Error playing sound ${soundId}:`, error);
    }
  }, [volumes, initializeAudio]);

  const stopSound = useCallback(async (soundId: string) => {
    try {
      if (Platform.OS === "web") {
        if (audioElements.current[soundId]) {
          audioElements.current[soundId].pause();
          audioElements.current[soundId].currentTime = 0;
        }
      } else {
        if (soundObjects.current[soundId]) {
          await soundObjects.current[soundId].pauseAsync();
        }
      }
      setIsPlaying(prev => ({ ...prev, [soundId]: false }));
    } catch (error) {
      console.error(`Error stopping sound ${soundId}:`, error);
    }
  }, []);

  const toggleSound = useCallback(async (soundId: string) => {
    const currentlyPlaying = isPlaying[soundId];
    if (currentlyPlaying) {
      await stopSound(soundId);
    } else {
      await playSound(soundId);
    }
  }, [isPlaying, playSound, stopSound]);

  return useMemo(() => ({
    volumes,
    isPlaying,
    setVolume,
    toggleSound,
    audioInitialized,
    initializeAudio,
  }), [volumes, isPlaying, setVolume, toggleSound, audioInitialized, initializeAudio]);
});