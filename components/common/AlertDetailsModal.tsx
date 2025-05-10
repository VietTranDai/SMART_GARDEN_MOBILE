import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Animated,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SensorType } from "@/types/gardens/sensor.types";

const { width } = Dimensions.get("window");

// Define alert interface based on the application's data structure
interface GardenAlert {
  id: string | number;
  type: string;
  title: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  sensorType?: SensorType;
  sensorId?: string | number;
  sensorValue?: number;
  sensorUnit?: string;
  isRead?: boolean;
  isResolved?: boolean;
  gardenId?: number;
}

interface AlertDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  alerts: GardenAlert[];
  gardenName: string;
  sensorData: Record<string, any[]>;
  theme: any;
  onResolveAlert?: (alertId: string | number) => void;
}

// Map alert types sang icon, màu sắc và nhãn
const ALERT_TYPE_MAP: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  SENSOR_THRESHOLD: {
    icon: "hardware-chip-outline",
    color: "#3498db",
    label: "Cảm biến",
  },
  WEATHER: { icon: "cloudy-outline", color: "#9b59b6", label: "Thời tiết" },
  PEST: { icon: "bug-outline", color: "#e74c3c", label: "Sâu bệnh" },
  WATER: { icon: "water-outline", color: "#3498db", label: "Nước" },
  NUTRIENT: { icon: "flask-outline", color: "#27ae60", label: "Dinh dưỡng" },
  SOIL: { icon: "leaf-outline", color: "#e67e22", label: "Đất" },
  LIGHT: { icon: "sunny-outline", color: "#f1c40f", label: "Ánh sáng" },
};

// Map severity sang màu sắc và nhãn
const SEVERITY_MAP: Record<
  string,
  { color: string; label: string; value: number }
> = {
  CRITICAL: { color: "#e74c3c", label: "Rất nghiêm trọng", value: 4 },
  HIGH: { color: "#e67e22", label: "Nghiêm trọng", value: 3 },
  MEDIUM: { color: "#f1c40f", label: "Trung bình", value: 2 },
  LOW: { color: "#3498db", label: "Nhẹ", value: 1 },
};

