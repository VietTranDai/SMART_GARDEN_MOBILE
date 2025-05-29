import React, { useState, useCallback, useEffect } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import { taskService, gardenService } from '@/service/api';
import { CreateTaskDto, Garden } from '@/types';
import { ActivityType } from '@/types/activities/activity.types';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '@/contexts/UserContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CreateTaskScreen() {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { user } = useUser();

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

  const [gardens, setGardens] = useState<Garden[]>([]);
  const [selectedGardenId, setSelectedGardenId] = useState<string>('');
  const [loadingGardens, setLoadingGardens] = useState(true);
  const [gardenFetchError, setGardenFetchError] = useState<string | null>(null);

  const [plantTypeName, setPlantTypeName] = useState('');
  const [plantStageName, setPlantStageName] = useState('');
  const [type, setType] = useState<ActivityType | string>(ActivityType.WATERING);
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserGardens = async () => {
      if (!user) return;
      try {
        setLoadingGardens(true);
        setGardenFetchError(null);
        const userGardens = await gardenService.getGardens();
        setGardens(userGardens || []);
        if (userGardens && userGardens.length > 0) {
          const firstGarden = userGardens[0];
          setSelectedGardenId(firstGarden.id.toString());
          // Plant type and stage will be set by the useEffect dependent on selectedGardenId
        } else {
          setSelectedGardenId(''); // Reset if no gardens
          setPlantTypeName('');
          setPlantStageName('');
        }
      } catch (err) {
        console.error("Failed to fetch gardens:", err);
        setGardenFetchError("Không thể tải danh sách vườn.");
      } finally {
        setLoadingGardens(false);
      }
    };
    fetchUserGardens();
  }, [user]);

  useEffect(() => {
    if (selectedGardenId && gardens.length > 0) {
      const selectedGarden = gardens.find(g => g.id.toString() === selectedGardenId);
      if (selectedGarden) {
        setPlantTypeName(selectedGarden.plantName || '');
        setPlantStageName(selectedGarden.plantGrowStage || '');
      }
    }
  }, [selectedGardenId, gardens]);

  useFocusEffect(
    useCallback(() => {
      setFormError(null);
      setIsLoading(false);
    }, [])
  );

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentMode = pickerMode;
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      const currentSelectedDate = new Date(dueDate);
      
      if (currentMode === 'date') {
        // Preserve the time from the current selection
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const day = selectedDate.getDate();
        const hours = currentSelectedDate.getHours();
        const minutes = currentSelectedDate.getMinutes();
        
        const newDate = new Date(year, month, day, hours, minutes);
        setDueDate(newDate);
        
        // On Android, after selecting date, automatically show time picker
        if (Platform.OS === 'android') {
          setPickerMode('time');
          setShowDatePicker(true);
        }
      } else {
        // Time mode - preserve the date but update the time
        const year = currentSelectedDate.getFullYear();
        const month = currentSelectedDate.getMonth();
        const day = currentSelectedDate.getDate();
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes();
        
        const newDate = new Date(year, month, day, hours, minutes);
        setDueDate(newDate);
      }
    }
  };

  const showDateTimePickerModal = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowDatePicker(true);
  };
  
  const formatDateTime = (date: Date) => {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const validateForm = (): boolean => {
    if (!user) {
      setFormError('Không thể xác định người dùng. Vui lòng đăng nhập lại.');
      return false;
    }
    if (!selectedGardenId || !type || !description.trim()) {
      setFormError('Vui lòng điền đầy đủ các trường thông tin bắt buộc được đánh dấu (*).');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleCreateTask = async () => {
    if (!validateForm() || !user) {
      return;
    }
    setIsLoading(true);
    setFormError(null);

    const taskData: CreateTaskDto = {
      gardenerId: user.id,
      gardenId: parseInt(selectedGardenId),
      plantTypeName: plantTypeName.trim() || undefined,
      plantStageName: plantStageName.trim() || undefined,
      type: type as string,
      description: description.trim(),
      dueDate: dueDate.toISOString(),
    };

    try {
      const newTask = await taskService.createTask(taskData);
      if (newTask) {
        Alert.alert('Hoàn tất', 'Công việc mới đã được tạo thành công!');
        router.push('/(modules)/tasks');
      } else {
        setFormError('Không thể tạo công việc. Vui lòng kiểm tra lại thông tin và thử lại.');
      }
    } catch (err: any) {
      console.error('Error creating task:', err);
      setFormError(err.response?.data?.message || err.message || 'Đã có lỗi xảy ra trong quá trình tạo công việc.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLabel = (text: string, required: boolean = false, iconName?: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.labelContainer}>
      {iconName && <Ionicons name={iconName} size={18} color={theme.textSecondary} style={styles.labelIcon} />}
      <Text style={styles.labelText}>
        {text} {required && <Text style={styles.requiredAsterisk}>*</Text>}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
      {formError && (
        <View style={styles.errorDisplayContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={theme.error} style={{marginRight: 8}}/>
          <Text style={styles.errorDisplayText}>{formError}</Text>
        </View>
      )}
      {gardenFetchError && !loadingGardens && (
         <View style={styles.errorDisplayContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={theme.error} style={{marginRight: 8}}/>
          <Text style={styles.errorDisplayText}>{gardenFetchError}</Text>
        </View>
      )}

      <View style={styles.formSection}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="information-circle-outline" size={22} color={theme.primary} style={styles.sectionTitleIcon}/>
          <Text style={styles.sectionTitle}>Thông tin chung</Text>
        </View>

        {renderLabel('Chọn Vườn', true, 'leaf-outline')}
        {loadingGardens ? (
          <ActivityIndicator size="small" color={theme.primary} style={{marginVertical: 20}}/>
        ) : gardens.length === 0 ? (
          <Text style={styles.noGardensText}>Bạn chưa có vườn nào. Vui lòng tạo vườn trước.</Text>
        ) : (
          <View style={styles.pickerInputContainer}>
            <Picker
              selectedValue={selectedGardenId}
              onValueChange={(itemValue) => setSelectedGardenId(itemValue as string)}
              style={styles.pickerStyle}
              itemStyle={styles.pickerItemStyle}
              enabled={!loadingGardens && gardens.length > 0}
            >
              {gardens.map((garden) => (
                <Picker.Item key={garden.id.toString()} label={garden.name} value={garden.id.toString()} />
              ))}
            </Picker>
            <Ionicons name="chevron-down" size={20} color={theme.textSecondary} style={styles.pickerIcon} />
          </View>
        )}
        
        {renderLabel('Loại công việc', true, 'construct-outline')}
        <View style={styles.pickerInputContainer}>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setType(itemValue as ActivityType)}
            style={styles.pickerStyle}
            itemStyle={styles.pickerItemStyle}
          >
            {Object.values(ActivityType).map((taskType) => (
              <Picker.Item key={taskType} label={activityTypeTranslations[taskType] || taskType.replace('_', ' ')} value={taskType} />
            ))}
          </Picker>
          <Ionicons name="chevron-down" size={20} color={theme.textSecondary} style={styles.pickerIcon} />
        </View>

        {renderLabel('Ngày và giờ đến hạn', true, 'calendar-outline')}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeDisplay}>
            <Text style={styles.dateTimeText}>
              {formatDateTime(dueDate)}
            </Text>
          </View>
          <View style={styles.dateTimeButtonsContainer}>
            <TouchableOpacity 
              style={styles.dateTimeButton} 
              onPress={() => showDateTimePickerModal('date')}
            >
              <Ionicons name="calendar-outline" size={18} color={theme.primary} />
              <Text style={styles.dateTimeButtonText}>Chọn ngày</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.dateTimeButton}
              onPress={() => showDateTimePickerModal('time')}
            >
              <Ionicons name="time-outline" size={18} color={theme.primary} />
              <Text style={styles.dateTimeButtonText}>Chọn giờ</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode={pickerMode}
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={pickerMode === 'date' ? new Date() : undefined}
            locale="vi-VN"
          />
        )}
        
        {renderLabel('Mô tả công việc', true, 'document-text-outline')}
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Mô tả chi tiết công việc cần thực hiện"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          placeholderTextColor={theme.textSecondary}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formSection}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="leaf-outline" size={20} color={theme.primary} style={styles.sectionTitleIcon}/>
          <Text style={styles.sectionTitle}>Thông tin cây trồng</Text>
        </View>
        {renderLabel('Tên loại cây', false, 'flower-outline')}
        <TextInput
          style={styles.input}
          placeholder="Tự động điền từ vườn đã chọn"
          value={plantTypeName}
          onChangeText={setPlantTypeName}
          placeholderTextColor={theme.textSecondary}
        />

        {renderLabel('Giai đoạn cây', false, 'analytics-outline')}
        <TextInput
          style={styles.input}
          placeholder="Tự động điền từ vườn đã chọn"
          value={plantStageName}
          onChangeText={setPlantStageName}
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleCreateTask}
        disabled={isLoading || loadingGardens}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.card} />
        ) : (
          <Text style={styles.submitButtonText}>Tạo công việc</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 15 : 10, // Adjust for status bar on iOS if no header
    paddingBottom: 5, 
    // marginBottom: 5, // Optional: if more space needed before errors
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.primary,
    marginLeft: 8,
  },
  formSection: {
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    backgroundColor: theme.card,
    borderRadius: 12,
    elevation: 1,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
    paddingBottom: 10,
  },
  sectionTitleIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.text,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 12, 
  },
  labelIcon: {
    marginRight: 8,
  },
  labelText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: theme.textSecondary,
  },
  requiredAsterisk: {
    color: theme.error,
  },
  input: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16, 
  },
  textArea: {
    minHeight: 120, 
    textAlignVertical: 'top',
  },
  pickerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
    paddingLeft: Platform.OS === 'ios' ? 8 : 0,
  },
  pickerStyle: {
    flex: 1,
    color: theme.text,
    height: Platform.OS === 'ios' ? undefined : 50, 
  },
  pickerItemStyle: {
    color: theme.text,
  },
  pickerIcon: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 14 : 13,
  },
  dateTimeContainer: {
    marginBottom: 16,
  },
  dateTimeDisplay: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  dateTimeText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: theme.text,
  },
  dateTimeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 0.48,
  },
  dateTimeButtonText: {
    marginLeft: 6,
    color: theme.primary,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  },
  dateTextValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.text,
  },
  submitButton: {
    backgroundColor: theme.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 25,
    elevation: 2,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    backgroundColor: theme.primaryMuted,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: theme.card,
  },
  errorDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.errorMuted,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
  },
  errorDisplayText: {
    flex:1,
    color: theme.error,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  noGardensText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: theme.textSecondary,
    textAlign: 'center',
    paddingVertical: 15,
    fontStyle: 'italic',
  },
}); 