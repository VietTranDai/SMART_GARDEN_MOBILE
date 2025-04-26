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
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

// Mock data for tasks
const TASKS_DATA = [
  {
    id: "1",
    type: "WATERING",
    description: "Water tomato plants in the main bed",
    gardenName: "Backyard Garden",
    dueDate: "2025-04-20T10:00:00Z",
    status: "PENDING",
  },
  {
    id: "2",
    type: "FERTILIZING",
    description: "Apply liquid fertilizer to rose bushes",
    gardenName: "Front Yard Flowers",
    dueDate: "2025-04-21T08:30:00Z",
    status: "PENDING",
  },
  {
    id: "3",
    type: "PRUNING",
    description: "Prune apple trees - remove dead branches",
    gardenName: "Orchard Section A",
    dueDate: "2025-04-19T15:00:00Z",
    status: "COMPLETED",
  },
  {
    id: "4",
    type: "HARVESTING",
    description: "Harvest ripe strawberries from patch 1",
    gardenName: "Berry Patch",
    dueDate: "2025-04-18T11:00:00Z",
    status: "COMPLETED",
  },
  {
    id: "5",
    type: "PEST_CONTROL",
    description: "Check for aphids on cabbage and apply neem oil if needed",
    gardenName: "Vegetable Garden Plot B",
    dueDate: "2025-04-22T09:00:00Z",
    status: "PENDING",
  },
  {
    id: "6",
    type: "PLANTING",
    description: "Plant new basil seedlings",
    gardenName: "Herb Garden Pots",
    dueDate: "2025-04-23T14:00:00Z",
    status: "PENDING",
  },
  {
    id: "7",
    type: "WEEDING",
    description: "Weed the carrot patch",
    gardenName: "Vegetable Garden Plot A",
    dueDate: "2025-04-20T16:00:00Z",
    status: "SKIPPED",
  },
];

// Define the Task interface
interface Task {
  id: string;
  type: string;
  description: string;
  gardenName: string;
  dueDate: string;
  status: "PENDING" | "COMPLETED" | "SKIPPED";
}

export default function TasksScreen() {
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "COMPLETED" | "SKIPPED"
  >("ALL");

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setTasks(TASKS_DATA as Task[]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTasks = useMemo(() => {
    if (filter === "ALL") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setTasks(TASKS_DATA.sort(() => 0.5 - Math.random()) as Task[]);
      setLoading(false);
      setRefreshing(false);
    }, 1500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return theme.success;
      case "SKIPPED":
        return theme.warning;
      case "PENDING":
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
            {item.gardenName}
          </Text>
        </View>
        <View
          style={[
            styles.taskStatus,
            { backgroundColor: getStatusColor(item.status) + "26" },
          ]}
        >
          <Text
            style={[
              styles.taskStatusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.taskFooter}>
        <Ionicons
          name="calendar-clear-outline"
          size={16}
          color={theme.textSecondary}
        />
        <Text style={styles.dueDateText}>{formatDate(item.dueDate)}</Text>
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              console.log("Complete Task", item.id);
            }}
          >
            <Feather name="check-circle" size={20} color={theme.success} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              console.log("Skip Task", item.id);
            }}
          >
            <Feather name="skip-forward" size={20} color={theme.warning} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (
    buttonFilter: "ALL" | "PENDING" | "COMPLETED" | "SKIPPED",
    text: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: filter === buttonFilter ? theme.primary : theme.card,
        },
      ]}
      onPress={() => setFilter(buttonFilter)}
    >
      <Text
        style={[
          styles.filterText,
          { color: filter === buttonFilter ? theme.card : theme.textSecondary },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.filterContainer}>
        {renderFilterButton("ALL", "All")}
        {renderFilterButton("PENDING", "Pending")}
        {renderFilterButton("COMPLETED", "Completed")}
        {renderFilterButton("SKIPPED", "Skipped")}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="check-square"
                size={48}
                color={theme.textTertiary}
              />
              <Text style={styles.emptyTitle}>
                {filter === "ALL"
                  ? "No tasks found"
                  : `No ${filter.toLowerCase()} tasks`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === "ALL"
                  ? "Add a new task or check back later."
                  : `You have no tasks with status "${filter}".`}
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButtonInline,
                  { backgroundColor: theme.primary },
                ]}
                onPress={() => router.push("/(modules)/tasks/new")}
              >
                <Ionicons name="add" size={20} color={theme.background} />
                <Text style={styles.addButtonText}>Add New Task</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {!loading && (
        <TouchableOpacity
          style={[styles.floatingAddButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/(modules)/tasks/new")}
        >
          <Ionicons name="add" size={30} color={theme.card} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundSecondary,
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
    filterText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    listContainer: {
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
    taskStatus: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    taskStatusText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      textTransform: "capitalize",
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
    dueDateText: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginLeft: 6,
    },
    taskActions: {
      flexDirection: "row",
    },
    actionButton: {
      marginLeft: 10,
      padding: 5,
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
    emptySubtitle: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 24,
    },
    addButtonInline: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    addButtonText: {
      color: theme.background,
      fontSize: 15,
      fontFamily: "Inter-Medium",
      marginLeft: 8,
    },
    floatingAddButton: {
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
