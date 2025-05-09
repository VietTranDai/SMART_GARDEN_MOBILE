import { useMemo } from "react";
import { Alert } from "@/types/alerts/alert.types";

export default function useAlertDisplay(
  gardenId: number | null,
  gardenAlerts: Record<number, Alert[]> = {}
) {
  // Get alerts for a specific garden with safety checks
  const alerts = useMemo(() => {
    if (!gardenId || !gardenAlerts || typeof gardenAlerts !== "object") {
      return [];
    }

    if (gardenId in gardenAlerts && Array.isArray(gardenAlerts[gardenId])) {
      return [...gardenAlerts[gardenId]];
    }

    return [];
  }, [gardenId, gardenAlerts]);

  // Count alerts by severity
  const alertCounts = useMemo(() => {
    const counts = {
      total: 0,
      critical: 0,
      warning: 0,
      info: 0,
    };

    if (!alerts.length) return counts;

    counts.total = alerts.length;

    alerts.forEach((alert) => {
      if (!alert) return;

      const severity = alert.severity?.toLowerCase() || "";

      if (severity === "critical" || severity === "high") {
        counts.critical++;
      } else if (severity === "warning" || severity === "medium") {
        counts.warning++;
      } else {
        counts.info++;
      }
    });

    return counts;
  }, [alerts]);

  // Format alert time relative to now
  const formatAlertTime = (timestamp?: string | number) => {
    if (!timestamp) return "";

    try {
      const alertTime = new Date(timestamp);
      const now = new Date();

      const diffMs = now.getTime() - alertTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;

      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} ngày trước`;
    } catch (error) {
      return "";
    }
  };

  // Get color based on alert severity
  const getAlertColor = (severity?: string) => {
    if (!severity) return "#8E8E93"; // Default gray

    const severityLower = severity.toLowerCase();

    if (severityLower === "critical" || severityLower === "high") {
      return "#FF3B30"; // Red for critical
    }

    if (severityLower === "warning" || severityLower === "medium") {
      return "#FF9500"; // Orange for warnings
    }

    return "#34C759"; // Green for info/low
  };

  // Get icon based on alert type
  const getAlertIcon = (alertType?: string) => {
    if (!alertType) return "alert-circle-outline";

    const type = alertType.toLowerCase();

    if (type.includes("water") || type.includes("moist")) {
      return "water-outline";
    }

    if (type.includes("temp")) {
      return "thermometer-outline";
    }

    if (type.includes("light")) {
      return "sunny-outline";
    }

    if (type.includes("fertilizer") || type.includes("nutrient")) {
      return "flask-outline";
    }

    if (type.includes("pest")) {
      return "bug-outline";
    }

    return "alert-circle-outline";
  };

  // Sort alerts by severity and time
  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      // First sort by severity (critical first)
      const severityA = a.severity?.toLowerCase() || "";
      const severityB = b.severity?.toLowerCase() || "";

      if (severityA === "critical" && severityB !== "critical") return -1;
      if (severityB === "critical" && severityA !== "critical") return 1;
      if (severityA === "warning" && severityB === "info") return -1;
      if (severityB === "warning" && severityA === "info") return 1;

      // Then sort by time (newest first)
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return timeB - timeA;
    });
  }, [alerts]);

  return {
    alerts: sortedAlerts,
    alertCounts,
    formatAlertTime,
    getAlertColor,
    getAlertIcon,
    hasAlerts: sortedAlerts.length > 0,
    isLoading: false, // In a real app, this would be determined by a loading state
  };
}
