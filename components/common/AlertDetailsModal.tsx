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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
}

const AlertDetailsModal = ({
  isVisible,
  onClose,
  alerts,
  gardenName,
  sensorData,
  theme,
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
      let icon = "alert-circle-outline";
      let backgroundColor = theme.primary;
      let label = "Cảnh báo";

      // Icon based on alert type
      switch (type) {
        case "SENSOR_THRESHOLD":
          icon = "hardware-chip-outline";
          label = "Cảm biến";
          break;
        case "WEATHER":
          icon = "cloudy-outline";
          label = "Thời tiết";
          break;
        case "PEST":
          icon = "bug-outline";
          label = "Sâu bệnh";
          break;
        case "WATER":
          icon = "water-outline";
          label = "Nước";
          break;
        case "NUTRIENT":
          icon = "nutrition-outline";
          label = "Dinh dưỡng";
          break;
        default:
          icon = "alert-circle-outline";
          label = "Cảnh báo";
      }

      // Color based on severity
      switch (severity) {
        case "CRITICAL":
          backgroundColor = "#e74c3c";
          break;
        case "HIGH":
          backgroundColor = "#e67e22";
          break;
        case "MEDIUM":
          backgroundColor = "#f1c40f";
          break;
        case "LOW":
          backgroundColor = "#3498db";
          break;
        default:
          backgroundColor = theme.primary;
      }

      return { icon, backgroundColor, label };
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
    ({ item }: { item: GardenAlert }) => {
      const { icon, backgroundColor, label } = getAlertStyleInfo(
        item.severity,
        item.type
      );
      const sensorInfo = item.sensorType ? getSensorName(item.sensorType) : "";
      const sensorData = getSensorDataForAlert(item);

      return (
        <View
          style={[
            styles.alertItem,
            {
              backgroundColor: theme.card,
              borderLeftColor: backgroundColor,
            },
          ]}
        >
          <View style={styles.alertHeader}>
            <View style={[styles.iconContainer, { backgroundColor }]}>
              <Ionicons name={icon as any} size={22} color="#fff" />
            </View>
            <View style={styles.alertTitle}>
              <Text style={[styles.categoryLabel, { color: backgroundColor }]}>
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
                    backgroundColor: `${backgroundColor}20`,
                    borderColor: `${backgroundColor}50`,
                  },
                ]}
              >
                <Text style={[styles.severityText, { color: backgroundColor }]}>
                  {item.severity === "CRITICAL"
                    ? "Rất nghiêm trọng"
                    : item.severity === "HIGH"
                    ? "Nghiêm trọng"
                    : item.severity === "MEDIUM"
                    ? "Trung bình"
                    : "Nhẹ"}
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
            <View style={styles.timeIconContainer}>
              <Ionicons name="time-outline" size={14} color="#fff" />
            </View>
            <Text style={[styles.timeText, { color: theme.textSecondary }]}>
              Phát hiện lúc: {formatDate(item.timestamp)}
            </Text>
          </View>

          {/* Action buttons if needed */}
          {!item.isResolved && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: backgroundColor },
                ]}
                onPress={() => {
                  // Handle resolving alert action
                  console.log(`Resolve alert ${item.id}`);
                }}
              >
                <Text style={styles.actionButtonText}>Đánh dấu đã xử lý</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    },
    [theme, getAlertStyleInfo, formatDate, getSensorName, getSensorDataForAlert]
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

    // Severity order mapping for sorting
    const severityOrder = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    return [...alerts].sort((a, b) => {
      // First sort by severity (critical first)
      const severityDiff =
        severityOrder[a.severity as keyof typeof severityOrder] -
        severityOrder[b.severity as keyof typeof severityOrder];

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
            <View>
              <Text style={styles.modalTitle}>Cảnh báo vườn</Text>
              <Text style={styles.gardenName}>{gardenName}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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
                keyExtractor={(item) => `${item.id}`}
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
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  alertList: {
    padding: 16,
  },
  alertItem: {
    marginBottom: 16,
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
    width: 38,
    height: 38,
    borderRadius: 19,
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
    backgroundColor: "rgba(0,0,0,0.02)",
    padding: 10,
    borderRadius: 8,
  },
  sensorLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginRight: 8,
  },
  sensorValue: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 11,
    fontFamily: "Inter-Medium",
  },
  actionContainer: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
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
