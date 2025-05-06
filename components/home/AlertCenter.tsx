import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import useSectionAnimation from "@/hooks/useSectionAnimation";
import { AlertType, Severity } from "@/types/alerts/alert.types";

interface Alert {
  id: number;
  type: AlertType;
  message: string;
  severity: Severity;
  timestamp: string;
}

interface AlertCenterProps {
  alerts: Record<string, any[]>;
  selectedGardenId?: number | null;
}

export default function AlertCenter({
  alerts,
  selectedGardenId,
}: AlertCenterProps) {
  const theme = useAppTheme();
  const { getAnimatedStyle } = useSectionAnimation("alerts");

  // Flatten and sort alerts by severity
  const flattenedAlerts = Object.values(alerts)
    .flat()
    .sort((a, b) => {
      // Sort by severity (CRITICAL > HIGH > MEDIUM > LOW)
      const severityOrder = {
        CRITICAL: 3,
        HIGH: 2,
        MEDIUM: 1,
        LOW: 0,
      };
      return (
        severityOrder[b.severity as keyof typeof severityOrder] -
        severityOrder[a.severity as keyof typeof severityOrder]
      );
    })
    .slice(0, 3); // Show only top 3 alerts

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case "CRITICAL":
        return "alert-circle";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "information-circle";
      case "LOW":
        return "information-outline";
      default:
        return "information-outline";
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case "CRITICAL":
        return theme.error;
      case "HIGH":
        return theme.warning;
      case "MEDIUM":
        return theme.info;
      case "LOW":
        return theme.textSecondary;
      default:
        return theme.textSecondary;
    }
  };

  const renderAlertItem = (alert: any) => {
    const iconName = getSeverityIcon(alert.severity);
    const color = getSeverityColor(alert.severity);

    return (
      <TouchableOpacity
        key={alert.id}
        style={[styles.alertItem, { backgroundColor: color + "10" }]}
        onPress={() => router.push(`/alert/${alert.id}`)}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Ionicons name={iconName as any} size={20} color={color} />
        </View>
        <View style={styles.alertContent}>
          <Text style={[styles.alertMessage, { color: theme.text }]}>
            {alert.message}
          </Text>
          {alert.suggestion && (
            <Text
              style={[styles.alertSuggestion, { color: theme.textSecondary }]}
            >
              {alert.suggestion}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!selectedGardenId || flattenedAlerts.length === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Cảnh báo
        </Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/alerts")}
        >
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            Xem tất cả
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.alertsContainer, { backgroundColor: theme.card }]}>
        {flattenedAlerts.map(renderAlertItem)}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 2,
  },
  alertsContainer: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 4,
  },
  alertSuggestion: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
});
