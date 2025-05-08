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
  OptimalGardenTime,
  WeatherAdvice,
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

// Các interfaces nên được chuyển sang types folder, nhưng để tránh phá vỡ tính nhất quán hiện tại,
// chúng ta sẽ giữ nguyên ở đây và đánh dấu để di chuyển sau.

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
  daysUntilHarvest?: number; // Thêm trường số ngày đến thu hoạch
  growthProgress?: number; // Thêm trường tiến độ tăng trưởng
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

// Define interface for GardenAdvice
export interface GardenAdvice {
  id: number;
  gardenId: number;
  action: string;
  description: string;
  reason: string;
  priority: number; // 1-5, 5 là cao nhất
  suggestedTime: string;
  category: string; // WATERING, FERTILIZING, PRUNING, PEST_CONTROL, etc.
  createdAt: string;
  updatedAt: string;
}

// Define polling interval (in milliseconds)
const SENSOR_POLLING_INTERVAL = 3000; // Giảm xuống 3 giây để kiểm thử, có thể tăng lên 5000 cho production

// Sử dụng hàm getSensorStatus từ sensorService
export const getSensorStatus = sensorService.getSensorStatus;

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

  // Add states for sensor loading and error
  const [sensorDataLoading, setSensorDataLoading] = useState<
    Record<number, boolean>
  >({});
  const [sensorDataError, setSensorDataError] = useState<
    Record<number, string | null>
  >({});

  // Add state for advice data
  const [gardenAdvice, setGardenAdvice] = useState<
    Record<number, GardenAdvice[]>
  >({});
  const [adviceLoading, setAdviceLoading] = useState<Record<number, boolean>>(
    {}
  );
  const [adviceError, setAdviceError] = useState<Record<number, string | null>>(
    {}
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

  // Add weather advice and optimal times states
  const [weatherAdviceByGarden, setWeatherAdviceByGarden] = useState<
    Record<number, WeatherAdvice[]>
  >({});

  const [optimalGardenTimes, setOptimalGardenTimes] = useState<
    Record<number, Record<string, OptimalGardenTime[]>>
  >({});

  const [weatherDetailLoading, setWeatherDetailLoading] = useState<
    Record<number, boolean>
  >({});

  const [weatherDetailError, setWeatherDetailError] = useState<
    Record<number, string | null>
  >({});

  const [gardenSensorData, setGardenSensorData] = useState<
    Record<number, Record<string, SensorData[]>>
  >({});

  // Thêm một ref để theo dõi trạng thái đã initial fetch hay chưa
  const initialFetchDone = useRef(false);

  // Thêm ref để theo dõi lần fetch gần nhất
  const lastFetchTime = useRef(0);

  // Thêm ref để theo dõi thời gian fetch sensor gần nhất cho mỗi vườn
  const lastSensorFetchTime = useRef<Record<number, number>>({});

  // Thêm flag để tránh gọi API liên tục
  const isLoading = useRef(false);

  // Add polling timer ref
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Add ref to track which gardens are being watched (have active polling)
  const watchedGardens = useRef<Set<number>>(new Set());

  // Sử dụng service function thay vì định nghĩa tại chỗ
  const getSensorIconName = useCallback((type: SensorType) => {
    return sensorService.getSensorIconName(type);
  }, []);

  // Use the service function for weather tip
  const getWeatherTip = useCallback(
    (weather: WeatherObservation, gardenType?: string) => {
      return weatherService.getWeatherTip(weather, gardenType);
    },
    []
  );

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

        // Mô phỏng dữ liệu hình ảnh đại diện
        const getRandomProfilePic = () => {
          const pics = [
            "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=300",
            "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=300",
            "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=300",
            "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=300",
            "https://images.unsplash.com/photo-1598512752271-33f913a5af13?q=80&w=300",
          ];
          return pics[Math.floor(Math.random() * pics.length)];
        };

        // Thêm dữ liệu mô phỏng
        const daysUntilHarvest = Math.floor(Math.random() * 30) + 5; // 5-35 days
        const growthProgress = Math.floor((1 - daysUntilHarvest / 40) * 100); // Calculate progress percentage

        return {
          ...garden,
          alertCount: 0, // Will be updated when alerts are fetched
          sensorData: {}, // Will be updated when sensor data is fetched
          location: getLocationString(garden),
          isPinned,
          statusColor, // Will be updated based on alerts/sensor status
          profilePicture: getRandomProfilePic(), // Add mock profile picture
          daysUntilHarvest, // Add days until harvest
          growthProgress, // Add growth progress percentage
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
      try {
        // Đánh dấu là đang loading
        setLoading(true);
        setError(null);

        // Sử dụng service function thay vì gọi API trực tiếp
        const weatherData = await weatherService.getCompleteWeatherData(
          gardenId
        );

        // Cập nhật state với dữ liệu mới
        setGardenWeatherData((prev) => ({
          ...prev,
          [gardenId]: weatherData,
        }));

        // Cập nhật weatherData state cho compatibility
        if (gardenId === selectedGardenId) {
          setWeatherData(weatherData.current);
        }

        return weatherData;
      } catch (error) {
        console.error(
          `Error fetching weather data for garden ${gardenId}:`,
          error
        );
        setError("Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [selectedGardenId]
  );

  // Fetch lời khuyên chăm sóc cho một vườn cụ thể
  const fetchGardenAdvice = useCallback(async (gardenId: number) => {
    if (!gardenId) return;

    try {
      // Set loading state
      setAdviceLoading((prev) => ({ ...prev, [gardenId]: true }));
      // Clear error
      setAdviceError((prev) => ({ ...prev, [gardenId]: null }));

      // Giả lập API call, trong thực tế sẽ gọi endpoint /gardens/:id/advice
      // const response = await gardenService.getGardenAdvice(gardenId);

      // Mock data - trong ứng dụng thực tế, thay bằng API call
      const mockAdviceData: GardenAdvice[] = [
        {
          id: 1,
          gardenId,
          action: "Tưới nước",
          description:
            "Cây cần được tưới nước vào buổi sáng sớm hoặc chiều tối",
          reason: "Độ ẩm đất đang ở mức thấp (25%)",
          priority: 5,
          suggestedTime: new Date(
            new Date().setHours(17, 0, 0, 0)
          ).toISOString(),
          category: "WATERING",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          gardenId,
          action: "Bón phân",
          description: "Bón phân NPK cho cây để cung cấp dưỡng chất",
          reason: "Đã 30 ngày kể từ lần bón phân gần nhất",
          priority: 4,
          suggestedTime: new Date(
            new Date().setHours(8, 0, 0, 0)
          ).toISOString(),
          category: "FERTILIZING",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          gardenId,
          action: "Kiểm tra sâu bệnh",
          description: "Kiểm tra lá cây để phát hiện sớm dấu hiệu sâu bệnh",
          reason: "Thời tiết ẩm ướt thuận lợi cho sâu bệnh phát triển",
          priority: 3,
          suggestedTime: new Date(
            new Date().setHours(10, 0, 0, 0)
          ).toISOString(),
          category: "PEST_CONTROL",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update state with advice data
      setGardenAdvice((prev) => ({
        ...prev,
        [gardenId]: mockAdviceData,
      }));

      // Clear loading state
      setAdviceLoading((prev) => ({ ...prev, [gardenId]: false }));

      return mockAdviceData;
    } catch (err) {
      console.error(`Failed to load advice for garden ${gardenId}:`, err);
      // Set error state
      setAdviceError((prev) => ({
        ...prev,
        [gardenId]: "Không thể tải lời khuyên chăm sóc",
      }));
      // Clear loading state
      setAdviceLoading((prev) => ({ ...prev, [gardenId]: false }));
      return [];
    }
  }, []);

  // Fetch sensor data cho một vườn cụ thể - cải tiến để hỗ trợ kiểm soát thời gian gọi API
  const fetchGardenSensorData = useCallback(
    async (gardenId: number, forceRefresh = false) => {
      // Skip if already loading and not force refresh
      if (sensorDataLoading[gardenId] && !forceRefresh) return;

      // Nếu đã có dữ liệu gần đây và không yêu cầu force refresh, dùng cache
      const lastFetch = lastSensorFetchTime.current[gardenId] || 0;
      const now = Date.now();
      if (
        !forceRefresh &&
        now - lastFetch < 10000 &&
        gardenSensorData[gardenId]
      ) {
        // Dữ liệu vẫn còn mới, không cần fetch lại
        return;
      }

      // Add garden to watched list to enable polling
      watchedGardens.current.add(gardenId);

      // Only set loading on initial fetch
      if (!gardenSensorData[gardenId] || forceRefresh) {
        setSensorDataLoading((prev) => ({ ...prev, [gardenId]: true }));
      }

      try {
        const data = await sensorService.getGardenSensorData(gardenId);

        // Update sensor data for this garden
        setGardenSensorData((prev) => ({
          ...prev,
          [gardenId]: data,
        }));

        // If this is the selected garden, also update sensorDataByType
        if (gardenId === selectedGardenId) {
          setSensorDataByType(data);
        }

        // Update last fetch time
        lastSensorFetchTime.current[gardenId] = now;

        // Clear loading and error states
        setSensorDataLoading((prev) => ({ ...prev, [gardenId]: false }));
        setSensorDataError((prev) => ({ ...prev, [gardenId]: null }));
      } catch (err) {
        console.error(
          `Error fetching sensor data for garden ${gardenId}:`,
          err
        );
        setSensorDataLoading((prev) => ({ ...prev, [gardenId]: false }));
        setSensorDataError((prev) => ({
          ...prev,
          [gardenId]: `Không thể tải dữ liệu cảm biến: ${err}`,
        }));
      }
    },
    [selectedGardenId]
  );

  // Fetch alerts for all gardens
  const fetchAlerts = useCallback(async () => {
    try {
      const alertsData = await alertService.getAlerts();

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

      // Fetch sensor data immediately for the selected garden
      fetchGardenSensorData(gardenId, true);

      // Fetch weather data if needed
      if (!gardenWeatherData[gardenId]?.current) {
        fetchCompleteWeatherData(gardenId);
      }

      // Add this garden to watched gardens for polling
      watchedGardens.current.add(gardenId);
    },
    [
      setLastVisitedGarden,
      fetchRecentActivities,
      fetchUpcomingSchedules,
      fetchGardenSensorData,
      fetchCompleteWeatherData,
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
  const fetchWeatherAdvice = useCallback(
    async (gardenId: number) => {
      // Skip if already loading
      if (weatherDetailLoading[gardenId]) return;

      try {
        setWeatherDetailLoading((prev: Record<number, boolean>) => ({
          ...prev,
          [gardenId]: true,
        }));
        setWeatherDetailError((prev: Record<number, string | null>) => ({
          ...prev,
          [gardenId]: null,
        }));

        // Get the current weather for this garden
        const gardenWeather = gardenWeatherData[gardenId]?.current;

        // Find the garden to get its type
        const garden = gardens.find((g) => g.id === gardenId);

        if (!gardenWeather) {
          // If we don't have weather data yet, fetch it first
          await fetchCompleteWeatherData(gardenId);
          // Now try again with the fetched data
          if (gardenWeatherData[gardenId]?.current) {
            const advice = await weatherService.getWeatherAdvice(
              gardenId,
              gardenWeatherData[gardenId].current,
              garden?.type
            );

            setWeatherAdviceByGarden(
              (prev: Record<number, WeatherAdvice[]>) => ({
                ...prev,
                [gardenId]: advice,
              })
            );
          }
        } else {
          // We have weather data, get advice
          const advice = await weatherService.getWeatherAdvice(
            gardenId,
            gardenWeather,
            garden?.type
          );

          setWeatherAdviceByGarden((prev: Record<number, WeatherAdvice[]>) => ({
            ...prev,
            [gardenId]: advice,
          }));
        }
      } catch (error) {
        console.error(
          `Error fetching weather advice for garden ${gardenId}:`,
          error
        );
        setWeatherDetailError((prev: Record<number, string | null>) => ({
          ...prev,
          [gardenId]: "Không thể tải lời khuyên thời tiết",
        }));
      } finally {
        setWeatherDetailLoading((prev: Record<number, boolean>) => ({
          ...prev,
          [gardenId]: false,
        }));
      }
    },
    [gardens, gardenWeatherData, weatherDetailLoading, fetchCompleteWeatherData]
  );

  // Calculate optimal times for garden activities
  const calculateOptimalTimes = useCallback(
    async (gardenId: number, activityType: string) => {
      // Skip if already loading
      if (weatherDetailLoading[gardenId]) return;

      try {
        setWeatherDetailLoading((prev: Record<number, boolean>) => ({
          ...prev,
          [gardenId]: true,
        }));
        setWeatherDetailError((prev: Record<number, string | null>) => ({
          ...prev,
          [gardenId]: null,
        }));

        // If we don't have weather data yet for this garden, fetch it
        if (!gardenWeatherData[gardenId]) {
          await fetchCompleteWeatherData(gardenId);
        }

        // Calculate optimal times for this activity
        const optimalTimes = await weatherService.getOptimalGardeningTimes(
          gardenId,
          activityType
        );

        // Update state with the results
        setOptimalGardenTimes(
          (prev: Record<number, Record<string, OptimalGardenTime[]>>) => {
            // Get or create the activities map for this garden
            const gardenActivities = prev[gardenId] || {};

            // Update the specific activity type
            return {
              ...prev,
              [gardenId]: {
                ...gardenActivities,
                [activityType]: optimalTimes,
              },
            };
          }
        );
      } catch (error) {
        console.error(
          `Error calculating optimal times for ${activityType} in garden ${gardenId}:`,
          error
        );
        setWeatherDetailError((prev: Record<number, string | null>) => ({
          ...prev,
          [gardenId]: `Không thể tính toán thời gian tối ưu cho ${activityType}`,
        }));
      } finally {
        setWeatherDetailLoading((prev: Record<number, boolean>) => ({
          ...prev,
          [gardenId]: false,
        }));
      }
    },
    [gardenWeatherData, weatherDetailLoading, fetchCompleteWeatherData]
  );

  // Helper function to get threshold for sensor type
  const getThresholdForSensorType = (type: SensorType): number => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return 0.3; // Very sensitive to temperature changes
      case SensorType.HUMIDITY:
        return 1.0;
      case SensorType.SOIL_MOISTURE:
        return 1.0;
      case SensorType.LIGHT:
        return 50; // Light can fluctuate a lot
      case SensorType.SOIL_PH:
        return 0.2; // Sensitive to pH changes
      case SensorType.WATER_LEVEL:
        return 0.05; // Sensitive to water level changes
      default:
        return 1.0;
    }
  };

  // Setup polling for sensor data - improved version with force updating
  useEffect(() => {
    // Function to poll sensor data for watched gardens
    const pollSensorData = async () => {
      // Only poll if there are watched gardens
      if (watchedGardens.current.size === 0) return;

      // Poll each watched garden
      for (const gardenId of watchedGardens.current) {
        try {
          // Limit frequency of polling to avoid overwhelming backend
          const now = Date.now();
          const lastFetch = lastSensorFetchTime.current[gardenId] || 0;

          // Nếu thời gian giữa hai lần fetch nhỏ hơn 1.5 giây, bỏ qua
          if (now - lastFetch < 1500) {
            continue;
          }

          // Fetch data without setting loading state to avoid visual flicker
          const newData = await sensorService.getGardenSensorData(gardenId);

          // Update last fetch time
          lastSensorFetchTime.current[gardenId] = now;

          // Using a functional update pattern to avoid race conditions
          setGardenSensorData((prev) => {
            // Create a shallow copy of the previous data for this garden
            const prevGardenData = prev[gardenId] || {};

            // New garden data object
            const updatedGardenData: Record<string, SensorData[]> = {};

            // Track if important sensors have changed significantly
            let hasSignificantChanges = false;

            // Process each sensor type
            for (const sensorType of Object.keys(newData)) {
              const typedSensorType = sensorType as SensorType;
              const newSensorData = newData[typedSensorType];

              // Skip if no data for this sensor type
              if (!newSensorData || newSensorData.length === 0) {
                updatedGardenData[typedSensorType] =
                  prevGardenData[typedSensorType] || [];
                continue;
              }

              // Get previous data for this sensor type
              const prevSensorData = prevGardenData[typedSensorType] || [];

              // Sort new data by timestamp
              const sortedNewData = [...newSensorData].sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              );

              // Get latest readings
              const latestNewReading = sortedNewData[0];
              const latestPrevReading =
                prevSensorData.length > 0
                  ? [...prevSensorData].sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )[0]
                  : null;

              // Check if this is new data
              if (
                !latestPrevReading ||
                new Date(latestNewReading.timestamp).getTime() >
                  new Date(latestPrevReading.timestamp).getTime()
              ) {
                // Merge and sort data
                updatedGardenData[typedSensorType] = [
                  ...sortedNewData,
                  ...prevSensorData,
                ]
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .slice(0, 20); // Keep only 20 latest readings

                // Check for significant changes on important sensors
                const importantTypes = [
                  SensorType.TEMPERATURE,
                  SensorType.HUMIDITY,
                  SensorType.SOIL_MOISTURE,
                  SensorType.LIGHT,
                  SensorType.SOIL_PH,
                  SensorType.WATER_LEVEL,
                ];

                if (importantTypes.includes(typedSensorType)) {
                  // If no previous reading or value changed meaningfully
                  if (!latestPrevReading) {
                    hasSignificantChanges = true;
                  } else {
                    const valueDiff = Math.abs(
                      latestNewReading.value - latestPrevReading.value
                    );

                    // Set thresholds for different sensor types
                    const threshold =
                      getThresholdForSensorType(typedSensorType);

                    if (valueDiff >= threshold) {
                      hasSignificantChanges = true;

                      // Check if status changed (normal/warning/critical)
                      const prevStatus = getSensorStatus(
                        latestPrevReading.value,
                        typedSensorType
                      );
                      const newStatus = getSensorStatus(
                        latestNewReading.value,
                        typedSensorType
                      );

                      if (prevStatus !== newStatus) {
                        // Cập nhật số cảnh báo và danh sách cảnh báo nếu trạng thái thay đổi
                        setGardens((gardens) =>
                          gardens.map((garden) => {
                            if (garden.id === gardenId) {
                              // Tính toán lại số cảnh báo
                              let alertChange = 0;
                              if (
                                newStatus !== "normal" &&
                                prevStatus === "normal"
                              ) {
                                alertChange = 1; // Thêm cảnh báo
                              } else if (
                                newStatus === "normal" &&
                                prevStatus !== "normal"
                              ) {
                                alertChange = -1; // Bớt cảnh báo
                              }

                              return {
                                ...garden,
                                alertCount: Math.max(
                                  0,
                                  garden.alertCount + alertChange
                                ),
                              };
                            }
                            return garden;
                          })
                        );
                      }
                    }
                  }
                }
              } else {
                // No new readings for this sensor type
                updatedGardenData[typedSensorType] = prevSensorData;
              }
            }

            // Update sensorDataByType if selected garden has significant changes
            if (hasSignificantChanges && gardenId === selectedGardenId) {
              // Sử dụng setTimeout để đảm bảo state update không block UI thread
              setTimeout(() => {
                setSensorDataByType(updatedGardenData);
              }, 0);
            }

            // Return updated state
            return {
              ...prev,
              [gardenId]: updatedGardenData,
            };
          });
        } catch (err) {
          console.error(
            `Error polling sensor data for garden ${gardenId}:`,
            err
          );
          // Chỉ cập nhật trạng thái lỗi nếu garden đang được xem
          if (gardenId === selectedGardenId) {
            setSensorDataError((prev) => ({
              ...prev,
              [gardenId]: `Không thể tải dữ liệu cảm biến: ${err}`,
            }));
          }
        }
      }
    };

    // Start polling immediately
    pollSensorData();

    // Setup interval for subsequent polls
    pollingTimerRef.current = setInterval(
      pollSensorData,
      SENSOR_POLLING_INTERVAL
    );

    // Cleanup on unmount
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      // Clear watched gardens
      watchedGardens.current.clear();
    };
  }, [selectedGardenId]); // Only depend on selectedGardenId to avoid unnecessary recreation

  // Add effect to update watched gardens when selected garden changes
  useEffect(() => {
    if (selectedGardenId) {
      watchedGardens.current.add(selectedGardenId);
    }
  }, [selectedGardenId]);

  // Function to refresh data
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();

    // Reset watched gardens to ensure we're only watching the selected garden
    watchedGardens.current.clear();
    if (selectedGardenId) {
      watchedGardens.current.add(selectedGardenId);
      // Refresh sensor data for selected garden
      await fetchGardenSensorData(selectedGardenId, true);
    }

    setRefreshing(false);
  }, [fetchData, fetchGardenSensorData, selectedGardenId]);

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
    // Garden advice
    gardenAdvice,
    fetchGardenAdvice,
    adviceLoading,
    adviceError,
    // Thêm state và functions mới
    gardenWeatherData,
    gardenSensorData,
    // Add new loading and error states for sensors
    sensorDataLoading,
    sensorDataError,
    // Add weather advice and optimal times states and functions
    weatherAdviceByGarden,
    optimalGardenTimes,
    weatherDetailLoading,
    weatherDetailError,
    fetchWeatherAdvice,
    calculateOptimalTimes,
  };
}
