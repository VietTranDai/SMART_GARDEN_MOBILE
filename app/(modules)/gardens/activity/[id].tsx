import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import ActivityList, {
  GardenActivity as ActivityListItemType,
} from "@/components/garden/ActivityList";
import { ActivityType } from "@/constants/database";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Define problematic types based on previous errors/context
const problematicActivityTypes = [
  ActivityType.PEST_CONTROL,
  ActivityType.SOIL_PREPARATION,
  ActivityType.WEEDING,
  ActivityType.OTHER,
];

// Mock data generation function (similar to the one in garden detail)
const generateMockActivities = (gardenId: string): ActivityListItemType[] => {
  const activityTypes = Object.values(ActivityType).filter(
    (t) => !problematicActivityTypes.includes(t)
  ); // Filter out problematic types
  const activities = [];
  const now = new Date();
  const numActivities = Math.floor(Math.random() * 15) + 10; // Generate 10-24 activities

  const getActivityTypeText = (actType: ActivityType): string => {
    switch (actType) {
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
      // Comment out or remove types causing issues if filtering above is not enough
      // case ActivityType.PEST_CONTROL:
      //   return "Kiểm soát sâu bệnh";
      // case ActivityType.SOIL_PREPARATION:
      //   return "Chuẩn bị đất";
      // case ActivityType.WEEDING:
      //   return "Nhổ cỏ";
      // case ActivityType.OTHER:
      // default:
      default: // Default remains for any unexpected types
        return "Khác";
    }
  };

  for (let i = 0; i < numActivities; i++) {
    const activityTime = new Date(now);
    // Spread activities over the last 30 days
    activityTime.setDate(now.getDate() - Math.floor(Math.random() * 30));
    activityTime.setHours(8 + Math.floor(Math.random() * 10)); // Random hour between 8 AM and 6 PM
    const type =
      activityTypes[Math.floor(Math.random() * activityTypes.length)];

    activities.push({
      id: i + 1,
      gardenId: parseInt(gardenId),
      gardenerId: 1, // Assume gardener ID 1
      activityType: type,
      timestamp: activityTime.toISOString(),
      details: `${getActivityTypeText(type)} cho vườn ${gardenId}.`,
      notes:
        Math.random() > 0.3
          ? `Ghi chú hoạt động #${i + 1}. Lorem ipsum dolor sit amet.`
          : null, // Add some notes randomly
      createdAt: activityTime.toISOString(),
      updatedAt: activityTime.toISOString(),
    });
  }
  // Sort activities by timestamp descending (most recent first)
  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  // Use type assertion to bypass enum mismatch error - TODO: Unify ActivityType definitions later
  return activities as ActivityListItemType[];
};

export default function GardenActivityHistoryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id: gardenId } = useLocalSearchParams<{ id: string }>(); // Get gardenId from route '[id]'
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [activities, setActivities] = useState<ActivityListItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = useCallback(async () => {
    if (!gardenId) return;
    console.log("Loading activities for garden:", gardenId);
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 700));
    try {
      const mockActivities = generateMockActivities(gardenId);
      setActivities(mockActivities);
    } catch (error) {
      console.error("Failed to load activities:", error);
      // Handle error display
    } finally {
      setIsLoading(false);
    }
  }, [gardenId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  }, [loadActivities]);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="format-list-bulleted-type"
        size={60}
        color={theme.textTertiary}
      />
      <Text style={styles.emptyText}>Chưa có hoạt động nào được ghi lại.</Text>
      <TouchableOpacity
        style={styles.addButtonEmpty}
        onPress={() =>
          router.push(`/gardens/activity/new?gardenId=${gardenId}`)
        }
      >
        <Text style={styles.addButtonEmptyText}>Thêm hoạt động đầu tiên</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Use gardenId in the title, maybe fetch garden name later */}
      <Stack.Screen options={{ title: `Lịch sử hoạt động Vườn ${gardenId}` }} />

      {isLoading && activities.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải hoạt động...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        >
          {activities.length > 0 ? (
            <ActivityList activities={activities} />
          ) : (
            renderEmptyComponent() // Show empty component if no activities
          )}
        </ScrollView>
      )}

      {/* Floating Action Button to add new activity */}
      {!isLoading && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            router.push(`/gardens/activity/new?gardenId=${gardenId}`)
          }
        >
          <MaterialCommunityIcons name="plus" size={24} color={theme.card} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.textSecondary,
    },
    listContentContainer: {
      padding: 16,
      paddingBottom: 80, // Add padding for FAB
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 16,
      paddingHorizontal: 16, // Match list padding
      paddingTop: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 50, // Adjust as needed
      paddingHorizontal: 30,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.textSecondary,
      marginTop: 16,
      textAlign: "center",
    },
    addButtonEmpty: {
      marginTop: 24,
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    addButtonEmptyText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 10,
      bottom: 20,
      backgroundColor: theme.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    scrollView: {
      flex: 1,
    },
  });