const AlertDetailsModal = ({
  isVisible,
  onClose,
  alerts,
  gardenName,
  sensorData,
  theme,
  onResolveAlert,
}: AlertDetailsModalProps) => {
  // Helper function to format date
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        day: "2-digit",
        month: "2-digit",
      });
    } catch (err) {
      return "Không xác định";
    }
  }, []);

  // Helper function to get icon and color based on alert severity
  const getAlertStyleInfo = useCallback(
    (severity: string, type: string) => {
      // Get styles from type map
      const typeInfo = ALERT_TYPE_MAP[type] || {
        icon: "alert-circle-outline",
        color: theme.primary,
        label: "Cảnh báo",
      };

      // Get severity color
      const severityInfo = SEVERITY_MAP[severity] || {
        color: theme.primary,
        label: "Cảnh báo",
        value: 0,
      };

      return {
        icon: typeInfo.icon,
        backgroundColor: typeInfo.color,
        label: typeInfo.label,
        severityColor: severityInfo.color,
        severityLabel: severityInfo.label,
      };
    },
    [theme]
  );

  // Helper to get sensor name from type
  const getSensorName = useCallback((type: SensorType): string => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "Nhiệt độ";
      case SensorType.HUMIDITY:
        return "Độ ẩm";
      case SensorType.SOIL_MOISTURE:
        return "Ẩm đất";
      case SensorType.LIGHT:
        return "Ánh sáng";
      case SensorType.WATER_LEVEL:
        return "Mực nước";
      case SensorType.SOIL_PH:
        return "pH đất";
      default:
        return "Cảm biến";
    }
  }, []);

  // Get relevant sensor data for the alert
  const getSensorDataForAlert = useCallback(
    (alert: GardenAlert) => {
      if (!alert.sensorType || !sensorData[alert.sensorType]) return null;

      // Get latest sensor reading
      const sensorReadings = sensorData[alert.sensorType];
      if (sensorReadings && sensorReadings.length > 0) {
        return sensorReadings[0];
      }

      return null;
    },
    [sensorData]
  );

  // Render alert item
  const renderAlertItem = useCallback(
    ({ item, index }: { item: GardenAlert; index: number }) => {
      const { icon, backgroundColor, label, severityColor, severityLabel } =
        getAlertStyleInfo(item.severity, item.type);
      const sensorInfo = item.sensorType ? getSensorName(item.sensorType) : "";
      const sensorData = getSensorDataForAlert(item);

      // Animation setup for fade-in effect
      const animatedValue = useMemo(() => new Animated.Value(0), []);
      useMemo(() => {
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      }, [animatedValue, index]);

      return (
        <Animated.View
          style={{
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          <View
            style={[
              styles.alertItem,
              {
                backgroundColor: theme.card,
                borderLeftColor: backgroundColor,
                marginBottom: index === alerts.length - 1 ? 0 : 16,
              },
            ]}
          >
            <View style={styles.alertHeader}>
              <View style={[styles.iconContainer, { backgroundColor }]}>
                <Ionicons name={icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.alertTitle}>
                <Text
                  style={[styles.categoryLabel, { color: backgroundColor }]}
                >
                  {label} {sensorInfo ? `(${sensorInfo})` : ""}
                </Text>
                <Text style={[styles.alertTitleText, { color: theme.text }]}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.severityContainer}>
                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor: `${severityColor}20`,
                      borderColor: `${severityColor}50`,
                    },
                  ]}
                >
                  <Text style={[styles.severityText, { color: severityColor }]}>
                    {severityLabel}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.alertMessage, { color: theme.text }]}>
              {item.message}
            </Text>

            {sensorData && (
              <View style={styles.sensorDataContainer}>
                <Text
                  style={[styles.sensorLabel, { color: theme.textSecondary }]}
                >
                  Dữ liệu cảm biến:
                </Text>
                <Text style={[styles.sensorValue, { color: theme.text }]}>
                  {sensorData.value.toFixed(1)} {sensorData.unit || ""}
                </Text>
              </View>
            )}

            <View style={styles.timeContainer}>
              <View
                style={[
                  styles.timeIconContainer,
                  { backgroundColor: backgroundColor + "50" },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={backgroundColor}
                />
              </View>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                Phát hiện lúc: {formatDate(item.timestamp)}
              </Text>
            </View>

            {/* Action buttons if needed */}
            {!item.isResolved && onResolveAlert && (
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: backgroundColor },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => onResolveAlert(item.id)}
                >
                  <Ionicons
                    name="checkmark-outline"
                    size={16}
                    color="#fff"
                    style={styles.actionIcon}
                  />
                  <Text style={styles.actionButtonText}>Đánh dấu đã xử lý</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      );
    },
    [
      theme,
      getAlertStyleInfo,
      formatDate,
      getSensorName,
      getSensorDataForAlert,
      onResolveAlert,
    ]
  );

  // Component for empty alerts state
  const EmptyAlertsComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1568910748155-01ca989dbdd6?q=80&w=300",
        }}
        style={styles.emptyImage}
      />
      <Text style={[styles.emptyTitle, { color: theme.primary }]}>
        Không có cảnh báo!
      </Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Vườn của bạn đang hoạt động bình thường, không có vấn đề gì cần lưu ý.
      </Text>
    </View>
  );

  // Sort alerts by severity and time
  const sortedAlerts = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];

    // Map severity to its numerical value for sorting
    return [...alerts].sort((a, b) => {
      // First sort by severity (critical first)
      const severityA = SEVERITY_MAP[a.severity]?.value || 0;
      const severityB = SEVERITY_MAP[b.severity]?.value || 0;

      const severityDiff = severityB - severityA; // Reversed for descending

      if (severityDiff !== 0) return severityDiff;

      // Then sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [alerts]);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
      >
        <View
          style={[styles.modalContainer, { backgroundColor: theme.background }]}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={[theme.warning, `${theme.warning}90`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <FontAwesome5
                  name="exclamation-triangle"
                  size={18}
                  color="#fff"
                />
              </View>
              <View>
                <Text style={styles.modalTitle}>Cảnh báo vườn</Text>
                <Text style={styles.gardenName}>{gardenName}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Content */}
          <View style={styles.modalContent}>
            {sortedAlerts.length === 0 ? (
              <EmptyAlertsComponent />
            ) : (
              <FlatList
                data={sortedAlerts}
                renderItem={renderAlertItem}
                keyExtractor={(item) => `alert-${item.id}`}
                contentContainerStyle={styles.alertList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 500,
    maxHeight: "85%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "#fff",
  },
  gardenName: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
  },
  alertList: {
    padding: 16,
    paddingTop: 20,
  },
  alertItem: {
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  alertTitle: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  alertTitleText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    marginBottom: 12,
  },
  sensorDataContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
    padding: 12,
    borderRadius: 8,
  },
  sensorLabel: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    marginRight: 8,
  },
  sensorValue: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  severityContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 11,
    fontFamily: "Inter-SemiBold",
    textTransform: "uppercase",
  },
  actionContainer: {
    marginTop: 4,
    alignItems: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AlertDetailsModal;
