import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

export type ActivityType =
  | "watering"
  | "fertilizing"
  | "pruning"
  | "harvesting"
  | "planting";

interface GardenActivityItemProps {
  type: ActivityType;
  date: string;
  description: string;
}

export default function GardenActivityItem({
  type,
  date,
  description,
}: GardenActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case "watering":
        return "water";
      case "fertilizing":
        return "leaf";
      case "pruning":
        return "content-cut";
      case "harvesting":
        return "fruit-cherries";
      case "planting":
        return "sprout";
      default:
        return "fountain-pen-tip";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "watering":
        return colors.info;
      case "fertilizing":
        return colors.success;
      case "pruning":
        return colors.warning;
      case "harvesting":
        return colors.error;
      case "planting":
        return colors.primary;
      default:
        return colors.neutral;
    }
  };

  const getActivityTitle = () => {
    switch (type) {
      case "watering":
        return "Watering";
      case "fertilizing":
        return "Fertilizing";
      case "pruning":
        return "Pruning";
      case "harvesting":
        return "Harvesting";
      case "planting":
        return "Planting";
      default:
        return "Activity";
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${getIconColor()}20` },
        ]}
      >
        <MaterialCommunityIcons
          name={getIcon()}
          size={20}
          color={getIconColor()}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{getActivityTitle()}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeGray,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textDark,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  description: {
    fontSize: 14,
    color: colors.textMedium,
    lineHeight: 20,
  },
});
