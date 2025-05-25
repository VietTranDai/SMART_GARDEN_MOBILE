import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Alert, AlertStatus, AlertType } from "@/types";

interface AlertsListProps {
  alerts: Alert[];
  onAlertPress?: (alert: Alert) => void;
  onResolveAlert?: (alertId: string) => void;
  onIgnoreAlert?: (alertId: string) => void;
  compact?: boolean;
  maxItems?: number;
}

const ALERT_ICONS: Record<
  AlertType,
  | keyof typeof FontAwesome5.glyphMap
  | keyof typeof MaterialCommunityIcons.glyphMap
> = {
  [AlertType.WEATHER]: "cloud-sun-rain",
  [AlertType.SENSOR_ERROR]: "exclamation-triangle",
  [AlertType.SYSTEM]: "cogs",
  [AlertType.PLANT_CONDITION]: "seedling",
  [AlertType.ACTIVITY]: "tasks",
  [AlertType.MAINTENANCE]: "tools",
  [AlertType.SECURITY]: "shield-alt",
  [AlertType.OTHER]: "bell",
};

export default function AlertsList({
  alerts,
  onAlertPress,
  onResolveAlert,
  onIgnoreAlert,
  compact = false,
  maxItems,
}: AlertsListProps) {
  const theme = useAppTheme();

  if (!alerts || alerts.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={48}
          color={theme.textSecondary}
        />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Không có cảnh báo nào
        </Text>
      </View>
    );
  }

  const getAlertTypeIcon = (type: AlertType) => {
    return ALERT_ICONS[type] || "bell";
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
      default:
        return String(status);
    }
  };

  const getActionButtons = (alert: Alert) => {
    if (
      alert.status === AlertStatus.RESOLVED ||
      alert.status === AlertStatus.IGNORED ||
      !onResolveAlert ||
      !onIgnoreAlert
    ) {
      return null;
    }

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.success + "20" },
          ]}
          onPress={() => onResolveAlert(alert.id.toString())}
        >
          <FontAwesome5 name="check" size={12} color={theme.success} />
          <Text style={[styles.actionText, { color: theme.success }]}>
            Xử lý
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.textSecondary + "20" },
          ]}
          onPress={() => onIgnoreAlert(alert.id.toString())}
        >
          <FontAwesome5 name="times" size={12} color={theme.textSecondary} />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>
            Bỏ qua
          </Text>
        </TouchableOpacity>
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
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  activeAlerts.sort(sortByTime);
  resolvedAlerts.sort(sortByTime);

  // Combine arrays with active alerts first
  let sortedAlerts = [...activeAlerts, ...resolvedAlerts];

  // Limit the number of items if maxItems is provided
  if (maxItems) {
    sortedAlerts = sortedAlerts.slice(0, maxItems);
  }

  const renderCompactAlert = ({ item }: { item: Alert }) => {
    const alertColor = getAlertTypeColor(item.type);
    const icon = getAlertTypeIcon(item.type);
    const isIconFA5 = [
      "cloud-sun-rain",
      "exclamation-triangle",
      "cogs",
      "seedling",
      "tasks",
      "tools",
      "shield-alt",
      "bell",
    ].includes(icon as string);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.alertCard}
        onPress={() => onAlertPress && onAlertPress(item)}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: alertColor + "20" }]}
        >
          {isIconFA5 ? (
            <FontAwesome5
              name={icon as keyof typeof FontAwesome5.glyphMap}
              size={24}
              color={alertColor}
            />
          ) : (
            <MaterialCommunityIcons
              name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={24}
              color={alertColor}
            />
          )}
        </View>
        <View style={styles.alertContent}>
          <Text
            style={[styles.alertMessage, { color: theme.text }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <View style={styles.alertFooter}>
            <Text style={[styles.gardenName, { color: theme.textSecondary }]}>
              {item.gardenName}
            </Text>
            <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailedAlert = ({ item }: { item: Alert }) => {
    const alertColor = getAlertTypeColor(item.type);
    const statusColor = getStatusColor(item.status);
    const icon = getAlertTypeIcon(item.type);
    const isIconFA5 = [
      "cloud-sun-rain",
      "exclamation-triangle",
      "cogs",
      "seedling",
      "tasks",
      "tools",
      "shield-alt",
      "bell",
    ].includes(icon);
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
              {isIconFA5 ? (
                <FontAwesome5
                  name={icon as keyof typeof FontAwesome5.glyphMap}
                  size={14}
                  color={alertColor}
                />
              ) : (
                <MaterialCommunityIcons
                  name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={14}
                  color={alertColor}
                />
              )}
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
            Đề xuất: {item.suggestion}
          </Text>
        )}

        {getActionButtons(item)}

        <View style={styles.alertMeta}>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {item.gardenName}
          </Text>
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (compact) {
    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sortedAlerts.map((alert) => renderCompactAlert({ item: alert }))}
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={sortedAlerts}
      renderItem={renderDetailedAlert}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.detailedListContainer}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  detailedListContainer: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    margin: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    marginTop: 8,
  },
  alertCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 4,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gardenName: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  timestamp: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  // Detailed alert styles
  alertContainer: {
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  alertType: {
    fontSize: 14,
    fontFamily: "Inter-Bold",
    textTransform: "capitalize",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    lineHeight: 20,
    padding: 12,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
    fontStyle: "italic",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginLeft: 6,
  },
  alertMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
});
