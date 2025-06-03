import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert as RNAlert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { alertService } from "@/service/api";
import { Alert, AlertStatus, AlertType, Severity } from "@/types/alerts/alert.types";

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useAppTheme();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Get alert ID from route params with validation
  const alertId = React.useMemo(() => {
    const idValue = Array.isArray(id) ? id[0] : id;
    const numericId = Number(idValue);
    
    // Check if the ID is a valid number and not NaN
    if (!idValue || isNaN(numericId) || numericId <= 0) {
      return null;
    }
    
    return numericId;
  }, [id]);

  useEffect(() => {
    if (alertId === null) {
      setError("ID cảnh báo không hợp lệ");
      setLoading(false);
      return;
    }
    
    fetchAlertDetails();
  }, [alertId]);

  const fetchAlertDetails = async () => {
    if (alertId === null) return;
    
    try {
      setLoading(true);
      setError(null);
      const alertData = await alertService.getAlertById(alertId);
      
      if (!alertData) {
        setError("Không tìm thấy thông tin cảnh báo");
        return;
      }
      
      setAlert(alertData);
    } catch (err) {
      console.error(`Error fetching alert ${alertId}:`, err);
      setError("Không thể tải thông tin cảnh báo");
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (newStatus: AlertStatus) => {
    if (!alert) return;

    try {
      setUpdating(true);
      let updatedAlert;

      if (newStatus === AlertStatus.RESOLVED) {
        updatedAlert = await alertService.resolveAlert(alert.id);
      } else {
        updatedAlert = await alertService.updateAlertStatus(alert.id, newStatus);
      }

      if (updatedAlert) {
        setAlert(updatedAlert);
        
        // Show success message
        const statusMessages: Record<AlertStatus, string> = {
          [AlertStatus.RESOLVED]: "Cảnh báo đã được xử lý thành công",
          [AlertStatus.IGNORED]: "Cảnh báo đã được bỏ qua",
          [AlertStatus.IN_PROGRESS]: "Cảnh báo đang được xử lý",
          [AlertStatus.ESCALATED]: "Cảnh báo đã được chuyển tiếp",
          [AlertStatus.PENDING]: "Cảnh báo đã được cập nhật",
        };

        RNAlert.alert("Thành công", statusMessages[newStatus] || "Cập nhật thành công");
      }
    } catch (err) {
      console.error("Failed to update alert status:", err);
      RNAlert.alert("Lỗi", "Không thể cập nhật trạng thái cảnh báo. Vui lòng thử lại sau.");
    } finally {
      setUpdating(false);
    }
  };

  const handleResolveAlert = () => updateAlertStatus(AlertStatus.RESOLVED);
  const handleDismissAlert = () => updateAlertStatus(AlertStatus.IGNORED);
  const handleEscalateAlert = () => updateAlertStatus(AlertStatus.ESCALATED);
  const handleMarkInProgress = () => updateAlertStatus(AlertStatus.IN_PROGRESS);

  const getAlertTypeLabel = (type: AlertType): string => {
    switch (type) {
      case AlertType.WEATHER:
        return "Cảnh báo thời tiết";
      case AlertType.SENSOR_ERROR:
        return "Lỗi cảm biến";
      case AlertType.SYSTEM:
        return "Cảnh báo hệ thống";
      case AlertType.PLANT_CONDITION:
        return "Tình trạng cây trồng";
      case AlertType.ACTIVITY:
        return "Hoạt động cần thực hiện";
      case AlertType.MAINTENANCE:
        return "Bảo trì thiết bị";
      case AlertType.SECURITY:
        return "Cảnh báo an ninh";
      default:
        return "Thông báo khác";
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.WEATHER:
        return (
          <MaterialCommunityIcons
            name="weather-lightning-rainy"
            size={36}
            color="#FFC107"
          />
        );
      case AlertType.SENSOR_ERROR:
        return (
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={36}
            color="#F44336"
          />
        );
      case AlertType.PLANT_CONDITION:
        return (
          <MaterialCommunityIcons
            name="sprout-outline"
            size={36}
            color="#4CAF50"
          />
        );
      case AlertType.ACTIVITY:
        return (
          <MaterialCommunityIcons
            name="calendar-clock"
            size={36}
            color="#2196F3"
          />
        );
      case AlertType.SYSTEM:
        return <MaterialIcons name="system-update" size={36} color="#9C27B0" />;
      case AlertType.MAINTENANCE:
        return (
          <MaterialCommunityIcons name="tools" size={36} color="#FF9800" />
        );
      case AlertType.SECURITY:
        return (
          <MaterialCommunityIcons
            name="shield-alert-outline"
            size={36}
            color="#F44336"
          />
        );
      default:
        return (
          <Ionicons
            name="notifications-outline"
            size={36}
            color={theme.primary}
          />
        );
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.PENDING:
        return theme.warning;
      case AlertStatus.IN_PROGRESS:
        return theme.info;
      case AlertStatus.RESOLVED:
        return theme.success;
      case AlertStatus.IGNORED:
        return theme.textTertiary;
      case AlertStatus.ESCALATED:
        return "#F44336";
      default:
        return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.PENDING:
        return "Chờ xử lý";
      case AlertStatus.IN_PROGRESS:
        return "Đang xử lý";
      case AlertStatus.RESOLVED:
        return "Đã giải quyết";
      case AlertStatus.IGNORED:
        return "Đã bỏ qua";
      case AlertStatus.ESCALATED:
        return "Đã chuyển tiếp";
      default:
        return status;
    }
  };

  const getSeverityColor = (severity?: Severity) => {
    switch (severity) {
      case Severity.CRITICAL:
        return "#FF1744";
      case Severity.HIGH:
        return "#F44336";
      case Severity.MEDIUM:
        return "#FFC107";
      case Severity.LOW:
        return "#4CAF50";
      default:
        return theme.warning;
    }
  };

  const getSeverityLabel = (severity?: Severity) => {
    switch (severity) {
      case Severity.CRITICAL:
        return "Cực kỳ nghiêm trọng";
      case Severity.HIGH:
        return "Nghiêm trọng";
      case Severity.MEDIUM:
        return "Trung bình";
      case Severity.LOW:
        return "Thấp";
      default:
        return "";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Custom header with back button
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={12} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Chi tiết cảnh báo
          </Text>
        </View>
        
        <View style={styles.rightSpace} />
      </View>
    </View>
  );

  // Render action buttons based on current status
  const renderActionButtons = () => {
    if (!alert || updating) return null;

    const buttons = [];

    // Mark as in progress if pending
    if (alert.status === AlertStatus.PENDING) {
      buttons.push(
        <TouchableOpacity
          key="progress"
          style={[styles.actionButton, { backgroundColor: theme.info }]}
          onPress={handleMarkInProgress}
        >
          <Text style={styles.actionButtonText}>Bắt đầu xử lý</Text>
        </TouchableOpacity>
      );
    }

    // Resolve if pending or in progress
    if (alert.status === AlertStatus.PENDING || alert.status === AlertStatus.IN_PROGRESS) {
      buttons.push(
        <TouchableOpacity
          key="resolve"
          style={[styles.actionButton, { backgroundColor: theme.success }]}
          onPress={handleResolveAlert}
        >
          <Text style={styles.actionButtonText}>Xử lý xong</Text>
        </TouchableOpacity>
      );
    }

    // Escalate if not resolved or escalated
    if (alert.status !== AlertStatus.RESOLVED && alert.status !== AlertStatus.ESCALATED) {
      buttons.push(
        <TouchableOpacity
          key="escalate"
          style={[styles.actionButton, { backgroundColor: "#F44336" }]}
          onPress={handleEscalateAlert}
        >
          <Text style={styles.actionButtonText}>Chuyển tiếp</Text>
        </TouchableOpacity>
      );
    }

    // Dismiss if not resolved
    if (alert.status !== AlertStatus.RESOLVED && alert.status !== AlertStatus.IGNORED) {
      buttons.push(
        <TouchableOpacity
          key="dismiss"
          style={[styles.actionButton, { backgroundColor: theme.textTertiary }]}
          onPress={handleDismissAlert}
        >
          <Text style={styles.actionButtonText}>Bỏ qua</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.actionButtonsContainer}>
        {buttons}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Đang tải thông tin cảnh báo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !alert) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color={theme.error}
          />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error || "Không tìm thấy thông tin cảnh báo"}
          </Text>
          <View style={styles.errorButtonContainer}>
            {alertId !== null && (
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.primary }]}
                onPress={fetchAlertDetails}
              >
                <Text style={[styles.retryText, { color: "#FFFFFF" }]}>
                  Thử lại
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.errorBackButton, { backgroundColor: theme.textSecondary }]}
              onPress={() => router.push("/(modules)/alerts")}
            >
              <Text style={[styles.backText, { color: "#FFFFFF" }]}>
                Quay lại danh sách
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alert Header */}
        <View style={[styles.alertHeader, { backgroundColor: theme.card }]}>
          <View style={styles.alertIconContainer}>
            {getAlertIcon(alert.type)}
          </View>
          
          <View style={styles.alertHeaderContent}>
            <Text style={[styles.alertTitle, { color: theme.text }]}>
              {getAlertTypeLabel(alert.type)}
            </Text>
            
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(alert.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusLabel(alert.status)}
                </Text>
              </View>
              
              {alert.severity && (
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(alert.severity) },
                  ]}
                >
                  <Text style={styles.severityText}>
                    {getSeverityLabel(alert.severity)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Alert Details */}
        <View style={[styles.detailsContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Chi tiết cảnh báo
          </Text>
          
          <Text style={[styles.messageText, { color: theme.textSecondary }]}>
            {alert.message}
          </Text>

          {alert.suggestion && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Đề xuất xử lý
              </Text>
              <Text style={[styles.suggestionText, { color: theme.info }]}>
                {alert.suggestion}
              </Text>
            </>
          )}

          {alert.gardenName && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Vườn:
              </Text>
              <Text style={[styles.infoValue, { color: theme.primary }]}>
                {alert.gardenName}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Thời gian tạo:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {formatDateTime(alert.createdAt)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Cập nhật cuối:
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {formatDateTime(alert.updatedAt)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {renderActionButtons()}
      </ScrollView>

      {updating && (
        <View style={styles.updatingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.updatingText, { color: theme.text }]}>
            Đang cập nhật...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginBottom: 8,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter-SemiBold",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
    width: 100,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  detailValueLink: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
    flex: 1,
    textDecorationLine: "underline",
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
  },
  suggestionContainer: {
    marginBottom: 20,
  },
  suggestionText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    fontStyle: "italic",
  },
  actionsContainer: {
    marginTop: 16,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
  },
  rightSpace: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
  },
  alertIconContainer: {
    marginRight: 16,
  },
  alertHeaderContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#FFFFFF",
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#FFFFFF",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: "Inter-Medium",
    width: 120,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  updatingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  updatingText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    marginTop: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#FFFFFF",
  },
  actionButtonsContainer: {
    padding: 16,
  },
  errorButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorBackButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#FFFFFF",
  },
});
