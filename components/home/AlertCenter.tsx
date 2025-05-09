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

// Utility functions for safer data handling
const isValidArray = (data: any): boolean => {
  return Array.isArray(data);
};

const getSafeObjectValues = (obj: any): any[] => {
  if (!obj || typeof obj !== "object") return [];
  try {
    const values = Object.values(obj);
    if (!isValidArray(values)) return [];
    return values;
  } catch (error) {
    console.error("Error in getSafeObjectValues:", error);
    return [];
  }
};

const safeArrayFlat = (arr: any[]): any[] => {
  if (!isValidArray(arr)) return [];
  try {
    // Some environments may not support flat(), so we implement it manually
    const result: any[] = [];
    arr.forEach((item) => {
      if (isValidArray(item)) {
        result.push(...item);
      } else if (item !== undefined && item !== null) {
        result.push(item);
      }
    });
    return result;
  } catch (error) {
    console.error("Error in safeArrayFlat:", error);
    return [];
  }
};

export default function AlertCenter({
  alerts,
  selectedGardenId,
}: AlertCenterProps) {
  const theme = useAppTheme();
  const { getAnimatedStyle } = useSectionAnimation("alerts");

  // Safely get and flatten alerts using utility functions
  const flattenedAlerts = safeArrayFlat(getSafeObjectValues(alerts))
    .sort((a, b) => {
      // Sort by severity (CRITICAL > HIGH > MEDIUM > LOW)
      const severityOrder = {
        CRITICAL: 3,
        HIGH: 2,
        MEDIUM: 1,
        LOW: 0,
      };

      // Safely access severity with fallback
      const aSeverity = a && a.severity ? a.severity : "LOW";
      const bSeverity = b && b.severity ? b.severity : "LOW";

      return (
        severityOrder[bSeverity as keyof typeof severityOrder] -
        severityOrder[aSeverity as keyof typeof severityOrder]
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
    if (!alert || typeof alert !== "object") {
      return null;
    }

    // Safely get properties with defaults
    const id = alert.id || Math.random().toString();
    const message = alert.message || "Unknown alert";
    const severity = alert.severity || "LOW";
    const suggestion = alert.suggestion;

    const iconName = getSeverityIcon(severity);
    const color = getSeverityColor(severity);

    return (
      <TouchableOpacity
        key={id}
        style={[styles.alertItem, { backgroundColor: color + "10" }]}
        onPress={() => router.push(`/alert/${id}`)}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Ionicons name={iconName as any} size={20} color={color} />
        </View>
        <View style={styles.alertContent}>
          <Text style={[styles.alertMessage, { color: theme.text }]}>
            {message}
          </Text>
          {suggestion && (
            <Text
              style={[styles.alertSuggestion, { color: theme.textSecondary }]}
            >
              {suggestion}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!selectedGardenId || !flattenedAlerts || flattenedAlerts.length === 0) {
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
