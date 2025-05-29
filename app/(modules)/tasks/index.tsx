import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { TaskList } from "@/components/task";
import { TaskStatus } from "@/types/activities/task.types";

export default function TasksScreen() {
  const theme = useAppTheme();
  const [selectedFilter, setSelectedFilter] = useState<TaskStatus | undefined>(undefined);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TaskList initialFilter={selectedFilter} />
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/(modules)/tasks/create')}
      >
        <Ionicons name="add-outline" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
