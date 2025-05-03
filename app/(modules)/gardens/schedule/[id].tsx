import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { TaskStatus, WateringScheduleItem } from "@/types";
import { taskService, gardenService } from "@/service/api";

export default function GardenScheduleScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id: gardenId } = useLocalSearchParams<{ id: string }>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [schedule, setSchedule] = useState<WateringScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [garden, setGarden] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper function to display Vietnamese Task/Alert status
  const getStatusText = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.PENDING:
        return "Chờ xử lý";
      case TaskStatus.COMPLETED:
        return "Hoàn thành";
      case TaskStatus.SKIPPED:
        return "Đã bỏ qua";
      default:
        return String(status); // Fallback
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return theme.success;
      case TaskStatus.SKIPPED:
        return theme.warning;
      case TaskStatus.PENDING:
      default:
        return theme.primary;
    }
  };

  const loadSchedule = useCallback(async () => {
    if (!gardenId) return;
    setIsLoading(true);
    setError(null);

    try {
      // Get garden details for the name
      const gardenData = await gardenService.getGardenById(gardenId);
      setGarden(gardenData);

      // Get watering schedules for this garden
      const scheduleData = await taskService.getGardenWateringSchedules(
        gardenId
      );
      setSchedule(scheduleData as WateringScheduleItem[]);
    } catch (error) {
      console.error("Failed to load schedule:", error);
      setError("Không thể tải lịch tưới. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }, [gardenId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSchedule();
    setRefreshing(false);
  }, [loadSchedule]);

  const handleAddNewSchedule = () => {
    // Navigate to the schedule creation screen
    router.push({
      pathname: "/(modules)/gardens/schedule",
      params: { id: gardenId },
    });
  };

  const handleUpdateScheduleStatus = async (
    id: number,
    newStatus: TaskStatus
  ) => {
    try {
      if (newStatus === TaskStatus.COMPLETED) {
        await taskService.completeWateringSchedule(id.toString());
      } else if (newStatus === TaskStatus.SKIPPED) {
        await taskService.skipWateringSchedule(id.toString());
      }

      // Update local state
      setSchedule((prevSchedule) =>
        prevSchedule.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error(`Failed to update schedule status:`, error);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái lịch tưới.");
    }
  };

  const renderScheduleItem = ({ item }: { item: WateringScheduleItem }) => {
    const isPending = item.status === TaskStatus.PENDING;
    const isPast = new Date(item.scheduledAt) < new Date();

    return (
      <View style={styles.itemContainer}>
        <MaterialIcons
          name="water-drop"
          size={24}
          color={getStatusColor(item.status)}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemDateTime}>
            {new Date(item.scheduledAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(item.scheduledAt).toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            })}
          </Text>
          <Text style={styles.itemAmount}>{item.amount} Lít nước</Text>
        </View>

        <View style={styles.itemActions}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>

          {isPending && !isPast && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.success + "20" },
                ]}
                onPress={() =>
                  handleUpdateScheduleStatus(item.id, TaskStatus.COMPLETED)
                }
              >
                <MaterialIcons name="check" size={16} color={theme.success} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.warning + "20" },
                ]}
                onPress={() =>
                  handleUpdateScheduleStatus(item.id, TaskStatus.SKIPPED)
                }
              >
                <MaterialIcons name="close" size={16} color={theme.warning} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="calendar-remove-outline"
        size={60}
        color={theme.textTertiary}
      />
      <Text style={styles.emptyText}>Chưa có lịch tưới nước nào.</Text>
      <TouchableOpacity
        style={styles.addButtonEmpty}
        onPress={handleAddNewSchedule}
      >
        <Text style={styles.addButtonEmptyText}>Tạo lịch tưới đầu tiên</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: garden?.name
            ? `Lịch tưới - ${garden.name}`
            : `Lịch tưới Vườn ${gardenId}`,
        }}
      />

      {isLoading && schedule.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải lịch tưới...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={60}
            color={theme.error}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSchedule}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={schedule}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        />
      )}

      {/* Floating Action Button to add new schedule */}
      {!isLoading && !error && (
        <TouchableOpacity style={styles.fab} onPress={handleAddNewSchedule}>
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
    listContent: {
      padding: 16,
      paddingBottom: 80, // Space for FAB
    },
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: 12,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    itemDetails: {
      flex: 1,
      marginLeft: 12,
    },
    itemDateTime: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.text,
      marginBottom: 4,
    },
    itemAmount: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    itemActions: {
      alignItems: "flex-end",
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 16,
      alignItems: "center",
      marginBottom: 8,
    },
    statusText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
    },
    actionButtons: {
      flexDirection: "row",
    },
    actionButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
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
