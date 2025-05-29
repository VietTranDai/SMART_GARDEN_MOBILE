import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { TaskList } from "@/components/task";
import { TaskStatus } from "@/types/activities/task.types";
import { gardenService, taskService } from "@/service/api";
import { Garden } from "@/types";
import { Picker } from '@react-native-picker/picker';

export default function TasksScreen() {
  const theme = useAppTheme();
  const [selectedGardenId, setSelectedGardenId] = useState<string | undefined>(undefined);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loadingGardens, setLoadingGardens] = useState(true);
  const [gardenFetchError, setGardenFetchError] = useState<string | null>(null);
  const [taskCounts, setTaskCounts] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Fetch gardens for filter
  const fetchUserGardens = useCallback(async () => {
    try {
      setLoadingGardens(true);
      setGardenFetchError(null);
      const userGardens = await gardenService.getGardens();
      setGardens(userGardens || []);
    } catch (err) {
      console.error("Failed to fetch gardens for filter:", err);
      setGardenFetchError("Không thể tải danh sách vườn để lọc.");
    } finally {
      setLoadingGardens(false);
    }
  }, []);

  // Fetch task counts for summary display
  const fetchTaskCounts = useCallback(async () => {
    try {
      setLoadingCounts(true);
      // We'll just get the first page with a high limit to count tasks
      const params = { page: 1, limit: 100 };
      const allTasks = await taskService.getTasks(params);
      const pendingTasks = await taskService.getTasks({ ...params, status: TaskStatus.PENDING });
      const completedTasks = await taskService.getTasks({ ...params, status: TaskStatus.COMPLETED });
      
      // Update the counts based on the meta info
      setTaskCounts({
        total: allTasks.meta?.totalItems || 0,
        pending: pendingTasks.meta?.totalItems || 0,
        completed: completedTasks.meta?.totalItems || 0
      });
    } catch (err) {
      console.error("Failed to fetch task counts:", err);
    } finally {
      setLoadingCounts(false);
    }
  }, []);

  useEffect(() => {
    fetchUserGardens();
    fetchTaskCounts();
  }, [fetchUserGardens, fetchTaskCounts]);

  useFocusEffect(
    useCallback(() => {
      fetchUserGardens();
      fetchTaskCounts();
    }, [fetchUserGardens, fetchTaskCounts])
  );

  // Find selected garden name
  const selectedGardenName = selectedGardenId 
    ? gardens.find(g => g.id.toString() === selectedGardenId)?.name 
    : undefined;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerSection: {
      backgroundColor: theme.card,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: theme.text,
    },
    summaryStatsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 5,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 8,
      padding: 10,
      marginHorizontal: 4,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    statValue: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
    },
    filterContainer: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    pickerLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginBottom: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pickerLabelText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
      marginLeft: 5,
    },
    pickerWrapper: {
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    pickerStyle: {
      color: theme.text,
      height: Platform.OS === 'ios' ? 150 : 50, // Taller for iOS
    },
    selectedGardenInfo: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.primary + '15',
      borderLeftWidth: 3,
      borderLeftColor: theme.primary,
    },
    selectedGardenText: {
      fontSize: 13,
      fontFamily: 'Inter-Medium',
      color: theme.text,
      marginLeft: 6,
      flex: 1,
    },
    clearFilterButton: {
      padding: 6,
    },
    errorText: {
      color: theme.error,
      textAlign: 'center',
      padding: 10,
      fontFamily: 'Inter-Regular',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      justifyContent: 'center',
    },
    loadingText: {
      marginLeft: 10,
      color: theme.textSecondary,
      fontFamily: 'Inter-Regular',
    },
    contentWrapper: {
      flex: 1,
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    fabIcon: {
      fontSize: 30,
      color: theme.card,
    },
    countLoadingIndicator: {
      width: 18,
      height: 18,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Section with Task Stats */}
      <View style={styles.headerSection}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Danh sách công việc</Text>
          {loadingCounts && (
            <ActivityIndicator size="small" color={theme.primary} style={styles.countLoadingIndicator} />
          )}
        </View>

        <View style={styles.summaryStatsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={styles.statValue}>{taskCounts.total}</Text>
            <Text style={styles.statLabel}>Tổng công việc</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.primary + '15', borderColor: theme.primaryLight }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{taskCounts.pending}</Text>
            <Text style={styles.statLabel}>Đang chờ</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.success + '15', borderColor: theme.success + '30' }]}>
            <Text style={[styles.statValue, { color: theme.success }]}>{taskCounts.completed}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>
      </View>

      {/* Garden Filter Section */}
      <View style={styles.filterContainer}>
        <View style={styles.pickerLabel}>
          <Ionicons name="filter-outline" size={16} color={theme.textSecondary} />
          <Text style={styles.pickerLabelText}>Lọc theo vườn:</Text>
        </View>
        
        {loadingGardens && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách vườn...</Text>
          </View>
        )}
        
        {gardenFetchError && !loadingGardens && (
          <Text style={styles.errorText}>{gardenFetchError}</Text>
        )}
        
        {!loadingGardens && !gardenFetchError && (
          <View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedGardenId}
                onValueChange={(itemValue) => setSelectedGardenId(itemValue === "all" ? undefined : itemValue)}
                style={styles.pickerStyle}
                prompt="Chọn vườn để lọc"
              >
                <Picker.Item label="Tất cả các vườn" value="all" />
                {gardens.map((garden) => (
                  <Picker.Item key={garden.id.toString()} label={garden.name} value={garden.id.toString()} />
                ))}
              </Picker>
            </View>
            
            {selectedGardenId && selectedGardenName && (
              <View style={styles.selectedGardenInfo}>
                <Ionicons name="leaf" size={18} color={theme.primary} />
                <Text style={styles.selectedGardenText}>
                  Đang xem công việc cho vườn: <Text style={{fontFamily: 'Inter-SemiBold'}}>{selectedGardenName}</Text>
                </Text>
                <TouchableOpacity 
                  onPress={() => setSelectedGardenId(undefined)} 
                  style={styles.clearFilterButton}
                >
                  <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Task List */}
      <View style={styles.contentWrapper}>
        <TaskList gardenId={selectedGardenId ? parseInt(selectedGardenId) : undefined} />
      </View>
      
      {/* FAB for creating new task */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(modules)/tasks/create')}
        activeOpacity={0.7}
      >
        <Ionicons name="add-outline" style={styles.fabIcon} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
