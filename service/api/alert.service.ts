import { Alert, AlertStatus, AlertType, UpdateAlertDto } from "@/types";
import apiClient from "../apiClient";
import { ALERT_ENDPOINTS } from "../endpoints";

/**
 * Alert Service
 *
 * Handles all alert-related API calls
 */
class AlertService {
  /**
   * Get all alerts for the current user
   */
  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await apiClient.get(ALERT_ENDPOINTS.ALERTS);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  /**
   * Get alerts for a specific garden
   */
  async getAlertsByGarden(gardenId: string | number): Promise<Alert[]> {
    try {
      const response = await apiClient.get(
        ALERT_ENDPOINTS.ALERTS_BY_GARDEN(gardenId)
      );
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching alerts for garden ${gardenId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific alert by ID
   */
  async getAlertById(alertId: string | number): Promise<Alert | null> {
    try {
      const response = await apiClient.get(
        ALERT_ENDPOINTS.ALERT_DETAIL(alertId)
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching alert ${alertId}:`, error);
      return null;
    }
  }

  /**
   * Update an alert's status (read, dismissed, etc.)
   */
  async updateAlertStatus(
    alertId: string | number,
    status: string
  ): Promise<Alert | null> {
    try {
      const response = await apiClient.patch(
        ALERT_ENDPOINTS.ALERT_DETAIL(alertId),
        {
          status,
        }
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error updating alert ${alertId}:`, error);
      return null;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string | number): Promise<Alert | null> {
    try {
      const response = await apiClient.post(
        ALERT_ENDPOINTS.RESOLVE_ALERT(alertId)
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error resolving alert ${alertId}:`, error);
      return null;
    }
  }

  /**
   * Count pending alerts for the current user
   * @returns Number of pending alerts
   */
  async countPendingAlerts(): Promise<number> {
    try {
      const alerts = await this.getAlerts();
      // Filter alerts that are pending
      const pendingAlerts = alerts.filter(
        (alert) => alert.status === AlertStatus.PENDING
      );
      return pendingAlerts.length;
    } catch (error) {
      console.error("Error counting pending alerts:", error);
      return 0;
    }
  }
}

export default new AlertService();
