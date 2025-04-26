import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import StatusBadge from "./StatusBadge";

export type GardenStatus = "healthy" | "needs-attention" | "critical";
export type GardenType = "vegetable" | "flower" | "herb" | "fruit";

interface GardenCardProps {
  id: string;
  name: string;
  type: GardenType;
  status: GardenStatus;
  plantCount: number;
  image: string;
  lastWatered: Date;
  onPress: () => void;
}

export default function GardenCard({
  id,
  name,
  type,
  status,
  plantCount,
  image,
  lastWatered,
  onPress,
}: GardenCardProps) {
  const theme = useAppTheme();

  const formatLastWatered = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastWatered.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const getWaterStatusColor = () => {
    const diffDays = Math.ceil(
      Math.abs(new Date().getTime() - lastWatered.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) return theme.waterLevel;
    if (diffDays <= 3) return theme.plantWarning;
    return theme.plantDanger;
  };

  const getGardenTypeIcon = () => {
    switch (type) {
      case "vegetable":
        return "leaf";
      case "flower":
        return "flower";
      case "herb":
        return "nutrition";
      case "fruit":
        return "basket";
      default:
        return "leaf";
    }
  };

  const getGardenTypeColor = () => {
    switch (type) {
      case "vegetable":
        return theme.gardenOutdoor;
      case "flower":
        return theme.gardenIndoor;
      case "herb":
        return theme.tertiary;
      case "fruit":
        return theme.accent;
      default:
        return theme.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          shadowColor: theme.shadow,
          borderColor: theme.borderLight,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {name}
          </Text>
          <StatusBadge status={status} />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons
              name={getGardenTypeIcon()}
              size={16}
              color={getGardenTypeColor()}
            />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="water" size={16} color={getWaterStatusColor()} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              Last watered: {formatLastWatered()}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="leaf" size={16} color={theme.primary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
              {plantCount} {plantCount === 1 ? "plant" : "plants"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  image: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  contentContainer: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  detailsContainer: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
});
