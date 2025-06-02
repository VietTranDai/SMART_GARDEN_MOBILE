import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { router, useFocusEffect } from 'expo-router';
import { TaskStatus } from '@/types/activities/task.types';
import { GetTasksQueryDto, PaginationMeta, TaskDto } from '@/types/activities/dtos';
import { taskService } from '@/service/api';
import { ActivityType } from '@/types/activities/activity.types';

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f1',
  },
  filterButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#dfe3e6',
    backgroundColor: '#fdfdfd',
  },
  filterButtonActive: {
    backgroundColor: theme.primaryLight || theme.primary + '30',
    borderColor: theme.primaryDark || theme.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: theme.primary,
    fontFamily: 'Inter-SemiBold',
  },
  taskList: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 70,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginVertical: 5,
    shadowColor: '#90a4ae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 0,
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  taskInfo: {
    flex: 1,
  },
  taskType: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginBottom: 3,
  },
  gardenInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  taskGarden: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 4,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    flexShrink: 1,
  },
  taskDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: theme.text,
    marginTop: 8,
    marginBottom: 10,
    lineHeight: 21,
    paddingHorizontal: 2,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight || '#e8eaed',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  dueDate: {
    fontSize: 12.5,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11.5,
    fontFamily: 'Inter-Bold',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 14,
    color: theme.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 16,
    color: theme.error,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
    maxWidth: 260,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
    marginTop: 18,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: theme.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
  plantInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  highlightedText: {
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  overdueDateContainer: {
    backgroundColor: theme.error + '15',
    borderWidth: 1,
    borderColor: theme.error + '60',
  },
  urgentDateContainer: {
    backgroundColor: theme.warning + '20',
    borderWidth: 1,
    borderColor: theme.warning + '60',
  },
  urgentText: {
    color: theme.warning,
    fontFamily: 'Inter-SemiBold',
  },
  overdueText: {
    color: theme.error,
    fontFamily: 'Inter-SemiBold',
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
    marginBottom: 6,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary + '40',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 3,
  },
  metadataText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    marginLeft: 4,
  },
});

interface TaskListProps {
  initialFilter?: TaskStatus;
  gardenId?: number;
  onTaskPress?: (task: TaskDto) => void;
}

