import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SectionList,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Feather,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import * as ImagePicker from "expo-image-picker";

// Import custom components
import WeatherDisplay from "@/components/garden/WeatherDisplay";
import SensorDetailView, {
  SensorInfo,
} from "@/components/garden/SensorDetailView";
import GardenStatusCard from "@/components/garden/GardenStatusCard";
import AlertsList from "@/components/garden/AlertsList";
import ActivityList from "@/components/garden/ActivityList";

// Import enums and potentially types from the central database constants/types file
import {
  ActivityType,
  TaskStatus,
  SensorType,
  GardenStatus,
  GardenType,
  AlertType,
  AlertStatus,
  NotificationMethod,
} from "@/constants/database";

// Temporarily remove import from '@/constants/types' as module not found
// import {
//   Garden,
//   SensorData,
//   WateringSchedule,
//   WeatherObservation,
// } from "@/constants/types";

// --- Define Local Interfaces based on Usage ---
interface AlertListItem {
  id: string;
  type: AlertType;
  message: string;
  suggestion?: string;
  timestamp: string;
  status: AlertStatus;
}

interface ActivityListItem {
  id: string;
  name: string;
  type: ActivityType;
  icon:
    | keyof typeof MaterialCommunityIcons.glyphMap
    | keyof typeof Ionicons.glyphMap;
  timestamp: string;
  details: string;
}

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Mock Garden Detail Data Generator
const generateMockGarden = (id: string): any => {
  const gardenTypes = Object.values(GardenType);
  const gardenStatuses = Object.values(GardenStatus);
  const plantNames = [
    "Cà chua",
    "Húng quế",
    "Bạc hà",
    "Xà lách",
    "Dâu tây",
    "Dưa chuột",
  ];
  const growthStages = [
    "Gieo hạt",
    "Nảy mầm",
    "Sinh trưởng",
    "Ra hoa",
    "Đậu quả",
    "Thu hoạch",
  ];
  const cities = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"];
  const districts = ["Quận 1", "Thủ Đức", "Bình Thạnh", "Hai Bà Trưng"];
  const wards = ["Phường 1", "An Khánh", "Phường 26", "Bạch Mai"];

  const now = new Date();
  const sixMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 6,
    now.getDate()
  );
  const twoMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 2,
    now.getDate()
  );
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );

  const gardenIdInt = parseInt(id, 10) || 1;
  const plantIdx = gardenIdInt % plantNames.length;
  const typeIdx = gardenIdInt % gardenTypes.length;
  const statusIdx = gardenIdInt % gardenStatuses.length;

  return {
    id: gardenIdInt,
    gardenKey: `VUON_${id.padStart(4, "0")}`,
    name: `Vườn ${id} - ${plantNames[plantIdx]}`,
    street: `${Math.floor(Math.random() * 100) + 1} Đường Vườn Xanh`,
    ward: wards[gardenIdInt % wards.length],
    district: districts[gardenIdInt % districts.length],
    city: cities[gardenIdInt % cities.length],
    lat: 10.8 + (Math.random() - 0.5) * 0.1,
    lng: 106.7 + (Math.random() - 0.5) * 0.1,
    gardenerId: 1,
    type: gardenTypes[typeIdx],
    status: gardenStatuses[statusIdx],
    plantName: plantNames[plantIdx],
    plantGrowStage: growthStages[gardenIdInt % growthStages.length],
    plantStartDate: randomDate(oneMonthAgo, now),
    plantDuration: Math.floor(Math.random() * 60) + 60,
    createdAt: randomDate(sixMonthsAgo, twoMonthsAgo),
    updatedAt: now,
    sensors: [],
    sensorData: [],
    alerts: [],
    activities: [],
    weatherData: [],
    hourlyForecast: [],
    dailyForecast: [],
    task: [],
    wateringSchedule: [],
    post: [],
  };
};

