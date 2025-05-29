import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { Task, TaskStatus } from '@/types/activities/task.types';
import { taskService } from '@/service/api';

interface TaskDetailProps {
  task: Task;
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (task: Task) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  isLoading = false,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const theme = useAppTheme();

  const handleUpdateStatus = async (status: TaskStatus) => {
    try {
      const updatedTask = await taskService.updateTask(task.id, { status });
      if (onStatusChange) {
        onStatusChange(updatedTask);
      }
      Alert.alert(
        'Thành công',
        `Đã cập nhật trạng thái công việc thành ${
          status === TaskStatus.COMPLETED ? 'Hoàn thành' :
          status === TaskStatus.SKIPPED ? 'Bỏ qua' : 'Đang chờ'
        }`
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
      Alert.alert(
        'Lỗi',
        'Không thể cập nhật trạng thái công việc. Vui lòng thử lại sau.'
      );
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getStatusColor(task.status) + '15' },
            ]}
          >
            <Ionicons
              name={getTaskIcon(task.type)}
              size={32}
              color={getStatusColor(task.status)}
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.taskType}>
              {task.type.replace('_', ' ').toUpperCase()}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { 
                  backgroundColor: getStatusColor(task.status) + '15',
                  borderColor: getStatusColor(task.status) + '30',
                },
              ]}
            >
              <Text
                style={[styles.statusText, { color: getStatusColor(task.status) }]}
              >
                {task.status === TaskStatus.PENDING ? 'Đang chờ' : 
                 task.status === TaskStatus.COMPLETED ? 'Hoàn thành' : 'Bỏ qua'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={22} color="#34495e" />
          <Text style={styles.sectionTitle}>Mô tả công việc</Text>
        </View>
        <Text style={styles.description}>{task.description}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={22} color="#34495e" />
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
        </View>
        
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Công việc:</Text>
            <Text style={styles.detailValue}>{task.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Người làm vườn:</Text>
            <Text style={styles.detailValue}>{task.gardenerId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Khu vườn:</Text>
            <Text style={styles.detailValue}>{task.gardenId}</Text>
          </View>
          
          {task.plantTypeName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Loại cây:</Text>
              <Text style={styles.detailValue}>{task.plantTypeName}</Text>
            </View>
          )}
          
          {task.plantStageName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giai đoạn cây:</Text>
              <Text style={styles.detailValue}>{task.plantStageName}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={22} color="#34495e" />
          <Text style={styles.sectionTitle}>Thời gian</Text>
        </View>
        
        <View style={styles.detailCard}>
          <View style={styles.timeRow}>
            <View style={styles.timeIconContainer}>
              <Ionicons name="hourglass-outline" size={20} color="#e67e22" />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Ngày đến hạn</Text>
              <Text style={styles.timeValue}>{formatDate(task.dueDate)}</Text>
            </View>
          </View>
          
          {task.completedAt && (
            <View style={styles.timeRow}>
              <View style={styles.timeIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#27ae60" />
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Ngày hoàn thành</Text>
                <Text style={styles.timeValue}>{formatDate(task.completedAt)}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.timeRow}>
            <View style={styles.timeIconContainer}>
              <Ionicons name="create-outline" size={20} color="#3498db" />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Ngày tạo</Text>
              <Text style={styles.timeValue}>{formatDate(task.createdAt)}</Text>
            </View>
          </View>
          
          <View style={styles.timeRow}>
            <View style={styles.timeIconContainer}>
              <Ionicons name="refresh-outline" size={20} color="#9b59b6" />
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeLabel}>Cập nhật cuối</Text>
              <Text style={styles.timeValue}>{formatDate(task.updatedAt)}</Text>
            </View>
          </View>
        </View>
      </View>

      {task.status === TaskStatus.PENDING && (
        <View style={styles.actionsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="options-outline" size={22} color="#34495e" />
            <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#e8f5e9', borderColor: '#c8e6c9' }]}
              onPress={() => handleUpdateStatus(TaskStatus.COMPLETED)}
            >
              <Ionicons name="checkmark-circle" size={24} color={theme.success} />
              <Text style={[styles.actionButtonText, { color: theme.success }]}>
                Hoàn thành
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#fff8e1', borderColor: '#ffe082' }]}
              onPress={() => handleUpdateStatus(TaskStatus.SKIPPED)}
            >
              <Ionicons name="close-circle" size={24} color={theme.warning} />
              <Text style={[styles.actionButtonText, { color: theme.warning }]}>
                Bỏ qua
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.editActions}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: theme.primary }]}
          onPress={onEdit}
        >
          <Ionicons name="create-outline" size={20} color="#ffffff" />
          <Text style={styles.editButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.error }]}
          onPress={onDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#ffffff" />
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
    fontFamily: 'Inter-Medium',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
    paddingBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  titleContainer: {
    flex: 1,
  },
  taskType: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 12,
    borderBottomWidth: 1,
    borderColor: '#e8eaed',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#34495e',
    lineHeight: 24,
    paddingHorizontal: 2,
  },
  detailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ebeef0',
  },
  detailLabel: {
    flex: 2,
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#7f8c8d',
  },
  detailValue: {
    flex: 3,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#2c3e50',
  },
  timeRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ebeef0',
    alignItems: 'center',
  },
  timeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#7f8c8d',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#2c3e50',
  },
  actionsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 12,
    borderBottomWidth: 1,
    borderColor: '#e8eaed',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 12,
    marginBottom: 30,
    borderBottomWidth: 1,
    borderColor: '#e8eaed',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  deleteButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default TaskDetail;
