import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import useSectionAnimation from "@/hooks/useSectionAnimation";
import { ActivityType } from "@/types/activities/activity.types";

interface Activity {
  id: number;
  activityType: ActivityType;
  name: string;
  timestamp: string;
  completed: boolean;
}

interface Schedule {
  id: number;
  activityType: ActivityType;
  name: string;
  scheduledTime: string;
}

interface ActivityTimelineProps {
  recentActivities?: Activity[];
  upcomingSchedules?: Schedule[];
  selectedGardenId?: number | null;
}

export default function ActivityTimeline({
  recentActivities = [],
  upcomingSchedules = [],
  selectedGardenId,
}: ActivityTimelineProps) {
  const theme = useAppTheme();
  const { getAnimatedStyle } = useSectionAnimation("activity");

  const getActivityIcon = (activityType: ActivityType) => {
    switch (activityType) {
      case "WATERING":
        return "water-outline";
      case "FERTILIZING":
        return "leaf-outline";
      case "PRUNING":
        return "cut-outline";
      case "HARVESTING":
        return "basket-outline";
      case "PLANTING":
        return "flower-outline";
      case "PEST_CONTROL":
        return "bug-outline";
      case "SOIL_TESTING":
        return "flask-outline";
      case "WEEDING":
        return "trash-outline";
      default:
        return "ellipsis-horizontal-outline";
    }
  };

  const getActivityColor = (
    activityType: ActivityType,
    isCompleted: boolean
  ) => {
    if (isCompleted) {
      return theme.success;
    }

    switch (activityType) {
      case "WATERING":
        return "#4299e1"; // blue
      case "FERTILIZING":
        return "#48bb78"; // green
      case "PRUNING":
        return "#ed8936"; // orange
      case "HARVESTING":
        return "#ecc94b"; // yellow
      case "PLANTING":
        return "#9f7aea"; // purple
      case "PEST_CONTROL":
        return "#f56565"; // red
      case "SOIL_TESTING":
        return "#667eea"; // indigo
      case "WEEDING":
        return "#d69e2e"; // gold
      default:
        return theme.primary;
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: string) => {
    const today = new Date();
    const activityDate = new Date(date);

    if (
      activityDate.getDate() === today.getDate() &&
      activityDate.getMonth() === today.getMonth() &&
      activityDate.getFullYear() === today.getFullYear()
    ) {
      return "Hôm nay";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (
      activityDate.getDate() === tomorrow.getDate() &&
      activityDate.getMonth() === tomorrow.getMonth() &&
      activityDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return "Ngày mai";
    }

    return activityDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const renderActivityItem = (
    item: Activity | Schedule,
    isCompleted?: boolean
  ) => {
    const iconName = getActivityIcon((item as any).activityType);
    const timestamp =
      (item as Activity).timestamp || (item as Schedule).scheduledTime;
    const activityColor = getActivityColor(
      (item as any).activityType,
      isCompleted || false
    );

    return (
      <View key={item.id} style={styles.activityItem}>
        <View style={styles.timelineConnector}>
          <View
            style={[styles.activityDot, { backgroundColor: activityColor }]}
          />
          <View
            style={[
              styles.activityLine,
              { backgroundColor: "rgba(0,0,0,0.1)" },
            ]}
          />
        </View>

        <View style={styles.activityTimeContainer}>
          <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
            {formatTime(timestamp)}
          </Text>
        </View>

        <View
          style={[
            styles.activityContent,
            {
              backgroundColor: `${activityColor}10`,
              borderLeftColor: activityColor,
              ...Platform.select({
                ios: {
                  shadowColor: activityColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                },
                android: {
                  elevation: 2,
                },
              }),
            },
          ]}
        >
          <View style={styles.activityHeader}>
            <View style={styles.activityNameContainer}>
              <Text style={[styles.activityName, { color: theme.text }]}>
                {isCompleted ? "✓ " : "⋯ "}
                {item.name}
              </Text>
            </View>
            <View
              style={[
                styles.activityIconContainer,
                { backgroundColor: `${activityColor}20` },
              ]}
            >
              <Ionicons
                name={iconName as any}
                size={16}
                color={activityColor}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderDateGroup = (date: string, items: (Activity | Schedule)[]) => {
    return (
      <View key={date} style={styles.dateGroup}>
        <View style={styles.dateHeaderContainer}>
          <View
            style={[
              styles.dateBadge,
              { backgroundColor: theme.primary + "20" },
            ]}
          >
            <Text style={[styles.dateLabel, { color: theme.primary }]}>
              {date}
            </Text>
          </View>
        </View>
        <View style={styles.activitiesContainer}>
          {items.map((item) =>
            renderActivityItem(
              item,
              "completed" in item ? (item as Activity).completed : false
            )
          )}
        </View>
      </View>
    );
  };

  const groupByDate = () => {
    const groups: Record<string, (Activity | Schedule)[]> = {};

    // Group recent activities
    recentActivities.forEach((activity) => {
      const date = formatDate(activity.timestamp);
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });

    // Group upcoming schedules
    upcomingSchedules.forEach((schedule) => {
      const date = formatDate(schedule.scheduledTime);
      if (!groups[date]) groups[date] = [];
      groups[date].push(schedule);
    });

    return Object.entries(groups)
      .map(([date, items]) => {
        return {
          date,
          items: items.sort((a, b) => {
            const timeA = new Date(
              (a as Activity).timestamp || (a as Schedule).scheduledTime
            ).getTime();
            const timeB = new Date(
              (b as Activity).timestamp || (b as Schedule).scheduledTime
            ).getTime();
            return timeA - timeB;
          }),
        };
      })
      .sort((a, b) => {
        if (a.date === "Hôm nay") return -1;
        if (b.date === "Hôm nay") return 1;
        if (a.date === "Ngày mai") return -1;
        if (b.date === "Ngày mai") return 1;
        return 0;
      });
  };

  if (
    !selectedGardenId ||
    (recentActivities.length === 0 && upcomingSchedules.length === 0)
  ) {
    return null;
  }

  const dateGroups = groupByDate();

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Hoạt động
        </Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/activities")}
        >
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            Xem tất cả
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.timelineContainer, { backgroundColor: theme.card }]}>
        {dateGroups
          .slice(0, 2)
          .map((group) => renderDateGroup(group.date, group.items))}

        {dateGroups.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Không có hoạt động nào
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 2,
  },
  timelineContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dateBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  dateLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  activitiesContainer: {
    paddingLeft: 4,
  },
  activityItem: {
    flexDirection: "row",
    marginBottom: 16,
    position: "relative",
  },
  timelineConnector: {
    alignItems: "center",
    width: 20,
    marginRight: 6,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 2,
    marginBottom: 4,
  },
  activityLine: {
    width: 2,
    flex: 1,
    position: "absolute",
    top: 12,
    bottom: -16,
    left: 9,
    zIndex: 1,
  },
  activityTimeContainer: {
    width: 50,
    marginRight: 12,
    paddingTop: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  activityContent: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityNameContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  activityIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});