// Mock Weather Observation Generator
const generateMockWeatherObservation = (): any => {
  // Replace WeatherMain enum with hardcoded values as import failed
  const weatherMains = [
    "Clear",
    "Clouds",
    "Rain",
    "Drizzle",
    "Thunderstorm",
    "Snow",
    "Atmosphere",
  ];
  const weatherDescs = [
    "trời quang",
    "ít mây",
    "mây rải rác",
    "nhiều mây",
    "mưa rào",
    "mưa",
    "dông",
    "tuyết",
    "sương mù",
  ];
  const iconCodes = [
    "01d",
    "02d",
    "03d",
    "04d",
    "09d",
    "10d",
    "11d",
    "13d",
    "50d",
  ];
  const randomIdx = Math.floor(Math.random() * weatherMains.length);

  return {
    id: Math.floor(Math.random() * 10000),
    gardenId: 0,
    observedAt: new Date(),
    temp: parseFloat((Math.random() * 15 + 20).toFixed(1)),
    feelsLike: parseFloat((Math.random() * 15 + 20).toFixed(1)),
    dewPoint: parseFloat((Math.random() * 10 + 15).toFixed(1)),
    pressure: Math.round(Math.random() * 50 + 1000),
    humidity: Math.round(Math.random() * 40 + 40),
    clouds: Math.round(Math.random() * 100),
    visibility: Math.round(Math.random() * 10000),
    uvi: parseFloat((Math.random() * 11).toFixed(1)),
    windSpeed: parseFloat((Math.random() * 10).toFixed(1)),
    windDeg: Math.round(Math.random() * 360),
    windGust:
      Math.random() < 0.7
        ? parseFloat((Math.random() * 15).toFixed(1))
        : undefined,
    rain1h:
      Math.random() < 0.3
        ? parseFloat((Math.random() * 20).toFixed(1))
        : undefined,
    snow1h:
      Math.random() < 0.1
        ? parseFloat((Math.random() * 10).toFixed(1))
        : undefined,
    weatherMain: weatherMains[randomIdx],
    weatherDesc: weatherDescs[randomIdx % weatherDescs.length],
    iconCode: iconCodes[randomIdx % iconCodes.length],
    GardenActivity: [],
  };
};

