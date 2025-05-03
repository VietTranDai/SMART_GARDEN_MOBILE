import apiClient from "../apiClient";
import { WEATHER_ENDPOINTS } from "../endpoints";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
} from "@/types/weather/weather.types";
import {
  Alert,
  AlertStatus,
  AlertType,
  CreateAlertDto,
  UpdateAlertDto,
} from "@/types/gardens/alert.types";

/**
 * Weather Service
 *
 * Handles all weather and alert-related API calls
 */
class WeatherService {
  /**
   * Get current weather for a garden
   * @param gardenId Garden ID
   * @returns Current weather observation
   */
  async getCurrentWeather(
    gardenId: number | string
  ): Promise<WeatherObservation> {
    const response = await apiClient.get(WEATHER_ENDPOINTS.CURRENT(gardenId));
    return response.data;
  }

  /**
   * Get hourly forecast for a garden
   * @param gardenId Garden ID
   * @param hours Number of hours to forecast (default 24)
   * @returns Hourly forecast data
   */
  async getHourlyForecast(
    gardenId: number | string,
    hours: number = 24
  ): Promise<HourlyForecast[]> {
    const response = await apiClient.get(
      WEATHER_ENDPOINTS.HOURLY_FORECAST(gardenId),
      {
        params: { hours },
      }
    );
    return response.data;
  }

  /**
   * Get daily forecast for a garden
   * @param gardenId Garden ID
   * @param days Number of days to forecast (default 7)
   * @returns Daily forecast data
   */
  async getDailyForecast(
    gardenId: number | string,
    days: number = 7
  ): Promise<DailyForecast[]> {
    const response = await apiClient.get(
      WEATHER_ENDPOINTS.DAILY_FORECAST(gardenId),
      {
        params: { days },
      }
    );
    return response.data;
  }

  /**
   * Get historical weather data for a garden
   * @param gardenId Garden ID
   * @param params Query parameters for date range
   * @returns Historical weather observations
   */
  async getHistoricalWeather(
    gardenId: number | string,
    params: { startDate: string; endDate: string }
  ): Promise<WeatherObservation[]> {
    const response = await apiClient.get(
      WEATHER_ENDPOINTS.HISTORICAL(gardenId),
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Get all alerts
   * @param params Query parameters
   * @returns List of alerts
   */
  async getAlerts(params?: {
    status?: AlertStatus;
    type?: AlertType;
  }): Promise<Alert[]> {
    const response = await apiClient.get(WEATHER_ENDPOINTS.ALERTS, { params });
    return response.data;
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
      WEATHER_ENDPOINTS.ALERTS_BY_GARDEN(gardenId),
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
    const response = await apiClient.get(
      WEATHER_ENDPOINTS.ALERT_DETAIL(alertId)
    );
    return response.data;
  }

  /**
   * Create a new alert
   * @param alertData Alert creation data
   * @returns Created alert
   */
  async createAlert(alertData: CreateAlertDto): Promise<Alert> {
    const response = await apiClient.post(WEATHER_ENDPOINTS.ALERTS, alertData);
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
      WEATHER_ENDPOINTS.ALERT_DETAIL(alertId),
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
      WEATHER_ENDPOINTS.RESOLVE_ALERT(alertId)
    );
    return response.data;
  }
}

export default new WeatherService();
