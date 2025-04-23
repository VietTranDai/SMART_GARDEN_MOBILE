import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

// Mock data for tasks
const TASKS_DATA = [
  {
    id: "1",
    type: "WATERING",
    description: "Water tomato plants",
    gardenName: "Backyard Garden",
    dueDate: "2025-04-20T10:00:00Z",
    status: "PENDING",
  },
  {
    id: "2",
    type: "FERTILIZING",
    description: "Apply fertilizer to rose bushes",
    gardenName: "Front Yard",
    dueDate: "2025-04-21T08:30:00Z",
    status: "PENDING",
  },
  {
    id: "3",
    type: "PRUNING",
    description: "Prune apple trees",
    gardenName: "Orchard",
    dueDate: "2025-04-19T15:00:00Z",
    status: "COMPLETED",
  },
  {
    id: "4",
    type: "HARVESTING",
    description: "Harvest ripe strawberries",
    gardenName: "Berry Patch",
    dueDate: "2025-04-18T11:00:00Z",
    status: "COMPLETED",
  },
  {
    id: "5",
    type: "PEST_CONTROL",
    description: "Check for aphids on cabbage",
    gardenName: "Vegetable Garden",
    dueDate: "2025-04-22T09:00:00Z",
    status: "PENDING",
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
  const [tasks, setTasks] = useState<Task[]>(TASKS_DATA as Task[]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  const styles = useMemo(() => createStyles(theme), [theme]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "ALL") return true;
    return task.status === filter;
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setTasks(TASKS_DATA as Task[]);
      setRefreshing(false);
    }, 1500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return theme.success;
      case "SKIPPED":
        return theme.warning;
      default:
        return theme.primary;
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
      default:
        return "clipboard-outline";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/(modules)/tasks/${item.id}`)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskIconContainer}>
          <Ionicons
            name={getTaskIcon(item.type)}
            size={24}
            color={theme.primary}
          />
        </View>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskType, { color: theme.text }]}>
            {item.type.replace("_", " ")}
          </Text>
          <Text style={[styles.taskGarden, { color: theme.textSecondary }]}>
            {item.gardenName}
          </Text>
        </View>
        <View
          style={[
            styles.taskStatus,
            { backgroundColor: getStatusColor(item.status) + "20" },
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
      <Text style={[styles.taskDescription, { color: theme.text }]}>
        {item.description}
      </Text>
      <View style={styles.taskFooter}>
        <View style={styles.dueDate}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={[styles.dueDateText, { color: theme.textSecondary }]}>
            {formatDate(item.dueDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      edges={["bottom"]}
    >
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === "ALL" ? theme.primary : theme.background,
            },
          ]}
          onPress={() => setFilter("ALL")}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === "ALL" ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === "PENDING" ? theme.primary : theme.background,
            },
          ]}
          onPress={() => setFilter("PENDING")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === "PENDING" ? "#FFFFFF" : theme.textSecondary,
              },
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === "COMPLETED" ? theme.primary : theme.background,
            },
          ]}
          onPress={() => setFilter("COMPLETED")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === "COMPLETED" ? "#FFFFFF" : theme.textSecondary,
              },
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="clipboard-outline"
              size={64}
              color={theme.textTertiary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No tasks found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Pull down to refresh
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/(modules)/tasks/new")}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    filterContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 12,
      justifyContent: "space-between",
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      flex: 1,
      marginHorizontal: 4,
      alignItems: "center",
    },
    filterText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    listContent: {
      padding: 16,
      paddingBottom: 80,
    },
    taskCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    taskHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    taskIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    taskInfo: {
      flex: 1,
    },
    taskType: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    taskGarden: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
    taskStatus: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    taskStatusText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
    },
    taskDescription: {
      fontSize: 15,
      fontFamily: "Inter-Regular",
      marginBottom: 12,
    },
    taskFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dueDate: {
      flexDirection: "row",
      alignItems: "center",
    },
    dueDateText: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      marginLeft: 6,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: "Inter-Medium",
      marginTop: 12,
    },
    emptySubtext: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      marginTop: 8,
    },
    addButton: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      backgroundColor: theme.primary,
    },
  });