// Mock Sensor Info Generator (for SensorDetailView component)
const generateMockSensors = (gardenId: string): SensorInfo[] => {
  const sensorTypes = Object.values(SensorType);
  const sensors: SensorInfo[] = [];
  const now = Date.now();
  let numericIdCounter = 0;

  sensorTypes.forEach((type, index) => {
    if (type === SensorType.SOIL_PH && Math.random() > 0.5) return;
    if (type === SensorType.RAINFALL && Math.random() > 0.6) return;
    if (type === SensorType.WATER_LEVEL && Math.random() > 0.7) return;

    numericIdCounter++;
    let value: number;
    let unit: string;
    let icon: string;
    let name: string;
    const statuses: ("normal" | "warning" | "critical")[] = [
      "normal",
      "warning",
      "critical",
    ];
    // Note: SensorInfo doesn't have a status field either, this is just for local mock logic
    // const status = statuses[Math.floor(Math.random() * statuses.length)];

    switch (type) {
      case SensorType.TEMPERATURE:
        value = parseFloat((Math.random() * 15 + 18).toFixed(1));
        unit = "°C";
        icon = "thermometer";
        name = "Nhiệt độ";
        break;
      case SensorType.HUMIDITY:
        value = Math.round(Math.random() * 50 + 40);
        unit = "%";
        icon = "water-percent";
        name = "Độ ẩm";
        break;
      case SensorType.SOIL_MOISTURE:
        value = Math.round(Math.random() * 60 + 20);
        unit = "%";
        icon = "water";
        name = "Độ ẩm đất";
        break;
      case SensorType.LIGHT:
        value = Math.round(Math.random() * 20000 + 5000);
        unit = " lux";
        icon = "white-balance-sunny";
        name = "Ánh sáng";
        break;
      case SensorType.WATER_LEVEL:
        value = parseFloat((Math.random() * 10 + 5).toFixed(1));
        unit = " cm";
        icon = "waves";
        name = "Mực nước";
        break;
      case SensorType.RAINFALL:
        value = parseFloat((Math.random() * 5).toFixed(1));
        unit = " mm/h";
        icon = "weather-pouring";
        name = "Lượng mưa";
        break;
      case SensorType.SOIL_PH:
        value = parseFloat((Math.random() * 1.5 + 5.5).toFixed(1));
        unit = " pH";
        icon = "flask-outline";
        name = "Độ pH Đất";
        break;
      default:
        value = 0;
        unit = "";
        icon = "help-circle-outline";
        name = "Unknown";
    }

    // Generate mock readings for SensorInfo
    const mockReadings: { timestamp: string; value: number }[] = [];
    const baseTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    for (let h = 0; h < 24; h++) {
      mockReadings.push({
        timestamp: new Date(baseTime + h * 60 * 60 * 1000).toISOString(),
        value: parseFloat(
          (value + (Math.random() - 0.5) * (value * 0.1)).toFixed(1)
        ), // Value +/- 10%
      });
    }

    sensors.push({
      // id: `${gardenId}-${type}-${index}`, // <-- Original string ID causing error
      id: numericIdCounter * 1000 + index, // <-- Generate a simple numeric ID
      type: type,
      // Properties expected by SensorInfo interface:
      sensorKey: `${type.toLowerCase()}_${gardenId}_${index}`,
      createdAt: new Date(
        now - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(), // Within last month
      updatedAt: new Date(now - Math.random() * 60 * 1000).toISOString(), // Within last minute
      lastReading: mockReadings[mockReadings.length - 1]?.value ?? value, // Use last reading or current generated value
      readings: mockReadings,
      // Properties NOT in SensorInfo (remove name, value, unit, status, icon, lastUpdated):
      // name: name, // Error: 'name' does not exist in type 'SensorInfo'.
      // value: value,
      // unit: unit,
      // status: status,
      // icon: icon, // Not part of SensorInfo
      // lastUpdated: new Date(now - Math.random() * 60 * 60 * 1000).toISOString(),
    });
  });

  return sensors;
};

// Mock Alerts Generator (Using AlertListItem type for component)
const generateMockAlerts = (gardenId: string): AlertListItem[] => {
  const alerts: AlertListItem[] = [];
  const alertTypes = Object.values(AlertType).filter(
    (t) => t !== AlertType.OTHER
  );
  const alertStatuses = Object.values(AlertStatus).filter(
    (s) => s !== AlertStatus.RESOLVED && s !== AlertStatus.IGNORED
  );
  const count = Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const status =
      alertStatuses[Math.floor(Math.random() * alertStatuses.length)];
    let message = "";
    let suggestion: string | undefined = undefined;

    switch (type) {
      case AlertType.WEATHER:
        message = "Dự báo có mưa lớn sắp tới.";
        suggestion = "Che chắn cây trồng nếu cần.";
        break;
      case AlertType.SENSOR_ERROR:
        message = `Cảm biến ${SensorType.TEMPERATURE} mất kết nối.`;
        suggestion = "Kiểm tra nguồn và kết nối.";
        break;
      case AlertType.PLANT_CONDITION:
        message = "Phát hiện dấu hiệu sâu bệnh trên lá.";
        suggestion = "Kiểm tra và xử lý sớm.";
        break;
      case AlertType.ACTIVITY:
        message = "Lượng nước tưới có vẻ hơi nhiều.";
        break;
      case AlertType.MAINTENANCE:
        message = "Đã đến lúc kiểm tra pin cảm biến.";
        break;
      case AlertType.SYSTEM:
        message = "Mất điện tạm thời tại khu vườn.";
        break;
      case AlertType.SECURITY:
        message = "Phát hiện chuyển động bất thường.";
        break;
      default:
        message = "Cảnh báo chung.";
    }

    alerts.push({
      id: `${gardenId}-alert-${i}`,
      type: type,
      message: message,
      suggestion: suggestion,
      timestamp: new Date(
        Date.now() - Math.random() * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: status,
    });
  }
  return alerts;
};

// Mock Watering Schedule Generator
const generateMockWateringSchedule = (gardenId: string): any[] => {
  const schedules: any[] = [];
  const count = Math.floor(Math.random() * 5) + 1; // 1 to 5 schedules

  for (let i = 0; i < count; i++) {
    const isPast = Math.random() > 0.4;
    const scheduledAt = new Date(
      Date.now() + (isPast ? -1 : 1) * (i + 1) * 12 * 60 * 60 * 1000
    );
    let status: "PENDING" | "COMPLETED" | "SKIPPED";
    if (isPast) {
      status = Math.random() > 0.3 ? "COMPLETED" : "SKIPPED";
    } else {
      status = "PENDING";
    }

    schedules.push({
      id: Date.now() + i, // Use timestamp + index for robust unique numeric ID
      gardenId: parseInt(gardenId),
      scheduledAt: scheduledAt,
      amount: parseFloat((Math.random() * 1 + 0.2).toFixed(1)),
      status: status as TaskStatus,
      createdAt: new Date(scheduledAt.getTime() - 60 * 60 * 1000),
      updatedAt: new Date(),
      tasks: [],
      garden: {} as any,
    });
  }
  return schedules.sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()
  );
};

