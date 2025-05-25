import { useState, useCallback } from "react";
import { Alert, AlertStatus } from "@/types/alerts/alert.types";
import { alertService } from "@/service/api";

/**
 * Custom hook for alert data management
 */
export default function useAlertData() {
  // State for alerts
  const [gardenAlerts, setGardenAlerts] = useState<Record<number, Alert[]>>({});

  // Status states
  const [alertsLoading, setAlertsLoading] = useState<Record<number, boolean>>(
    {}
  );
  const [alertsError, setAlertsError] = useState<Record<number, string | null>>(
    {}
  );

  /**
   * Fetch alerts for a specific garden
   */
  const fetchGardenAlerts = useCallback(
    async (gardenId: number) => {
      try {
        // Set loading state
        setAlertsLoading((prev) => ({
          ...prev,
          [gardenId]: true,
        }));

        // Fetch alerts
        const alerts = await alertService.getGardenAlerts(gardenId);

        // Update state
        setGardenAlerts((prev) => ({
          ...prev,
          [gardenId]: alerts,
        }));

        // Clear any error
        setAlertsError((prev) => ({
          ...prev,
          [gardenId]: null,
        }));

        return alerts;
      } catch (error) {
        console.error(`Error fetching alerts for garden ${gardenId}:`, error);
        setAlertsError((prev) => ({
          ...prev,
          [gardenId]: `Không thể tải cảnh báo: ${error}`,
        }));
        return [];
      } finally {
        // Clear loading state
        setAlertsLoading((prev) => ({
          ...prev,
          [gardenId]: false,
        }));
      }
    },
    [] // alertsLoading removed
  );

  /**
   * Fetch alerts for all gardens
   */
  const fetchAllGardenAlerts = useCallback(
    async (gardenIds: number[]) => {
      try {
        // Fetch alerts for each garden in parallel
        const results = await Promise.all(
          gardenIds.map((gardenId) => fetchGardenAlerts(gardenId))
        );

        // Build a map of garden IDs to alerts
        const alertMap: Record<number, Alert[]> = {};
        gardenIds.forEach((gardenId, index) => {
          alertMap[gardenId] = results[index] || [];
        });

        return alertMap;
      } catch (error) {
        console.error("Error fetching alerts for all gardens:", error);
        return {};
      }
    },
    [fetchGardenAlerts]
  );

  /**
   * Resolve an alert
   */
  const resolveAlert = useCallback(async (alertId: number) => {
    try {
      // Call API to resolve alert
      await alertService.resolveAlert(alertId);

      // Update local state
      setGardenAlerts((prev) => {
        const updatedAlerts: Record<number, Alert[]> = {};

        // Update alert status in each garden
        Object.entries(prev).forEach(([gardenIdStr, alerts]) => {
          const gardenId = parseInt(gardenIdStr, 10);

          // Update the status of the alert
          updatedAlerts[gardenId] = alerts.map((alert) =>
            alert.id === alertId
              ? { ...alert, status: AlertStatus.RESOLVED }
              : alert
          );
        });

        return updatedAlerts;
      });

      return true;
    } catch (error) {
      console.error(`Error resolving alert ${alertId}:`, error);
      return false;
    }
  }, []);

  /**
   * Ignore an alert
   */
  const ignoreAlert = useCallback(async (alertId: number) => {
    try {
      // Call API to ignore alert
      await alertService.ignoreAlert(alertId);

      // Update local state
      setGardenAlerts((prev) => {
        const updatedAlerts: Record<number, Alert[]> = {};

        // Update alert status in each garden
        Object.entries(prev).forEach(([gardenIdStr, alerts]) => {
          const gardenId = parseInt(gardenIdStr, 10);

          // Update the status of the alert
          updatedAlerts[gardenId] = alerts.map((alert) =>
            alert.id === alertId
              ? { ...alert, status: AlertStatus.IGNORED }
              : alert
          );
        });

        return updatedAlerts;
      });

      return true;
    } catch (error) {
      console.error(`Error ignoring alert ${alertId}:`, error);
      return false;
    }
  }, []);

  /**
   * Get total number of active alerts for a garden
   */
  const getActiveAlertCount = useCallback(
    (gardenId: number): number => {
      const alerts = gardenAlerts[gardenId] || [];
      return alerts.filter(
        (alert) =>
          alert.status !== AlertStatus.RESOLVED &&
          alert.status !== AlertStatus.IGNORED
      ).length;
    },
    [gardenAlerts]
  );

  /**
   * Get total number of active alerts across all gardens
   */
  const getTotalActiveAlertCount = useCallback((): number => {
    let count = 0;
    Object.values(gardenAlerts).forEach((alerts) => {
      count += alerts.filter(
        (alert) =>
          alert.status !== AlertStatus.RESOLVED &&
          alert.status !== AlertStatus.IGNORED
      ).length;
    });
    return count;
  }, [gardenAlerts]);

  return {
    // Data
    gardenAlerts,

    // Status
    alertsLoading,
    alertsError,

    // Functions
    fetchGardenAlerts,
    fetchAllGardenAlerts,
    resolveAlert,
    ignoreAlert,
    getActiveAlertCount,
    getTotalActiveAlertCount,
  };
}
