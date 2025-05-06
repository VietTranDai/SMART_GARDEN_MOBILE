import apiClient from "../apiClient";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  WeatherMain,
} from "@/types/weather/weather.types";
import { WEATHER_ENDPOINTS } from "../endpoints";

export interface GardenWeatherData {
  current: WeatherObservation;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

/**
 * Weather Service
 *
 * Handles all weather-related API calls
 */
class WeatherService {
  /**
   * Get complete weather data for a garden
   */
  async getCompleteWeatherData(
    gardenId: string | number,
    options?: {
      hourlyLimit?: number;
      dailyLimit?: number;
    }
  ): Promise<GardenWeatherData> {
    try {
      // Since there's no specific endpoint for complete weather data,
      // we'll fetch each part separately and combine them
      const [current, hourly, daily] = await Promise.all([
        this.getCurrentWeather(gardenId),
        this.getHourlyForecast(gardenId),
        this.getDailyForecast(gardenId),
      ]);

      return {
        current,
        hourly: options?.hourlyLimit
          ? hourly.slice(0, options.hourlyLimit)
          : hourly,
        daily: options?.dailyLimit ? daily.slice(0, options.dailyLimit) : daily,
      };
    } catch (error) {
      console.error("Error fetching complete weather data:", error);
      // Return default structure in case of error
      return {
        current: this.createDefaultWeatherObservation(gardenId),
        hourly: [],
        daily: [],
      };
    }
  }

  /**
   * Get complete weather data for a garden
   */
  async getCurrentAndForecast(
    gardenId: string | number
  ): Promise<GardenWeatherData> {
    try {
      // Since there's no specific endpoint for complete weather data,
      // we'll fetch each part separately and combine them
      const [current, hourly, daily] = await Promise.all([
        this.getCurrentWeather(gardenId),
        this.getHourlyForecast(gardenId),
        this.getDailyForecast(gardenId),
      ]);

      return {
        current,
        hourly,
        daily,
      };
    } catch (error) {
      console.error("Error fetching garden weather data:", error);
      // Return default structure in case of error
      return {
        current: this.createDefaultWeatherObservation(gardenId),
        hourly: [],
        daily: [],
      };
    }
  }

  /**
   * Get current weather observation
   */
  async getCurrentWeather(
    gardenId: string | number
  ): Promise<WeatherObservation> {
    try {
      const response = await apiClient.get<any>(
        WEATHER_ENDPOINTS.CURRENT(gardenId)
      );
      return (
        response.data.data || this.createDefaultWeatherObservation(gardenId)
      );
    } catch (error) {
      console.error("Error fetching current weather:", error);
      return this.createDefaultWeatherObservation(gardenId);
    }
  }

  /**
   * Get hourly forecast
   */
  async getHourlyForecast(
    gardenId: string | number
  ): Promise<HourlyForecast[]> {
    try {
      const response = await apiClient.get<any>(
        WEATHER_ENDPOINTS.HOURLY_FORECAST(gardenId)
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching hourly forecast:", error);
      return [];
    }
  }

  /**
   * Get daily forecast
   */
  async getDailyForecast(gardenId: string | number): Promise<DailyForecast[]> {
    try {
      const response = await apiClient.get<any>(
        WEATHER_ENDPOINTS.DAILY_FORECAST(gardenId)
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching daily forecast:", error);
      return [];
    }
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
    try {
      const response = await apiClient.get(
        WEATHER_ENDPOINTS.HISTORICAL(gardenId),
        {
          params,
        }
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching historical weather:", error);
      return [];
    }
  }

  /**
   * Creates a default weather observation for error handling
   */
  private createDefaultWeatherObservation(
    gardenId: string | number
  ): WeatherObservation {
    return {
      id: 0,
      gardenId:
        typeof gardenId === "string" ? parseInt(gardenId, 10) : gardenId,
      temp: 25,
      feelsLike: 25,
      humidity: 50,
      pressure: 1013,
      windSpeed: 0,
      windDeg: 0,
      clouds: 0,
      visibility: 10000,
      iconCode: "01d",
      weatherMain: WeatherMain.CLEAR,
      weatherDesc: "No data available",
      observedAt: new Date().toISOString(),
    };
  }
}

export default new WeatherService();
