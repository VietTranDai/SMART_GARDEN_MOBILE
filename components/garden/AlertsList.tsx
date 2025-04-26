import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

export enum AlertType {
  WEATHER = "WEATHER",
  SENSOR_ERROR = "SENSOR_ERROR",
  SYSTEM = "SYSTEM",
  PLANT_CONDITION = "PLANT_CONDITION",
  ACTIVITY = "ACTIVITY",
  MAINTENANCE = "MAINTENANCE",
  SECURITY = "SECURITY",
  OTHER = "OTHER",
  MOISTURE = "MOISTURE",
  TEMPERATURE = "TEMPERATURE",
  PEST = "PEST",
  WATERING = "WATERING",
  LIGHT = "LIGHT",
  HUMIDITY = "HUMIDITY",
  NUTRIENT = "NUTRIENT",
}

export enum AlertStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  IGNORED = "IGNORED",
  ESCALATED = "ESCALATED",
  ACTIVE = "ACTIVE",
}

export enum NotificationMethod {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
  IN_APP = "IN_APP",
  NONE = "NONE",
}

export interface Alert {
  id: string;
  gardenId: string;
  title: string;
  message: string;
  type: AlertType;
  status: AlertStatus;
  priority: number;
  timestamp: string;
  suggestion?: string;
  notificationMethod: NotificationMethod;
  createdAt: string;
  updatedAt: string;
}

interface AlertsListProps {
  alerts: Alert[];
  onResolveAlert?: (alertId: string) => void;
  onIgnoreAlert?: (alertId: string) => void;
}

