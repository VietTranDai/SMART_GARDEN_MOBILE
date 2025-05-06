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
interface Alert {
  id: string;
  type: "warning" | "error" | "info" | "success";
  message: string;
  timestamp: Date;
  gardenId: string;
  gardenName: string;
}

interface AlertsListProps {
  alerts: Alert[];
  onAlertPress: (alert: Alert) => void;
  pendingCount?: number;
}

const ALERT_ICONS: Record<
  Alert["type"],
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  warning: "alert",
  error: "alert-circle",
  info: "information",
  success: "check-circle",
};

type ThemeColors = {
  warningLight: string;
  errorLight: string;
  infoLight: string;
  successLight: string;
  warning: string;
  error: string;
  info: string;
  success: string;
  text: string;
  textSecondary: string;
  card: string;
  shadow: string;
};

export default function AlertsList({
  alerts,
  onAlertPress,
  pendingCount = 0,
}: AlertsListProps) {
  const theme = useAppTheme() as unknown as ThemeColors;
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
      {alerts.map((alert) => (
        <TouchableOpacity
          key={alert.id}
          style={styles.alertCard}
          onPress={() => onAlertPress(alert)}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme[`${alert.type}Light`] },
            ]}
          >
            <MaterialCommunityIcons
              name={ALERT_ICONS[alert.type]}
              size={24}
              color={theme[alert.type]}
            />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertMessage} numberOfLines={2}>
              {alert.message}
            </Text>
            <View style={styles.alertFooter}>
              <Text style={styles.gardenName}>{alert.gardenName}</Text>
              <Text style={styles.timestamp}>
                {new Date(alert.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
