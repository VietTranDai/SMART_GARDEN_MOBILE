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
import { useAppTheme } from "@/hooks/useAppTheme";
import { alertService, gardenService } from "@/service/api";
import { Alert, AlertStatus, AlertType } from "@/types/gardens/alert.types";

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useAppTheme();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [garden, setGarden] = useState<any>(null);

  // Get alert ID from route params
  const alertId = Number(id);

  useEffect(() => {
    fetchAlertDetails();
  }, [id]);

  const fetchAlertDetails = async () => {
    try {
      setLoading(true);
      const alertData = await alertService.getAlertById(alertId);
      setAlert(alertData);

      // Try to fetch garden info if there's a gardenId
      if (alertData.gardenId) {
        try {
          const gardenData = await gardenService.getGardenById(
            alertData.gardenId
          );
          setGarden(gardenData);
        } catch (err) {
          console.error("Failed to load garden details:", err);
        }
      }
    } catch (err) {
      console.error("Failed to load alert details:", err);
      setError("Không thể tải thông tin cảnh báo");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!alert) return;

    try {
      await alertService.resolveAlert(alert.id);
      setAlert({ ...alert, status: AlertStatus.RESOLVED });
      RNAlert.alert("Thành công", "Cảnh báo đã được xử lý.");
    } catch (err) {
      console.error("Failed to resolve alert:", err);
      RNAlert.alert("Lỗi", "Không thể xử lý cảnh báo. Vui lòng thử lại sau.");
    }
  };

  const handleDismissAlert = async () => {
    if (!alert) return;

    try {
      await alertService.updateAlert(alert.id, {
        status: AlertStatus.IGNORED,
      });
      setAlert({ ...alert, status: AlertStatus.IGNORED });
      RNAlert.alert("Thành công", "Cảnh báo đã được bỏ qua.");
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
      RNAlert.alert("Lỗi", "Không thể bỏ qua cảnh báo. Vui lòng thử lại sau.");
    }
  };

  const handleEscalateAlert = async () => {
    if (!alert) return;

    try {
      await alertService.updateAlert(alert.id, {
        status: AlertStatus.ESCALATED,
      });
      setAlert({ ...alert, status: AlertStatus.ESCALATED });
      RNAlert.alert("Thành công", "Cảnh báo đã được chuyển tiếp.");
    } catch (err) {
      console.error("Failed to escalate alert:", err);
      RNAlert.alert(
        "Lỗi",
        "Không thể chuyển tiếp cảnh báo. Vui lòng thử lại sau."
      );
    }
  };

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

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "CRITICAL":
        return "#FF1744";
      case "HIGH":
        return "#F44336";
      case "MEDIUM":
        return "#FFC107";
      case "LOW":
        return "#4CAF50";
      default:
        return theme.warning;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
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
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error || "Không tìm thấy thông tin cảnh báo."}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
              Quay lại
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>{getAlertIcon(alert.type)}</View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, { color: theme.text }]}>
                {getAlertTypeLabel(alert.type)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(alert.status) + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(alert.status) },
                  ]}
                >
                  {getStatusLabel(alert.status)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Thông tin
            </Text>

            {alert.gardenId && garden && (
              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: theme.textSecondary }]}
                >
                  Vườn:
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/(modules)/gardens/${alert.gardenId}`)
                  }
                >
                  <Text
                    style={[styles.detailValueLink, { color: theme.primary }]}
                  >
                    {garden?.name || `Vườn ${alert.gardenId}`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text
                style={[styles.detailLabel, { color: theme.textSecondary }]}
              >
                Thời gian:
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDateTime(alert.createdAt)}
              </Text>
            </View>

            {alert.severity && (
              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: theme.textSecondary }]}
                >
                  Mức độ:
                </Text>
                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor: getSeverityColor(alert.severity) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.severityText,
                      { color: getSeverityColor(alert.severity) },
                    ]}
                  >
                    {alert.severity}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text
                style={[styles.detailLabel, { color: theme.textSecondary }]}
              >
                Người dùng:
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                ID: {alert.userId}
              </Text>
            </View>
          </View>

          <View style={styles.messageContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Nội dung
            </Text>
            <Text style={[styles.messageText, { color: theme.text }]}>
              {alert.message}
            </Text>
          </View>

          {alert.suggestion && (
            <View style={styles.suggestionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Đề xuất
              </Text>
              <Text style={[styles.suggestionText, { color: theme.info }]}>
                {alert.suggestion}
              </Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            {(alert.status === AlertStatus.PENDING ||
              alert.status === AlertStatus.IN_PROGRESS) && (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.success },
                  ]}
                  onPress={handleResolveAlert}
                >
                  <Text style={styles.actionButtonText}>Đánh dấu đã xử lý</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                  onPress={handleDismissAlert}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Bỏ qua
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.error },
                  ]}
                  onPress={handleEscalateAlert}
                >
                  <Text style={styles.actionButtonText}>Chuyển tiếp</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={() => router.back()}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.textSecondary },
                ]}
              >
                Quay lại
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
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
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
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
});
