import { useState, useCallback, useRef, useEffect } from "react";
import { useInterval } from "./useInterval";
import { Alert, Garden, GardenActivity, WateringSchedule } from "@/types";
import { UISensor } from "@/components/garden/GardenSensorSection";
import {
  HourlyForecast,
  WeatherObservation,
  DailyForecast,
} from "@/types/weather/weather.types";
import {
  GardenPlantDetails,
  GardenPhoto,
  SensorHistory,
} from "@/types/gardens/garden.types";

// Import services
import gardenService from "@/service/api/garden.service";
import weatherService from "@/service/api/weather.service";
import sensorService from "@/service/api/sensor.service";
import activityService from "@/service/api/activity.service";
import alertService from "@/service/api/alert.service";
import wateringScheduleService from "@/service/api/watering.service";
import taskService from "@/service/api/task.service";

interface UseGardenDetailProps {
  gardenId: string | null;
}

interface GardenDetailState {
  garden: Garden | null;
  currentWeather: WeatherObservation | null;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  alerts: Alert[];
  wateringSchedule: WateringSchedule[];
  activities: GardenActivity[];
  sensors: UISensor[];
  previousSensorData: UISensor[];
  plantDetails: GardenPlantDetails | null;
  gardenPhotos: GardenPhoto[];
  sensorHistory: Record<string, SensorHistory>;
  tasks: any[];
  isLoading: boolean;
  isRefreshing: boolean;
  isSensorDataLoading: boolean;
  error: string | null;
  sensorDataError: string | null;
  lastSensorUpdate: Date | null;
  adviceModalVisible: boolean;
  gardenAdvice: any[];
  adviceLoading: boolean;
  adviceError: string | null;
  weatherModalVisible: boolean;
}

export function useGardenDetail({ gardenId }: UseGardenDetailProps) {
  // Garden detail state
  const [state, setState] = useState<GardenDetailState>({
    garden: null,
    currentWeather: null,
    hourlyForecast: [],
    dailyForecast: [],
    alerts: [],
    wateringSchedule: [],
    activities: [],
    sensors: [],
    previousSensorData: [],
    plantDetails: null,
    gardenPhotos: [],
    sensorHistory: {},
    tasks: [],
    isLoading: true,
    isRefreshing: false,
    isSensorDataLoading: false,
    error: null,
    sensorDataError: null,
    lastSensorUpdate: null,
    adviceModalVisible: false,
    gardenAdvice: [],
    adviceLoading: false,
    adviceError: null,
    weatherModalVisible: false,
  });

  // Refs for debouncing
  const sensorUpdateDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef(Date.now());

  // Constants
  const sensorRefreshInterval = 30000; // 30 seconds

  /**
   * Load all garden data from API
   */
  const loadGardenData = useCallback(
    async (id: string) => {
      if (!id) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Load garden details
        const gardenData = await gardenService.getGardenById(id);
        if (!gardenData) {
          throw new Error("Không thể tải dữ liệu vườn.");
        }

        setState((prev) => ({ ...prev, garden: gardenData }));

        // Create an array of promises to fetch data in parallel
        const dataPromises = [
          // Load plant details if the garden has a plant
          gardenData.plantName
            ? gardenService.getGardenPlantDetails(id).catch((error) => {
                console.error("Failed to load plant details:", error);
                return null;
              })
            : Promise.resolve(null),

          // Load garden photos
          gardenService.getGardenPhotos(id).catch((error) => {
            console.error("Failed to load garden photos:", error);
            return [];
          }),

          // Load sensor history
          gardenService.getGardenSensorHistory(id, 7).catch((error) => {
            console.error("Failed to load sensor history:", error);
            return {};
          }),

          // Load tasks
          taskService.getTasksByGarden(id).catch((error) => {
            console.error("Failed to load tasks:", error);
            return [];
          }),

          // Load weather data
          weatherService.getCurrentWeather(id).catch((error) => {
            console.error("Failed to load weather data:", error);
            return null;
          }),

          // Load hourly forecast
          weatherService.getHourlyForecast(id).catch((error) => {
            console.error("Failed to load hourly forecast:", error);
            return [];
          }),

          // Load daily forecast
          weatherService.getDailyForecast(id).catch((error) => {
            console.error("Failed to load daily forecast:", error);
            return [];
          }),

          // Load alerts
          alertService.getAlertsByGarden(id).catch((error) => {
            console.error("Failed to load alerts:", error);
            return [];
          }),

          // Load watering schedule
          wateringScheduleService
            .getGardenWateringSchedules(id)
            .catch((error) => {
              console.error("Failed to load watering schedule:", error);
              return [];
            }),

          // Load activities
          activityService.getActivitiesByGarden(id).catch((error) => {
            console.error("Failed to load activities:", error);
            return [];
          }),
        ];

        // Wait for all promises to resolve
        const [
          plantDetails,
          photos,
          sensorHistory,
          tasks,
          weatherData,
          hourlyData,
          dailyData,
          alertData,
          wateringData,
          activities,
        ] = await Promise.all(dataPromises);

        // Update state with all data
        setState((prev) => ({
          ...prev,
          plantDetails,
          gardenPhotos: photos || [],
          sensorHistory: sensorHistory || {},
          tasks: tasks || [],
          currentWeather: weatherData,
          hourlyForecast: hourlyData || [],
          dailyForecast: dailyData || [],
          alerts: alertData || [],
          wateringSchedule: wateringData || [],
          activities: activities || [],
        }));

        // Load sensors (can't be parallelized due to state dependencies)
        await refreshSensorData(id);
      } catch (error) {
        console.error("Failed to load garden data:", error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Không thể tải dữ liệu vườn. Vui lòng thử lại sau.",
          garden: null,
        }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [refreshSensorData]
  );

  /**
   * Handle refresh operation
   */
  const handleRefresh = useCallback(async () => {
    if (!gardenId) return;

    setState((prev) => ({ ...prev, isRefreshing: true }));

    // Prevent too frequent refreshes
    const now = Date.now();
    if (now - lastFetchTime.current < 5000) {
      // 5s debounce
      console.log("Debouncing refresh - too frequent");
      setState((prev) => ({ ...prev, isRefreshing: false }));
      return;
    }

    lastFetchTime.current = now;

    await loadGardenData(gardenId);
    setState((prev) => ({ ...prev, isRefreshing: false }));
  }, [gardenId, loadGardenData]);

  /**
   * Validate and process sensor data to ensure it's safe for display
   */
  const validateSensorData = useCallback((sensorData: any[]): UISensor[] => {
    if (!Array.isArray(sensorData)) return [];

    // Map API sensor data to the format required by the UI components
    return sensorData
      .filter(
        (sensor) =>
          sensor && typeof sensor === "object" && sensor.id && sensor.type
      )
      .map((sensor) => ({
        id: sensor.id,
        type: sensor.type,
        name: sensor.name || "",
        value: typeof sensor.lastReading === "number" ? sensor.lastReading : 0,
        unit: sensor.unit,
        lastUpdated: sensor.lastReadingAt || sensor.updatedAt,
        lastReadingAt: sensor.lastReadingAt || sensor.updatedAt,
        recentValues: sensor.recentValues || undefined,
      }));
  }, []);

  /**
   * Refresh sensor data with debouncing
   */
  const refreshSensorData = useCallback(
    async (id: string) => {
      if (!id) return;

      if (sensorUpdateDebounceRef.current) {
        clearTimeout(sensorUpdateDebounceRef.current);
      }

      sensorUpdateDebounceRef.current = setTimeout(async () => {
        try {
          setState((prev) => ({
            ...prev,
            isSensorDataLoading: true,
            sensorDataError: null,
            previousSensorData:
              prev.sensors.length > 0 ? [...prev.sensors] : [],
          }));

          // Fetch new sensor data
          const sensorData = await sensorService.getLatestReadingsByGarden(id);

          // Validate sensor data
          const validatedSensorData = validateSensorData(sensorData || []);

          // Update state with new data
          setState((prev) => ({
            ...prev,
            sensors: validatedSensorData,
            lastSensorUpdate: new Date(),
          }));
        } catch (error) {
          console.error("Failed to refresh sensor data:", error);
          setState((prev) => ({
            ...prev,
            sensorDataError:
              error instanceof Error
                ? error.message
                : "Could not update sensor data",
          }));
        } finally {
          setState((prev) => ({ ...prev, isSensorDataLoading: false }));
          sensorUpdateDebounceRef.current = null;
        }
      }, 300); // 300ms debounce
    },
    [validateSensorData]
  );

  /**
   * Get garden advice data
   */
  const fetchGardenAdvice = useCallback(async (id: string) => {
    if (!id) return;

    setState((prev) => ({
      ...prev,
      adviceLoading: true,
      adviceError: null,
    }));

    try {
      const adviceResponse = await gardenService.getGardenAdvice(id);

      // Ensure advice is a valid array
      const validAdvice = Array.isArray(adviceResponse) ? adviceResponse : [];

      setState((prev) => ({
        ...prev,
        gardenAdvice: validAdvice,
        adviceError:
          validAdvice.length === 0
            ? "Không tìm thấy lời khuyên nào cho vườn này"
            : null,
      }));

      return validAdvice;
    } catch (error) {
      console.error("Failed to load garden advice:", error);
      setState((prev) => ({
        ...prev,
        adviceError:
          error instanceof Error
            ? error.message
            : "Không thể tải lời khuyên. Vui lòng thử lại sau.",
      }));
      return [];
    } finally {
      setState((prev) => ({ ...prev, adviceLoading: false }));
    }
  }, []);

  /**
   * Show advice modal
   */
  const showAdviceModal = useCallback(
    async (id: string) => {
      await fetchGardenAdvice(id);
      setState((prev) => ({ ...prev, adviceModalVisible: true }));
    },
    [fetchGardenAdvice]
  );

  /**
   * Close advice modal
   */
  const closeAdviceModal = useCallback(() => {
    setState((prev) => ({ ...prev, adviceModalVisible: false }));
  }, []);

  /**
   * Show weather modal
   */
  const showWeatherModal = useCallback(() => {
    setState((prev) => ({ ...prev, weatherModalVisible: true }));
  }, []);

  /**
   * Close weather modal
   */
  const closeWeatherModal = useCallback(() => {
    setState((prev) => ({ ...prev, weatherModalVisible: false }));
  }, []);

  /**
   * Determine if a sensor value has increased or decreased
   */
  const getSensorTrend = useCallback(
    (currentSensor: UISensor): "up" | "down" | "stable" | null => {
      if (!state.previousSensorData || state.previousSensorData.length === 0)
        return null;

      const prevSensor = state.previousSensorData.find(
        (s) => s.id === currentSensor.id
      );
      if (!prevSensor) return null;

      const diff = currentSensor.value - prevSensor.value;
      if (Math.abs(diff) < 0.1) return "stable";
      return diff > 0 ? "up" : "down";
    },
    [state.previousSensorData]
  );

  /**
   * Format time passed since last update
   */
  const getTimeSinceUpdate = useCallback(() => {
    if (!state.lastSensorUpdate) return "";

    const now = new Date();
    const diffMs = now.getTime() - state.lastSensorUpdate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return `${diffSecs} giây trước`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} phút trước`;
    return `${Math.floor(diffSecs / 3600)} giờ trước`;
  }, [state.lastSensorUpdate]);

  // Automatically fetch data when gardenId changes
  useEffect(() => {
    if (gardenId) {
      loadGardenData(gardenId);
    }
  }, [gardenId, loadGardenData]);

  // Use polling to refresh sensor data periodically
  useInterval(() => {
    if (gardenId && !state.isLoading && state.garden) {
      refreshSensorData(gardenId);
    }
  }, sensorRefreshInterval);

  return {
    ...state,
    loadGardenData,
    handleRefresh,
    refreshSensorData,
    fetchGardenAdvice,
    showAdviceModal,
    closeAdviceModal,
    showWeatherModal,
    closeWeatherModal,
    getSensorTrend,
    getTimeSinceUpdate,
  };
}
