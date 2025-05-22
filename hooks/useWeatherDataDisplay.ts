import { useMemo } from "react";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  GardenWeatherData,
} from "@/types/weather/weather.types";
import { GardenDisplayDto } from "@/types/gardens/dtos";

export default function useWeatherDataDisplay(
  gardenId: number | null,
  gardenWeatherData: Record<number, GardenWeatherData> = {},
  weatherData: WeatherObservation | null = null,
  selectedGarden?: GardenDisplayDto
) {
  // Get current weather data with safety checks
  const currentWeather = useMemo(() => {
    if (
      gardenId &&
      gardenWeatherData &&
      typeof gardenWeatherData === "object"
    ) {
      if (
        gardenId in gardenWeatherData &&
        gardenWeatherData[gardenId]?.current
      ) {
        return gardenWeatherData[gardenId].current;
      }
    }
    return weatherData;
  }, [gardenId, gardenWeatherData, weatherData]);

  // Get hourly forecast with safety checks
  const hourlyForecast = useMemo(() => {
    if (
      gardenId &&
      gardenWeatherData &&
      typeof gardenWeatherData === "object"
    ) {
      if (
        gardenId in gardenWeatherData &&
        gardenWeatherData[gardenId]?.hourly
      ) {
        const hourly = gardenWeatherData[gardenId].hourly;
        return Array.isArray(hourly) ? hourly : [];
      }
    }
    return [];
  }, [gardenId, gardenWeatherData]);

  // Get daily forecast with safety checks
  const dailyForecast = useMemo(() => {
    if (
      gardenId &&
      gardenWeatherData &&
      typeof gardenWeatherData === "object"
    ) {
      if (gardenId in gardenWeatherData && gardenWeatherData[gardenId]?.daily) {
        const daily = gardenWeatherData[gardenId].daily;
        return Array.isArray(daily) ? daily : [];
      }
    }
    return [];
  }, [gardenId, gardenWeatherData]);

  // Get weather tip based on current conditions
  const getWeatherTip = (weather: WeatherObservation | null) => {
    if (!weather) return "Không có dữ liệu thời tiết.";

    const { temp, iconCode, humidity, windSpeed } = weather;

    if (temp > 30) {
      return "Thời tiết nóng! Tưới cây vào sáng sớm hoặc chiều tối.";
    }

    if (iconCode.includes("rain") || iconCode.includes("drizzle")) {
      return "Đang có mưa, không cần tưới thêm nước.";
    }

    if (humidity < 40) {
      return "Độ ẩm thấp, nên tưới thêm nước cho cây.";
    }

    if (windSpeed > 20) {
      return "Gió khá mạnh, cần đảm bảo cây được bảo vệ.";
    }

    return "Thời tiết phù hợp cho các hoạt động làm vườn.";
  };

  // Format temperature for display
  const formatTemperature = (temp?: number) => {
    if (typeof temp !== "number") return "N/A";
    return `${Math.round(temp)}°C`;
  };

  // Format time for hourly forecast
  const formatHourlyTime = (time?: string) => {
    if (!time) return "";
    try {
      const date = new Date(time);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "";
    }
  };

  // Format day for daily forecast
  const formatDay = (time?: string) => {
    if (!time) return "";
    try {
      const date = new Date(time);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return "Hôm nay";
      }
      if (date.toDateString() === tomorrow.toDateString()) {
        return "Ngày mai";
      }

      return date.toLocaleDateString("vi-VN", { weekday: "short" });
    } catch (error) {
      return "";
    }
  };

  // Get icon for weather condition
  const getWeatherIcon = (iconCode?: string) => {
    if (!iconCode) return "partly-sunny-outline";

    // Convert condition to lowercase for easier comparison
    const code = iconCode.toLowerCase();

    if (code.includes("thunderstorm")) return "thunderstorm-outline";
    if (code.includes("rain") || code.includes("drizzle"))
      return "rainy-outline";
    if (code.includes("snow")) return "snow-outline";
    if (code.includes("clear")) return "sunny-outline";
    if (code.includes("cloud")) return "cloudy-outline";

    return "partly-sunny-outline";
  };

  return {
    current: currentWeather,
    hourly: hourlyForecast,
    daily: dailyForecast,
    selectedGarden,
    getWeatherTip,
    formatTemperature,
    formatHourlyTime,
    formatDay,
    getWeatherIcon,
    tip: currentWeather
      ? getWeatherTip(currentWeather)
      : "Không có dữ liệu thời tiết.",
  };
}
