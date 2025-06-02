import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { taskService, gardenService } from "@/service/api";
import { Task, TaskStatus } from "@/types/activities/task.types";
import { Garden } from "@/types";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function TaskDetailScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGarden, setLoadingGarden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  useEffect(() => {
    fetchTaskDetail();
  }, [id]);

  // Fetch garden details when task is loaded
  useEffect(() => {
    if (task?.gardenId) {
      fetchGardenDetail(task.gardenId);
    }
  }, [task?.gardenId]);

  const fetchTaskDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const taskDetail = await taskService.getTaskById(Number(id));
      setTask(taskDetail);
    } catch (err) {
      console.error("Failed to fetch task details:", err);
      setError("Không thể tải thông tin công việc. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGardenDetail = async (gardenId: number) => {
    try {
      setLoadingGarden(true);
      const gardenDetail = await gardenService.getGardenById(gardenId);
      setGarden(gardenDetail);
    } catch (err) {
      console.error("Failed to fetch garden details:", err);
    } finally {
      setLoadingGarden(false);
    }
  };

  const updateTaskStatus = async (newStatus: TaskStatus) => {
    if (!task) return;
    
    try {
      setUpdating(true);
      await taskService.updateTask(task.id, { status: newStatus });
      setTask({ ...task, status: newStatus });
      Alert.alert(
        "Thành công", 
        `Đã cập nhật trạng thái công việc thành ${newStatus === TaskStatus.COMPLETED ? "hoàn thành" : "đang chờ"}`
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái công việc. Vui lòng thử lại sau.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return theme.success;
      case TaskStatus.PENDING:
        return theme.primary;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return "Đã hoàn thành";
      case TaskStatus.PENDING:
        return "Đang chờ";
      default:
        return "Không xác định";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm - dd/MM/yyyy", { locale: vi });
    } catch (e) {
      return "Không xác định";
    }
  };

  const handleComplete = () => {
    if (!task) return;
    
    if (task.status === TaskStatus.PENDING) {
      Alert.alert(
        "Xác nhận hoàn thành",
        "Bạn có chắc chắn muốn đánh dấu công việc này là đã hoàn thành?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xác nhận", onPress: () => updateTaskStatus(TaskStatus.COMPLETED) }
        ]
      );
    } else {
      Alert.alert(
        "Đặt lại trạng thái",
        "Bạn có chắc chắn muốn đặt lại công việc này về trạng thái đang chờ?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xác nhận", onPress: () => updateTaskStatus(TaskStatus.PENDING) }
        ]
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.card,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: theme.error,
      textAlign: 'center',
      fontFamily: 'Inter-Medium',
      marginTop: 10,
    },
    retryButton: {
      marginTop: 16,
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      color: 'white',
      fontFamily: 'Inter-Medium',
    },
    taskCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    taskTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 8,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      marginLeft: 4,
    },
    infoSection: {
      marginBottom: 20,
    },
    infoTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 8,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    infoIconContainer: {
      width: 30,
      alignItems: 'center',
      marginRight: 10,
    },
    infoLabel: {
      width: 100,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.textSecondary,
    },
    infoValue: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter-Regular',
      color: theme.text,
    },
    descriptionText: {
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: theme.text,
      lineHeight: 22,
    },
    actionButtonsContainer: {
      marginTop: 16,
    },
    actionButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    pendingButton: {
      backgroundColor: theme.primary,
    },
    completedButton: {
      backgroundColor: theme.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.border,
    },
    pendingButtonText: {
      color: 'white',
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      marginLeft: 8,
    },
    completedButtonText: {
      color: theme.textSecondary,
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      marginLeft: 8,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/(modules)/tasks/")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết công việc</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 10, color: theme.textSecondary }}>Đang tải chi tiết công việc...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !task) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/(modules)/tasks/")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết công việc</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.error} />
          <Text style={styles.errorText}>{error || "Không tìm thấy thông tin công việc"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTaskDetail}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(modules)/tasks/")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết công việc</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.taskCard}>
          <Text style={styles.taskTitle}>{task.type}</Text>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(task.status) + '20' }
            ]}>
              <Ionicons 
                name={task.status === TaskStatus.COMPLETED ? "checkmark-circle" : "timer-outline"}
                size={16}
                color={getStatusColor(task.status)}
              />
              <Text style={[
                styles.statusText,
                { color: getStatusColor(task.status) }
              ]}>
                {getStatusLabel(task.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Thông tin cơ bản</Text>
            
            {garden && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="leaf" size={18} color={theme.success} />
                </View>
                <Text style={styles.infoLabel}>Vườn:</Text>
                <Text style={styles.infoValue}>{garden.name}</Text>
              </View>
            )}
            
            {task.dueDate && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="calendar" size={18} color={theme.primary} />
                </View>
                <Text style={styles.infoLabel}>Hạn chót:</Text>
                <Text style={styles.infoValue}>{formatDate(task.dueDate)}</Text>
              </View>
            )}
            
            {task.createdAt && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
                </View>
                <Text style={styles.infoLabel}>Tạo lúc:</Text>
                <Text style={styles.infoValue}>{formatDate(task.createdAt)}</Text>
              </View>
            )}
            
            {task.updatedAt && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="refresh-outline" size={18} color={theme.textSecondary} />
                </View>
                <Text style={styles.infoLabel}>Cập nhật:</Text>
                <Text style={styles.infoValue}>{formatDate(task.updatedAt)}</Text>
              </View>
            )}
            
            {task.gardenerId && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="person-outline" size={18} color={theme.info} />
                </View>
                <Text style={styles.infoLabel}>Người thực hiện:</Text>
                <Text style={styles.infoValue}>ID: {task.gardenerId}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Mô tả công việc</Text>
            <Text style={styles.descriptionText}>{task.description || "Không có mô tả cho công việc này."}</Text>
          </View>
          
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                task.status === TaskStatus.PENDING ? styles.pendingButton : styles.completedButton
              ]}
              onPress={handleComplete}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color={task.status === TaskStatus.PENDING ? "white" : theme.primary} />
              ) : (
                <>
                  <Ionicons 
                    name={task.status === TaskStatus.PENDING ? "checkmark-circle" : "refresh-circle"}
                    size={20}
                    color={task.status === TaskStatus.PENDING ? "white" : theme.textSecondary}
                  />
                  <Text 
                    style={task.status === TaskStatus.PENDING ? styles.pendingButtonText : styles.completedButtonText}
                  >
                    {task.status === TaskStatus.PENDING ? "Đánh dấu hoàn thành" : "Đặt lại trạng thái"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 