import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { Task, TaskStatus } from '@/types/activities/task.types';
import { CreateTaskDto, UpdateTaskDto } from '@/types/activities/dtos';
import { taskService } from '@/service/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface TaskFormProps {
  task?: Task; // If provided, we're editing an existing task
  onSuccess?: (task: Task) => void;
  onCancel?: () => void;
  gardenId?: number; // Pre-selected garden ID for new tasks
  gardenerId?: number; // Pre-selected gardener ID for new tasks
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSuccess,
  onCancel,
  gardenId,
  gardenerId,
}) => {
  const theme = useAppTheme();
  // Check if we're in edit mode (has existing task) or create mode
  const isEditMode = !!task;
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state - we use a common form state for simplicity and handle the differences at submit time
  const [formData, setFormData] = useState({
    gardenerId: gardenerId || (task?.gardenerId || 0),
    gardenId: gardenId || (task?.gardenId || 0),
    type: task?.type || '',
    description: task?.description || '',
    dueDate: task?.dueDate || new Date().toISOString(),
    plantTypeName: task?.plantTypeName || '',
    plantStageName: task?.plantStageName || '',
    status: task?.status || TaskStatus.PENDING,
    completedAt: task?.completedAt || undefined,
  });
  
  // Helper function to update form data
  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Convert ISO string to Date object for the date picker
  const getDueDateObject = () => {
    return formData.dueDate ? new Date(formData.dueDate) : new Date();
  };

  const taskTypes = [
    { label: 'Chọn loại công việc', value: '' },
    { label: 'Tưới cây', value: 'WATERING' },
    { label: 'Bón phân', value: 'FERTILIZING' },
    { label: 'Cắt tỉa', value: 'PRUNING' },
    { label: 'Thu hoạch', value: 'HARVESTING' },
    { label: 'Phòng trừ sâu bệnh', value: 'PEST_CONTROL' },
    { label: 'Trồng mới', value: 'PLANTING' },
    { label: 'Làm cỏ', value: 'WEEDING' },
    { label: 'Khác', value: 'OTHER' },
  ];

  // Handle date selection
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      updateFormField('dueDate', selectedDate.toISOString());
    }
  };

  // Validate form before submission
  const validateForm = () => {
    if (!formData.gardenerId) {
      Alert.alert('Lỗi', 'Vui lòng chọn người làm vườn');
      return false;
    }
    if (!formData.gardenId) {
      Alert.alert('Lỗi', 'Vui lòng chọn khu vườn');
      return false;
    }
    if (!formData.type) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại công việc');
      return false;
    }
    if (!formData.description) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả công việc');
      return false;
    }
    if (!formData.dueDate) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày đến hạn');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let result: Task;

      if (isEditMode && task) {
        // Prepare update data (only include fields that are valid for UpdateTaskDto)
        const updateData: UpdateTaskDto = {
          type: formData.type,
          description: formData.description,
          dueDate: formData.dueDate,
          plantTypeName: formData.plantTypeName || undefined,
          plantStageName: formData.plantStageName || undefined,
          status: formData.status as TaskStatus,
          completedAt: formData.completedAt,
        };
        
        // Update existing task
        result = await taskService.updateTask(task.id, updateData);
      } else {
        // Prepare create data (only include fields that are valid for CreateTaskDto)
        const createData: CreateTaskDto = {
          gardenerId: formData.gardenerId,
          gardenId: formData.gardenId,
          type: formData.type,
          description: formData.description,
          dueDate: formData.dueDate,
          plantTypeName: formData.plantTypeName || undefined,
          plantStageName: formData.plantStageName || undefined,
        };
        
        // Create new task
        result = await taskService.createTask(createData);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      Alert.alert(
        'Thành công',
        isEditMode
          ? 'Cập nhật công việc thành công'
          : 'Tạo công việc thành công'
      );
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert(
        'Lỗi',
        isEditMode
          ? 'Không thể cập nhật công việc. Vui lòng thử lại sau.'
          : 'Không thể tạo công việc. Vui lòng thử lại sau.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.formTitle}>
          {isEditMode ? 'Cập nhật công việc' : 'Tạo công việc mới'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ID Người làm vườn *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập ID người làm vườn"
            value={formData.gardenerId?.toString() || ''}
            onChangeText={(text) => {
              // Ensure we always have a valid number
              const numValue = text ? parseInt(text) : 0;
              updateFormField('gardenerId', numValue);
            }}
            keyboardType="numeric"
            editable={!isEditMode} // Cannot change gardener in edit mode
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ID Khu vườn *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập ID khu vườn"
            value={formData.gardenId?.toString() || ''}
            onChangeText={(text) => {
              // Ensure we always have a valid number
              const numValue = text ? parseInt(text) : 0;
              updateFormField('gardenId', numValue);
            }}
            keyboardType="numeric"
            editable={!isEditMode} // Cannot change garden in edit mode
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Loại công việc *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
              style={styles.picker}
            >
              {taskTypes.map((type) => (
                <Picker.Item
                  key={type.value}
                  label={type.label}
                  value={type.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mô tả *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả chi tiết công việc"
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ngày đến hạn *</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDate(formData.dueDate || new Date().toISOString())}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={getDueDateObject()}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Loại cây (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập loại cây"
            value={formData.plantTypeName}
            onChangeText={(text) => updateFormField('plantTypeName', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Giai đoạn cây (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập giai đoạn cây"
            value={formData.plantStageName}
            onChangeText={(text) => updateFormField('plantStageName', text)}
          />
        </View>

        {isEditMode && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Trạng thái</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => updateFormField('status', value)}
                style={styles.picker}
              >
                <Picker.Item
                  label="Đang chờ"
                  value={TaskStatus.PENDING}
                />
                <Picker.Item
                  label="Hoàn thành"
                  value={TaskStatus.COMPLETED}
                />
                <Picker.Item
                  label="Bỏ qua"
                  value={TaskStatus.SKIPPED}
                />
              </Picker>
            </View>
          </View>
        )}

        <View style={styles.formActions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Cập nhật' : 'Tạo'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  formTitle: {
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#34495e',
    marginBottom: 8,
    paddingLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e8eaed',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e8eaed',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  picker: {
    height: 54,
    width: '100%',
    color: '#2c3e50',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8eaed',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
    fontFamily: 'Inter-Regular',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cancelButton: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e8eaed',
    backgroundColor: '#ffffff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#7f8c8d',
  },
  submitButton: {
    marginLeft: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  requiredIndicator: {
    color: '#e74c3c',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 6,
    opacity: 0.7,
  },
});

export default TaskForm;