export default function AlertsList({
  alerts,
  onResolveAlert,
  onIgnoreAlert,
}: AlertsListProps) {
  const theme = useAppTheme();

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.WEATHER:
        return "cloud-sun-rain";
      case AlertType.SENSOR_ERROR:
        return "exclamation-triangle";
      case AlertType.SYSTEM:
        return "cogs";
      case AlertType.PLANT_CONDITION:
        return "seedling";
      case AlertType.ACTIVITY:
        return "tasks";
      case AlertType.MAINTENANCE:
        return "tools";
      case AlertType.SECURITY:
        return "shield-alt";
      case AlertType.OTHER:
      default:
        return "bell";
    }
  };

  const getAlertTypeColor = (type: AlertType) => {
    switch (type) {
      case AlertType.WEATHER:
        return theme.info;
      case AlertType.SENSOR_ERROR:
        return theme.error;
      case AlertType.SYSTEM:
        return theme.secondary;
      case AlertType.PLANT_CONDITION:
        return theme.warning;
      case AlertType.ACTIVITY:
        return theme.primary;
      case AlertType.MAINTENANCE:
        return theme.tertiary;
      case AlertType.SECURITY:
        return theme.error;
      case AlertType.OTHER:
      default:
        return theme.textSecondary;
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
        return theme.textSecondary;
      case AlertStatus.ESCALATED:
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  // Helper to get Vietnamese status text
  const getStatusText = (status: AlertStatus): string => {
    switch (status) {
      case AlertStatus.PENDING:
        return "Chờ xử lý";
      case AlertStatus.IN_PROGRESS:
        return "Đang xử lý";
      case AlertStatus.RESOLVED:
        return "Đã xử lý";
      case AlertStatus.IGNORED:
        return "Đã bỏ qua";
      case AlertStatus.ESCALATED:
        return "Đã chuyển cấp";
      case AlertStatus.ACTIVE: // Assuming ACTIVE is similar to PENDING for display
        return "Đang hoạt động";
      default:
        return String(status);
    }
  };

  const getActionButtons = (alert: Alert) => {
    if (
      alert.status === AlertStatus.RESOLVED ||
      alert.status === AlertStatus.IGNORED
    ) {
      return null;
    }

    return (
      <View style={styles.actionButtons}>
        {onResolveAlert && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.success + "20" },
            ]}
            onPress={() => onResolveAlert(alert.id)}
          >
            <FontAwesome5 name="check" size={12} color={theme.success} />
            <Text style={[styles.actionText, { color: theme.success }]}>
              Xử lý
            </Text>
          </TouchableOpacity>
        )}

        {onIgnoreAlert && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.textSecondary + "20" },
            ]}
            onPress={() => onIgnoreAlert(alert.id)}
          >
            <FontAwesome5 name="times" size={12} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.textSecondary }]}>
              Bỏ qua
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) {
      return `${diffSec} giây trước`;
    } else if (diffMin < 60) {
      return `${diffMin} phút trước`;
    } else if (diffHour < 24) {
      return `${diffHour} giờ trước`;
    } else if (diffDay < 7) {
      return `${diffDay} ngày trước`;
    } else {
      // Use Vietnamese locale for older dates
      return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    }
  };

  // Filter active alerts first (PENDING, IN_PROGRESS, ESCALATED)
  const activeAlerts = alerts.filter(
    (alert) =>
      alert.status === AlertStatus.PENDING ||
      alert.status === AlertStatus.IN_PROGRESS ||
      alert.status === AlertStatus.ESCALATED
  );

  // Then include resolved and ignored alerts
  const resolvedAlerts = alerts.filter(
    (alert) =>
      alert.status === AlertStatus.RESOLVED ||
      alert.status === AlertStatus.IGNORED
  );

  // Sort both arrays by timestamp (newest first)
  const sortByTime = (a: Alert, b: Alert) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();

  activeAlerts.sort(sortByTime);
  resolvedAlerts.sort(sortByTime);

  // Combine arrays with active alerts first
  const sortedAlerts = [...activeAlerts, ...resolvedAlerts];

  const renderAlert = ({ item }: { item: Alert }) => {
    const alertColor = getAlertTypeColor(item.type);
    const statusColor = getStatusColor(item.status);
    const icon = getAlertTypeIcon(item.type);
    const isActive =
      item.status === AlertStatus.PENDING ||
      item.status === AlertStatus.IN_PROGRESS ||
      item.status === AlertStatus.ESCALATED;

    return (
      <View
        style={[
          styles.alertContainer,
          {
            backgroundColor: theme.card,
            borderLeftColor: alertColor,
            opacity: isActive ? 1 : 0.7,
          },
        ]}
      >
        <View style={styles.alertHeader}>
          <View style={styles.typeContainer}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: alertColor + "20" },
              ]}
            >
              <FontAwesome5 name={icon} size={14} color={alertColor} />
            </View>
            <Text style={[styles.alertType, { color: alertColor }]}>
              {item.type.replace(/_/g, " ")}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[styles.statusIndicator, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <Text style={[styles.messageText, { color: theme.text }]}>
          {item.message}
        </Text>

        {item.suggestion && (
          <Text style={[styles.suggestionText, { color: theme.textSecondary }]}>
            Gợi ý: {item.suggestion}
          </Text>
        )}

        <View style={styles.alertFooter}>
          <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
            {formatDate(item.timestamp)}
          </Text>
          {getActionButtons(item)}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Alerts and Warnings
      </Text>

      {alerts.length > 0 ? (
        <FlatList
          data={sortedAlerts}
          renderItem={renderAlert}
          keyExtractor={(item) => `alert-${item.id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.alertsList}
        />
      ) : (
        <View
          style={[
            styles.emptyContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <FontAwesome5 name="check-circle" size={24} color={theme.success} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Không có cảnh báo nào
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  alertsList: {
    paddingBottom: 8,
  },
  alertContainer: {
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  alertType: {
    fontSize: 12,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    textTransform: "uppercase",
  },
  messageText: {
    fontSize: 14,
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  timestamp: {
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
});

export const sampleAlerts: Alert[] = [
  {
    id: "1",
    gardenId: "garden1",
    title: "Low Soil Moisture",
    message: "The soil moisture in zone 1 is below the recommended threshold.",
    type: AlertType.MOISTURE,
    status: AlertStatus.ACTIVE,
    priority: 1,
    timestamp: new Date().toISOString(),
    notificationMethod: NotificationMethod.EMAIL,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    gardenId: "garden1",
    title: "Temperature Warning",
    message: "The temperature is expected to drop below freezing tonight.",
    type: AlertType.TEMPERATURE,
    status: AlertStatus.ACTIVE,
    priority: 2,
    timestamp: new Date().toISOString(),
    notificationMethod: NotificationMethod.PUSH,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    gardenId: "garden1",
    title: "Pest Detection",
    message: "Possible pest infestation detected in zone 2.",
    type: AlertType.PEST,
    status: AlertStatus.RESOLVED,
    priority: 1,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notificationMethod: NotificationMethod.SMS,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    gardenId: "garden1",
    title: "Watering Schedule",
    message: "Your tomatoes are due for watering today.",
    type: AlertType.WATERING,
    status: AlertStatus.IGNORED,
    priority: 3,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notificationMethod: NotificationMethod.IN_APP,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
