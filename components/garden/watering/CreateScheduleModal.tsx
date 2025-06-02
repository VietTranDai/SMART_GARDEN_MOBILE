import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { CreateWateringSchedule } from '@/types/activities/watering-schedules.type';

interface CreateScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWateringSchedule) => Promise<void>;
  loading: boolean;
}

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading,
}) => {
  const theme = useAppTheme();
  
  // Get surface color with fallback
  const surfaceColor = theme.card || theme.background || '#FFFFFF';
  
  const [formData, setFormData] = useState<Partial<CreateWateringSchedule>>({
    scheduledAt: new Date(),
    amount: 2.5,
    notes: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Quick amount selection options
  const quickAmountOptions = [1, 2, 2.5, 3, 4, 5];

  // Ensure scheduledAt is always a Date object
  const getScheduledDate = (): Date => {
    if (!formData.scheduledAt) return new Date();
    return formData.scheduledAt instanceof Date ? formData.scheduledAt : new Date(formData.scheduledAt);
  };

  const handleSubmit = async () => {
    const scheduledDate = getScheduledDate();
    
    if (!scheduledDate || scheduledDate < new Date()) {
      Alert.alert('Lỗi', 'Vui lòng chọn thời gian tưới hợp lệ');
      return;
    }

    try {
      await onSubmit({
        gardenId: 0, // Will be set by parent component
        scheduledAt: scheduledDate,
        amount: formData.amount,
        notes: formData.notes || undefined,
      });
      handleClose();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo lịch tưới nước');
    }
  };

  const handleClose = () => {
    setFormData({
      scheduledAt: new Date(),
      amount: 2.5,
      notes: '',
    });
    onClose();
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = getScheduledDate();
      const newDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes()
      );
      setFormData({ ...formData, scheduledAt: newDate });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = getScheduledDate();
      const newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setFormData({ ...formData, scheduledAt: newDate });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Tạo lịch tưới nước
          </Text>

          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.saveButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="checkmark" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* DateTime Section */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Thời gian tưới
            </Text>

            <TouchableOpacity
              style={[styles.dateTimeButton, { borderColor: theme.borderLight }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.primary} />
              <Text style={[styles.dateTimeText, { color: theme.text }]}>
                {getScheduledDate().toLocaleDateString('vi-VN')}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateTimeButton, { borderColor: theme.borderLight }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={theme.primary} />
              <Text style={[styles.dateTimeText, { color: theme.text }]}>
                {getScheduledDate().toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.previewCard, { backgroundColor: theme.background }]}>
              <Ionicons name="information-circle-outline" size={16} color={theme.info} />
              <Text style={[styles.previewText, { color: theme.textSecondary }]}>
                Thời gian đã chọn: {formatDateTime(getScheduledDate())}
              </Text>
            </View>
          </View>

          {/* Amount Section */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Lượng nước (lít)
            </Text>

            <View style={styles.amountContainer}>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.borderLight,
                    color: theme.text,
                  },
                ]}
                value={formData.amount?.toString() || ''}
                onChangeText={(text) => {
                  const amount = parseFloat(text) || 0;
                  setFormData({ ...formData, amount });
                }}
                placeholder="0.0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                maxLength={5}
              />
              <Text style={[styles.amountUnit, { color: theme.textSecondary }]}>
                Lít
              </Text>
            </View>

            <Text style={[styles.quickSelectLabel, { color: theme.textSecondary }]}>
              Chọn nhanh:
            </Text>
            <View style={styles.quickAmountGrid}>
              {quickAmountOptions.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountButton,
                    {
                      backgroundColor:
                        formData.amount === amount ? theme.primary : theme.background,
                      borderColor: theme.borderLight,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, amount })}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      {
                        color:
                          formData.amount === amount ? 'white' : theme.text,
                      },
                    ]}
                  >
                    {amount}L
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes Section */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Ghi chú
            </Text>

            <TextInput
              style={[
                styles.notesInput,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.borderLight,
                  color: theme.text,
                },
              ]}
              value={formData.notes || ''}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Thêm ghi chú cho lịch tưới này..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              maxLength={200}
            />

            <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
              {formData.notes?.length || 0}/200 ký tự
            </Text>
          </View>

          {/* Tips Section */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={20} color={theme.warning} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Mẹo hay
              </Text>
            </View>

            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                  Tưới vào sáng sớm hoặc chiều tối để tránh bay hơi
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                  Kiểm tra độ ẩm đất trước khi tưới
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                  Tưới đều khắp khu vườn, tránh tập trung một điểm
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Date/Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={getScheduledDate()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={getScheduledDate()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            is24Hour={true}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  saveButton: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  amountInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  amountUnit: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  quickSelectLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  notesInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});

export default CreateScheduleModal; 