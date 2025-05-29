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
import { router } from 'expo-router';
import { Task, TaskStatus } from '@/types/activities/task.types';
import { GetTasksQueryDto, PaginationMeta } from '@/types/activities/dtos';
import { taskService } from '@/service/api';

interface TaskListProps {
  initialFilter?: TaskStatus;
  gardenId?: number;
  onTaskPress?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  initialFilter,
  gardenId,
  onTaskPress,
}) => {
  const theme = useAppTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | undefined>(initialFilter);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTasks = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      setError(null);
      if (pageNum === 1) {
        setLoading(true);
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
    }
  }, [filter, gardenId]);

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks(1, true);
    setRefreshing(false);
  };

  const loadMoreTasks = () => {
    if (!pagination || loadingMore || !tasks || tasks.length === 0 || (pagination && tasks.length >= pagination.totalItems)) return;
    
    const nextPage = page + 1;
    if (nextPage <= pagination.totalPages) {
      setLoadingMore(true);
      fetchTasks(nextPage);
    }
  };

  const handleTaskPress = (task: Task) => {
    if (onTaskPress) {
      onTaskPress(task);
    } else {
      router.push(`/(modules)/tasks/${task.id}`);
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
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return `Hôm nay, ${time}`;
    if (isTomorrow) return `Ngày mai, ${time}`;
    return `${date.toLocaleDateString()} ${time}`;
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.taskHeader}>
        <View
          style={[
            styles.taskIconContainer,
            { backgroundColor: getStatusColor(item.status) + '1A' },
          ]}
        >
          <Ionicons
            name={getTaskIcon(item.type)}
            size={24}
            color={getStatusColor(item.status)}
          />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskType} numberOfLines={1}>
            {item.type.replace('_', ' ')}
          </Text>
          <Text style={styles.taskGarden} numberOfLines={1}>
            {item.gardenId ? `Vườn #${item.gardenId}` : ''}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status === TaskStatus.PENDING ? 'Đang chờ' : 
             item.status === TaskStatus.COMPLETED ? 'Hoàn thành' : 'Bỏ qua'}
          </Text>
        </View>
      </View>
      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.taskFooter}>
        <View style={styles.dueDateContainer}>
          <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
          <Text style={styles.dueDate}>{formatDate(item.dueDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterOptions = () => (
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

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải công việc...</Text>
      </View>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (tasks.length === 0) {
    return (
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
            : 'Không có công việc nào. Hãy tạo công việc mới.'}
        </Text>
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa', // Slightly blue tinted background for better contrast
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f7fa',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e8eaed',
    backgroundColor: '#ffffff',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#4a4a4a',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  taskList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  taskInfo: {
    flex: 1,
  },
  taskType: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  taskGarden: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#7f8c8d',
  },
  taskDescription: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#34495e',
    marginBottom: 16,
    lineHeight: 22,
    paddingHorizontal: 2,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dueDate: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#5d6d7e',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 14,
    color: '#7f8c8d',
    fontFamily: 'Inter-Medium',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 20,
    fontFamily: 'Inter-Medium',
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
    color: '#2c3e50',
    marginTop: 18,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#7f8c8d',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
    fontFamily: 'Inter-Regular',
  },
});

export default TaskList;
