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
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { CreateWateringDecision, SensorDataForRequestModelAIDto } from '@/types/activities/watering-schedules.type';

interface CustomDecisionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWateringDecision) => Promise<void>;
  loading: boolean;
}

const CustomDecisionModal: React.FC<CustomDecisionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading,
}) => {
  const theme = useAppTheme();
  
  // Get surface color with fallback
  const surfaceColor = theme.card || theme.background || '#FFFFFF';
  
  const [sensorData, setSensorData] = useState<SensorDataForRequestModelAIDto>({
    soil_moisture: 45,
    air_humidity: 60,
    temperature: 25,
    light_intensity: 15000,
    water_level: 50,
  });
  const [notes, setNotes] = useState('');

  // Preset conditions for quick setup
  const presets = [
    {
      name: 'Khô hạn',
      icon: 'flame-outline',
      color: theme.error || '#EF5350',
      data: { soil_moisture: 20, air_humidity: 30, temperature: 35, light_intensity: 25000, water_level: 30 },
    },
    {
      name: 'Ẩm ướt',
      icon: 'water-outline',
      color: theme.info || '#29B6F6',
      data: { soil_moisture: 80, air_humidity: 85, temperature: 22, light_intensity: 8000, water_level: 80 },
    },
    {
      name: 'Lý tưởng',
      icon: 'checkmark-circle-outline',
      color: theme.success || '#66BB6A',
      data: { soil_moisture: 55, air_humidity: 65, temperature: 24, light_intensity: 18000, water_level: 70 },
    },
  ];

  const handleSubmit = async () => {
    try {
      await onSubmit({
        sensorData,
        notes: notes || undefined,
      });
      handleClose();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu đến AI');
    }
  };

  const handleClose = () => {
    setSensorData({
      soil_moisture: 45,
      air_humidity: 60,
      temperature: 25,
      light_intensity: 15000,
      water_level: 50,
    });
    setNotes('');
    onClose();
  };

  const applyPreset = (presetData: SensorDataForRequestModelAIDto) => {
    setSensorData(presetData);
    Alert.alert(
      'Đã áp dụng',
      'Điều kiện môi trường đã được cập nhật theo bộ cài đặt sẵn'
    );
  };

  const updateSensorData = (field: string, value: number) => {
    setSensorData((prev: SensorDataForRequestModelAIDto) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Sensor field configuration helpers
  const getSensorConfig = (field: string) => {
    const configs = {
      soil_moisture: {
        icon: 'water-outline',
        label: 'Độ ẩm đất',
        unit: '%',
        range: '0-100',
        min: 0,
        max: 100,
      },
      air_humidity: {
        icon: 'cloudy-outline',
        label: 'Độ ẩm không khí',
        unit: '%',
        range: '0-100',
        min: 0,
        max: 100,
      },
      temperature: {
        icon: 'thermometer-outline',
        label: 'Nhiệt độ',
        unit: '°C',
        range: '-10 đến 60',
        min: -10,
        max: 60,
      },
      light_intensity: {
        icon: 'sunny-outline',
        label: 'Cường độ ánh sáng',
        unit: 'lux',
        range: '0-100000',
        min: 0,
        max: 100000,
      },
      water_level: {
        icon: 'analytics-outline',
        label: 'Mức nước trong bể',
        unit: '%',
        range: '0-100',
        min: 0,
        max: 100,
      },
    };
    
    return configs[field as keyof typeof configs] || {
      icon: 'settings-outline',
      label: field,
      unit: '',
      range: '',
      min: 0,
      max: 100,
    };
  };

  const getSensorColor = (field: string, value: number) => {
    const fallbackWarning = theme.warning || '#FFA726';
    const fallbackSuccess = theme.success || '#66BB6A';
    const fallbackError = theme.error || '#EF5350';
    
    switch (field) {
      case 'soil_moisture':
        if (value < 30) return fallbackError;
        if (value < 60) return fallbackWarning;
        return fallbackSuccess;
      case 'air_humidity':
        if (value < 40 || value > 80) return fallbackWarning;
        return fallbackSuccess;
      case 'temperature':
        if (value < 15 || value > 35) return fallbackWarning;
        return fallbackSuccess;
      case 'light_intensity':
        if (value < 5000) return fallbackWarning;
        return fallbackSuccess;
      case 'water_level':
        if (value < 20) return fallbackError;
        if (value < 50) return fallbackWarning;
        return fallbackSuccess;
      default:
        return theme.textSecondary || '#999';
    }
  };

  const renderSensorInput = (field: string, value: number) => {
    const config = getSensorConfig(field);
    const percentage = ((value - config.min) / (config.max - config.min)) * 100;

    return (
      <View key={field} style={styles.sensorInput}>
        <View style={styles.sensorHeader}>
          <View style={styles.sensorLabelContainer}>
            <Ionicons
              name={config.icon as any}
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.sensorLabel, { color: theme.text }]}>
              {config.label}
            </Text>
          </View>
          <Text style={[styles.sensorRange, { color: theme.textSecondary }]}>
            ({config.range})
          </Text>
        </View>

        <View style={styles.sensorValueContainer}>
          <TextInput
            style={[
              styles.sensorValueInput,
              {
                backgroundColor: theme.background,
                borderColor: getSensorColor(field, value),
                color: theme.text,
              },
            ]}
            value={value.toString()}
            onChangeText={(text) => {
              const numValue = parseFloat(text) || 0;
              const clampedValue = Math.max(config.min, Math.min(config.max, numValue));
              updateSensorData(field, clampedValue);
            }}
            keyboardType="numeric"
            maxLength={6}
          />
          <Text style={[styles.sensorUnit, { color: theme.textSecondary }]}>
            {config.unit}
          </Text>
        </View>

        {/* Sensor Progress Bar */}
        <View style={[styles.sensorBar, { backgroundColor: theme.background }]}>
          <View
            style={[
              styles.sensorBarFill,
              {
                width: `${Math.min(100, Math.max(0, percentage))}%`,
                backgroundColor: getSensorColor(field, value),
              },
            ]}
          />
        </View>
      </View>
    );
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
            Quyết định tùy chỉnh
          </Text>

          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.submitButton,
              { backgroundColor: theme.primary },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preset Options */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Điều kiện sẵn có
            </Text>

            <View style={styles.presetGrid}>
              {presets.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.presetButton, { borderColor: preset.color }]}
                  onPress={() => applyPreset(preset.data)}
                >
                  <Ionicons name={preset.icon as any} size={24} color={preset.color} />
                  <Text style={[styles.presetText, { color: theme.text }]}>
                    {preset.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sensor Data Section */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Dữ liệu cảm biến
            </Text>

            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              Nhập dữ liệu cảm biến để AI đưa ra quyết định tưới nước phù hợp
            </Text>

            <View style={styles.sensorList}>
              {Object.entries(sensorData).map(([field, value]) =>
                renderSensorInput(field, value)
              )}
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
              value={notes}
              onChangeText={setNotes}
              placeholder="Thêm ghi chú về điều kiện môi trường đặc biệt..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={200}
            />

            <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
              {notes.length}/200 ký tự
            </Text>
          </View>

          {/* Info Section */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle-outline" size={20} color={theme.info} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Hướng dẫn
              </Text>
            </View>

            <View style={styles.infoList}>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                • AI sẽ phân tích dữ liệu cảm biến bạn cung cấp
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                • Kết quả bao gồm quyết định tưới và lượng nước đề xuất
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                • Độ chính xác cao nhất khi dữ liệu thực tế
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                • Có thể sử dụng điều kiện sẵn có để thử nghiệm
              </Text>
            </View>
          </View>
        </ScrollView>
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
  submitButton: {
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
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  presetButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 12,
    gap: 8,
  },
  presetText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  sensorList: {
    gap: 20,
  },
  sensorInput: {
    gap: 8,
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sensorLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sensorLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  sensorRange: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  sensorValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sensorValueInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  sensorUnit: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    minWidth: 40,
  },
  sensorBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sensorBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  notesInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoList: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
});

export default CustomDecisionModal; 