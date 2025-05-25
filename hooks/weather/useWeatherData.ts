import { useState, useCallback, useRef } from "react";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
  GardenWeatherData,
  WeatherAdvice,
  OptimalGardenTime,
} from "@/types/weather/weather.types";
import { weatherService } from "@/service/api";
import { GardenType } from "@/types/gardens/garden.types";

/**
 * Custom hook for weather data management
 */
export default function useWeatherData() {
  // State for weather data
  const [weatherData, setWeatherData] = useState<WeatherObservation | null>(
    null
  );
  const [gardenWeatherData, setGardenWeatherData] = useState<
    Record<number, GardenWeatherData>
  >({});
  const [weatherAdviceByGarden, setWeatherAdviceByGarden] = useState<
    Record<number, WeatherAdvice[]>
  >({});
  const [optimalGardenTimes, setOptimalGardenTimes] = useState<
    Record<number, Record<string, OptimalGardenTime[]>>
  >({});

  // Loading and error states
  const [weatherDetailLoading, setWeatherDetailLoading] = useState<
    Record<number, boolean>
  >({});
  const [weatherDetailError, setWeatherDetailError] = useState<
    Record<number, string | null>
  >({});

  // Ref to track last fetch time for debouncing
  const lastWeatherFetchTime = useRef<Record<number, number>>({});

  /**
   * Get weather tip from weather service
   */
  const getWeatherTip = useCallback(
    (weather: WeatherObservation, gardenType?: string) => {
      return weatherService.getWeatherTip(weather, gardenType);
    },
    []
  );

  /**
   * Fetch complete weather data for a garden (current, hourly, daily)
   * Sử dụng phương thức mới từ service
   */
  const fetchCompleteWeatherData = useCallback(async (gardenId: number) => {
    try {
      // Mark as loading
      setWeatherDetailLoading((prev) => ({
        ...prev,
        [gardenId]: true,
      }));

      // Sử dụng phương thức mới từ service
      const { weatherData, error, newLastFetchTime } =
        await weatherService.fetchAndTrackWeatherData(
          gardenId,
          lastWeatherFetchTime.current,
          60000 // 1 minute debounce
        );

      // Cập nhật thời gian fetch cuối cùng
      lastWeatherFetchTime.current[gardenId] = newLastFetchTime;

      // Nếu dữ liệu bị trả về null do debounce, không cập nhật state
      if (weatherData === null) {
        return null;
      }

      // Ensure the data has the correct structure
      const safeWeatherData = {
        current: weatherData.current || null,
        hourly: Array.isArray(weatherData.hourly)
          ? [...weatherData.hourly]
          : [],
        daily: Array.isArray(weatherData.daily) ? [...weatherData.daily] : [],
      };

      // Update state with the result
      setGardenWeatherData((prev) => {
        const newState = {
          ...prev,
          [gardenId]: safeWeatherData,
        };
        return newState;
      });

      // Cập nhật state lỗi
      setWeatherDetailError((prev) => ({
        ...prev,
        [gardenId]: error,
      }));

      return safeWeatherData;
    } catch (error) {
      console.error(
        `Error fetching weather data for garden ${gardenId}:`,
        error
      );
      setWeatherDetailError((prev) => ({
        ...prev,
        [gardenId]: `Không thể tải dữ liệu thời tiết: ${error}`,
      }));
      return null;
    } finally {
      // Clear loading state
      setWeatherDetailLoading((prev) => ({
        ...prev,
        [gardenId]: false,
      }));
    }
  }, []);

  /**
   * Fetch weather advice for a garden
   * Sử dụng phương thức mới từ service
   */
  const fetchWeatherAdvice = useCallback(
    async (gardenId: number, gardenType?: GardenType) => {
      try {
        // Mark as loading
        setWeatherDetailLoading((prev) => ({
          ...prev,
          [gardenId]: true,
        }));

        // Sử dụng phương thức mới từ service
        const { advice, error } =
          await weatherService.fetchAndTrackWeatherAdvice(
            gardenId,
            gardenWeatherData[gardenId] || null,
            gardenType
          );

        if (error) {
          throw new Error(error);
        }

        // Update state with result
        setWeatherAdviceByGarden((prev) => ({
          ...prev,
          [gardenId]: advice,
        }));

        // Clear any errors
        setWeatherDetailError((prev) => ({
          ...prev,
          [gardenId]: null,
        }));

        return advice;
      } catch (error) {
        console.error(
          `Error fetching weather advice for garden ${gardenId}:`,
          error
        );
        setWeatherDetailError((prev) => ({
          ...prev,
          [gardenId]: `Không thể tải lời khuyên thời tiết: ${error}`,
        }));
        return [];
      } finally {
        // Clear loading state
        setWeatherDetailLoading((prev) => ({
          ...prev,
          [gardenId]: false,
        }));
      }
    },
    [gardenWeatherData]
  );

  /**
   * Calculate optimal times for a specific activity in a garden
   * Sử dụng phương thức mới từ service
   */
  const calculateOptimalTimes = useCallback(
    async (gardenId: number, activityType: string) => {
      // Skip if already loading - improved tracking with local variable
      const isCurrentlyLoading = weatherDetailLoading[gardenId] === true;
      if (isCurrentlyLoading) {
        return [];
      }

      // Use a local state flag to avoid race conditions
      let isLocalLoading = true;

      try {
        // Mark as loading
        setWeatherDetailLoading((prev) => ({
          ...prev,
          [gardenId]: true,
        }));

        // Explicitly check if gardenWeatherData exists and has the right structure
        const hasValidWeatherData =
          gardenWeatherData &&
          typeof gardenWeatherData === "object" &&
          gardenId in gardenWeatherData &&
          gardenWeatherData[gardenId] &&
          gardenWeatherData[gardenId].hourly &&
          Array.isArray(gardenWeatherData[gardenId].hourly) &&
          gardenWeatherData[gardenId].hourly.length > 0;

        // Kiểm tra dữ liệu weather trước khi gọi API
        if (!hasValidWeatherData) {
          try {
            // Fetch weather data first if needed
            await fetchCompleteWeatherData(gardenId);

            // Give state time to update
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (weatherError) {
            console.error(
              `calculateOptimalTimes: Error fetching weather data: ${weatherError}`
            );
          }

          // Double check if we have data now - with explicit validation
          const hasDataAfterFetch =
            gardenWeatherData &&
            typeof gardenWeatherData === "object" &&
            gardenId in gardenWeatherData &&
            gardenWeatherData[gardenId] &&
            gardenWeatherData[gardenId].hourly &&
            Array.isArray(gardenWeatherData[gardenId].hourly) &&
            gardenWeatherData[gardenId].hourly.length > 0;

          if (!hasDataAfterFetch) {
            console.warn(
              `calculateOptimalTimes: Still no weather data after fetch, cannot proceed`
            );
            throw new Error("Missing weather data for garden");
          }
        }

        // Check if we have valid hourly forecast - defensive copy approach
        let safeHourlyForecast = [];

        try {
          if (
            gardenWeatherData &&
            gardenId in gardenWeatherData &&
            gardenWeatherData[gardenId] &&
            gardenWeatherData[gardenId].hourly &&
            Array.isArray(gardenWeatherData[gardenId].hourly)
          ) {
            // Create a safe defensive copy
            safeHourlyForecast = [...gardenWeatherData[gardenId].hourly];
          } else {
            console.warn(
              `calculateOptimalTimes: Invalid hourly forecast data for garden ${gardenId}`
            );
            throw new Error("Invalid hourly forecast data structure");
          }
        } catch (structureError) {
          console.error(
            "Error handling hourly forecast structure:",
            structureError
          );
          throw new Error("Failed to process forecast data structure");
        }

        // Sử dụng phương thức mới từ service with safe hourly data
        const { optimalTimes, error } =
          await weatherService.fetchAndTrackOptimalTimes(
            gardenId,
            activityType,
            {
              current: gardenWeatherData[gardenId].current,
              hourly: safeHourlyForecast,
              daily: Array.isArray(gardenWeatherData[gardenId].daily)
                ? [...gardenWeatherData[gardenId].daily]
                : [],
            }
          );

        if (error) {
          throw new Error(error);
        }

        // Ensure optimalTimes is an array
        const safeOptimalTimes = Array.isArray(optimalTimes)
          ? optimalTimes
          : [];

        // Update state with the results
        setOptimalGardenTimes((prev) => {
          // Get or create the activities map for this garden
          const gardenActivities = prev[gardenId] || {};

          // Create new state with safety checks
          const newState = {
            ...prev,
            [gardenId]: {
              ...gardenActivities,
              [activityType]: safeOptimalTimes,
            },
          };

          return newState;
        });

        // Clear any errors
        setWeatherDetailError((prev) => ({
          ...prev,
          [gardenId]: null,
        }));

        return safeOptimalTimes;
      } catch (error) {
        console.error(
          `Error calculating optimal times for ${activityType} in garden ${gardenId}:`,
          error
        );
        setWeatherDetailError((prev) => ({
          ...prev,
          [gardenId]: `Không thể tính toán thời gian tối ưu cho ${activityType}: ${error}`,
        }));
        return [];
      } finally {
        // Clear loading state - ensure this always happens
        isLocalLoading = false;
        setWeatherDetailLoading((prev) => ({
          ...prev,
          [gardenId]: false,
        }));
      }
    },
    [gardenWeatherData, weatherDetailLoading, fetchCompleteWeatherData]
  );

  /**
   * Clear all weather data state
   */
  const clearWeatherData = useCallback(() => {
    setWeatherData(null);
    setGardenWeatherData({});
    setWeatherAdviceByGarden({});
    setOptimalGardenTimes({});
    setWeatherDetailLoading({});
    setWeatherDetailError({});
    lastWeatherFetchTime.current = {};
  }, []);

  return {
    // Weather data
    weatherData,
    gardenWeatherData,
    weatherAdviceByGarden,
    optimalGardenTimes,

    // Loading and error states
    weatherDetailLoading,
    weatherDetailError,

    // Functions
    getWeatherTip,
    fetchCompleteWeatherData,
    fetchWeatherAdvice,
    calculateOptimalTimes,
    clearWeatherData,
  };
}
