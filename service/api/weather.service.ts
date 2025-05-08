import apiClient from "../apiClient";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  WeatherMain,
  WeatherAdvice,
  OptimalGardenTime,
} from "@/types/weather/weather.types";
import { WEATHER_ENDPOINTS } from "../endpoints";
import { GardenType } from "@/types/gardens/garden.types";

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
   * Get weather-based advice for gardening activities
   * @param gardenId Garden ID
   * @param weatherData Current weather data
   * @param gardenType Optional garden type for more specific advice
   * @returns List of advice items
   */
  async getWeatherAdvice(
    gardenId: string | number,
    weatherData: WeatherObservation,
    gardenType?: GardenType
  ): Promise<WeatherAdvice[]> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll mock the data based on weather conditions

      // setTimeout to simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Generate advice based on current weather and garden type
      return this.generateWeatherAdvice(weatherData, gardenType);
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
   * Generate advice based on weather conditions and garden type
   * This is a helper method that would ideally be on the server
   * @private
   */
  private generateWeatherAdvice(
    weather: WeatherObservation,
    gardenType?: GardenType
  ): WeatherAdvice[] {
    const advice: WeatherAdvice[] = [];
    const now = new Date();

    // Base advice on weather conditions
    switch (weather.weatherMain) {
      case WeatherMain.CLEAR:
        if (weather.temp > 30) {
          advice.push({
            id: 1,
            title: "Tưới nước buổi sáng sớm",
            description:
              "Nhiệt độ cao có thể gây mất nước cho cây. Hãy tưới nước vào buổi sáng sớm để giúp cây chống chọi với nhiệt.",
            weatherCondition: WeatherMain.CLEAR,
            temperature: { min: 30, max: 40 },
            icon: "water-outline",
            priority: 5,
            bestTimeOfDay: "6:00 - 8:00",
            applicableGardenTypes: ["OUTDOOR", "BALCONY", "ROOFTOP"],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });

          advice.push({
            id: 2,
            title: "Che phủ đất",
            description:
              "Sử dụng lớp phủ để giảm sự bốc hơi nước và giữ độ ẩm cho đất trong điều kiện nắng nóng.",
            weatherCondition: WeatherMain.CLEAR,
            temperature: { min: 30, max: 40 },
            icon: "leaf-outline",
            priority: 4,
            applicableGardenTypes: ["OUTDOOR", "BALCONY", "ROOFTOP"],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });
        } else {
          advice.push({
            id: 3,
            title: "Thời điểm lý tưởng để làm vườn",
            description:
              "Thời tiết đẹp là thời điểm lý tưởng để làm vườn, cắt tỉa và chăm sóc cây trồng.",
            weatherCondition: WeatherMain.CLEAR,
            icon: "sunny-outline",
            priority: 3,
            applicableGardenTypes: [
              "INDOOR",
              "OUTDOOR",
              "BALCONY",
              "ROOFTOP",
              "WINDOW_SILL",
            ],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });
        }
        break;

      case WeatherMain.CLOUDS:
        advice.push({
          id: 4,
          title: "Thời điểm tốt để cấy ghép",
          description:
            "Thời tiết có mây là thời điểm tốt để cấy ghép cây con hoặc chuyển cây sang chậu mới vì sẽ giảm sốc nhiệt.",
          weatherCondition: WeatherMain.CLOUDS,
          icon: "cloud-outline",
          priority: 3,
          applicableGardenTypes: ["OUTDOOR", "BALCONY", "ROOFTOP"],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
        break;

      case WeatherMain.RAIN:
      case WeatherMain.DRIZZLE:
        advice.push({
          id: 5,
          title: "Kiểm tra thoát nước",
          description:
            "Mưa kéo dài có thể gây ngập úng cho cây. Kiểm tra hệ thống thoát nước và đảm bảo nước không đọng lại ở chậu cây.",
          weatherCondition: WeatherMain.RAIN,
          icon: "rainy-outline",
          priority: 4,
          applicableGardenTypes: [
            "OUTDOOR",
            "BALCONY",
            "ROOFTOP",
            "WINDOW_SILL",
          ],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });

        advice.push({
          id: 6,
          title: "Tạm hoãn bón phân",
          description:
            "Trời mưa không phải thời điểm tốt để bón phân vì phân có thể bị rửa trôi trước khi cây hấp thụ.",
          weatherCondition: WeatherMain.RAIN,
          icon: "water-outline",
          priority: 3,
          applicableGardenTypes: ["OUTDOOR", "BALCONY", "ROOFTOP"],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
        break;

      case WeatherMain.THUNDERSTORM:
        advice.push({
          id: 7,
          title: "Bảo vệ cây khỏi gió mạnh",
          description:
            "Di chuyển chậu cây vào trong hoặc nơi kín gió để tránh thiệt hại do bão.",
          weatherCondition: WeatherMain.THUNDERSTORM,
          icon: "thunderstorm-outline",
          priority: 5,
          applicableGardenTypes: ["BALCONY", "ROOFTOP", "WINDOW_SILL"],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
        break;

      default:
        advice.push({
          id: 8,
          title: "Theo dõi điều kiện thời tiết",
          description:
            "Hãy theo dõi sát điều kiện thời tiết để điều chỉnh việc chăm sóc cây trồng phù hợp.",
          weatherCondition: weather.weatherMain,
          icon: "thermometer-outline",
          priority: 2,
          applicableGardenTypes: [
            "INDOOR",
            "OUTDOOR",
            "BALCONY",
            "ROOFTOP",
            "WINDOW_SILL",
          ],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
    }

    // Add garden type specific advice
    if (gardenType) {
      switch (gardenType) {
        case "INDOOR":
          advice.push({
            id: 9,
            title: "Điều chỉnh ánh sáng cho cây trong nhà",
            description: `Với thời tiết ${weather.weatherDesc}, hãy đảm bảo cây nhận đủ ánh sáng bằng cách điều chỉnh vị trí đặt cây.`,
            weatherCondition: weather.weatherMain,
            icon: "home-outline",
            priority: 3,
            applicableGardenTypes: ["INDOOR"],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });
          break;

        case "BALCONY":
        case "ROOFTOP":
          if (weather.windSpeed > 5) {
            advice.push({
              id: 10,
              title: "Cẩn thận với gió lớn",
              description:
                "Tốc độ gió hiện tại có thể gây nguy hiểm cho cây ở ban công/sân thượng. Hãy di chuyển chậu cây vào vị trí an toàn.",
              weatherCondition: weather.weatherMain,
              wind: { minSpeed: 5 },
              icon: "leaf-outline",
              priority: 4,
              applicableGardenTypes: ["BALCONY", "ROOFTOP"],
              createdAt: now.toISOString(),
              updatedAt: now.toISOString(),
            });
          }
          break;

        default:
        // Default advice for all garden types
      }
    }

    // Sort by priority (highest first)
    return advice.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate optimal times based on activity type and forecast
   * This is a helper method that would ideally be on the server
   * @private
   */
  private calculateOptimalTimes(
    forecast: HourlyForecast[],
    activityType: string
  ): OptimalGardenTime[] {
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
        avoidWeather: [
          WeatherMain.RAIN,
          WeatherMain.THUNDERSTORM,
          WeatherMain.DRIZZLE,
        ],
        idealTempRange: { min: 15, max: 28 },
        idealTimeRange: { startHour: 6, endHour: 9 }, // Early morning
      },
      FERTILIZING: {
        preferredWeather: [WeatherMain.CLEAR, WeatherMain.CLOUDS],
        avoidWeather: [WeatherMain.RAIN, WeatherMain.THUNDERSTORM],
        idealTempRange: { min: 18, max: 26 },
        idealTimeRange: { startHour: 7, endHour: 10 }, // Morning
      },
      PRUNING: {
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

    // Find optimal time slots
    for (let i = 0; i < forecast.length; i++) {
      const hour = forecast[i];
      const hourDate = new Date(hour.forecastFor);
      const hourNumber = hourDate.getHours();

      // Calculate a score for this hour
      let score = 0;

      // Preferred weather conditions
      if (conditions.preferredWeather.includes(hour.weatherMain)) {
        score += 30;
      }

      // Avoid bad weather conditions
      if (conditions.avoidWeather.includes(hour.weatherMain)) {
        score -= 50;
      }

      // Temperature score
      const tempScore =
        100 -
        Math.min(
          100,
          Math.abs(
            hour.temp -
              (conditions.idealTempRange.min + conditions.idealTempRange.max) /
                2
          ) * 5
        );
      score += tempScore * 0.4;

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
        for (let j = 1; j <= 2 && i + j < forecast.length; j++) {
          const nextHour = forecast[i + j];
          const nextHourDate = new Date(nextHour.forecastFor);
          const nextHourNumber = nextHourDate.getHours();

          // Calculate score for next hour
          let nextScore = 0;

          if (conditions.preferredWeather.includes(nextHour.weatherMain)) {
            nextScore += 30;
          }

          if (conditions.avoidWeather.includes(nextHour.weatherMain)) {
            nextScore -= 50;
          }

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
        if (endHour >= i) {
          optimalTimes.push({
            startTime: hour.forecastFor,
            endTime: forecast[endHour].forecastFor,
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

    // Sort by score (highest first)
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
}

export default new WeatherService();
