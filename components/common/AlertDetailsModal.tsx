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
import { Alert, AlertType, Severity } from "@/types";

const { width } = Dimensions.get("window");

interface AlertDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  alerts: Alert[];
  gardenName: string;
  sensorData: Record<string, any[]>;
  theme: any;
  onResolveAlert?: (alertId: string | number) => void;
}

// Map alert types sang icon, màu sắc và nhãn
const ALERT_TYPE_MAP: Partial<
  Record<AlertType, { icon: string; color: string; label: string }>
> = {
  [AlertType.SENSOR_ERROR]: {
    icon: "pulse-outline",
    color: "#3498db",
    label: "Cảm biến",
  },
  [AlertType.WEATHER]: {
    icon: "cloudy-outline",
    color: "#9b59b6",
    label: "Thời tiết",
  },
  [AlertType.PLANT_CONDITION]: {
    icon: "bug-outline",
    color: "#e74c3c",
    label: "Sâu bệnh",
  },
  // Add other AlertType mappings as needed, e.g., for WATER, NUTRIENT, SOIL, LIGHT if they are valid AlertTypes
  // For now, assuming these might be custom types not in the global AlertType enum.
  // If they are, they should be added to the AlertType enum and mapped here.
  // Example:
  // [AlertType.WATER]: { icon: "water-outline", color: "#3498db", label: "Nước" },
};

// Map severity sang màu sắc và nhãn
const SEVERITY_MAP: Partial<
  Record<Severity, { color: string; label: string; value: number }>
> = {
  [Severity.CRITICAL]: {
    color: "#e74c3c",
    label: "Rất nghiêm trọng",
    value: 4,
  },
  [Severity.HIGH]: { color: "#e67e22", label: "Nghiêm trọng", value: 3 },
  [Severity.MEDIUM]: { color: "#f1c40f", label: "Trung bình", value: 2 },
  [Severity.LOW]: { color: "#3498db", label: "Nhẹ", value: 1 },
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
    (alertSeverity: Severity | undefined, alertType: AlertType) => {
      const defaultTypeInfo = {
        icon: "alert-circle-outline",
        color: theme.primary,
        label: "Cảnh báo",
      };
      // Use enum key directly for lookup
      const typeInfo = ALERT_TYPE_MAP[alertType]
        ? ALERT_TYPE_MAP[alertType]!
        : defaultTypeInfo;

      const defaultSeverityInfo = {
        color: theme.primary,
        label: "Thông báo",
        value: 0,
      };
      const currentSeverityKey = alertSeverity || Severity.LOW;
      // Use enum key directly for lookup
      const severityInfo = SEVERITY_MAP[currentSeverityKey]
        ? SEVERITY_MAP[currentSeverityKey]!
        : defaultSeverityInfo;

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
  // const getSensorName = useCallback((type: SensorType): string => {
  //   switch (type) {
  //     case SensorType.TEMPERATURE:
  //       return "Nhiệt độ";
  //     case SensorType.HUMIDITY:
  //       return "Độ ẩm";
  //     case SensorType.SOIL_MOISTURE:
  //       return "Ẩm đất";
  //     case SensorType.LIGHT:
  //       return "Ánh sáng";
  //     case SensorType.WATER_LEVEL:
  //       return "Mực nước";
  //     case SensorType.SOIL_PH:
  //       return "pH đất";
  //     default:
  //       return "Cảm biến";
  //   }
  // }, []);

  // Get relevant sensor data for the alert
  // const getSensorDataForAlert = useCallback(
  //   (alert: Alert) => {
  //     // if (!alert.sensorType || !sensorData[alert.sensorType]) return null;
  //     // For now, sensor specific data cannot be directly linked from Alert type
  //     return null;
  //   },
  //   [sensorData]
  // );

  // Render alert item
  const renderAlertItem = useCallback(
    ({ item, index }: { item: Alert; index: number }) => {
      const { icon, backgroundColor, label, severityColor, severityLabel } =
        getAlertStyleInfo(item.severity, item.type);
      // const sensorInfo = item.sensorType ? getSensorName(item.sensorType) : "";
      // const sensorDataForDisplay = getSensorDataForAlert(item);

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
                  {label}
                </Text>
                <Text style={[styles.alertTitleText, { color: theme.text }]}>
                  {item.message}
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

            {/* {sensorDataForDisplay && (
              <View style={styles.sensorDataContainer}>
                <Text
                  style={[styles.sensorLabel, { color: theme.textSecondary }]}
                >
                  {getSensorName(item.sensorType)}:
                </Text>
                <Text style={[styles.sensorValue, { color: theme.text }]}>
                  {sensorDataForDisplay.value} {sensorDataForDisplay.unit}
                </Text>
              </View>
            )} */}

            <View style={styles.footerContainer}>
              <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
                {formatDate(item.createdAt)}
              </Text>
              {onResolveAlert && item.status !== "RESOLVED" && (
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
                    <Text style={styles.actionButtonText}>
                      Đánh dấu đã xử lý
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      );
    },
    [theme, getAlertStyleInfo, formatDate, onResolveAlert]
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
      const severityAValue =
        SEVERITY_MAP[a.severity || Severity.LOW]?.value || 0;
      const severityBValue =
        SEVERITY_MAP[b.severity || Severity.LOW]?.value || 0;

      const severityDiff = severityBValue - severityAValue; // Reversed for descending

      if (severityDiff !== 0) return severityDiff;

      // Then sort by timestamp (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
});

export default AlertDetailsModal;