// Mock Activities Generator
const generateMockActivities = (gardenId: string): ActivityListItem[] => {
  const activities: ActivityListItem[] = [];
  const activityTypes = Object.values(ActivityType);
  const count = Math.floor(Math.random() * 8) + 3;

  for (let i = 0; i < count; i++) {
    const type =
      activityTypes[Math.floor(Math.random() * activityTypes.length)];
    let name = "";
    let icon:
      | keyof typeof MaterialCommunityIcons.glyphMap
      | keyof typeof Ionicons.glyphMap = "leaf-outline";

    switch (type) {
      case ActivityType.PLANTING:
        name = "Trồng cây mới";
        icon = "sprout";
        break;
      case ActivityType.WATERING:
        name = "Tưới nước";
        icon = "water";
        break;
      case ActivityType.FERTILIZING:
        name = "Bón phân";
        icon = "flask-outline";
        break;
      case ActivityType.PRUNING:
        name = "Tỉa cành";
        icon = "content-cut";
        break;
      case ActivityType.HARVESTING:
        name = "Thu hoạch";
        icon = "basket-outline";
        break;
      // case ActivityType.PEST_CONTROL: // <-- Comment out - Property not found
      //   name = "Kiểm tra sâu bệnh";
      //   icon = "bug-outline";
      //   break;
      // case ActivityType.SOIL_TESTING: // <-- Error: Property 'SOIL_TESTING' does not exist...
      //   name = "Kiểm tra đất";
      //   icon = "test-tube";
      //  break;
      // name = "Kiểm tra sâu bệnh";
      // icon = "bug-outline";
      // break;
      // case ActivityType.SOIL_TESTING: // <-- Comment out - Property not found
      //   name = "Kiểm tra đất";
      //   icon = "test-tube";
      // break;
      // case ActivityType.WEEDING: // <-- Comment out - Property not found
      // name = "Nhổ cỏ";
      // icon = "grass";
      // break;
      //   name = "Nhổ cỏ";
      //   icon = "grass";
      // break;
      default:
        name = "Hoạt động khác";
    }

    activities.push({
      id: `${gardenId}-act-${i}`,
      name: name,
      type: type,
      icon: icon,
      timestamp: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      details: `Đã ${name.toLowerCase()} cho cây cà chua.`,
    });
  }
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

enum DetailSectionType {
  HEADER_INFO = "HEADER_INFO",
  STATUS = "STATUS",
  WEATHER = "WEATHER",
  ALERTS = "ALERTS",
  SCHEDULE = "SCHEDULE",
  SENSORS = "SENSORS",
  ACTIVITY = "ACTIVITY",
  ACTIONS = "ACTIONS",
}

interface DetailSection {
  type: DetailSectionType;
  key: string;
  data: any[];
}

export default function GardenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for garden data (using Prisma types where possible)
  const [garden, setGarden] = useState<any | null>(null);
  const [currentWeather, setCurrentWeather] = useState<any | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [dailyForecast, setDailyForecast] = useState<any[]>([]);
  const [sensors, setSensors] = useState<SensorInfo[]>([]);
  const [alerts, setAlerts] = useState<AlertListItem[]>([]);
  const [wateringSchedule, setWateringSchedule] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityListItem[]>([]);

  // Load garden data using mock generators
  const loadGardenData = useCallback(async (gardenId: string) => {
    if (!gardenId) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    try {
      const gardenData = generateMockGarden(gardenId);
      const weatherData = generateMockWeatherObservation();
      weatherData.gardenId = gardenData.id;
      const sensorData = generateMockSensors(gardenId);
      const alertData = generateMockAlerts(gardenId);
      const scheduleData = generateMockWateringSchedule(gardenId);
      const activityData = generateMockActivities(gardenId);

      setGarden(gardenData);
      setCurrentWeather(weatherData);
      setSensors(sensorData);
      setAlerts(alertData);
      setWateringSchedule(scheduleData);
      setActivities(activityData);
    } catch (error) {
      console.error("Failed to load garden data:", error);
      setGarden(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id && typeof id === "string") {
      loadGardenData(id);
    }
  }, [id, loadGardenData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (id && typeof id === "string") {
      loadGardenData(id).finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }, [id, loadGardenData]);

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, status: AlertStatus.RESOLVED }
          : alert
      )
    );
  };
  const handleIgnoreAlert = (alertId: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.filter((alert) => alert.id !== alertId)
    );
  };

  const getStatusColor = (
    status: TaskStatus | AlertStatus | GardenStatus | string
  ): string => {
    switch (status) {
      case TaskStatus.COMPLETED:
      case AlertStatus.RESOLVED:
      case GardenStatus.ACTIVE:
        return theme.success;
      case TaskStatus.SKIPPED:
      case AlertStatus.IGNORED:
        return theme.warning;
      case GardenStatus.INACTIVE:
        return theme.textTertiary;
      case TaskStatus.PENDING:
      case AlertStatus.PENDING:
      case AlertStatus.IN_PROGRESS:
      case AlertStatus.ESCALATED:
        return theme.primary;
      default:
        return theme.textSecondary;
    }
  };
  const getStatusText = (
    status: TaskStatus | AlertStatus | GardenStatus | string
  ): string => {
    switch (status) {
      case TaskStatus.PENDING:
        return "Chờ xử lý";
      case TaskStatus.COMPLETED:
        return "Hoàn thành";
      case TaskStatus.SKIPPED:
        return "Đã bỏ qua";
      case AlertStatus.PENDING:
        return "Mới";
      case AlertStatus.RESOLVED:
        return "Đã xử lý";
      case AlertStatus.IGNORED:
        return "Đã bỏ qua";
      case AlertStatus.IN_PROGRESS:
        return "Đang xử lý";
      case AlertStatus.ESCALATED:
        return "Đã chuyển cấp";
      case GardenStatus.ACTIVE:
        return "Hoạt động";
      case GardenStatus.INACTIVE:
        return "Ngừng";
      default:
        return String(status);
    }
  };

  const sections: DetailSection[] = useMemo(() => {
    if (!garden) return [];

    const activeAlerts = alerts.filter(
      (a) =>
        a.status !== AlertStatus.RESOLVED && a.status !== AlertStatus.IGNORED
    );
    const upcomingSchedules = wateringSchedule.filter(
      (ws) => ws.status === "PENDING" && new Date(ws.scheduledAt) > new Date()
    );

    let dataSections: DetailSection[] = [
      { type: DetailSectionType.STATUS, key: "status", data: [garden] },
      {
        type: DetailSectionType.WEATHER,
        key: "weather",
        data: [{ currentWeather, hourlyForecast, dailyForecast }],
      },
    ];

    if (activeAlerts.length > 0) {
      dataSections.push({
        type: DetailSectionType.ALERTS,
        key: "alerts",
        data: [activeAlerts],
      });
    }
    if (upcomingSchedules.length > 0) {
      dataSections.push({
        type: DetailSectionType.SCHEDULE,
        key: "schedule",
        data: [upcomingSchedules.slice(0, 3)],
      });
    } else {
      dataSections.push({
        type: DetailSectionType.SCHEDULE,
        key: "schedule-empty",
        data: [[]],
      });
    }

    dataSections.push({
      type: DetailSectionType.SENSORS,
      key: "sensors",
      data: [sensors],
    });

    if (activities.length > 0) {
      dataSections.push({
        type: DetailSectionType.ACTIVITY,
        key: "activity",
        data: [activities.slice(0, 5)],
      });
    } else {
      dataSections.push({
        type: DetailSectionType.ACTIVITY,
        key: "activity-empty",
        data: [[]],
      });
    }

    dataSections.push({
      type: DetailSectionType.ACTIONS,
      key: "actions",
      data: [{ gardenId: id }],
    });

    return dataSections;
  }, [
    garden,
    currentWeather,
    hourlyForecast,
    dailyForecast,
    alerts,
    wateringSchedule,
    sensors,
    activities,
    id,
  ]);

  const renderSectionItem = ({
    section,
    item,
  }: {
    section: DetailSection;
    item: any;
  }) => {
    switch (section.type) {
      case DetailSectionType.STATUS:
        return (
          <View style={styles.sectionContentPadding}>
            <GardenStatusCard
              garden={item}
              onViewPlantDetails={() => {
                console.log("Navigate to plant details for:", item.plantName);
              }}
            />
          </View>
        );
      case DetailSectionType.WEATHER:
        return (
          <View style={styles.sectionContentPadding}>
            {item.currentWeather ? (
              <WeatherDisplay
                currentWeather={item.currentWeather}
                hourlyForecast={item.hourlyForecast}
                dailyForecast={item.dailyForecast}
              />
            ) : (
              <Text style={styles.noDataText}>Loading weather...</Text>
            )}
          </View>
        );
      case DetailSectionType.ALERTS:
        return (
          <AlertsList
            alerts={item}
            onResolveAlert={handleResolveAlert}
            onIgnoreAlert={handleIgnoreAlert}
          />
        );
      case DetailSectionType.SCHEDULE:
        const schedulesToRender = item;
        if (!schedulesToRender || schedulesToRender.length === 0) {
          return (
            <Text style={[styles.noDataText, styles.sectionContentPadding]}>
              Chưa có lịch tưới nào sắp tới.
            </Text>
          );
        }
        return (
          <View style={styles.listSectionContainer}>
            {schedulesToRender.map((scheduleItem: any) => (
              <View key={scheduleItem.id} style={styles.scheduleItem}>
                <MaterialIcons
                  name="water-drop"
                  size={20}
                  color={theme.primary}
                />
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleTime}>
                    {new Date(scheduleItem.scheduledAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(scheduleItem.scheduledAt).toLocaleDateString([], {
                      weekday: "short",
                      month: "numeric",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.scheduleAmount}>
                    {scheduleItem.amount} L
                  </Text>
                </View>
                <View style={styles.scheduleStatusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(scheduleItem.status) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.scheduleStatusText,
                      { color: getStatusColor(scheduleItem.status) },
                    ]}
                  >
                    {getStatusText(scheduleItem.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        );
      case DetailSectionType.SENSORS:
        return (
          <SensorDetailView
            sensors={item}
            onSelectSensor={(sensor) => router.push(`/sensors/${sensor.id}`)}
          />
        );
      case DetailSectionType.ACTIVITY:
        const activitiesToRender = item;
        if (!activitiesToRender || activitiesToRender.length === 0) {
          return (
            <Text style={[styles.noDataText, styles.sectionContentPadding]}>
              Chưa có hoạt động nào gần đây.
            </Text>
          );
        }
        return <ActivityList activities={activitiesToRender} />;
      case DetailSectionType.ACTIONS:
        return (
          <View
            style={[styles.bottomActionContainer, styles.sectionContentPadding]}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.primaryLight },
              ]}
              onPress={() =>
                console.log("Go to add activity for garden:", item.gardenId)
              }
            >
              <FontAwesome5 name="plus" size={16} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                Thêm hoạt động
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.primaryLight },
              ]}
              onPress={() => console.log("Image upload TBD")}
            >
              <FontAwesome5 name="camera" size={16} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                Tải ảnh lên
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const renderSectionHeader = ({ section }: { section: DetailSection }) => {
    let title = "";
    let showButton = false;
    let buttonText = "Xem tất cả";
    let buttonIcon: any = null;
    let buttonOnPress = () => {};
    let hasData = section.data[0]?.length > 0;

    switch (section.type) {
      case DetailSectionType.ALERTS:
        title = "Cảnh báo Đang hoạt động";
        if (!hasData) return null;
        break;
      case DetailSectionType.SCHEDULE:
        title = "Lịch tưới sắp tới";
        showButton = true;
        buttonText = "Quản lý lịch";
        buttonIcon = (
          <MaterialIcons name="schedule" size={18} color={theme.primary} />
        );
        buttonOnPress = () =>
          router.push(`/(modules)/gardens/schedule?id=${id}`);
        break;
      case DetailSectionType.SENSORS:
        title = "Số liệu Cảm biến";
        if (!hasData) return null;
        break;
      case DetailSectionType.ACTIVITY:
        title = "Hoạt động Gần đây";
        showButton = true;
        buttonText = "Xem tất cả";
        buttonIcon = (
          <MaterialIcons name="history" size={18} color={theme.primary} />
        );
        buttonOnPress = () => console.log("Navigate to full activity history");
        break;
      default:
        return null;
    }

    return (
      <View
        style={[styles.sectionContainerHeader, styles.sectionContentPadding]}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        {section.type === DetailSectionType.ALERTS &&
          section.data[0]?.length > 0 && (
            <View
              style={[
                styles.headerAlertCountBadge,
                { backgroundColor: theme.error },
              ]}
            >
              <Text style={styles.headerAlertCountText}>
                {section.data[0].length}
              </Text>
            </View>
          )}
        {showButton && (
          <TouchableOpacity
            onPress={buttonOnPress}
            style={styles.sectionHeaderButton}
          >
            {buttonIcon}
            <Text style={styles.sectionHeaderButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={24} color={theme.primary} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text
          style={[styles.headerTitle, { color: theme.text }]}
          numberOfLines={1}
        >
          {garden?.name}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {garden?.district
            ? `${garden.district}, ${garden.city}`
            : garden?.city}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => router.push(`/(modules)/gardens/edit/${id}`)}
      >
        <Feather name="edit-2" size={20} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !garden) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết vườn...</Text>
      </View>
    );
  }

  if (!garden) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Feather name="alert-triangle" size={40} color={theme.error} />
        <Text style={styles.errorText}>Không thể tải dữ liệu vườn.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonOnError}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: garden.name, headerShown: false }} />
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => {
          // Ensure a unique string key even if item.id is missing/invalid
          const keySuffix =
            typeof item?.id === "string" || typeof item?.id === "number"
              ? item.id.toString()
              : `idx-${index}`;
          return keySuffix;
        }}
        renderItem={renderSectionItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContentContainer}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        SectionSeparatorComponent={() => (
          <View style={styles.sectionSeparator} />
        )}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundAlt,
    },
    listContentContainer: {
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    errorText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.error,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
      marginHorizontal: 20,
    },
    backButtonOnError: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    backButtonText: {
      color: theme.card,
      fontSize: 16,
      fontFamily: "Inter-Medium",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: Platform.OS === "ios" ? 50 : 40,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    headerButton: {
      padding: 5,
    },
    headerTitleContainer: {
      flex: 1,
      marginHorizontal: 12,
      alignItems: "center",
    },
    headerTitle: { fontSize: 18, fontFamily: "Inter-Bold", color: theme.text },
    headerSubtitle: {
      fontSize: 13,
      marginTop: 2,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    sectionContainerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 12,
      paddingTop: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      marginBottom: 10,
    },
    sectionContentPadding: {
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
      color: theme.text,
      flexShrink: 1,
    },
    headerAlertCountBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
      paddingHorizontal: 5,
    },
    headerAlertCountText: {
      color: theme.card,
      fontSize: 12,
      fontFamily: "Inter-Bold",
    },
    sectionHeaderButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: theme.cardAlt,
    },
    sectionHeaderButtonText: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginLeft: 4,
    },
    scheduleItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      marginHorizontal: 16,
    },
    scheduleInfo: {
      flex: 1,
      marginLeft: 12,
    },
    scheduleTime: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 2,
    },
    scheduleAmount: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    scheduleStatusContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: theme.backgroundAlt,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 5,
    },
    scheduleStatusText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
    },
    listSectionContainer: {},
    bottomActionContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 16,
      paddingBottom: 10,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      backgroundColor: theme.background,
      marginTop: 10,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: theme.primaryLight,
    },
    actionButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
    },
    itemSeparator: {
      height: 8,
    },
    sectionSeparator: {
      height: 10,
      backgroundColor: theme.backgroundAlt,
    },
    noDataText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      paddingVertical: 20,
    },
  });
