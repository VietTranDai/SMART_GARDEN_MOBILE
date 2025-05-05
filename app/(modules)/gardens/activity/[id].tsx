import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import ActivityList from "@/components/garden/ActivityList";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GardenActivity } from "@/types";
import { taskService, gardenService, activityService } from "@/service/api";

export default function GardenActivityHistoryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id: gardenId } = useLocalSearchParams<{ id: string }>(); // Get gardenId from route '[id]'
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [activities, setActivities] = useState<GardenActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [garden, setGarden] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    if (!gardenId) return;
    console.log("Loading activities for garden:", gardenId);
    setIsLoading(true);
    setError(null);

    try {
      // Get garden details for the name
      const gardenData = await gardenService.getGardenById(gardenId);
      setGarden(gardenData);

      // Get activities for this garden
      const activitiesData = await activityService.getActivitiesByGarden(gardenId);
      setActivities(activitiesData);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setError("Không thể tải hoạt động. Vui lòng thử lại sau.");
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
      {/* Display garden name if available */}
      <Stack.Screen
        options={{
          title: garden?.name
            ? `Lịch sử hoạt động - ${garden.name}`
            : `Lịch sử hoạt động Vườn ${gardenId}`,
        }}
      />

      {isLoading && activities.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải hoạt động...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color={theme.error}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadActivities}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
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
      {!isLoading && !error && (
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
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    errorText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.text,
      fontFamily: "Inter-Medium",
      textAlign: "center",
    },
    retryButton: {
      marginTop: 24,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    scrollView: {
      flex: 1,
    },
    listContentContainer: {
      flexGrow: 1,
      paddingBottom: 80, // Extra space for FAB
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      marginTop: 40,
    },
    emptyText: {
      fontSize: 18,
      color: theme.text,
      marginTop: 16,
      marginBottom: 24,
      textAlign: "center",
      fontFamily: "Inter-Regular",
    },
    addButtonEmpty: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    addButtonEmptyText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });
