import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useAppTheme } from "@/hooks/useAppTheme";

// Import types
import { User } from "@/types";
import { Garden, GardenStatus, GardenType } from "@/types/gardens/garden.types";
import {
  SensorType,
  SensorUnit,
  SensorData,
} from "@/types/gardens/sensor.types";
import {
  WeatherObservation,
  HourlyForecast,
  DailyForecast,
} from "@/types/weather/weather.types";
import { Alert, AlertStatus } from "@/types/alerts/alert.types";
import {
  ActivityType,
  GardenActivity,
} from "@/types/activities/activity.types";

// Import services
import {
  alertService,
  gardenService,
  sensorService,
  weatherService,
  activityService,
  wateringService,
} from "@/service/api";

// Define a display interface for garden data with UI properties
export interface GardenDisplay extends Garden {
  alertCount: number;
  sensorData: {
    temperature?: number;
    humidity?: number;
    soilMoisture?: number;
    light?: number;
  };
  location: string;
  isPinned: boolean;
  lastVisitedAt?: string;
  statusColor: string;
  isSelected?: boolean;
}

// Define interface for activities with completed flag
export interface ActivityDisplay extends GardenActivity {
  completed: boolean;
}

// Define interface for schedules
export interface ScheduleDisplay {
  id: number;
  activityType: ActivityType;
  name: string;
  scheduledTime: string;
  gardenId: number;
}

export default function useHomeData() {
  const theme = useAppTheme();
  const { user } = useUser();
  const { homePreferences, togglePinnedGarden, setLastVisitedGarden } =
    usePreferences();

  // States for API data
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gardens, setGardens] = useState<GardenDisplay[]>([]);
  const [sensorDataByType, setSensorDataByType] = useState<
    Record<string, SensorData[]>
  >({});
  const [selectedGardenId, setSelectedGardenId] = useState<number | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherObservation | null>(
    null
  );
  const [gardenAlerts, setGardenAlerts] = useState<Record<number, Alert[]>>({});
  const [recentActivities, setRecentActivities] = useState<ActivityDisplay[]>(
    []
  );
  const [upcomingSchedules, setUpcomingSchedules] = useState<ScheduleDisplay[]>(
    []
  );

  // Cập nhật state để quản lý dữ liệu thời tiết và sensor cho mỗi vườn
  const [gardenWeatherData, setGardenWeatherData] = useState<
    Record<
      number,
      {
        current: WeatherObservation | null;
        hourly: HourlyForecast[];
        daily: DailyForecast[];
      }
    >
  >({});

  const [gardenSensorData, setGardenSensorData] = useState<
    Record<number, Record<string, SensorData[]>>
  >({});

  // Thêm một ref để theo dõi trạng thái đã initial fetch hay chưa
  const initialFetchDone = useRef(false);

  // Thêm ref để theo dõi lần fetch gần nhất
  const lastFetchTime = useRef(0);

  // Thêm flag để tránh gọi API liên tục
  const isLoading = useRef(false);

  // Helper for garden location string
  const getLocationString = (garden: Garden) => {
    const parts = [];
    if (garden.district) parts.push(garden.district);
    if (garden.city) parts.push(garden.city);
    return parts.length > 0 ? parts.join(", ") : "Chưa có địa chỉ";
  };

  // Fetch garden data
  const fetchGardens = useCallback(async () => {
    try {
      const gardensData = await gardenService.getGardens();

      // Convert API gardens to display format with additional UI properties
      const displayGardens: GardenDisplay[] = gardensData.map((garden) => {
        // Check if garden is pinned in user preferences
        const isPinned = homePreferences.pinnedGardens.includes(garden.id);

        // Default status color
        const statusColor = theme.primary;

        return {
          ...garden,
          alertCount: 0, // Will be updated when alerts are fetched
          sensorData: {}, // Will be updated when sensor data is fetched
          location: getLocationString(garden),
          isPinned,
          statusColor, // Will be updated based on alerts/sensor status
        };
      });

      // Sort gardens: pinned first, then recently visited
      const sortedGardens = [...displayGardens].sort((a, b) => {
        // 1. Pinned gardens first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // 2. Then by last visited (if available)
        if (a.lastVisitedAt && b.lastVisitedAt) {
          return (
            new Date(b.lastVisitedAt).getTime() -
            new Date(a.lastVisitedAt).getTime()
          );
        }

        return 0;
      });

      setGardens(sortedGardens);

      // Set initial selected garden if none selected
      if (selectedGardenId === null) {
        // First try to use last visited garden from preferences
        if (homePreferences.lastVisitedGarden) {
          const exists = sortedGardens.some(
            (g) => g.id === homePreferences.lastVisitedGarden
          );
          if (exists) {
            setSelectedGardenId(homePreferences.lastVisitedGarden);
            return;
          }
        }

        // Otherwise use first garden
        if (sortedGardens.length > 0) {
          setSelectedGardenId(sortedGardens[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load gardens:", err);
      setError("Không thể tải danh sách vườn. Vui lòng thử lại sau.");
    }
  }, [homePreferences, selectedGardenId, theme.primary]);

  // Fetch dữ liệu thời tiết đầy đủ cho một vườn
  const fetchCompleteWeatherData = useCallback(
    async (gardenId: number) => {
      if (!gardenId) return;

      try {
        const data = await weatherService.getCompleteWeatherData(gardenId, {
          hourlyLimit: 24,
          dailyLimit: 7,
        });

        setGardenWeatherData((prev) => ({
          ...prev,
          [gardenId]: data,
        }));

        // Cập nhật weatherData state cho compatibility
        if (gardenId === selectedGardenId) {
          setWeatherData(data.current);
        }
      } catch (err) {
        console.error("Failed to load complete weather data:", err);
      }
    },
    [selectedGardenId]
  );

  // Fetch sensor data cho một vườn cụ thể
  const fetchGardenSensorData = useCallback(
    async (gardenId: number) => {
      if (!gardenId) return;

      try {
        const data = await sensorService.getGardenSensorData(gardenId);

        setGardenSensorData((prev) => ({
          ...prev,
          [gardenId]: data,
        }));

        // Cập nhật sensorDataByType cho compatibility
        if (gardenId === selectedGardenId) {
          setSensorDataByType(data);
        }
      } catch (err) {
        console.error(
          `Failed to load sensor data for garden ${gardenId}:`,
          err
        );
      }
    },
    [selectedGardenId]
  );

  // Fetch alerts for all gardens
  const fetchAlerts = useCallback(async () => {
    try {
      const alertsData = await alertService.getAlerts({
        status: AlertStatus.PENDING,
      });

      // Group alerts by garden ID
      const alertsByGarden: Record<number, Alert[]> = {};
      if (alertsData && Array.isArray(alertsData)) {
        alertsData.forEach((alert) => {
          if (!alertsByGarden[alert.gardenId || 0]) {
            alertsByGarden[alert.gardenId || 0] = [];
          }
          alertsByGarden[alert.gardenId || 0].push(alert);
        });
      }

      setGardenAlerts(alertsByGarden);

      // Update garden data with alert counts
      setGardens((prevGardens) =>
        prevGardens.map((garden) => ({
          ...garden,
          alertCount: alertsByGarden[garden.id]?.length || 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load alerts:", err);
    }
  }, []);

  // Fetch recent activities
  const fetchRecentActivities = useCallback(async () => {
    if (!selectedGardenId) return;

    try {
      // Get activities from the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const activities = await activityService.getActivitiesByGarden(
        selectedGardenId,
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }
      );

      // Convert to ActivityDisplay with completed flag
      const activityDisplays: ActivityDisplay[] = activities
        .slice(0, 5)
        .map((activity: GardenActivity) => ({
          ...activity,
          completed: true, // Assuming past activities are completed
        }));

      setRecentActivities(activityDisplays);
    } catch (err) {
      console.error("Failed to load recent activities:", err);
    }
  }, [selectedGardenId]);

  // Fetch upcoming schedules
  const fetchUpcomingSchedules = useCallback(async () => {
    if (!selectedGardenId) return;

    try {
      // Get schedules for the next 7 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const wateringSchedules =
        await wateringService.getGardenWateringSchedules(selectedGardenId, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

      // Convert to ScheduleDisplay format
      const scheduleDisplays: ScheduleDisplay[] = wateringSchedules
        .slice(0, 5)
        .map((schedule) => ({
          id: schedule.id,
          activityType: ActivityType.WATERING,
          name: `Tưới nước - ${schedule.amount}ml`,
          scheduledTime: schedule.scheduledAt,
          gardenId: schedule.gardenId,
        }));

      setUpcomingSchedules(scheduleDisplays);
    } catch (err) {
      console.error("Failed to load upcoming schedules:", err);
    }
  }, [selectedGardenId]);

  // Cập nhật fetchData để tránh vòng lặp vô hạn
  const fetchData = useCallback(async () => {
    // Nếu đang loading, bỏ qua lệnh gọi mới
    if (isLoading.current) {
      console.log("Skip fetchData - already loading");
      return;
    }

    isLoading.current = true;
    setLoading(true);
    setError(null);

    try {
      // Fetch garden list
      await fetchGardens();

      // Fetch alerts
      await fetchAlerts();

      // Fetch data phụ thuộc vào selectedGardenId
      if (selectedGardenId) {
        await Promise.all([fetchRecentActivities(), fetchUpcomingSchedules()]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      isLoading.current = false;
    }
  }, [
    fetchGardens,
    fetchAlerts,
    fetchRecentActivities,
    fetchUpcomingSchedules,
    selectedGardenId,
  ]);

  // Thêm effect riêng để xử lý garden data
  useEffect(() => {
    const loadGardenData = async () => {
      if (!gardens.length) return;

      try {
        const promises = [];
        for (const garden of gardens) {
          promises.push(fetchGardenSensorData(garden.id));
          promises.push(fetchCompleteWeatherData(garden.id));
        }

        await Promise.all(promises);
      } catch (err) {
        console.error("Error loading garden data:", err);
      }
    };

    loadGardenData();
  }, [gardens, fetchGardenSensorData, fetchCompleteWeatherData]);

  // Cập nhật handleSelectGarden để lấy dữ liệu khi chọn vườn mới
  const handleSelectGarden = useCallback(
    (gardenId: number) => {
      // Update gardens with highlighted selection
      setGardens((prev) =>
        prev.map((garden) => ({
          ...garden,
          // Mark the new selection and unmark others
          isSelected: garden.id === gardenId,
        }))
      );

      // Update selected garden ID
      setSelectedGardenId(gardenId);

      // Update last visited garden in preferences
      setLastVisitedGarden(gardenId);

      // Cập nhật dữ liệu hiện tại dựa trên dữ liệu đã có của vườn
      if (gardenSensorData[gardenId]) {
        setSensorDataByType(gardenSensorData[gardenId]);
      }

      if (gardenWeatherData[gardenId]?.current) {
        setWeatherData(gardenWeatherData[gardenId].current);
      }

      // Fetch data for the new selection
      fetchRecentActivities();
      fetchUpcomingSchedules();
    },
    [
      setLastVisitedGarden,
      fetchRecentActivities,
      fetchUpcomingSchedules,
      gardenSensorData,
      gardenWeatherData,
    ]
  );

  // Handle pinning/unpinning a garden
  const handleTogglePinGarden = useCallback(
    (gardenId: number) => {
      // First toggle in preferences
      togglePinnedGarden(gardenId);

      // Then update our local state
      setGardens((prev) =>
        prev.map((garden) => {
          if (garden.id === gardenId) {
            return {
              ...garden,
              isPinned: !garden.isPinned,
            };
          }
          return garden;
        })
      );
    },
    [togglePinnedGarden]
  );

  // Get weather tip based on current weather
  const getWeatherTip = useCallback(
    (weather: WeatherObservation, gardenType?: GardenType) => {
      const { temp, humidity, weatherMain } = weather;

      // Default tips
      if (weatherMain === "RAIN" || weatherMain === "THUNDERSTORM") {
        return "Vào trời mưa, hãy kiểm tra thoát nước của vườn để tránh ngập úng.";
      }

      if (weatherMain === "CLEAR" && temp > 30) {
        return "Nhiệt độ cao, nên tưới nước cho cây vào sáng sớm hoặc chiều tối.";
      }

      if (weatherMain === "CLOUDS" && humidity < 40) {
        return "Độ ẩm thấp, hãy tưới nước cho cây để bổ sung độ ẩm.";
      }

      // Garden type specific tips
      if (gardenType === "INDOOR" && weatherMain === "CLEAR") {
        return "Hôm nay trời nắng, hãy đặt cây ở nơi có đủ ánh sáng nhưng tránh ánh nắng trực tiếp.";
      }

      if (gardenType === "OUTDOOR" && weatherMain === "CLEAR" && temp > 32) {
        return "Nắng nóng gay gắt, nên che phủ gốc cây để tránh mất nước quá nhanh.";
      }

      // Fallback
      return "Theo dõi điều kiện thời tiết để chăm sóc vườn hiệu quả.";
    },
    []
  );

  // Get status for sensor readings
  const getSensorStatus = useCallback(
    (value: number, type: SensorType): "normal" | "warning" | "critical" => {
      switch (type) {
        case SensorType.TEMPERATURE:
          if (value < 10 || value > 35) return "critical";
          if (value < 15 || value > 30) return "warning";
          return "normal";

        case SensorType.HUMIDITY:
          if (value < 20 || value > 90) return "critical";
          if (value < 30 || value > 80) return "warning";
          return "normal";

        case SensorType.LIGHT:
          if (value < 100 || value > 10000) return "critical";
          if (value < 500 || value > 8000) return "warning";
          return "normal";

        case SensorType.SOIL_MOISTURE:
          if (value < 20 || value > 90) return "critical";
          if (value < 30 || value > 80) return "warning";
          return "normal";

        default:
          return "normal";
      }
    },
    []
  );

  // Get Material Community Icon name for each sensor type
  const getSensorIconName = useCallback((type: SensorType): string => {
    const iconMap: Record<SensorType, string> = {
      [SensorType.HUMIDITY]: "water-percent",
      [SensorType.TEMPERATURE]: "thermometer",
      [SensorType.LIGHT]: "white-balance-sunny",
      [SensorType.WATER_LEVEL]: "cup-water",
      [SensorType.RAINFALL]: "weather-pouring",
      [SensorType.SOIL_MOISTURE]: "flower",
      [SensorType.SOIL_PH]: "test-tube",
    };

    return iconMap[type] || "help-circle";
  }, []);

  // Function to refresh data
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export everything
  return {
    user,
    loading,
    error,
    refreshing,
    gardens,
    selectedGardenId,
    weatherData,
    sensorDataByType,
    gardenAlerts,
    recentActivities,
    upcomingSchedules,
    getWeatherTip,
    getSensorStatus,
    getSensorIconName,
    handleSelectGarden,
    handleTogglePinGarden,
    refresh,
    // Thêm state và functions mới
    gardenWeatherData,
    gardenSensorData,
  };
}
