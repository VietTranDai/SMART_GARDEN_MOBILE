import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Alert, AlertType } from "@/types";
import Colors from "@/constants/Colors";

interface AlertsListProps {
  alerts: (Alert & { gardenName?: string })[];
  onAlertPress: (alert: Alert) => void;
  pendingCount?: number;
}

type ThemeColors = typeof Colors.light;

const ALERT_ICONS: Partial<
  Record<AlertType, keyof typeof MaterialCommunityIcons.glyphMap>
> = {
  [AlertType.PLANT_CONDITION]: "alert",
  [AlertType.SENSOR_ERROR]: "alert-circle",
  [AlertType.SYSTEM]: "information",
  [AlertType.WEATHER]: "weather-cloudy-alert",
  [AlertType.ACTIVITY]: "calendar-alert",
  [AlertType.MAINTENANCE]: "tools",
  [AlertType.SECURITY]: "shield-alert",
  [AlertType.OTHER]: "information-outline",
};
const DEFAULT_ALERT_ICON: keyof typeof MaterialCommunityIcons.glyphMap =
  "bell-alert-outline";

const getAlertThemeColorKeys = (
  alertType: AlertType
): {
  iconColorKey: keyof ThemeColors;
  backgroundColorKey: keyof ThemeColors;
} => {
  switch (alertType) {
    case AlertType.PLANT_CONDITION:
    case AlertType.ACTIVITY:
      return { iconColorKey: "warning", backgroundColorKey: "statusWarningBg" };
    case AlertType.SENSOR_ERROR:
    case AlertType.SECURITY:
      return { iconColorKey: "error", backgroundColorKey: "statusDangerBg" };
    case AlertType.SYSTEM:
    case AlertType.MAINTENANCE:
    case AlertType.OTHER:
    case AlertType.WEATHER:
    default:
      return { iconColorKey: "info", backgroundColorKey: "statusInfoBg" };
  }
};

export default function AlertsList({
  alerts,
  onAlertPress,
  pendingCount = 0,
}: AlertsListProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  if (alerts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={48}
          color={theme.textSecondary}
        />
        <Text style={styles.emptyText}>No alerts at the moment</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {alerts.map((alert) => {
        const alertColorKeys = getAlertThemeColorKeys(alert.type);
        const iconName = ALERT_ICONS[alert.type] || DEFAULT_ALERT_ICON;

        return (
          <TouchableOpacity
            key={alert.id}
            style={styles.alertCard}
            onPress={() => onAlertPress(alert)}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: theme[
                    alertColorKeys.backgroundColorKey
                  ] as string,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={theme[alertColorKeys.iconColorKey] as string}
              />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertMessage} numberOfLines={2}>
                {alert.message}
              </Text>
              <View style={styles.alertFooter}>
                {alert.gardenName && (
                  <Text style={styles.gardenName}>{alert.gardenName}</Text>
                )}
                <Text style={styles.timestamp}>
                  {new Date(alert.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginTop: 8,
    },
    alertCard: {
      flexDirection: "row",
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 12,
      gap: 12,
      elevation: 2,
      shadowColor: theme.shadow,
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
      color: theme.text,
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
      color: theme.textSecondary,
    },
    timestamp: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
  });
