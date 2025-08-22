import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SoundData } from "@/types/sound";
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // ✅ replaced lucide-react-native

interface SoundControlProps {
  sound: SoundData;
  volume: number;
  isPlaying: boolean;
  onVolumeChange: (volume: number) => void;
  onToggle: () => void;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

const SoundControl: React.FC<SoundControlProps> = ({
  sound,
  volume,
  isPlaying,
  onVolumeChange,
  onToggle,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderWidth = CARD_WIDTH - 40;
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    onPanResponderMove: (evt) => {
      const { locationX } = evt.nativeEvent;
      const newVolume = Math.max(0, Math.min(100, (locationX / sliderWidth) * 100));
      onVolumeChange(Math.round(newVolume));
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });

  const IconComponent = sound.icon;
  const volumePosition = (volume / 100) * sliderWidth;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          isPlaying ? sound.color : "rgba(255, 255, 255, 0.1)",
          isPlaying ? `${sound.color}80` : "rgba(255, 255, 255, 0.05)",
        ]}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>


            <Ionicons name={IconComponent} size={16} color={isPlaying ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"} />

          </View>
          <TouchableOpacity 
            style={[
              styles.playButton, 
              { backgroundColor: isPlaying ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)" }
            ]}
            onPress={onToggle}
            activeOpacity={0.8}
          >
            {isPlaying ? (
              <Ionicons name="pause" size={16} color="#FFFFFF" />
            ) : (
              <Ionicons name="play" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Sound Name */}
        <Text style={styles.soundName}>{sound.name}</Text>

        {/* Volume Control */}
        <View style={styles.volumeSection}>
          <View style={styles.volumeHeader}>
            <MaterialIcons name="volume-up" size={14} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.volumeText}>{volume}%</Text>
          </View>
          
          <View style={styles.sliderContainer} {...panResponder.panHandlers}>
            {/* Background Track */}
            <View style={styles.sliderTrack} />
            
            {/* Active Track */}
            <View 
              style={[
                styles.sliderActiveTrack, 
                { 
                  width: volumePosition,
                  backgroundColor: isPlaying ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)"
                }
              ]} 
            />
            
            {/* Thumb */}
            <View 
              style={[
                styles.sliderThumb, 
                { 
                  left: volumePosition - 8,
                  backgroundColor: isPlaying ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)",
                  transform: [{ scale: isDragging ? 1.2 : 1 }]
                }
              ]} 
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 20,
    
  },
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  
    backgroundColor:"rgba(255, 255, 255, 0)"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor:"rgba(255, 255, 255, 0)"
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  soundName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  volumeSection: {
    flex: 1,
    justifyContent: "flex-end",
  },
  volumeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  volumeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },
  sliderContainer: {
    height: 20,
    justifyContent: "center",
    position: "relative",
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "rgba(163, 134, 168, 0.8)",
    borderRadius: 2,
  },
  sliderActiveTrack: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -6,
  },
});

export default SoundControl;
