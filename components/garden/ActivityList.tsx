import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ActivityType, GardenActivity } from "@/types";
import Colors from "@/constants/Colors"; // Import Colors for theme type

// Define a more specific type for the theme object
type AppThemeType = typeof Colors.light;

// Props for the ActivityList component
interface ActivityListProps {
  activities: GardenActivity[];
  onPressActivity?: (activity: GardenActivity) => void;
}

export default function ActivityList({
  activities,
  onPressActivity,
}: ActivityListProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  // Helper function to get the appropriate icon for each activity type
  const getActivityIcon = (
    type: ActivityType
  ): React.ComponentProps<typeof MaterialCommunityIcons>["name"] => {
    switch (type) {
      case ActivityType.WATERING:
        return "water";
      case ActivityType.FERTILIZING:
        return "leaf";
      case ActivityType.PRUNING:
        return "content-cut";
      case ActivityType.HARVESTING:
        return "fruit-cherries";
      case ActivityType.PLANTING:
        return "sprout";
      default:
        return "fountain-pen-tip";
    }
  };

  // Helper function to get the appropriate color for each activity type
  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case ActivityType.WATERING:
        return theme.waterLevel;
      case ActivityType.FERTILIZING:
        return theme.soilQuality || theme.success;
      case ActivityType.PRUNING:
        return theme.secondary;
      case ActivityType.HARVESTING:
        return theme.accent;
      case ActivityType.PLANTING:
        return theme.gardenOutdoor || theme.primary;
      default:
        return theme.primary;
    }
  };

  // Helper function to format the activity time using Vietnamese locale
  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    )}`;
  };

  // Helper function to get Vietnamese activity type text
  const getActivityTypeText = (type: ActivityType): string => {
    switch (type) {
      case ActivityType.WATERING:
        return "Tưới nước";
      case ActivityType.FERTILIZING:
        return "Bón phân";
      case ActivityType.PRUNING:
        return "Cắt tỉa";
      case ActivityType.HARVESTING:
        return "Thu hoạch";
      case ActivityType.PLANTING:
        return "Trồng cây";
      default:
        return String(type);
    }
  };

  const renderActivityItem = ({ item }: { item: GardenActivity }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => onPressActivity && onPressActivity(item)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${getActivityColor(item.activityType)}20` },
        ]}
      >
        <MaterialCommunityIcons
          name={getActivityIcon(item.activityType)}
          size={20}
          color={getActivityColor(item.activityType)}
        />
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityType}>
          {getActivityTypeText(item.activityType)}
        </Text>
        <Text style={styles.activityTime}>
          {formatActivityTime(item.timestamp)}
        </Text>
        <Text style={styles.activityDescription} numberOfLines={2}>
          {item.details}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!activities || activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có hoạt động gần đây.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      renderItem={renderActivityItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // Disable scrolling within the FlatList
    />
  );
}

const createStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    listContainer: {
      paddingTop: 8,
    },
    emptyContainer: {
      padding: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
    activityItem: {
      flexDirection: "row",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    activityDetails: {
      flex: 1,
    },
    activityType: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 2,
    },
    activityTime: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
      marginBottom: 4,
    },
    activityDescription: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
  });
