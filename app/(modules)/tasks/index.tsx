import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { taskService } from "@/service/api";
import { TaskStatus, Task } from "@/types/activities/task.types";

export default function TasksScreen() {
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [error, setError] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const params: { status?: TaskStatus } = {};
      if (filter !== "ALL") {
        params.status = filter;
      }
      const tasksData = await taskService.getTasks(params);
      setTasks(tasksData);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError("Không thể tải danh sách nhiệm vụ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, [fetchTasks]);

  const handleCompleteTask = async (taskId: number) => {
    try {
      await taskService.completeTask(taskId);
      // Update local task state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: TaskStatus.COMPLETED } : task
        )
      );
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  const handleSkipTask = async (taskId: number) => {
    try {
      await taskService.skipTask(taskId);
      // Update local task state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: TaskStatus.SKIPPED } : task
        )
      );
    } catch (err) {
      console.error("Failed to skip task:", err);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return theme.success;
      case TaskStatus.SKIPPED:
        return theme.warning;
      case TaskStatus.PENDING:
        return theme.primary;
      default:
        return theme.textTertiary;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "WATERING":
        return "water-outline";
      case "FERTILIZING":
        return "leaf-outline";
      case "PRUNING":
        return "cut-outline";
      case "HARVESTING":
        return "basket-outline";
      case "PEST_CONTROL":
        return "bug-outline";
      case "PLANTING":
        return "trending-up-outline";
      case "WEEDING":
        return "remove-circle-outline";
      default:
        return "clipboard-outline";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow =
      new Date(now.setDate(now.getDate() + 1)).toDateString() ===
      date.toDateString();
    now.setDate(now.getDate() - 1);

    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return `Today at ${time}`;
    if (isTomorrow) return `Tomorrow at ${time}`;
    return `${date.toLocaleDateString()} at ${time}`;
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => router.push(`/(modules)/tasks/${item.id}`)}
    >
      <View style={styles.taskHeader}>
        <View
          style={[
            styles.taskIconContainer,
            { backgroundColor: getStatusColor(item.status) + "1A" },
          ]}
        >
          <Ionicons
            name={getTaskIcon(item.type) as any}
            size={24}
            color={getStatusColor(item.status)}
          />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskType} numberOfLines={1}>
            {item.type.replace("_", " ")}
          </Text>
          <Text style={styles.taskGarden} numberOfLines={1}>
            {item.gardenId}
          </Text>
        </View>
        {item.status === TaskStatus.PENDING && (
          <View style={styles.taskActions}>
            <TouchableOpacity
              style={styles.taskActionButton}
              onPress={() => handleCompleteTask(item.id)}
            >
              <Ionicons
                name="checkmark-outline"
                size={18}
                color={theme.success}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.taskActionButton}
              onPress={() => handleSkipTask(item.id)}
            >
              <Ionicons name="close-outline" size={18} color={theme.warning} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.taskFooter}>
        <View style={styles.dueDateContainer}>
          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
          <Text style={styles.dueDate}>{formatDate(item.dueDate)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "1A" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (
    buttonFilter: "ALL" | TaskStatus,
    text: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === buttonFilter && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(buttonFilter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === buttonFilter && styles.filterButtonTextActive,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Nhiệm vụ</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton("ALL", "Tất cả")}
          {renderFilterButton(TaskStatus.PENDING, "Đang chờ")}
          {renderFilterButton(TaskStatus.COMPLETED, "Đã hoàn thành")}
          {renderFilterButton(TaskStatus.SKIPPED, "Đã bỏ qua")}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải nhiệm vụ...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTasks}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="clipboard-outline"
            size={64}
            color={theme.textTertiary}
          />
          <Text style={styles.emptyTitle}>Không có nhiệm vụ nào</Text>
          <Text style={styles.emptyText}>
            {filter === "ALL"
              ? "Bạn chưa có nhiệm vụ nào. Thêm cây trồng mới để bắt đầu."
              : `Không có nhiệm vụ nào ở trạng thái "${filter}".`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/(modules)/tasks/create")}
      >
        <Ionicons name="add-outline" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundSecondary,
    },
    header: {
      padding: 16,
      paddingTop: 24,
      paddingBottom: 20,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    title: {
      fontSize: 20,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 12,
      paddingHorizontal: 10,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    filterButtonActive: {
      backgroundColor: theme.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    filterButtonTextActive: {
      color: theme.card,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 30,
    },
    errorText: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.error,
      marginBottom: 24,
    },
    retryButton: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.primary,
    },
    retryButtonText: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.card,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 30,
      marginTop: 50,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 24,
    },
    taskList: {
      padding: 16,
    },
    taskCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    taskHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    taskIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    taskInfo: {
      flex: 1,
      marginRight: 8,
    },
    taskType: {
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      textTransform: "capitalize",
    },
    taskGarden: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginTop: 2,
    },
    taskDescription: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginBottom: 12,
      lineHeight: 20,
    },
    taskFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      paddingTop: 12,
      marginTop: 8,
    },
    dueDateContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    dueDate: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginLeft: 6,
    },
    taskActions: {
      flexDirection: "row",
    },
    taskActionButton: {
      marginLeft: 10,
      padding: 5,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      textTransform: "capitalize",
    },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  });
