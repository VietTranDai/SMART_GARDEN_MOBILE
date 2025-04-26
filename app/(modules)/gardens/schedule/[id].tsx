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
import { TaskStatus } from "@/constants/database"; // Assuming TaskStatus is here
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

interface WateringScheduleItem {
  id: number;
  gardenId: number;
  scheduledAt: string;
  amount: number; // in Liters
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

// Mock data generation function
const generateMockWateringSchedule = (
  gardenId: string
): WateringScheduleItem[] => {
  const schedules = [];
  const now = new Date();
  const statuses: TaskStatus[] = [
    TaskStatus.PENDING,
    TaskStatus.COMPLETED,
    TaskStatus.SKIPPED,
    TaskStatus.PENDING,
    TaskStatus.COMPLETED,
  ];
  const numSchedules = Math.floor(Math.random() * 8) + 5; // 5-12 schedules

  for (let i = 0; i < numSchedules; i++) {
    const scheduledTime = new Date(now);
    // Spread schedules over the next 7 days and past 3 days
    const dayOffset = Math.floor(Math.random() * 10) - 3; // -3 to +6 days from now
    scheduledTime.setDate(now.getDate() + dayOffset);
    scheduledTime.setHours(Math.floor(Math.random() * 12) + 6, 0, 0, 0); // Schedule between 6 AM and 6 PM

    schedules.push({
      id: i + 1,
      gardenId: parseInt(gardenId),
      scheduledAt: scheduledTime.toISOString(),
      amount: Math.round(Math.random() * 5 + 5), // 5-10 liters
      status: statuses[i % statuses.length],
      createdAt: new Date(
        now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 5
      ).toISOString(), // Created in last 5 days
      updatedAt: new Date().toISOString(),
    });
  }
  // Sort schedules by date ascending
  schedules.sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
  return schedules;
};

export default function GardenScheduleScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id: gardenId } = useLocalSearchParams<{ id: string }>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [schedule, setSchedule] = useState<WateringScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      const mockSchedule = generateMockWateringSchedule(gardenId);
      setSchedule(mockSchedule);
    } catch (error) {
      console.error("Failed to load schedule:", error);
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
    // TODO: Navigate to a new screen or show a modal to add schedule
    Alert.alert(
      "Chức năng đang phát triển",
      "Tạo lịch tưới mới sẽ được thêm vào sau."
    );
  };

  const renderScheduleItem = ({ item }: { item: WateringScheduleItem }) => (
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
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + "20" },
        ]}
      >
        <Text
          style={[styles.statusText, { color: getStatusColor(item.status) }]}
        >
          {getStatusText(item.status)}
        </Text>
      </View>
    </View>
  );

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
      <Stack.Screen options={{ title: `Lịch tưới Vườn ${gardenId}` }} />

      {isLoading && schedule.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải lịch tưới...</Text>
        </View>
      ) : (
        <FlatList
          data={schedule}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
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
      {!isLoading && (
        <TouchableOpacity style={styles.fab} onPress={handleAddNewSchedule}>
          <MaterialCommunityIcons
            name="calendar-plus"
            size={24}
            color={theme.card}
          />
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
    itemContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      elevation: 1,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
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
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      marginLeft: 8,
    },
    statusText: {
      fontSize: 13,
      fontFamily: "Inter-SemiBold",
      textTransform: "capitalize",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 50,
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
  });
