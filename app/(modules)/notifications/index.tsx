import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { router } from "expo-router";
import { Alert, AlertStatus } from "@/types/gardens/alert.types";
import { weatherService } from "@/service/api";

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
  const [filter, setFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setError(null);
      const alertsData = await weatherService.getAlerts();
      setAlerts(alertsData as AlertUI[]);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError("Không thể tải thông báo. Vui lòng thử lại sau.");
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
        await weatherService.resolveAlert(id);
      } else {
        await weatherService.updateAlert(id, { status: newStatus });
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

    // Navigate based on alert type
    switch (alert.type) {
      case "WEATHER":
        router.push("/(modules)/weather" as any);
        break;
      case "SENSOR_ERROR":
      case "ACTIVITY":
        router.push("/(modules)/tasks" as any);
        break;
      case "SYSTEM":
      case "MAINTENANCE":
      case "SECURITY":
        // Just update status, no navigation
        break;
      default:
        break;
    }
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
        unresolvedAlerts.map((alert) => weatherService.resolveAlert(alert.id))
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
      return "Yesterday";
    }

    // If it's within 7 days, show the day name
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    if (date > sevenDaysAgo) {
      return date.toLocaleDateString(undefined, { weekday: "long" });
    }

    // Otherwise show the full date
    return formatDate(timestamp);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "WEATHER":
        return (
          <MaterialCommunityIcons
            name="weather-lightning-rainy"
            size={24}
            color="#FFC107"
          />
        );
      case "SENSOR_ERROR":
        return (
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={24}
            color="#F44336"
          />
        );
      case "CROP_CONDITION":
        return (
          <MaterialCommunityIcons
            name="sprout-outline"
            size={24}
            color="#4CAF50"
          />
        );
      case "ACTIVITY":
        return (
          <MaterialCommunityIcons
            name="calendar-clock"
            size={24}
            color="#2196F3"
          />
        );
      case "SYSTEM":
        return <MaterialIcons name="system-update" size={24} color="#9C27B0" />;
      case "MAINTENANCE":
        return (
          <MaterialCommunityIcons name="tools" size={24} color="#FF9800" />
        );
      case "SECURITY":
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return theme.warning;
      case "IN_PROGRESS":
        return theme.info;
      case "RESOLVED":
        return theme.success;
      case "IGNORED":
        return theme.textTertiary;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ");
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "ALL") return true;
    return alert.status === filter;
  });

  const renderAlertItem = ({ item }: { item: AlertUI }) => (
    <TouchableOpacity
      style={[
        styles.alertItem,
        {
          backgroundColor: theme.card,
          borderLeftColor: getStatusColor(item.status),
          opacity: item.status === "IGNORED" ? 0.7 : 1,
        },
      ]}
      onPress={() => handleAlertPress(item)}
    >
      <View style={styles.alertIconContainer}>{getAlertIcon(item.type)}</View>
      <View style={styles.alertContent}>
        <View style={styles.alertHeaderRow}>
          <Text style={[styles.alertTitle, { color: theme.text }]}>
            {item.title || item.type}
          </Text>
          <Text style={[styles.alertTime, { color: theme.textTertiary }]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>

        <Text
          style={[styles.alertMessage, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {item.message}
        </Text>

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

          <View style={styles.alertActions}>
            {item.status === "PENDING" && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => updateAlertStatus(item.id, AlertStatus.RESOLVED)}
              >
                <Text style={[styles.actionText, { color: theme.success }]}>
                  Resolve
                </Text>
              </TouchableOpacity>
            )}

            {(item.status === "PENDING" || item.status === "IN_PROGRESS") && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => dismissAlert(item.id)}
              >
                <Text
                  style={[styles.actionText, { color: theme.textSecondary }]}
                >
                  Dismiss
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      edges={["bottom"]}
    >
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === "ALL" ? theme.primary : theme.background,
            },
          ]}
          onPress={() => setFilter("ALL")}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === "ALL" ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === "PENDING" ? theme.primary : theme.background,
            },
          ]}
          onPress={() => setFilter("PENDING")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === "PENDING" ? "#FFFFFF" : theme.textSecondary,
              },
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === "RESOLVED" ? theme.primary : theme.background,
            },
          ]}
          onPress={() => setFilter("RESOLVED")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === "RESOLVED" ? "#FFFFFF" : theme.textSecondary,
              },
            ]}
          >
            Resolved
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading alerts...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={[styles.alertsCount, { color: theme.text }]}>
              {filteredAlerts.length}{" "}
              {filter === "ALL" ? "Alerts" : filter.toLowerCase()}
            </Text>
            {filteredAlerts.some(
              (alert) =>
                alert.status === "PENDING" || alert.status === "IN_PROGRESS"
            ) && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={resolveAllAlerts}
              >
                <Text style={[styles.markAllText, { color: theme.primary }]}>
                  Resolve All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredAlerts}
            renderItem={renderAlertItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
                  {filter === "ALL"
                    ? "No alerts"
                    : `No ${filter.toLowerCase()} alerts`}
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: theme.textTertiary }]}
                >
                  Pull down to refresh
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
  alertGarden: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter-Medium",
  },
  alertActions: {
    flexDirection: "row",
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
});
