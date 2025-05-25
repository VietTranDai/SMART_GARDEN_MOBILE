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
import { Alert, AlertStatus, AlertType } from "@/types/alerts/alert.types";
import { alertService, gardenService, weatherService } from "@/service/api";

// Extended Alert type with UI-specific properties
interface AlertUI extends Alert {
  title?: string;
  gardenName?: string;
}

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
  const [alerts, setAlerts] = useState<AlertUI[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setError(null);
      const alertsData = await alertService.getAlerts();

      // Transform to AlertUI if needed (e.g., add garden name if gardenId exists)
      const enhancedAlerts = await Promise.all(
        alertsData.map(async (alert) => {
          if (alert.gardenId) {
            try {
              // Get garden details to add garden name
              const garden = await gardenService.getGardenById(alert.gardenId);
              return {
                ...alert,
                gardenName: garden?.name || `Garden ${alert.gardenId}`,
                title: getAlertTitle(alert.type),
              } as AlertUI;
            } catch (err) {
              // If garden fetch fails, still return the alert with default values
              return {
                ...alert,
                gardenName: `Garden ${alert.gardenId}`,
                title: getAlertTitle(alert.type),
              } as AlertUI;
            }
          } else {
            // No gardenId, return with just the alert type as title
            return {
              ...alert,
              title: getAlertTitle(alert.type),
            } as AlertUI;
          }
        })
      );

      setAlerts(enhancedAlerts);
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
  }, []);

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

  const handleAlertPress = (alert: AlertUI) => {
    // If pending, mark as in progress
    if (alert.status === AlertStatus.PENDING) {
      updateAlertStatus(alert.id, AlertStatus.IN_PROGRESS);
    }

    // Navigate to alert detail view
    router.push(`/(modules)/alerts/[id]?id=${alert.id}`);
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

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.WEATHER:
        return (
          <MaterialCommunityIcons
            name="weather-lightning-rainy"
            size={24}
            color="#FFC107"
          />
        );
      case AlertType.SENSOR_ERROR:
        return (
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={24}
            color="#F44336"
          />
        );
      case AlertType.PLANT_CONDITION:
        return (
          <MaterialCommunityIcons
            name="sprout-outline"
            size={24}
            color="#4CAF50"
          />
        );
      case AlertType.ACTIVITY:
        return (
          <MaterialCommunityIcons
            name="calendar-clock"
            size={24}
            color="#2196F3"
          />
        );
      case AlertType.SYSTEM:
        return <MaterialIcons name="system-update" size={24} color="#9C27B0" />;
      case AlertType.MAINTENANCE:
        return (
          <MaterialCommunityIcons name="tools" size={24} color="#FF9800" />
        );
      case AlertType.SECURITY:
        return (
          <MaterialCommunityIcons
            name="shield-alert-outline"
            size={24}
            color="#F44336"
          />
        );
      default:
        return (
          <Ionicons
            name="notifications-outline"
            size={24}
            color={theme.primary}
          />
        );
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

  const filteredAlerts = alerts.filter((alert) => {
    // Filter by status
    if (statusFilter !== "ALL" && alert.status !== statusFilter) {
      return false;
    }

    // Filter by type
    if (typeFilter !== "ALL" && alert.type !== typeFilter) {
      return false;
    }

    return true;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // Sort by status (pending first)
    if (a.status === AlertStatus.PENDING && b.status !== AlertStatus.PENDING)
      return -1;
    if (a.status !== AlertStatus.PENDING && b.status === AlertStatus.PENDING)
      return 1;

    // Then by severity if available
    if (a.severity && b.severity && a.severity !== b.severity) {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (
        severityOrder[a.severity as keyof typeof severityOrder] -
        severityOrder[b.severity as keyof typeof severityOrder]
      );
    }

    // Finally by timestamp (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const renderAlertItem = ({ item }: { item: AlertUI }) => (
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
    >
      <View style={styles.alertIconContainer}>{getAlertIcon(item.type)}</View>
      <View style={styles.alertContent}>
        <View style={styles.alertHeaderRow}>
          <Text style={[styles.alertTitle, { color: theme.text }]}>
            {item.title || getAlertTitle(item.type)}
          </Text>
          <Text style={[styles.alertTime, { color: theme.textTertiary }]}>
            {formatTimestamp(item.createdAt)}
          </Text>
        </View>

        <Text
          style={[styles.alertMessage, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {item.message}
        </Text>

        {item.suggestion && (
          <Text
            style={[styles.alertSuggestion, { color: theme.info }]}
            numberOfLines={1}
          >
            Đề xuất: {item.suggestion}
          </Text>
        )}

        {item.gardenName ? (
          <Text style={[styles.alertGarden, { color: theme.primary }]}>
            {item.gardenName}
          </Text>
        ) : null}

        <View style={styles.alertFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>

          {item.severity && (
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(item.severity) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.severityText,
                  { color: getSeverityColor(item.severity) },
                ]}
              >
                {item.severity}
              </Text>
            </View>
          )}

          <View style={styles.alertActions}>
            {item.status === AlertStatus.PENDING && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => updateAlertStatus(item.id, AlertStatus.RESOLVED)}
              >
                <Text style={[styles.actionText, { color: theme.success }]}>
                  Xử lý
                </Text>
              </TouchableOpacity>
            )}

            {(item.status === AlertStatus.PENDING ||
              item.status === AlertStatus.IN_PROGRESS) && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => dismissAlert(item.id)}
              >
                <Text
                  style={[styles.actionText, { color: theme.textSecondary }]}
                >
                  Bỏ qua
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => {
    const statusOptions = [
      { label: "Tất cả", value: "ALL" },
      { label: "Chờ xử lý", value: AlertStatus.PENDING },
      { label: "Đang xử lý", value: AlertStatus.IN_PROGRESS },
      { label: "Đã xử lý", value: AlertStatus.RESOLVED },
    ];

    return (
      <View style={styles.filterContainer}>
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
                      : theme.background,
                },
              ]}
              onPress={() => setStatusFilter(option.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      statusFilter === option.value
                        ? "#FFFFFF"
                        : theme.textSecondary,
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
                      ? theme.primaryLight
                      : theme.backgroundSecondary,
                  borderWidth: 1,
                  borderColor:
                    typeFilter === option.value
                      ? theme.primary
                      : theme.borderLight,
                },
              ]}
              onPress={() => setTypeFilter(option.value)}
            >
              <Text
                style={[
                  styles.typeFilterText,
                  {
                    color:
                      typeFilter === option.value
                        ? theme.primary
                        : theme.textSecondary,
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      edges={["bottom"]}
    >
      {renderFilterButtons()}
      {renderTypeFilterChips()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Đang tải cảnh báo...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={[styles.alertsCount, { color: theme.text }]}>
              {filteredAlerts.length}{" "}
              {statusFilter === "ALL"
                ? "Cảnh báo"
                : `cảnh báo ${getStatusLabel(
                    statusFilter as AlertStatus
                  ).toLowerCase()}`}
            </Text>
            {filteredAlerts.some(
              (alert) =>
                alert.status === AlertStatus.PENDING ||
                alert.status === AlertStatus.IN_PROGRESS
            ) && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={resolveAllAlerts}
              >
                <Text style={[styles.markAllText, { color: theme.primary }]}>
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
              />
            }
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
                  {statusFilter === "ALL"
                    ? "Không có cảnh báo nào"
                    : `Không có cảnh báo ${getStatusLabel(
                        statusFilter as AlertStatus
                      ).toLowerCase()}`}
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: theme.textTertiary }]}
                >
                  Kéo xuống để làm mới
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  filterText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  alertsCount: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  alertItem: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertIconContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  alertContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 8,
  },
  alertHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginBottom: 8,
  },
  alertSuggestion: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    marginBottom: 8,
    fontStyle: "italic",
  },
  alertGarden: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter-Medium",
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 11,
    fontFamily: "Inter-Medium",
  },
  alertActions: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  actionText: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Inter-Medium",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginTop: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 8,
  },
  typeFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typeFilterScrollContent: {
    paddingHorizontal: 8,
  },
  typeFilterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  typeFilterText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
});