const TaskList: React.FC<TaskListProps> = (props) => {
  const { initialFilter, gardenId, onTaskPress } = props;
  
  const theme = useAppTheme();
  const styles = createStyles(theme);
  
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | undefined>(initialFilter);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const activityTypeTranslations: Record<ActivityType, string> = {
    [ActivityType.PLANTING]: "Trồng cây",
    [ActivityType.WATERING]: "Tưới nước",
    [ActivityType.FERTILIZING]: "Bón phân",
    [ActivityType.PRUNING]: "Cắt tỉa",
    [ActivityType.HARVESTING]: "Thu hoạch",
    [ActivityType.PEST_CONTROL]: "Kiểm soát sâu bệnh",
    [ActivityType.SOIL_TESTING]: "Kiểm tra đất",
    [ActivityType.WEEDING]: "Làm cỏ",
    [ActivityType.OTHER]: "Khác",
  };

  const fetchTasks = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      setError(null);
      if (pageNum === 1 || refresh) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: GetTasksQueryDto = {
        page: pageNum,
        limit: 10,
      };
      
      if (filter) {
        params.status = filter;
      }
      
      if (gardenId) {
        params.gardenId = gardenId;
      }

      const response = await taskService.getTasks(params);
      
      const items = response.items || [];
      const meta = response.meta || null;

      if (pageNum === 1 || refresh) {
        setTasks(items);
      } else {
        setTasks(prev => [...prev, ...items]);
      }
      
      setPagination(meta);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Không thể tải danh sách công việc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [filter, gardenId]);

  useEffect(() => {
    fetchTasks(1, true);
  }, [filter, gardenId, fetchTasks]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks(1, true);
      return () => {
        // Cleanup if needed
      };
    }, [fetchTasks])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks(1, true);
    setRefreshing(false);
  }, [fetchTasks]);

  const loadMoreTasks = useCallback(() => {
    if (!pagination || loadingMore || !tasks || tasks.length === 0 || (pagination && tasks.length >= pagination.totalItems)) {
      return;
    }
    
    const nextPage = page + 1;
    if (nextPage <= pagination.totalPages) {
      setLoadingMore(true);
      fetchTasks(nextPage);
    }
  }, [pagination, loadingMore, tasks, page, fetchTasks]);

  const handleTaskPress = useCallback((task: TaskDto) => {
    if (onTaskPress) {
      onTaskPress(task);
    } else {
      router.push(`/(modules)/tasks/${task.id}`);
    }
  }, [onTaskPress]);

  const getStatusColor = useCallback((status: TaskStatus) => {
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
  }, [theme]);

  const getTaskIcon = useCallback((type: string) => {
    switch (type.toUpperCase()) {
      case 'WATERING':
        return 'water-outline';
      case 'FERTILIZING':
        return 'leaf-outline';
      case 'PRUNING':
        return 'cut-outline';
      case 'HARVESTING':
        return 'basket-outline';
      case 'PEST_CONTROL':
        return 'bug-outline';
      case 'PLANTING':
        return 'trending-up-outline';
      case 'WEEDING':
        return 'remove-circle-outline';
      default:
        return 'clipboard-outline';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    const time = date.toLocaleTimeString('vi-VN', timeOptions);
    
    const diffMs = date.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    let dateLabel = '';
    if (isToday) {
      dateLabel = `Hôm nay, ${time}`;
    } else if (isTomorrow) {
      dateLabel = `Ngày mai, ${time}`;
    } else {
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      };
      dateLabel = `${date.toLocaleDateString('vi-VN', dateOptions)}, ${time}`;
    }
    
    return {
      label: dateLabel,
      isUrgent: diffHours <= 24 && diffHours > 0,
      isOverdue: diffHours <= 0,
      timeLeft: diffHours
    };
  }, []);

  const renderTaskItem = useCallback(({ item }: { item: TaskDto }) => {
    const taskTypeDisplay = activityTypeTranslations[item.type as ActivityType] || item.type.replace('_', ' ');
    const dateInfo = formatDate(item.dueDate);
    
    let priorityColor = theme.primary;
    let priorityWidth = 3;
    
    if (item.status === TaskStatus.COMPLETED) {
      priorityColor = theme.success;
      priorityWidth = 2;
    } else if (item.status === TaskStatus.SKIPPED) {
      priorityColor = theme.warning;
      priorityWidth = 2;
    } else if (dateInfo.isOverdue) {
      priorityColor = theme.error;
      priorityWidth = 4;
    } else if (dateInfo.isUrgent) {
      priorityColor = theme.warning;
      priorityWidth = 4;
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          { borderLeftWidth: priorityWidth, borderLeftColor: priorityColor }
        ]}
        onPress={() => handleTaskPress(item)}
      >
        <View style={styles.taskHeader}>
          <View
            style={[
              styles.taskIconContainer,
              { backgroundColor: getStatusColor(item.status) + '2A' },
            ]}
          >
            <Ionicons
              name={getTaskIcon(item.type)}
              size={22}
              color={getStatusColor(item.status)}
            />
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.taskType} numberOfLines={1}>
              {taskTypeDisplay} 
            </Text>
            <View style={styles.gardenInfoContainer}>
              <Ionicons name="leaf-outline" size={14} color={theme.textSecondary} style={styles.detailIcon} />
              <Text style={styles.taskGarden} numberOfLines={1}>
                {item.gardenId ? `Vườn #${item.gardenId}` : 'Không có vườn'}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, {borderColor: getStatusColor(item.status)}]}>
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status === TaskStatus.PENDING ? 'Đang chờ' : 
               item.status === TaskStatus.COMPLETED ? 'Hoàn thành' : 
               item.status === TaskStatus.SKIPPED ? 'Bỏ qua' : item.status}
            </Text>
          </View>
        </View>
        
        <Text style={styles.taskDescription} numberOfLines={3}>
          {item.description || "Không có mô tả"}
        </Text>
        
        {(item.plantTypeName || item.plantStageName) && (
          <View style={styles.metadataContainer}>
            {item.plantTypeName && (
              <View style={styles.metadataItem}>
                <Ionicons name="flower-outline" size={12} color={theme.textSecondary} />
                <Text style={styles.metadataText}>{item.plantTypeName}</Text>
              </View>
            )}
            {item.plantStageName && (
              <View style={styles.metadataItem}>
                <Ionicons name="analytics-outline" size={12} color={theme.textSecondary} />
                <Text style={styles.metadataText}>{item.plantStageName}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.taskFooter}>
          <View style={[
            styles.dueDateContainer,
            dateInfo.isOverdue && styles.overdueDateContainer,
            dateInfo.isUrgent && styles.urgentDateContainer
          ]}>
            <Ionicons 
              name={dateInfo.isOverdue ? "alert-circle-outline" : dateInfo.isUrgent ? "time-outline" : "calendar-outline"} 
              size={14}
              color={dateInfo.isOverdue ? theme.error : dateInfo.isUrgent ? theme.warning : theme.textSecondary} 
            />
            <Text style={[
              styles.dueDate,
              dateInfo.isOverdue && styles.overdueText,
              dateInfo.isUrgent && styles.urgentText
            ]}>
              {dateInfo.label}
              {dateInfo.isOverdue && " (Quá hạn)"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleTaskPress, styles, getStatusColor, getTaskIcon, formatDate, activityTypeTranslations, theme]);

  const renderFilterOptions = useCallback(() => {
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === undefined && styles.filterButtonActive,
          ]}
          onPress={() => setFilter(undefined)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === undefined && styles.filterButtonTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === TaskStatus.PENDING && styles.filterButtonActive,
          ]}
          onPress={() => setFilter(TaskStatus.PENDING)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === TaskStatus.PENDING && styles.filterButtonTextActive,
            ]}
          >
            Đang chờ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === TaskStatus.COMPLETED && styles.filterButtonActive,
          ]}
          onPress={() => setFilter(TaskStatus.COMPLETED)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === TaskStatus.COMPLETED && styles.filterButtonTextActive,
            ]}
          >
            Hoàn thành
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === TaskStatus.SKIPPED && styles.filterButtonActive,
          ]}
          onPress={() => setFilter(TaskStatus.SKIPPED)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === TaskStatus.SKIPPED && styles.filterButtonTextActive,
            ]}
          >
            Bỏ qua
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [styles, filter]);

  if (loading && !refreshing && tasks.length === 0) {
    return (
      <View style={styles.container}>
        {renderFilterOptions()}
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải công việc...</Text>
        </View>
      </View>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <View style={styles.container}>
        {renderFilterOptions()}
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => fetchTasks(1)}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!loading && !refreshing && tasks.length === 0) {
    return (
      <View style={styles.container}>
        {renderFilterOptions()}
        <View style={styles.centerContainer}>
          <Ionicons
            name="clipboard-outline"
            size={64}
            color={theme.textTertiary}
          />
          <Text style={styles.emptyTitle}>Không có công việc nào</Text>
          <Text style={styles.emptyText}>
            {filter
              ? `Không tìm thấy công việc nào ở trạng thái "${filter}".`
              : gardenId 
              ? `Không tìm thấy công việc nào cho vườn đã chọn.` 
              : 'Không có công việc nào. Hãy tạo công việc mới.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderFilterOptions()}
      <FlatList
        data={tasks || []}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.taskList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        onEndReached={loadMoreTasks}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
        ListEmptyComponent={
          (!loading && !error && tasks.length === 0 && !refreshing) ? (
            <View style={styles.centerContainer}>
              <Ionicons name="file-tray-outline" size={64} color={theme.textTertiary} />
              <Text style={styles.emptyTitle}>Không có kết quả</Text>
              <Text style={styles.emptyText}>
                Không tìm thấy công việc nào phù hợp với bộ lọc hiện tại.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default TaskList;
