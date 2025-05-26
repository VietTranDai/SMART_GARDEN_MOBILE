import { useState, useEffect, useCallback } from "react";
import {
  GardenPhoto,
  GardenPlantDetails,
  SensorHistory,
  GardenAdvice,
} from "@/types/gardens/garden.types";
import {
  WeatherObservation,
  GardenWeatherData,
  HourlyForecast,
  DailyForecast,
} from "@/types/weather/weather.types";
import { SensorType } from "@/types/gardens/sensor.types";
import { Alert, AlertStatus } from "@/types/alerts/alert.types";
import { UISensor } from "@/components/garden/GardenSensorSection";
import {
  gardenService,
  plantService,
  alertService,
  activityService,
  weatherService,
  wateringService,
} from "@/service/api";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { WateringSchedule } from "@/types";
import {
  PlantStatisticsData,
  PlantAdviceData,
} from "@/types/plants/plant-insights.types";

/**
 * Custom hook for managing garden details and related data
 */
export function useGardenDetail({ gardenId }: { gardenId: string | null }) {
  // Garden and plant data
  const [garden, setGarden] = useState<any>(null);
  const [plantDetails, setPlantDetails] = useState<GardenPlantDetails | null>(
    null
  );

  // Loading and error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sensor data states
  const [sensorHistory, setSensorHistory] = useState<
    Record<string, SensorHistory>
  >({});
  const [sensors, setSensors] = useState<UISensor[]>([]);
  const [isSensorDataLoading, setIsSensorDataLoading] =
    useState<boolean>(false);
  const [sensorDataError, setSensorDataError] = useState<string | null>(null);
  const [lastSensorUpdate, setLastSensorUpdate] = useState<string | null>(null);

  // Weather & forecast
  const [currentWeather, setCurrentWeather] = useState<
    WeatherObservation | undefined
  >(undefined);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);

  // Photos, alerts, activities and schedules
  const [gardenPhotos, setGardenPhotos] = useState<GardenPhoto[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [wateringSchedule, setWateringSchedule] = useState<WateringSchedule[]>(
    []
  );

  // Modal states
  const [adviceModalVisible, setAdviceModalVisible] = useState<boolean>(false);
  const [gardenAdvice, setGardenAdvice] = useState<GardenAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState<boolean>(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);
  const [weatherModalVisible, setWeatherModalVisible] =
    useState<boolean>(false);

  // New states for Plant Statistics and Detailed Advice
  const [plantStats, setPlantStats] = useState<PlantStatisticsData | null>(
    null
  );
  const [plantStatsLoading, setPlantStatsLoading] = useState<boolean>(false);
  const [plantStatsError, setPlantStatsError] = useState<string | null>(null);

  const [plantDetailedAdvice, setPlantDetailedAdvice] =
    useState<PlantAdviceData | null>(null);
  const [plantDetailedAdviceLoading, setPlantDetailedAdviceLoading] =
    useState<boolean>(false);
  const [plantDetailedAdviceError, setPlantDetailedAdviceError] = useState<
    string | null
  >(null);

  /**
   * Load all garden data
   */
  const loadGardenData = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch garden details
      const gardenDetails = await gardenService.getGardenById(id);
      setGarden(gardenDetails);

      // Fetch related data in parallel
      const [
        plantDetailsData,
        sensorHistoryData,
        photosData,
        alertsData,
        activitiesData,
        weatherData,
        // Fetch new plant insights data
        fetchedPlantStats,
        fetchedPlantDetailedAdvice,
      ] = await Promise.all([
        gardenService.getGardenPlantDetails(id),
        gardenService.getGardenSensorHistory(id),
        gardenService.getGardenPhotos(id),
        alertService.getAlertsByGarden(id),
        activityService.getActivities(), // Get all activities and filter by garden ID later
        weatherService.getCurrentAndForecast(id),
        gardenService.getPlantStatistics(id).catch((err) => {
          console.error("Error fetching plant statistics in Promise.all:", err);
          setPlantStatsError("Không thể tải thống kê cây trồng.");
          return null;
        }),
        gardenService.getPlantDetailedAdvice(id).catch((err) => {
          console.error(
            "Error fetching plant detailed advice in Promise.all:",
            err
          );
          setPlantDetailedAdviceError(
            "Không thể tải lời khuyên chi tiết cho cây trồng."
          );
          return null;
        }),
      ]);

      // Fetch watering schedules separately as it's already processed by the service
      const scheduleData = await wateringService.getGardenWateringSchedules(id);

      setPlantDetails(plantDetailsData);
      setSensorHistory(sensorHistoryData);
      setGardenPhotos(photosData);
      setAlerts(alertsData as any);

      // Set new plant insights data
      setPlantStats(fetchedPlantStats);
      setPlantDetailedAdvice(fetchedPlantDetailedAdvice);

      // Filter activities by garden ID
      const gardenActivities = activitiesData.filter(
        (activity: any) => String(activity.gardenId) === String(id)
      );
      setActivities(gardenActivities);

      // Set watering schedule
      setWateringSchedule(scheduleData);

      // Set weather data if available
      if (weatherData) {
        setCurrentWeather(weatherData.current || undefined);
        setHourlyForecast(weatherData.hourly);
        setDailyForecast(weatherData.daily);
      }

      // Transform sensor data for UI
      const sensorsData = transformSensorData(sensorHistoryData);
      setSensors(sensorsData);

      // Set last sensor update time if available
      if (sensorsData.length > 0) {
        const latestUpdateTimes = sensorsData
          .map((s) => s.lastUpdated)
          .filter(Boolean) as string[];

        if (latestUpdateTimes.length > 0) {
          latestUpdateTimes.sort(
            (a, b) => new Date(b).getTime() - new Date(a).getTime()
          );
          setLastSensorUpdate(latestUpdateTimes[0]);
        }
      }
    } catch (err) {
      console.error("Error loading garden data:", err);
      setError("Không thể tải dữ liệu vườn.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Transform sensor history data to UI sensor format
   */
  const transformSensorData = (
    sensorHistories: Record<string, SensorHistory>
  ): UISensor[] => {
    if (!sensorHistories) return [];

    const sensors: UISensor[] = [];

    Object.entries(sensorHistories).forEach(([type, history]) => {
      if (history.data && history.data.length > 0) {
        // Get latest reading
        const sortedData = [...history.data].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const latestReading = sortedData[0];

        // Create recent values for sparkline (last 10 readings)
        const recentValues = sortedData.slice(0, 10).map((point) => ({
          timestamp: point.timestamp,
          value: point.value,
        }));

        sensors.push({
          id: history.sensorId,
          type: type as SensorType,
          name: history.sensorName,
          value: latestReading.value,
          unit: history.unit as any,
          lastUpdated: latestReading.timestamp,
          recentValues: recentValues,
        });
      }
    });

    return sensors;
  };

  /**
   * Refresh garden data
   */
  const refreshGarden = useCallback(() => {
    if (gardenId) {
      loadGardenData(gardenId);
    }
  }, [gardenId, loadGardenData]);

  /**
   * Handle refresh action (pull-to-refresh)
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    refreshGarden();
  }, [refreshGarden]);

  /**
   * Refresh only sensor data
   */
  const refreshSensorData = useCallback(async (id: string) => {
    try {
      setIsSensorDataLoading(true);
      const sensorHistoryData = await gardenService.getGardenSensorHistory(id);
      setSensorHistory(sensorHistoryData);

      // Transform and update sensors
      const sensorsData = transformSensorData(sensorHistoryData);
      setSensors(sensorsData);

      // Update last sensor update time
      if (sensorsData.length > 0) {
        const latestUpdateTimes = sensorsData
          .map((s) => s.lastUpdated)
          .filter(Boolean) as string[];

        if (latestUpdateTimes.length > 0) {
          latestUpdateTimes.sort(
            (a, b) => new Date(b).getTime() - new Date(a).getTime()
          );
          setLastSensorUpdate(latestUpdateTimes[0]);
        }
      }

      // Refresh alerts too as they may be sensor-related
      const alertsData = await alertService.getAlertsByGarden(id);
      setAlerts(alertsData as any);
    } catch (err) {
      console.error("Error refreshing sensor data:", err);
      setSensorDataError("Không thể tải dữ liệu cảm biến.");
    } finally {
      setIsSensorDataLoading(false);
    }
  }, []);

  /**
   * Fetch garden advice
   */
  const fetchGardenAdvice = useCallback(async (id: string) => {
    try {
      setAdviceLoading(true);
      setAdviceError(null);
      const advice = await gardenService.getGardenAdvice(id);
      if (advice && advice.length > 0) {
        setGardenAdvice(advice[0]);
      } else {
        setGardenAdvice(null);
      }
    } catch (err) {
      console.error("Error fetching garden advice:", err);
      setAdviceError("Không thể tải lời khuyên cho vườn.");
    } finally {
      setAdviceLoading(false);
    }
  }, []);

  /**
   * Modal control functions
   */
  const showAdviceModal = useCallback(
    (id: string) => {
      setAdviceModalVisible(true);
      fetchGardenAdvice(id);
    },
    [fetchGardenAdvice]
  );

  const closeAdviceModal = useCallback(() => {
    setAdviceModalVisible(false);
  }, []);

  const showWeatherModal = useCallback(() => {
    setWeatherModalVisible(true);
  }, []);

  const closeWeatherModal = useCallback(() => {
    setWeatherModalVisible(false);
  }, []);

  /**
   * Sensor data analysis
   */
  const getSensorTrend = useCallback(
    (readings: { value: number; timestamp: string }[]) => {
      if (!readings || readings.length < 2) return "stable";

      const sortedReadings = [...readings].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const firstValue = sortedReadings[0].value;
      const lastValue = sortedReadings[sortedReadings.length - 1].value;
      const difference = lastValue - firstValue;

      // Calculate percentage change
      const percentChange = (difference / firstValue) * 100;

      if (percentChange > 5) return "rising";
      if (percentChange < -5) return "falling";
      return "stable";
    },
    []
  );

  /**
   * Format relative time since update
   */
  const getTimeSinceUpdate = useCallback((timestamp: string) => {
    if (!timestamp) return "Chưa có cập nhật";

    const now = new Date();
    const updateTime = new Date(timestamp);
    const diffInMs = now.getTime() - updateTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return "Vừa cập nhật";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  }, []);

  /**
   * Handle photo upload
   */
  const handleUploadPhoto = async (id: string | number) => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Không có quyền truy cập thư viện ảnh",
          position: "bottom",
          visibilityTime: 3000,
        });
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Create form data for upload
        const formData = new FormData();
        formData.append("photo", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "garden-photo.jpg",
        } as any);

        // Upload photo
        const uploadedPhoto = await gardenService.uploadGardenPhoto(
          id,
          formData
        );

        // Add the new photo to state
        if (uploadedPhoto) {
          setGardenPhotos((prevPhotos) => [uploadedPhoto, ...prevPhotos]);
        }

        Toast.show({
          type: "success",
          text1: "Tải ảnh lên thành công",
          position: "bottom",
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi khi tải ảnh lên",
        text2: "Vui lòng thử lại sau",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };

  /**
   * Resolve an alert
   */
  const resolveAlert = useCallback(
    async (alertId: number) => {
      if (!gardenId) return;
      try {
        await alertService.updateAlertStatus(alertId, AlertStatus.RESOLVED);
        await loadGardenData(gardenId); // Refresh data
        Toast.show({
          type: "success",
          text1: "Đã xử lý cảnh báo",
          position: "bottom",
          visibilityTime: 2000,
        });
      } catch (error) {
        console.error("Failed to resolve alert:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi xử lý cảnh báo",
          text2: "Vui lòng thử lại sau",
          position: "bottom",
          visibilityTime: 3000,
        });
      }
    },
    [gardenId, loadGardenData]
  );

  /**
   * Ignore an alert
   */
  const ignoreAlert = useCallback(
    async (alertId: number) => {
      if (!gardenId) return;
      try {
        // Assuming there's an API endpoint to ignore alerts - this matches useGardenAlerts
        await alertService.ignoreAlert(alertId);
        await loadGardenData(gardenId); // Refresh data
        Toast.show({
          type: "success",
          text1: "Đã bỏ qua cảnh báo",
          position: "bottom",
          visibilityTime: 2000,
        });
      } catch (error) {
        console.error("Failed to ignore alert:", error);
        Toast.show({
          type: "error",
          text1: "Lỗi bỏ qua cảnh báo",
          text2: "Vui lòng thử lại sau",
          position: "bottom",
          visibilityTime: 3000,
        });
      }
    },
    [gardenId, loadGardenData]
  );

  // Effect to load garden data initially
  useEffect(() => {
    if (gardenId) {
      loadGardenData(gardenId);
    }
  }, [gardenId, loadGardenData]);

  return {
    garden,
    plantDetails,
    isLoading,
    isRefreshing,
    error,
    sensorData: sensors,
    sensorHistory,
    gardenPhotos,
    photos: gardenPhotos, // For backward compatibility
    alerts,
    activities,
    wateringSchedule,
    currentWeather,
    hourlyForecast,
    dailyForecast,
    isSensorDataLoading,
    sensorDataError,
    lastSensorUpdate,
    adviceModalVisible,
    gardenAdvice,
    adviceLoading,
    adviceError,
    weatherModalVisible,
    sensors,
    handleRefresh,
    refreshGarden,
    refreshSensorData,
    handleUploadPhoto,
    loadGardenData,
    fetchGardenAdvice,
    showAdviceModal,
    closeAdviceModal,
    showWeatherModal,
    closeWeatherModal,
    getSensorTrend,
    getTimeSinceUpdate,
    resolveAlert,
    ignoreAlert,
    plantStats,
    plantStatsLoading,
    plantStatsError,
    plantDetailedAdvice,
    plantDetailedAdviceLoading,
    plantDetailedAdviceError,
  };
}
