import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { taskService } from '@/service/api';
import { CreateTaskDto } from '@/types';
import { ActivityType } from '@/types/activities/activity.types'; // For task types
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function CreateTaskScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const [gardenerId, setGardenerId] = useState('');
  const [gardenId, setGardenId] = useState('');
  const [plantTypeName, setPlantTypeName] = useState('');
  const [plantStageName, setPlantStageName] = useState('');
  const [type, setType] = useState<ActivityType | string>(ActivityType.OTHER);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const validateForm = (): boolean => {
    if (!gardenerId.trim() || !gardenId.trim() || !type.trim() || !description.trim()) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc: ID Người làm vườn, ID Vườn, Loại công việc, Mô tả.');
      return false;
    }
    if (isNaN(parseInt(gardenerId)) || isNaN(parseInt(gardenId))) {
        setError('ID Người làm vườn và ID Vườn phải là số.');
        return false;
    }
    setError(null);
    return true;
  };

  const handleCreateTask = async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setError(null);

    const taskData: CreateTaskDto = {
      gardenerId: parseInt(gardenerId),
      gardenId: parseInt(gardenId),
      plantTypeName: plantTypeName.trim() || undefined,
      plantStageName: plantStageName.trim() || undefined,
      type: type as string, // Backend expects string
      description: description.trim(),
      dueDate: dueDate.toISOString(),
    };

    try {
      const newTask = await taskService.createTask(taskData);
      if (newTask) {
        Alert.alert('Thành công', 'Công việc đã được tạo thành công!');
        router.back();
        // Optionally, navigate to the task list or detail screen
        // router.push('/(modules)/tasks'); 
        // router.push(`/(modules)/tasks/${newTask.id}`);
      } else {
        setError('Không thể tạo công việc. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tạo công việc.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo công việc mới</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.label}>ID Người làm vườn (Bắt buộc)</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập ID người làm vườn"
          value={gardenerId}
          onChangeText={setGardenerId}
          keyboardType="numeric"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>ID Vườn (Bắt buộc)</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập ID vườn"
          value={gardenId}
          onChangeText={setGardenId}
          keyboardType="numeric"
          placeholderTextColor={theme.textSecondary}
        />
        
        <Text style={styles.label}>Loại công việc (Bắt buộc)</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setType(itemValue as ActivityType)}
            style={styles.picker}
          >
            {Object.values(ActivityType).map((taskType) => (
              <Picker.Item key={taskType} label={taskType.replace('_', ' ')} value={taskType} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Ngày đến hạn (Bắt buộc)</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{dueDate.toLocaleDateString()}</Text>
          <Ionicons name="calendar-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
        
        <Text style={styles.label}>Mô tả công việc (Bắt buộc)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nhập mô tả chi tiết cho công việc"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Tên loại cây (Tuỳ chọn)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Cà chua, Hoa hồng"
          value={plantTypeName}
          onChangeText={setPlantTypeName}
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={styles.label}>Giai đoạn cây (Tuỳ chọn)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Ra hoa, Đơm trái"
          value={plantStageName}
          onChangeText={setPlantStageName}
          placeholderTextColor={theme.textSecondary}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleCreateTask}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Tạo công việc</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden', // For Picker border radius on Android
    marginBottom:10,
  },
  picker: {
    color: theme.text,
    height: Platform.OS === 'ios' ? undefined : 50, // Standard height for Android picker
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.text,
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: theme.primaryMuted,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  errorContainer: {
    backgroundColor: theme.errorMuted,
    padding: 12,
    marginHorizontal: 20,
    marginTop:10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
  },
  errorText: {
    color: theme.error,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
}); 