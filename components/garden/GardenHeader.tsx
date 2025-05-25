import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import env from "@/config/environment";
import { useAppTheme } from "@/hooks/ui/useAppTheme";

interface GardenHeaderProps {
  profilePicture?: string;
  placeholder?: number;
}

const GardenHeader: React.FC<GardenHeaderProps> = ({
  profilePicture,
  placeholder = require("@/assets/images/garden-placeholder.png"),
}) => {
  const router = useRouter();
  const theme = useAppTheme();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerImageWrapper}>
        {profilePicture ? (
          <Image
            source={{ uri: `${env.apiUrl}${profilePicture}` }}
            style={styles.headerImage}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <Image
            source={placeholder}
            style={styles.headerImage}
            contentFit="cover"
          />
        )}
        <LinearGradient
          style={styles.headerGradient}
          colors={["rgba(0,0,0,0.5)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessible={true}
        accessibilityLabel="Quay lại"
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    height: 220,
  },
  headerImageWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E5E5", // Fallback color
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    position: "absolute",
    top: 10,
    left: 10,
  },
});

export default GardenHeader;
