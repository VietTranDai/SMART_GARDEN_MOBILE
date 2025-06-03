import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { router } from "expo-router";
import { Alert, AlertStatus, AlertType, Severity } from "@/types/alerts/alert.types";
import { alertService } from "@/service/api";

// Add a date formatting function
const formatDate = (dateString: string, format: string = "default"): string => {
  const date = new Date(dateString);
  if (format === "time") {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString();
};

export default function AlertsScreen() {
  const theme = useAppTheme();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<AlertType | "ALL">("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, typeFilter]);

  const fetchAlerts = async () => {
    try {
      setError(null);
      
      // Use the updated service method with filtering
      const statusParam = statusFilter === "ALL" ? undefined : statusFilter;
      const typeParam = typeFilter === "ALL" ? undefined : typeFilter;
      
      const alertsData = await alertService.getAlerts(statusParam, typeParam);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError("Không thể tải thông báo cảnh báo. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  }, [statusFilter, typeFilter]);

  const updateAlertStatus = async (id: number, newStatus: AlertStatus) => {
    try {
      if (newStatus === AlertStatus.RESOLVED) {
        await alertService.resolveAlert(id);
      } else {
        await alertService.updateAlertStatus(id, newStatus);
      }

      // Update local state after successful API call
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === id ? { ...alert, status: newStatus } : alert
        )
      );
    } catch (err) {
      console.error(`Failed to update alert ${id} status:`, err);
    }
  };

  const handleAlertPress = (alert: Alert) => {
    // If pending, mark as in progress
    if (alert.status === AlertStatus.PENDING) {
      updateAlertStatus(alert.id, AlertStatus.IN_PROGRESS);
    }

    // Navigate to alert detail view
    router.push(`/(modules)/alerts/${alert.id}`);
  };

  const resolveAllAlerts = async () => {
    try {
      // Get all unresolved alerts
      const unresolvedAlerts = alerts.filter(
        (alert) =>
          alert.status === AlertStatus.PENDING ||
          alert.status === AlertStatus.IN_PROGRESS
      );

      // Resolve each alert
      await Promise.all(
        unresolvedAlerts.map((alert) => alertService.resolveAlert(alert.id))
      );

      // Update local state
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.status === AlertStatus.PENDING ||
          alert.status === AlertStatus.IN_PROGRESS
            ? { ...alert, status: AlertStatus.RESOLVED }
            : alert
        )
      );
    } catch (err) {
      console.error("Failed to resolve all alerts:", err);
    }
  };

  const dismissAlert = async (id: number) => {
    await updateAlertStatus(id, AlertStatus.IGNORED);
  };

  const markAsRead = async (id: number) => {
    await alertService.markAsRead(id);
    // Update local state
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === id ? { ...alert, status: AlertStatus.IN_PROGRESS } : alert
      )
    );
  };

  const getAlertTitle = (type: AlertType): string => {
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
        return "Thông báo";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    // If it's today, show the time
    if (date.toDateString() === now.toDateString()) {
      return formatDate(timestamp, "time");
    }

    // If it's yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    }

    // If it's within 7 days, show the day name
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    if (date > sevenDaysAgo) {
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      return days[date.getDay()];
    }

    // Otherwise show the full date
    return formatDate(timestamp);
  };

  const getAlertIcon = (type: AlertType, severity?: Severity) => {
    const iconSize = 28;
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

  // Sort alerts by priority
  const sortedAlerts = [...alerts].sort((a, b) => {
    // Sort by status (pending first)
    if (a.status === AlertStatus.PENDING && b.status !== AlertStatus.PENDING)
      return -1;
    if (a.status !== AlertStatus.PENDING && b.status === AlertStatus.PENDING)
      return 1;

    // Then by severity if available
    if (a.severity && b.severity && a.severity !== b.severity) {
      const severityOrder = { 
        [Severity.CRITICAL]: 0, 
        [Severity.HIGH]: 1, 
        [Severity.MEDIUM]: 2, 
        [Severity.LOW]: 3 
      };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }

    // Finally by timestamp (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const renderAlertItem = ({ item }: { item: Alert }) => (
    <TouchableOpacity
      style={[
        styles.alertItem,
        {
          backgroundColor: theme.card,
          borderLeftColor: item.severity
            ? getSeverityColor(item.severity)
            : getStatusColor(item.status),
          opacity: item.status === AlertStatus.IGNORED ? 0.7 : 1,
        },
      ]}
      onPress={() => handleAlertPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.alertIconContainer, {
        backgroundColor: item.severity 
          ? `${getSeverityColor(item.severity)}15` 
          : `${getStatusColor(item.status)}15`
      }]}>
        {getAlertIcon(item.type, item.severity)}
      </View>
      
      <View style={styles.alertContent}>
        <View style={styles.alertHeaderRow}>
          <Text style={[styles.alertTitle, { color: theme.text }]} numberOfLines={1}>
            {getAlertTitle(item.type)}
          </Text>
          <View style={styles.alertTimeContainer}>
            <Text style={[styles.alertTime, { color: theme.textTertiary }]}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.alertMessage, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {item.message}
        </Text>

        {item.suggestion && (
          <View style={styles.suggestionContainer}>
            <MaterialCommunityIcons 
              name="lightbulb-outline" 
              size={14} 
              color={theme.info} 
              style={styles.suggestionIcon}
            />
            <Text
              style={[styles.alertSuggestion, { color: theme.info }]}
              numberOfLines={1}
            >
              {item.suggestion}
            </Text>
          </View>
        )}

        {item.gardenName && (
          <View style={styles.gardenContainer}>
            <MaterialCommunityIcons 
              name="home-outline" 
              size={14} 
              color={theme.primary} 
              style={styles.gardenIcon}
            />
            <Text style={[styles.alertGarden, { color: theme.primary }]} numberOfLines={1}>
              {item.gardenName}
            </Text>
          </View>
        )}

        <View style={styles.alertFooter}>
          <View style={styles.badgesContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusLabel(item.status)}
              </Text>
            </View>

            {item.severity && (
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(item.severity) },
                ]}
              >
                <Text style={styles.severityText}>
                  {getSeverityLabel(item.severity)}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${theme.primary}15` }]}
            onPress={(e) => {
              e.stopPropagation();
              markAsRead(item.id);
            }}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => {
    const statusOptions = [
      { label: "Tất cả", value: "ALL" },
      { label: "Chờ xử lý", value: AlertStatus.PENDING },
      { label: "Đang xử lý", value: AlertStatus.IN_PROGRESS },
      { label: "Đã giải quyết", value: AlertStatus.RESOLVED },
      { label: "Đã bỏ qua", value: AlertStatus.IGNORED },
    ];

    return (
      <View style={[styles.filterContainer, { backgroundColor: theme.background }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    statusFilter === option.value
                      ? theme.primary
                      : theme.backgroundSecondary,
                  borderWidth: 1,
                  borderColor:
                    statusFilter === option.value
                      ? theme.primary
                      : "transparent",
                },
              ]}
              onPress={() => setStatusFilter(option.value as AlertStatus | "ALL")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      statusFilter === option.value
                        ? "#FFFFFF"
                        : theme.textSecondary,
                    fontFamily:
                      statusFilter === option.value
                        ? "Inter-SemiBold"
                        : "Inter-Medium",
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTypeFilterChips = () => {
    const typeOptions = [
      { label: "Tất cả", value: "ALL" },
      { label: "Thời tiết", value: AlertType.WEATHER },
      { label: "Cảm biến", value: AlertType.SENSOR_ERROR },
      { label: "Cây trồng", value: AlertType.PLANT_CONDITION },
      { label: "Hoạt động", value: AlertType.ACTIVITY },
      { label: "Hệ thống", value: AlertType.SYSTEM },
      { label: "Bảo trì", value: AlertType.MAINTENANCE },
      { label: "An ninh", value: AlertType.SECURITY },
    ];

    return (
      <View style={styles.typeFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeFilterScrollContent}
        >
          {typeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.typeFilterChip,
                {
                  backgroundColor:
                    typeFilter === option.value
                      ? `${theme.primary}20`
                      : theme.backgroundSecondary,
                  borderWidth: 1,
                  borderColor:
                    typeFilter === option.value
                      ? theme.primary
                      : theme.borderLight,
                },
              ]}
              onPress={() => setTypeFilter(option.value as AlertType | "ALL")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeFilterText,
                  {
                    color:
                      typeFilter === option.value
                        ? theme.primary
                        : theme.textSecondary,
                    fontFamily:
                      typeFilter === option.value
                        ? "Inter-SemiBold"
                        : "Inter-Medium",
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
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
            Cảnh báo & Thông báo
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Quản lý cảnh báo hệ thống
          </Text>
        </View>
        
        <View style={styles.rightSpace} />
      </View>
    </View>
  );

  const renderStatsCard = () => {
    const pendingCount = alerts.filter(a => a.status === AlertStatus.PENDING).length;
    const inProgressCount = alerts.filter(a => a.status === AlertStatus.IN_PROGRESS).length;
    const criticalCount = alerts.filter(a => a.severity === Severity.CRITICAL).length;

    return (
      <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#FF9500" }]}>{pendingCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Chờ xử lý</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#007AFF" }]}>{inProgressCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Đang xử lý</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#FF3B30" }]}>{criticalCount}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Nghiêm trọng</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      edges={["top", "bottom"]}
    >
      {renderHeader()}
      {renderFilterButtons()}
      {renderTypeFilterChips()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Đang tải cảnh báo...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color={theme.error}
          />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={fetchAlerts}
            activeOpacity={0.8}
          >
            <Text style={[styles.retryText, { color: "#FFFFFF" }]}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {renderStatsCard()}
          
          <View style={styles.headerContainer}>
            <Text style={[styles.alertsCount, { color: theme.text }]}>
              {sortedAlerts.length} cảnh báo
            </Text>
            {sortedAlerts.some(
              (alert) =>
                alert.status === AlertStatus.PENDING ||
                alert.status === AlertStatus.IN_PROGRESS
            ) && (
              <TouchableOpacity
                style={[styles.markAllButton, { backgroundColor: `${theme.success}15` }]}
                onPress={resolveAllAlerts}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="check-all" size={16} color={theme.success} />
                <Text style={[styles.markAllText, { color: theme.success }]}>
                  Xử lý tất cả
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={sortedAlerts}
            renderItem={renderAlertItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="bell-check-outline"
                  size={64}
                  color={theme.textTertiary}
                />
                <Text
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  Không có cảnh báo nào
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: theme.textTertiary }]}
                >
                  Hệ thống hoạt động bình thường
                </Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  rightSpace: {
    width: 40,
    height: 40,
  },
  statsCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 8,
    minWidth: 80,
    alignItems: "center",
  },
  filterText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  typeFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  typeFilterScrollContent: {
    paddingRight: 16,
  },
  typeFilterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  typeFilterText: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  alertsCount: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  alertItem: {
    flexDirection: "row",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  alertIconContainer: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  alertContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
  },
  alertHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    flex: 1,
    marginRight: 8,
  },
  alertTimeContainer: {
    alignItems: "flex-end",
  },
  alertTime: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    marginBottom: 8,
  },
  suggestionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  suggestionIcon: {
    marginRight: 6,
  },
  alertSuggestion: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    fontStyle: "italic",
    flex: 1,
  },
  gardenContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  gardenIcon: {
    marginRight: 6,
  },
  alertGarden: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    flex: 1,
  },
  alertFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontFamily: "Inter-SemiBold",
    color: "#FFFFFF",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
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
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    textAlign: "center",
  },
});
