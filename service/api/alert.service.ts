import { Alert, AlertStatus, AlertType, UpdateAlertDto } from "@/types";
import { ALERT_ENDPOINTS } from "../endpoints";
import apiClient from "../apiClient";

class AlertService {
  /**
   * Get all alerts
   * @param params Query parameters
   * @returns List of alerts
   */
  async getAlerts(params?: {
    status?: AlertStatus;
    type?: AlertType;
  }): Promise<Alert[]> {
    try {
      const response = await apiClient.get(ALERT_ENDPOINTS.ALERTS, { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error fetching alerts:", error);
      return [];
    }
  }

  /**
   * Get alerts for a specific garden
   * @param gardenId Garden ID
   * @param params Query parameters
   * @returns List of alerts for the garden
   */
  async getAlertsByGarden(
    gardenId: number | string,
    params?: { status?: AlertStatus; type?: AlertType }
  ): Promise<Alert[]> {
    const response = await apiClient.get(
      ALERT_ENDPOINTS.ALERTS_BY_GARDEN(gardenId),
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Get alert by ID
   * @param alertId Alert ID
   * @returns Alert details
   */
  async getAlertById(alertId: number | string): Promise<Alert> {
    const response = await apiClient.get(ALERT_ENDPOINTS.ALERT_DETAIL(alertId));
    return response.data;
  }

  /**
   * Update an alert
   * @param alertId Alert ID
   * @param alertData Alert update data
   * @returns Updated alert
   */
  async updateAlert(
    alertId: number | string,
    alertData: UpdateAlertDto
  ): Promise<Alert> {
    const response = await apiClient.patch(
      ALERT_ENDPOINTS.ALERT_DETAIL(alertId),
      alertData
    );
    return response.data;
  }

  /**
   * Resolve an alert
   * @param alertId Alert ID
   * @returns Resolved alert
   */
  async resolveAlert(alertId: number | string): Promise<Alert> {
    const response = await apiClient.post(
      ALERT_ENDPOINTS.RESOLVE_ALERT(alertId)
    );
    return response.data;
  }

  /**
   * Count pending alerts
   * @returns Number of pending alerts
   */
  async countPendingAlerts(): Promise<number> {
    try {
      const alerts = await this.getAlerts({ status: AlertStatus.PENDING });
      return alerts.length;
    } catch (error) {
      console.error("Error counting pending alerts:", error);
      return 0;
    }
  }
}

export default new AlertService();
