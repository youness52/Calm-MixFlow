import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import SoundControl from "@/components/SoundControl";
import { useSounds } from "@/contexts/SoundContext";
import { soundData } from "@/constants/sounds";
import { Ionicons } from "@expo/vector-icons"; // ✅ replaced lucide-react-native

export default function HomeScreen() {
  const { volumes, isPlaying, setVolume, toggleSound, audioInitialized, initializeAudio } = useSounds();

  const handleVolumeChange = (soundId: string, volume: number) => {
    setVolume(soundId, volume);
  };

  const handleToggle = async (soundId: string) => {
    if (!audioInitialized) {
      await initializeAudio();
    }
    toggleSound(soundId);
  };

  const playingSounds = Object.values(isPlaying).filter(Boolean).length;

  return (
    <LinearGradient
      colors={["#1a1a2e", "#16213e", "#0f3460"]}
      style={styles.container}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>Calm</Text>
            <Text style={styles.subtitle}>Mix ambient sounds for perfect focus</Text>
          </View>
          
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              {playingSounds > 0 ? (
                <Ionicons name="pause" size={16} color="#4ECDC4" />
              ) : (
                <Ionicons name="play" size={16} color="rgba(255, 255, 255, 0.6)" />
              )}
            </View>
            <Text style={styles.statusText}>
              {playingSounds > 0 ? `${playingSounds} playing` : "Tap to start"}
            </Text>
          </View>
        </View>
        
        {!audioInitialized && (
          <TouchableOpacity 
            style={styles.initButton}
            onPress={initializeAudio}
            activeOpacity={0.8}
          >
            <Text style={styles.initButtonText}>Tap to Enable Audio</Text>
          </TouchableOpacity>
        )}
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {soundData.map((sound) => (
              <SoundControl
                key={sound.id}
                sound={sound}
                volume={volumes[sound.id] || 50}
                isPlaying={isPlaying[sound.id] || false}
                onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                onToggle={() => handleToggle(sound.id)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
  },
  statusCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 100,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.8)",
  },
  initButton: {
    display:"none",
    backgroundColor: "#4ECDC4",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  initButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
});
