import apiClient from "../apiClient";
import { WEATHER_ENDPOINTS, GARDEN_ENDPOINTS } from "../endpoints";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
} from "@/types/weather/weather.types";
import { Garden } from "@/types/gardens/garden.types";

/**
 * Weather Service
 *
 * Handles all weather-related API calls
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
    return response.data.data;
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
    return response.data.data;
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
    return response.data.data;
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
    return response.data.data;
  }
}

export default new WeatherService();
