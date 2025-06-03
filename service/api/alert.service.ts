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
   * Get all alerts for the current user with optional filtering
   * @param status Optional status filter
   * @param type Optional type filter
   */
  async getAlerts(status?: AlertStatus, type?: AlertType): Promise<Alert[]> {
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (type) params.type = type;

      const response = await apiClient.get(ALERT_ENDPOINTS.ALERTS, { params });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  /**
   * Get alerts for a specific garden with optional filtering
   * @param gardenId Garden ID
   * @param status Optional status filter
   * @param type Optional type filter
   */
  async getAlertsByGarden(
    gardenId: string | number,
    status?: AlertStatus,
    type?: AlertType
  ): Promise<Alert[]> {
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (type) params.type = type;

      const response = await apiClient.get(
        ALERT_ENDPOINTS.ALERTS_BY_GARDEN(gardenId),
        { params }
      );
      return response.data.data || response.data || [];
    } catch (error) {
      console.error(`Error fetching alerts for garden ${gardenId}:`, error);
      return [];
    }
  }

  /**
   * Get a specific alert by ID
   * @param alertId Alert ID
   */
  async getAlertById(alertId: string | number): Promise<Alert | null> {
    try {
      const response = await apiClient.get(
        ALERT_ENDPOINTS.ALERT_DETAIL(alertId)
      );
      return response.data.data || response.data || null;
    } catch (error) {
      console.error(`Error fetching alert ${alertId}:`, error);
      return null;
    }
  }

  /**
   * Update an alert using PATCH method
   * @param alertId Alert ID
   * @param updateDto Update data
   */
  async updateAlert(
    alertId: string | number,
    updateDto: UpdateAlertDto
  ): Promise<Alert | null> {
    try {
      const response = await apiClient.patch(
        ALERT_ENDPOINTS.ALERT_DETAIL(alertId),
        updateDto
      );
      return response.data.data || response.data || null;
    } catch (error) {
      console.error(`Error updating alert ${alertId}:`, error);
      return null;
    }
  }

  /**
   * Update an alert's status only
   * @param alertId Alert ID
   * @param status New status
   */
  async updateAlertStatus(
    alertId: string | number,
    status: AlertStatus
  ): Promise<Alert | null> {
    try {
      return await this.updateAlert(alertId, { status });
    } catch (error) {
      console.error(`Error updating alert status ${alertId}:`, error);
      return null;
    }
  }

  /**
   * Resolve an alert using POST method
   * @param alertId Alert ID
   */
  async resolveAlert(alertId: string | number): Promise<Alert | null> {
    try {
      const response = await apiClient.post(
        ALERT_ENDPOINTS.RESOLVE_ALERT(alertId)
      );
      return response.data.data || response.data || null;
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
      const pendingAlerts = await this.getAlerts(AlertStatus.PENDING);
      return pendingAlerts.length;
    } catch (error) {
      console.error("Error counting pending alerts:", error);
      return 0;
    }
  }

  /**
   * Get alerts for a specific garden (alias method for backward compatibility)
   * @param gardenId Garden ID
   * @param status Optional status filter
   * @param type Optional type filter
   */
  async getGardenAlerts(
    gardenId: string | number,
    status?: AlertStatus,
    type?: AlertType
  ): Promise<Alert[]> {
    try {
      return await this.getAlertsByGarden(gardenId, status, type);
    } catch (error) {
      console.error(`Error in getGardenAlerts for garden ${gardenId}:`, error);
      return [];
    }
  }

  /**
   * Mark an alert as ignored
   * @param alertId Alert ID
   */
  async ignoreAlert(alertId: string | number): Promise<Alert | null> {
    try {
      return await this.updateAlertStatus(alertId, AlertStatus.IGNORED);
    } catch (error) {
      console.error(`Error ignoring alert ${alertId}:`, error);
      return null;
    }
  }

  /**
   * Mark an alert as read
   * @param alertId Alert ID
   */
  async markAsRead(alertId: string | number): Promise<Alert | null> {
    try {
      return await this.updateAlertStatus(alertId, AlertStatus.IN_PROGRESS);
    } catch (error) {
      console.error(`Error marking alert as read ${alertId}:`, error);
      return null;
    }
  }

  /**
   * Get alerts by type for current user
   * @param type Alert type
   * @param status Optional status filter
   */
  async getAlertsByType(
    type: AlertType,
    status?: AlertStatus
  ): Promise<Alert[]> {
    try {
      return await this.getAlerts(status, type);
    } catch (error) {
      console.error(`Error fetching alerts by type ${type}:`, error);
      return [];
    }
  }

  /**
   * Get unread alerts count
   * @returns Number of unread alerts
   */
  async countUnreadAlerts(): Promise<number> {
    try {
      const unreadAlerts = await this.getAlerts(AlertStatus.PENDING);
      return unreadAlerts.length;
    } catch (error) {
      console.error("Error counting unread alerts:", error);
      return 0;
    }
  }
}

export default new AlertService();
