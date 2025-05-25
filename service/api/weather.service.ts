import apiClient from "../apiClient";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  WeatherMain,
  WeatherAdvice,
  OptimalGardenTime,
  GardenWeatherData,
} from "@/types/weather/weather.types";
import { WEATHER_ENDPOINTS } from "../endpoints";
import { GardenType } from "@/types/gardens/garden.types";

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

      // Kiểm tra dữ liệu trả về từ API
      if (!response || !response.data) {
        console.warn("Invalid API response format in getHourlyForecast");
        return [];
      }

      const data = response.data.data;

      // Kiểm tra xem data có phải là mảng không, nếu không thì trả về mảng rỗng
      if (!data) return [];
      if (!Array.isArray(data)) {
        console.warn(
          "API returned non-array data in getHourlyForecast:",
          typeof data
        );
        return [];
      }

      return data;
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

      // Kiểm tra dữ liệu trả về từ API
      if (!response || !response.data) {
        console.warn("Invalid API response format in getDailyForecast");
        return [];
      }

      const data = response.data.data;

      // Kiểm tra xem data có phải là mảng không, nếu không thì trả về mảng rỗng
      if (!data) return [];
      if (!Array.isArray(data)) {
        console.warn(
          "API returned non-array data in getDailyForecast:",
          typeof data
        );
        return [];
      }

      return data;
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
   * Get weather-based advice for gardening activities
   * @param gardenId Garden ID
   * @param weatherData Current weather data
   * @param gardenType Optional garden type for more specific advice
   * @returns List of advice items
   */
  async getWeatherAdvice(
    gardenId: string | number,
    // weatherData parameter is no longer needed as advice is fetched from backend
    // weatherData: WeatherObservation,
    gardenType?: GardenType // gardenType might still be used by the backend, keep for now
  ): Promise<WeatherAdvice[]> {
    try {
      // The new endpoint path is /advice/weather/garden/:gardenId
      // Assuming WEATHER_ENDPOINTS will be updated or constructing the path directly.
      // For now, let's assume a structure like WEATHER_ENDPOINTS.ADVICE(gardenId)
      // If not, we can construct it: `/advice/weather/garden/${gardenId}`
      const response = await apiClient.get<any>(
        // WEATHER_ENDPOINTS.ADVICE(gardenId) // Ideal if endpoint is added
        `/advice/weather/garden/${gardenId}` // Direct construction as per user's path
      );

      // According to the provided structure, advice is in response.data.data.advice
      if (
        response &&
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.advice)
      ) {
        return response.data.data.advice;
      } else {
        console.warn(
          "Invalid API response format for weather advice:",
          response
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching weather advice:", error);
      return [];
    }
  }

  /**
   * Calculate optimal time slots for gardening activities based on weather forecast
   * @param gardenId Garden ID
   * @param activityType Type of activity (e.g., "WATERING", "FERTILIZING")
   * @returns List of optimal time slots in the next 48 hours
   */
  async getOptimalGardeningTimes(
    gardenId: string | number,
    activityType: string
  ): Promise<OptimalGardenTime[]> {
    try {
      // Get hourly forecast for the next 48 hours
      const hourlyForecast = await this.getHourlyForecast(gardenId);

      // Filter to next 48 hours
      const next48Hours = hourlyForecast.slice(0, 48);

      // Calculate optimal times based on activity type and forecast
      return this.calculateOptimalTimes(next48Hours, activityType);
    } catch (error) {
      console.error("Error calculating optimal gardening times:", error);
      return [];
    }
  }

  /**
   * Calculate optimal gardening times based on hourly forecast
   * @private
   */
  private calculateOptimalTimes(
    forecast: HourlyForecast[],
    activityType: string
  ): OptimalGardenTime[] {
    if (!forecast) {
      console.warn(
        "Null or undefined forecast provided to calculateOptimalTimes"
      );
      return [];
    }

    // Ensure forecast is an array
    if (!Array.isArray(forecast)) {
      console.error(
        "Non-array forecast provided to calculateOptimalTimes:",
        typeof forecast
      );
      return [];
    }

    // Check if the array is empty
    if (forecast.length === 0) {
      console.warn("Empty forecast array provided to calculateOptimalTimes");
      return [];
    }

    const optimalTimes: OptimalGardenTime[] = [];

    // Define optimal conditions for different activities
    const optimalConditions: Record<
      string,
      {
        preferredWeather: WeatherMain[];
        avoidWeather: WeatherMain[];
        idealTempRange: { min: number; max: number };
        idealTimeRange: { startHour: number; endHour: number };
      }
    > = {
      WATERING: {
        preferredWeather: [WeatherMain.CLEAR, WeatherMain.CLOUDS],
        avoidWeather: [WeatherMain.RAIN, WeatherMain.THUNDERSTORM],
        idealTempRange: { min: 10, max: 25 },
        idealTimeRange: { startHour: 9, endHour: 16 }, // Daytime
      },
      PLANTING: {
        preferredWeather: [WeatherMain.CLOUDS, WeatherMain.CLEAR],
        avoidWeather: [WeatherMain.THUNDERSTORM],
        idealTempRange: { min: 16, max: 24 },
        idealTimeRange: { startHour: 8, endHour: 17 }, // Daytime
      },
      HARVESTING: {
        preferredWeather: [WeatherMain.CLEAR, WeatherMain.CLOUDS],
        avoidWeather: [WeatherMain.RAIN, WeatherMain.THUNDERSTORM],
        idealTempRange: { min: 15, max: 30 },
        idealTimeRange: { startHour: 8, endHour: 11 }, // Morning
      },
    };

    // If we don't have conditions for this activity, use general conditions
    const conditions = optimalConditions[activityType] || {
      preferredWeather: [WeatherMain.CLEAR, WeatherMain.CLOUDS],
      avoidWeather: [WeatherMain.THUNDERSTORM],
      idealTempRange: { min: 15, max: 28 },
      idealTimeRange: { startHour: 8, endHour: 17 },
    };

    // Create a safe copy of the forecast array to iterate over
    const safeForecast = [...forecast];

    // Find optimal time slots
    for (let i = 0; i < safeForecast.length; i++) {
      const hour = safeForecast[i];

      // Skip if the hour data is invalid
      if (!hour || !hour.forecastFor) {
        console.warn(`Invalid hour data at index ${i}:`, hour);
        continue;
      }

      const hourDate = new Date(hour.forecastFor);
      const hourNumber = hourDate.getHours();

      // Calculate a score for this hour
      let score = 0;

      // Preferred weather conditions
      if (
        hour.weatherMain &&
        conditions.preferredWeather.includes(hour.weatherMain)
      ) {
        score += 30;
      }

      // Avoid bad weather conditions
      if (
        hour.weatherMain &&
        conditions.avoidWeather.includes(hour.weatherMain)
      ) {
        score -= 50;
      }

      // Temperature score
      if (typeof hour.temp === "number") {
        const tempScore =
          100 -
          Math.min(
            100,
            Math.abs(
              hour.temp -
                (conditions.idealTempRange.min +
                  conditions.idealTempRange.max) /
                  2
            ) * 5
          );
        score += tempScore * 0.4;
      }

      // Time of day score
      if (
        hourNumber >= conditions.idealTimeRange.startHour &&
        hourNumber <= conditions.idealTimeRange.endHour
      ) {
        score += 30;
      }

      // Only consider positive scores
      if (score > 0) {
        // Look ahead to find a time slot (up to 3 hours)
        let endHour = i;
        let slotScore = score;

        // Check up to 3 consecutive hours
        for (let j = 1; j <= 2 && i + j < safeForecast.length; j++) {
          const nextHour = safeForecast[i + j];

          // Skip if the next hour data is invalid
          if (!nextHour || !nextHour.forecastFor) {
            continue;
          }

          const nextHourDate = new Date(nextHour.forecastFor);
          const nextHourNumber = nextHourDate.getHours();

          // Calculate score for next hour
          let nextScore = 0;

          if (
            nextHour.weatherMain &&
            conditions.preferredWeather.includes(nextHour.weatherMain)
          ) {
            nextScore += 30;
          }

          if (
            nextHour.weatherMain &&
            conditions.avoidWeather.includes(nextHour.weatherMain)
          ) {
            nextScore -= 50;
          }

          if (typeof nextHour.temp === "number") {
            const nextTempScore =
              100 -
              Math.min(
                100,
                Math.abs(
                  nextHour.temp -
                    (conditions.idealTempRange.min +
                      conditions.idealTempRange.max) /
                      2
                ) * 5
              );
            nextScore += nextTempScore * 0.4;
          }

          if (
            nextHourNumber >= conditions.idealTimeRange.startHour &&
            nextHourNumber <= conditions.idealTimeRange.endHour
          ) {
            nextScore += 30;
          }

          // If next hour is also good, extend the time slot
          if (nextScore > 0) {
            endHour = i + j;
            slotScore = (slotScore + nextScore) / 2; // Average score
          } else {
            break;
          }
        }

        // Add time slot if it's at least 1 hour long
        if (
          endHour >= i &&
          safeForecast[endHour] &&
          safeForecast[endHour].forecastFor
        ) {
          optimalTimes.push({
            startTime: hour.forecastFor,
            endTime: safeForecast[endHour].forecastFor,
            activity: activityType,
            reason: `Thời tiết thuận lợi cho hoạt động ${activityType.toLowerCase()}`,
            score: Math.round(slotScore),
            weatherCondition: hour.weatherMain,
            temperature: hour.temp,
          });

          // Skip to end of this slot
          i = endHour;
        }
      }
    }
    return optimalTimes.sort((a, b) => b.score - a.score);
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

  /**
   * Utility functions for WeatherDisplay component
   */

  /**
   * Get background color for weather display based on weather condition
   */
  getWeatherBackgroundColor(weatherMain: WeatherMain): [string, string] {
    switch (weatherMain) {
      case WeatherMain.CLEAR:
        return ["#4da0ff", "#5687d8"];
      case WeatherMain.CLOUDS:
        return ["#b8c3d2", "#91a0b9"];
      case WeatherMain.RAIN:
      case WeatherMain.DRIZZLE:
        return ["#778899", "#546681"];
      case WeatherMain.THUNDERSTORM:
        return ["#6c7689", "#404859"];
      case WeatherMain.SNOW:
        return ["#e3e3e3", "#c9d1dc"];
      case WeatherMain.ATMOSPHERE:
        return ["#c7c5c5", "#a6a6a6"];
      default:
        return ["#4da0ff", "#5687d8"];
    }
  }

  /**
   * Get OpenWeatherMap icon URL
   */
  getWeatherIcon(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  /**
   * Format time from ISO string to human-readable time
   */
  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  /**
   * Format date from ISO string to human-readable date
   */
  formatDay(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  }

  /**
   * Get wind direction string from degrees
   */
  getWindDirection(deg: number): string {
    const dirs = [
      "B",
      "BĐB",
      "ĐB",
      "ĐĐB",
      "Đ",
      "ĐĐN",
      "ĐN",
      "NĐN",
      "N",
      "NTN",
      "TN",
      "TNN",
      "T",
      "TBB",
      "TB",
      "NTB",
    ];
    return dirs[Math.round(deg / 22.5) % 16];
  }

  /**
   * Get weather tip based on current weather and garden type
   */
  getWeatherTip(weather: WeatherObservation, gardenType?: string): string {
    if (!weather) return "";

    // Generating tips based on weather conditions
    if (weather.weatherMain === WeatherMain.RAIN) {
      if (gardenType === "OUTDOOR") {
        return "Hôm nay trời mưa, không cần tưới nước cho khu vườn.";
      }
      return "Thời tiết ẩm ướt, lưu ý kiểm tra độ ẩm đất.";
    }

    if (weather.weatherMain === WeatherMain.CLEAR && weather.temp > 30) {
      if (gardenType === "OUTDOOR") {
        return "Nhiệt độ cao, nên tưới nước vào sáng sớm hoặc chiều tối.";
      }
      return "Nhiệt độ cao, hãy đảm bảo cây được cung cấp đủ nước.";
    }

    if (weather.weatherMain === WeatherMain.CLOUDS) {
      return "Thời tiết mát mẻ, phù hợp để chăm sóc cây.";
    }

    if (weather.weatherMain === WeatherMain.THUNDERSTORM) {
      return "Có dông, hãy di chuyển cây cảnh vào trong nếu có thể.";
    }

    if (weather.humidity > 80) {
      return "Độ ẩm cao, chú ý cây dễ bị nấm mốc.";
    }

    if (weather.humidity < 30 && weather.temp > 28) {
      return "Thời tiết khô nóng, nên tăng cường tưới nước.";
    }

    // Default tip
    return "Thời tiết tốt cho cây trồng, nên chú ý theo dõi độ ẩm đất.";
  }

  /**
   * Lấy và theo dõi dữ liệu thời tiết chi tiết cho một khu vườn
   * Phương thức mới nâng cao dành cho các hook
   */
  async fetchAndTrackWeatherData(
    gardenId: number,
    lastFetchTime: Record<number, number> = {},
    debounceTime: number = 60000
  ): Promise<{
    weatherData: GardenWeatherData | null;
    error: string | null;
    newLastFetchTime: number;
  }> {
    try {
      // Kiểm tra thời gian gọi API để tránh gọi quá thường xuyên
      const now = Date.now();
      const lastFetch = lastFetchTime[gardenId] || 0;

      // Nếu gọi trong thời gian debounce, trả về null
      if (now - lastFetch < debounceTime) {
        return {
          weatherData: null,
          error: null,
          newLastFetchTime: lastFetch,
        };
      }

      // Lấy dữ liệu thời tiết
      const weatherData = await this.getCompleteWeatherData(gardenId);

      return {
        weatherData,
        error: null,
        newLastFetchTime: now,
      };
    } catch (error) {
      console.error(
        `Error in fetchAndTrackWeatherData for garden ${gardenId}:`,
        error
      );
      return {
        weatherData: null,
        error: `Không thể tải dữ liệu thời tiết: ${error}`,
        newLastFetchTime: lastFetchTime[gardenId] || 0,
      };
    }
  }

  /**
   * Lấy lời khuyên thời tiết cho một khu vườn dựa trên dữ liệu thời tiết hiện có
   * hoặc tự động lấy dữ liệu thời tiết nếu chưa có
   * Phương thức mới nâng cao dành cho các hook
   */
  async fetchAndTrackWeatherAdvice(
    gardenId: number,
    existingWeatherData: GardenWeatherData | null,
    gardenType?: GardenType
  ): Promise<{
    advice: WeatherAdvice[];
    weatherData: WeatherObservation | null;
    error: string | null;
  }> {
    try {
      // Lấy dữ liệu thời tiết hiện tại, nếu không có sẽ fetch mới
      let currentWeather = existingWeatherData?.current;

      // Nếu không có dữ liệu thời tiết, lấy mới
      if (!currentWeather) {
        const completeData = await this.getCompleteWeatherData(gardenId);
        currentWeather = completeData?.current || null;
      }

      // Không thể lấy lời khuyên nếu không có dữ liệu thời tiết
      if (!currentWeather) {
        return {
          advice: [],
          weatherData: null,
          error: "Không có dữ liệu thời tiết",
        };
      }

      // Lấy lời khuyên
      const advice = await this.getWeatherAdvice(gardenId, gardenType);

      return {
        advice,
        weatherData: currentWeather,
        error: null,
      };
    } catch (error) {
      console.error(
        `Error in fetchAndTrackWeatherAdvice for garden ${gardenId}:`,
        error
      );
      return {
        advice: [],
        weatherData: null,
        error: `Không thể tải lời khuyên thời tiết: ${error}`,
      };
    }
  }

  /**
   * Tính toán và trả về thời gian tối ưu cho một hoạt động cụ thể
   * sử dụng dữ liệu dự báo thời tiết theo giờ
   * Phương thức mới nâng cao dành cho các hook
   */
  async fetchAndTrackOptimalTimes(
    gardenId: number,
    activityType: string,
    existingWeatherData: GardenWeatherData | null
  ): Promise<{
    optimalTimes: OptimalGardenTime[];
    error: string | null;
  }> {
    try {
      // Super defensive validation of input data
      if (!existingWeatherData || typeof existingWeatherData !== "object") {
        existingWeatherData = { current: null, hourly: [], daily: [] };
      }

      // Lấy dữ liệu dự báo theo giờ với kiểm tra an toàn nhiều lớp
      let hourlyForecast: HourlyForecast[] = [];

      // Validate hourly forecast data explicitly before attempting to use it
      const hasValidHourlyForecast =
        existingWeatherData.hourly !== undefined &&
        existingWeatherData.hourly !== null &&
        Array.isArray(existingWeatherData.hourly);

      if (hasValidHourlyForecast) {
        try {
          // Create defensive copy with explicit validation
          hourlyForecast = [];
          const sourceArray = existingWeatherData.hourly;

          // Loop instead of spread to ensure each item is valid
          for (let i = 0; i < sourceArray.length; i++) {
            const item = sourceArray[i];
            if (item && typeof item === "object") {
              hourlyForecast.push({ ...item });
            }
          }
        } catch (copyError) {
          console.error("Error safely copying hourly forecast:", copyError);
          hourlyForecast = [];
        }
      } else {
        console.log("No valid hourly forecast found in provided data");
      }

      // Nếu không có dữ liệu dự báo hợp lệ, lấy mới
      if (hourlyForecast.length === 0) {
        console.log("Fetching new forecast data for optimal times calculation");
        try {
          const completeData = await this.getCompleteWeatherData(gardenId);

          if (completeData?.hourly && Array.isArray(completeData.hourly)) {
            // Same safe copy approach
            const sourceArray = completeData.hourly;
            for (let i = 0; i < sourceArray.length; i++) {
              const item = sourceArray[i];
              if (item && typeof item === "object") {
                hourlyForecast.push({ ...item });
              }
            }
          } else {
            console.warn("Fetched data does not contain valid hourly forecast");
          }
        } catch (fetchError) {
          console.error("Error fetching weather data:", fetchError);
        }
      }

      // Multiple validation checks to ensure array is valid
      const isValidArray =
        hourlyForecast !== undefined &&
        hourlyForecast !== null &&
        Array.isArray(hourlyForecast);

      if (!isValidArray) {
        console.error(
          "hourlyForecast is not an array after all processing steps"
        );
        return {
          optimalTimes: [],
          error: "Dữ liệu dự báo không hợp lệ sau khi xử lý an toàn",
        };
      }

      // Không thể tính thời gian tối ưu nếu không có dữ liệu dự báo
      if (hourlyForecast.length === 0) {
        console.log(
          "Empty forecast array after validation - cannot calculate optimal times"
        );
        return {
          optimalTimes: [],
          error: "Không có dữ liệu dự báo thời tiết",
        };
      }

      // Bảo vệ calculateOptimalTimes từ dữ liệu không hợp lệ
      try {
        // One final check before calculation
        if (!Array.isArray(hourlyForecast) || hourlyForecast.length === 0) {
          throw new Error("Invalid forecast array before calculation");
        }

        // Use explicitly created array rather than spread to avoid iterator issues
        const verifiedForecast: HourlyForecast[] = [];

        for (let i = 0; i < hourlyForecast.length; i++) {
          const hour = hourlyForecast[i];
          if (hour && typeof hour === "object") {
            verifiedForecast.push({ ...hour });
          }
        }

        // Extra safety before calculation
        if (verifiedForecast.length === 0) {
          console.warn("No valid forecast data after verification");
          return {
            optimalTimes: [],
            error: "Dữ liệu dự báo không hợp lệ sau khi kiểm tra",
          };
        }

        // Final calculation with verified data
        const optimalTimes = this.calculateOptimalTimes(
          verifiedForecast,
          activityType
        );

        // Đảm bảo kết quả luôn là mảng
        if (!Array.isArray(optimalTimes)) {
          console.error("calculateOptimalTimes did not return an array!");
          return {
            optimalTimes: [],
            error: "Kết quả tính toán không hợp lệ",
          };
        }

        return {
          optimalTimes,
          error: null,
        };
      } catch (calcError) {
        console.error("Error in calculateOptimalTimes:", calcError);
        return {
          optimalTimes: [],
          error: `Lỗi khi tính toán: ${calcError}`,
        };
      }
    } catch (error) {
      console.error(
        `Error in fetchAndTrackOptimalTimes for garden ${gardenId}:`,
        error
      );
      return {
        optimalTimes: [],
        error: `Không thể tính toán thời gian tối ưu cho ${activityType}: ${error}`,
      };
    }
  }
}

export default new WeatherService();
