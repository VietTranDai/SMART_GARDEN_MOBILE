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

  const navigateToAlertsList = () => {
    router.push("/(modules)/alerts");
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

  const getAlertIcon = (type: AlertType, severity?: Severity) => {
    const iconSize = 40;
    const iconColor = severity ? getSeverityColor(severity) : getTypeColor(type);
    
    switch (type) {
      case AlertType.WEATHER:
        return (
          <MaterialCommunityIcons
            name="weather-lightning-rainy"
            size={iconSize}
            color={iconColor}
          />
        );
      case AlertType.SENSOR_ERROR:
        return (
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={iconSize}
            color={iconColor}
          />
        );
      case AlertType.PLANT_CONDITION:
        return (
          <MaterialCommunityIcons
            name="sprout-outline"
            size={iconSize}
            color={iconColor}
          />
        );
      case AlertType.ACTIVITY:
        return (
          <MaterialCommunityIcons
            name="calendar-clock"
            size={iconSize}
            color={iconColor}
          />
        );
      case AlertType.SYSTEM:
        return <MaterialIcons name="system-update" size={iconSize} color={iconColor} />;
      case AlertType.MAINTENANCE:
        return (
          <MaterialCommunityIcons name="tools" size={iconSize} color={iconColor} />
        );
      case AlertType.SECURITY:
        return (
          <MaterialCommunityIcons
            name="shield-alert-outline"
            size={iconSize}
            color={iconColor}
          />
        );
      default:
        return (
          <Ionicons
            name="notifications-outline"
            size={iconSize}
            color={iconColor}
          />
        );
    }
  };

  const getTypeColor = (type: AlertType) => {
    switch (type) {
      case AlertType.WEATHER:
        return "#FFC107";
      case AlertType.SENSOR_ERROR:
        return "#F44336";
      case AlertType.PLANT_CONDITION:
        return "#4CAF50";
      case AlertType.ACTIVITY:
        return "#2196F3";
      case AlertType.SYSTEM:
        return "#9C27B0";
      case AlertType.MAINTENANCE:
        return "#FF9800";
      case AlertType.SECURITY:
        return "#F44336";
      default:
        return theme.primary;
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.PENDING:
        return "#FF9500";
      case AlertStatus.IN_PROGRESS:
        return "#007AFF";
      case AlertStatus.RESOLVED:
        return "#34C759";
      case AlertStatus.IGNORED:
        return "#8E8E93";
      case AlertStatus.ESCALATED:
        return "#FF3B30";
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return formatDateTime(dateString);
  };

  // Custom header with back button
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Chi tiết cảnh báo
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            ID: #{alertId}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.listButton, { backgroundColor: theme.primary }]}
          onPress={navigateToAlertsList}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render priority indicator
  const renderPriorityIndicator = () => {
    if (!alert?.severity) return null;

    return (
      <View style={[styles.priorityIndicator, { backgroundColor: getSeverityColor(alert.severity) }]}>
        <MaterialCommunityIcons 
          name="alert" 
          size={16} 
          color="#FFFFFF" 
        />
        <Text style={styles.priorityText}>
          {getSeverityLabel(alert.severity)}
        </Text>
      </View>
    );
  };

  // Render status timeline
  const renderStatusTimeline = () => {
    if (!alert) return null;

    const timeline = [
      {
        status: AlertStatus.PENDING,
        label: "Tạo cảnh báo",
        time: alert.createdAt,
        active: true
      },
      {
        status: AlertStatus.IN_PROGRESS,
        label: "Bắt đầu xử lý",
        time: alert.status === AlertStatus.IN_PROGRESS || alert.status === AlertStatus.RESOLVED ? alert.updatedAt : null,
        active: alert.status === AlertStatus.IN_PROGRESS || alert.status === AlertStatus.RESOLVED
      },
      {
        status: AlertStatus.RESOLVED,
        label: "Hoàn thành",
        time: alert.status === AlertStatus.RESOLVED ? alert.updatedAt : null,
        active: alert.status === AlertStatus.RESOLVED
      }
    ];

    return (
      <View style={[styles.timelineCard, { backgroundColor: theme.card }]}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="timeline-clock" size={20} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Tiến trình xử lý
          </Text>
        </View>
        
        {timeline.map((item, index) => (
          <View key={item.status} style={styles.timelineItem}>
            <View style={styles.timelineContent}>
              <View style={[
                styles.timelineIcon,
                { 
                  backgroundColor: item.active ? getStatusColor(item.status) : theme.borderLight,
                  borderColor: item.active ? getStatusColor(item.status) : theme.borderLight
                }
              ]}>
                <MaterialCommunityIcons 
                  name={
                    item.status === AlertStatus.PENDING ? "clock-outline" :
                    item.status === AlertStatus.IN_PROGRESS ? "play-circle-outline" :
                    "check-circle-outline"
                  }
                  size={16} 
                  color={item.active ? "#FFFFFF" : theme.textTertiary}
                />
              </View>
              
              <View style={styles.timelineText}>
                <Text style={[
                  styles.timelineLabel,
                  { color: item.active ? theme.text : theme.textTertiary }
                ]}>
                  {item.label}
                </Text>
                {item.time && (
                  <Text style={[styles.timelineTime, { color: theme.textSecondary }]}>
                    {getTimeAgo(item.time)}
                  </Text>
                )}
              </View>
            </View>
            
            {index < timeline.length - 1 && (
              <View style={[
                styles.timelineLine,
                { backgroundColor: timeline[index + 1].active ? getStatusColor(timeline[index + 1].status) : theme.borderLight }
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render action buttons based on current status
  const renderActionButtons = () => {
    if (!alert || updating) return null;

    const primaryButtons = [];
    const secondaryButtons = [];

    // Primary actions based on status
    if (alert.status === AlertStatus.PENDING) {
      primaryButtons.push({
        key: "progress",
        label: "Bắt đầu xử lý",
        icon: "play-circle-outline",
        color: "#007AFF",
        onPress: handleMarkInProgress
      });
    }

    if (alert.status === AlertStatus.PENDING || alert.status === AlertStatus.IN_PROGRESS) {
      primaryButtons.push({
        key: "resolve",
        label: "Xử lý xong",
        icon: "check-circle-outline",
        color: "#34C759",
        onPress: handleResolveAlert
      });
    }

    // Secondary actions
    if (alert.status !== AlertStatus.RESOLVED && alert.status !== AlertStatus.ESCALATED) {
      secondaryButtons.push({
        key: "escalate",
        label: "Chuyển tiếp",
        icon: "arrow-up-circle-outline",
        color: "#FF3B30",
        onPress: handleEscalateAlert
      });
    }

    if (alert.status !== AlertStatus.RESOLVED && alert.status !== AlertStatus.IGNORED) {
      secondaryButtons.push({
        key: "dismiss",
        label: "Bỏ qua",
        icon: "close-circle-outline",
        color: "#8E8E93",
        onPress: handleDismissAlert
      });
    }

    // Always show back to list button
    secondaryButtons.push({
      key: "backToList",
      label: "Danh sách cảnh báo",
      icon: "format-list-bulleted",
      color: theme.primary,
      onPress: navigateToAlertsList
    });

    return (
      <View style={styles.actionButtonsContainer}>
        {primaryButtons.length > 0 && (
          <>
            <Text style={[styles.actionsTitle, { color: theme.text }]}>
              Thao tác chính
            </Text>
            <View style={styles.primaryButtonsGrid}>
              {primaryButtons.map((button) => (
                <TouchableOpacity
                  key={button.key}
                  style={[styles.actionButton, styles.primaryActionButton, { backgroundColor: button.color }]}
                  onPress={button.onPress}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name={button.icon as any} size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>{button.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {secondaryButtons.length > 0 && (
          <>
            <Text style={[styles.actionsTitle, { color: theme.text, marginTop: primaryButtons.length > 0 ? 24 : 0 }]}>
              Thao tác khác
            </Text>
            <View style={styles.secondaryButtonsGrid}>
              {secondaryButtons.map((button) => (
                <TouchableOpacity
                  key={button.key}
                  style={[
                    styles.actionButton, 
                    styles.secondaryActionButton, 
                    { 
                      borderColor: button.color,
                      backgroundColor: button.key === "backToList" ? `${button.color}15` : "transparent"
                    }
                  ]}
                  onPress={button.onPress}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name={button.icon as any} size={18} color={button.color} />
                  <Text style={[styles.secondaryActionButtonText, { color: button.color }]}>
                    {button.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
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
                activeOpacity={0.8}
              >
                <Text style={[styles.retryText, { color: "#FFFFFF" }]}>
                  Thử lại
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.errorBackButton, { backgroundColor: theme.textSecondary }]}
              onPress={navigateToAlertsList}
              activeOpacity={0.8}
            >
              <Text style={[styles.backText, { color: "#FFFFFF" }]}>
                Danh sách cảnh báo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundSecondary }]} edges={["top", "bottom"]}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alert Overview Card */}
        <View style={[styles.overviewCard, { backgroundColor: theme.card }]}>
          <View style={styles.overviewHeader}>
            <View style={[styles.alertIconContainer, {
              backgroundColor: alert.severity 
                ? `${getSeverityColor(alert.severity)}15` 
                : `${getStatusColor(alert.status)}15`
            }]}>
              {getAlertIcon(alert.type, alert.severity)}
            </View>
            
            <View style={styles.overviewContent}>
              <Text style={[styles.alertTitle, { color: theme.text }]}>
                {getAlertTypeLabel(alert.type)}
              </Text>
              
              <View style={styles.badgesRow}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(alert.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(alert.status)}</Text>
                </View>
                
                {alert.severity && (
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                    <Text style={styles.severityText}>{getSeverityLabel(alert.severity)}</Text>
                  </View>
                )}
              </View>

              {alert.gardenName && (
                <View style={styles.gardenInfo}>
                  <MaterialCommunityIcons name="home-outline" size={16} color={theme.primary} />
                  <Text style={[styles.gardenName, { color: theme.primary }]}>{alert.gardenName}</Text>
                </View>
              )}
            </View>
          </View>

          {renderPriorityIndicator()}
        </View>

        {/* Alert Message */}
        <View style={[styles.messageCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="message-text-outline" size={20} color="#2196F3" />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Nội dung cảnh báo
            </Text>
          </View>
          <Text style={[styles.messageText, { color: theme.text }]}>
            {alert.message}
          </Text>
        </View>

        {/* Suggestion */}
        {alert.suggestion && (
          <View style={[styles.suggestionCard, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFC107" />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Gợi ý xử lý
              </Text>
            </View>
            <Text style={[styles.suggestionText, { color: theme.textSecondary }]}>
              {alert.suggestion}
            </Text>
          </View>
        )}

        {/* Status Timeline */}
        {renderStatusTimeline()}

        {/* Information Details */}
        <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information-outline" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Thông tin chi tiết
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Thời gian tạo</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{formatDateTime(alert.createdAt)}</Text>
              <Text style={[styles.detailSubValue, { color: theme.textTertiary }]}>{getTimeAgo(alert.createdAt)}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Cập nhật cuối</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{formatDateTime(alert.updatedAt)}</Text>
              <Text style={[styles.detailSubValue, { color: theme.textTertiary }]}>{getTimeAgo(alert.updatedAt)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {renderActionButtons()}
      </ScrollView>

      {updating && (
        <View style={styles.updatingOverlay}>
          <View style={[styles.updatingContent, { backgroundColor: theme.card }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.updatingText, { color: theme.text }]}>
              Đang cập nhật...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  listButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  overviewCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  alertIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  overviewContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  severityText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
  },
  gardenInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  gardenName: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    marginLeft: 6,
  },
  priorityIndicator: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: "Inter-Bold",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  messageCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timelineCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginLeft: 8,
  },
  messageText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
  },
  suggestionText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    fontStyle: "italic",
  },
  timelineItem: {
    marginBottom: 16,
    position: "relative",
  },
  timelineContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginRight: 12,
  },
  timelineText: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
  },
  timelineLine: {
    position: "absolute",
    left: 15,
    top: 32,
    width: 2,
    height: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
  },
  actionButtonsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginBottom: 16,
  },
  primaryButtonsGrid: {
    gap: 12,
  },
  secondaryButtonsGrid: {
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryActionButton: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryActionButton: {
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  secondaryActionButtonText: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
    marginLeft: 8,
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
  updatingContent: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  updatingText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    marginTop: 16,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginRight: 12,
  },
  retryText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
  },
  errorButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  errorBackButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  backText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
  },
});
