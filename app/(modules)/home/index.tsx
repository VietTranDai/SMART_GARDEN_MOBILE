import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import env from "@/config/environment";

// Import proper types from schema
import { AlertStatus, AlertType } from "@/types/gardens/alert.types";
import { Garden, GardenStatus, GardenType } from "@/types/gardens/garden.types";
import {
  Sensor,
  SensorData,
  SensorType,
  SensorUnit,
} from "@/types/gardens/sensor.types";
import { WeatherObservation } from "@/types/weather/weather.types";
import { Alert } from "@/types/gardens/alert.types";

// Import services
import {
  alertService,
  gardenService,
  sensorService,
  weatherService,
} from "@/service/api";
import { API_URL } from "@env";

// Import new components
import EnhancedGardenCard from "@/components/garden/EnhancedGardenCard";
import EnhancedSensorCard from "@/components/garden/EnhancedSensorCard";
import EnhancedWeatherCard from "@/components/home/EnhancedWeatherCard";
import GardeningTipCard from "@/components/home/GardeningTipCard";
import QuickActionsBar from "@/components/home/QuickActionsBar";

// Define Section Types
enum SectionType {
  HEADER = "HEADER",
  GARDENS = "GARDENS",
  SENSORS = "SENSORS",
  QUICK_ACTIONS = "QUICK_ACTIONS",
  TIPS = "TIPS",
  WEATHER = "WEATHER",
}

// Structure for the main FlatList data
interface Section {
  type: SectionType;
  key: string;
  data?: any;
}

// Define a display interface for sensor data
interface SensorDisplay {
  id: string;
  gardenId: number;
  gardenName: string;
  type: SensorType;
  icon: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  timestamp: string;
  trendData?: Array<{ value: number; timestamp: string }>;
}

// Define a combined garden view interface
interface GardenDisplay extends Garden {
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
}

// Thêm mapping SensorUnit to display string
const UNIT_DISPLAY = {
  [SensorUnit.CELSIUS]: "°C",
  [SensorUnit.PERCENT]: "%",
  [SensorUnit.LUX]: "lux",
  [SensorUnit.METER]: "m",
  [SensorUnit.MILLIMETER]: "mm",
  [SensorUnit.PH]: "pH",
};

export default function HomeScreen() {
  const theme = useAppTheme();
  const { user } = useUser();
  const { homePreferences, togglePinnedGarden, setLastVisitedGarden } =
    usePreferences();

  // Track animation refs
  const refreshAnimationRef = useRef(new Animated.Value(0)).current;
  const notificationPulse = useRef(new Animated.Value(1)).current;
  const sectionAnimationRefs = useRef({
    header: new Animated.Value(0),
    weather: new Animated.Value(0),
    gardens: new Animated.Value(0),
    sensors: new Animated.Value(0),
    quickActions: new Animated.Value(0),
    tips: new Animated.Value(0),
  }).current;

  const styles = useMemo(() => createStyles(theme), [theme]);

  // State for real API data
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
  }, [selectedGardenId, homePreferences]);

  // Function to handle garden selection
  const handleSelectGarden = useCallback(
    (gardenId: number) => {
      setSelectedGardenId(gardenId);

      // Save to preferences
      setLastVisitedGarden(gardenId);

      // Update garden's lastVisitedAt timestamp
      setGardens((prev) =>
        prev.map((garden) =>
          garden.id === gardenId
            ? { ...garden, lastVisitedAt: new Date().toISOString() }
            : garden
        )
      );
    },
    [setLastVisitedGarden]
  );

  // Function to toggle pinned garden status
  const handleTogglePinGarden = useCallback(
    (gardenId: number) => {
      // Call the context function
      togglePinnedGarden(gardenId);

      // Update local state
      setGardens((prev) =>
        prev.map((garden) =>
          garden.id === gardenId
            ? { ...garden, isPinned: !garden.isPinned }
            : garden
        )
      );
    },
    [togglePinnedGarden]
  );

  // Fetch sensor data for selected garden
  const fetchSensorData = useCallback(async () => {
    if (!selectedGardenId) return;

    try {
      const data = await sensorService.getGardenSensorData(selectedGardenId);
      setSensorDataByType(data);

      // Update garden sensor data summaries
      setGardens((prev) =>
        prev.map((garden) => {
          if (garden.id === selectedGardenId) {
            // Extract the latest reading of each sensor type
            const sensorSummary = {
              temperature: data["TEMPERATURE"]?.[0]?.value,
              humidity: data["HUMIDITY"]?.[0]?.value,
              soilMoisture: data["SOIL_MOISTURE"]?.[0]?.value,
              light: data["LIGHT"]?.[0]?.value,
            };

            return {
              ...garden,
              sensorData: sensorSummary,
            };
          }
          return garden;
        })
      );
    } catch (err) {
      console.error("Failed to load sensor data:", err);
    }
  }, [selectedGardenId]);

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

  // Fetch weather data for selected garden
  const fetchWeatherData = useCallback(async () => {
    if (!selectedGardenId) return;

    try {
      const response = await weatherService.getCurrentWeather(selectedGardenId);

      // Kiểm tra xem dữ liệu thời tiết có tồn tại không và xử lý các cấu trúc phản hồi khác nhau
      if (response) {
        setWeatherData(response);
      } else {
        console.warn("Weather data is empty or invalid");
      }
    } catch (err) {
      console.error("Failed to load weather data:", err);
    }
  }, [selectedGardenId]);

  // Main data fetching function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First fetch gardens and alerts (they don't depend on selectedGardenId)
      await Promise.all([fetchGardens(), fetchAlerts()]);

      // Then fetch data that depends on selectedGardenId
      if (selectedGardenId) {
        await Promise.all([fetchSensorData(), fetchWeatherData()]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [
    fetchGardens,
    fetchSensorData,
    fetchWeatherData,
    fetchAlerts,
    selectedGardenId,
  ]);

  // Effect to fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect to fetch garden-specific data when selectedGardenId changes
  useEffect(() => {
    if (selectedGardenId) {
      Promise.all([fetchSensorData(), fetchWeatherData()]);
    }
  }, [selectedGardenId, fetchSensorData, fetchWeatherData]);

  // Animation for refresh
  const animateRefresh = useCallback(() => {
    refreshAnimationRef.setValue(0);
    Animated.timing(refreshAnimationRef, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Enhanced onRefresh with animation
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    animateRefresh();
    await fetchData();
    setRefreshing(false);
  }, [fetchData, animateRefresh]);

  const getLocationString = (garden: Garden) => {
    const parts = [];
    if (garden.district) parts.push(garden.district);
    if (garden.city) parts.push(garden.city);
    return parts.length > 0 ? parts.join(", ") : "Chưa có địa chỉ";
  };

  // Helper to determine sensor status
  const getSensorStatus = (
    value: number,
    type: SensorType
  ): "normal" | "warning" | "critical" => {
    // Improved thresholds based on plant science
    switch (type) {
      case SensorType.TEMPERATURE:
        if (value < 5 || value > 40) return "critical";
        if (value < 15 || value > 32) return "warning";
        return "normal";
      case SensorType.HUMIDITY:
        if (value < 20 || value > 90) return "critical";
        if (value < 30 || value > 80) return "warning";
        return "normal";
      case SensorType.SOIL_MOISTURE:
        if (value < 10 || value > 90) return "critical";
        if (value < 20 || value > 80) return "warning";
        return "normal";
      case SensorType.LIGHT:
        if (value < 1000 || value > 100000) return "critical";
        if (value < 5000 || value > 80000) return "warning";
        return "normal";
      case SensorType.SOIL_PH:
        if (value < 4 || value > 9) return "critical";
        if (value < 5.5 || value > 7.5) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  // Helper to get the sensor icon name
  const getSensorIconName = (sensorType: SensorType): string => {
    switch (sensorType) {
      case SensorType.TEMPERATURE:
        return "thermometer";
      case SensorType.HUMIDITY:
        return "water-percent";
      case SensorType.SOIL_MOISTURE:
        return "water-outline";
      case SensorType.LIGHT:
        return "white-balance-sunny";
      case SensorType.WATER_LEVEL:
        return "water";
      case SensorType.RAINFALL:
        return "weather-pouring";
      case SensorType.SOIL_PH:
        return "flask-outline";
      default:
        return "gauge";
    }
  };

  // Transform sensor data for UI display
  const getSensorDisplayData = useMemo((): SensorDisplay[] => {
    if (!selectedGardenId || !sensorDataByType) return [];

    const result: SensorDisplay[] = [];
    const selectedGarden = gardens.find((g) => g.id === selectedGardenId);

    // Process different sensor types
    Object.entries(sensorDataByType).forEach(([typeKey, sensorReadings]) => {
      if (sensorReadings?.length) {
        const latest = sensorReadings[0];
        const sensorType = typeKey as SensorType;

        const unit = UNIT_DISPLAY[latest.sensor?.unit || SensorUnit.PERCENT];

        result.push({
          id: `${sensorType.toLowerCase()}-${latest.id}`,
          gardenId: selectedGardenId,
          gardenName: selectedGarden?.name || "",
          type: sensorType,
          icon: getSensorIconName(sensorType),
          value: latest.value,
          unit,
          status: getSensorStatus(latest.value, sensorType),
          timestamp: latest.timestamp,
        });
      }
    });

    return result;
  }, [selectedGardenId, sensorDataByType, gardens]);

  // Function to generate weather-based gardening tips
  const getWeatherTip = (weather: WeatherObservation): string => {
    if (weather.temp > 32) {
      return "Nhiệt độ cao, hãy tưới thêm nước cho cây và tránh tưới vào buổi trưa.";
    } else if (weather.temp < 15) {
      return "Nhiệt độ thấp, hãy che chắn cho cây khỏi gió lạnh và hạn chế tưới nước.";
    } else if (weather.humidity > 85) {
      return "Độ ẩm cao, cẩn thận với nấm bệnh. Hạn chế phun nước lên lá cây.";
    } else if (weather.humidity < 30) {
      return "Độ ẩm thấp, hãy tưới nhẹ vào buổi sáng sớm hoặc chiều tối.";
    } else if (weather.weatherMain === "RAIN") {
      return "Đang có mưa, tránh bón phân để tránh rửa trôi dinh dưỡng.";
    }
    return `Thời tiết lý tưởng cho việc chăm sóc vườn. Nhiệt độ: ${weather.temp}°C, Độ ẩm: ${weather.humidity}%.`;
  };

  // Generate sections for the home screen
  const sections: Section[] = useMemo(() => {
    const constructedSections: Section[] = [];

    // Always start with header
    constructedSections.push({ type: SectionType.HEADER, key: "header" });

    // Add weather section if data is available - give it higher priority
    if (weatherData) {
      constructedSections.push({
        type: SectionType.WEATHER,
        key: "weather",
        data: weatherData,
      });
    }

    // Gardens section is always included
    constructedSections.push({
      type: SectionType.GARDENS,
      key: "gardens",
      data: gardens,
    });

    // Add sensor section only if a garden is selected
    if (selectedGardenId) {
      constructedSections.push({
        type: SectionType.SENSORS,
        key: "sensors",
        data: getSensorDisplayData,
      });
    } else if (gardens.length > 0) {
      // Add a placeholder/prompt section if no garden selected but gardens exist
      constructedSections.push({
        type: SectionType.SENSORS,
        key: "sensors-prompt",
        data: [],
      });
    }

    // Quick actions are always included
    constructedSections.push({
      type: SectionType.QUICK_ACTIONS,
      key: "quick_actions",
    });

    // Only add tips section if we have weather data
    if (weatherData) {
      constructedSections.push({
        type: SectionType.TIPS,
        key: "tips",
        data: {
          title: "Lời khuyên dựa trên thời tiết",
          content: getWeatherTip(weatherData),
          imageUrl: weatherData.iconCode
            ? `https://openweathermap.org/img/wn/${weatherData.iconCode}@2x.png`
            : undefined,
          iconName: "leaf", // Default icon if no weather icon is available
        },
      });
    }

    return constructedSections;
  }, [
    gardens,
    selectedGardenId,
    getSensorDisplayData,
    weatherData,
    gardenAlerts,
  ]);

  // Helper function to generate fake trend data outside the render function
  const getFakeTrendData = (value: number | undefined) => {
    if (value === undefined) return undefined;

    // Generate 5 points of fake trend data
    const now = new Date();
    const result = [];

    // The current value
    result.push({
      value: value,
      timestamp: now.toISOString(),
    });

    // Generate 4 earlier values with small random variations
    for (let i = 1; i <= 4; i++) {
      const pastTime = new Date(now.getTime() - i * 30 * 60 * 1000); // 30 mins apart
      const randomChange = (Math.random() * 0.4 - 0.2) * value; // +/- 20%
      result.push({
        value: Math.max(0, value + randomChange),
        timestamp: pastTime.toISOString(),
      });
    }

    // Return in reverse order (oldest first)
    return result.reverse();
  };

  // Render garden item using the enhanced component
  const renderGardenItem = ({ item }: { item: GardenDisplay }) => {
    // Get main sensor value to display
    const mainSensor =
      item.sensorData?.temperature !== undefined
        ? {
            type: "temperature",
            value: item.sensorData.temperature,
            unit: "°C",
          }
        : item.sensorData?.humidity !== undefined
        ? {
            type: "humidity",
            value: item.sensorData.humidity,
            unit: "%",
          }
        : undefined;

    return (
      <EnhancedGardenCard
        garden={item}
        isPinned={item.isPinned}
        alertCount={item.alertCount}
        isSelected={selectedGardenId === item.id}
        onPress={() => handleSelectGarden(item.id)}
        onLongPress={() => router.push(`/(modules)/gardens/${item.id}`)}
        onPinPress={() => handleTogglePinGarden(item.id)}
        mainSensorValue={mainSensor}
        location={item.location}
        statusColor={item.statusColor}
        lastActivity={item.updatedAt || ""}
      />
    );
  };

  // Render sensor card using the enhanced component
  const renderSensorItem = ({ item }: { item: SensorDisplay }) => {
    const fakeTrendData = getFakeTrendData(item.value);

    return (
      <EnhancedSensorCard
        id={item.id}
        type={item.type}
        name={item.type} // Will be transformed to display name in the component
        value={item.value}
        unit={item.unit}
        status={item.status}
        timestamp={item.timestamp}
        trendData={fakeTrendData}
        onPress={() => router.push(`/sensors/${item.id}`)}
      />
    );
  };

  // Render function for main sections
  const renderSection = ({ item: section }: { item: Section }) => {
    switch (section.type) {
      case SectionType.HEADER:
        return renderHeader();

      case SectionType.WEATHER:
        const weather = section.data as WeatherObservation;
        if (!weather) return null;

        return (
          <EnhancedWeatherCard
            weatherData={weather}
            onPress={() => router.push("/(modules)/weather/index")}
          />
        );

      case SectionType.GARDENS:
        // Use section.data which is the gardens state variable
        return (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: sectionAnimationRefs.gardens,
                transform: [
                  {
                    translateY: sectionAnimationRefs.gardens.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Vườn của tôi
              </Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push("/(modules)/gardens/index")}
                accessibilityLabel="Xem tất cả vườn"
                accessibilityRole="button"
              >
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  Xem tất cả
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>
            {section.data && section.data.length > 0 ? (
              <FlatList
                data={section.data}
                renderItem={renderGardenItem}
                keyExtractor={(item) => `garden-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContainer}
                ListFooterComponent={
                  <TouchableOpacity
                    style={[
                      styles.addGardenCard,
                      {
                        borderColor: theme.border,
                        backgroundColor: theme.backgroundSecondary,
                      },
                    ]}
                    onPress={() => router.push("/(modules)/gardens/create")}
                    accessibilityLabel="Thêm vườn mới"
                    accessibilityRole="button"
                  >
                    <View style={styles.addGardenContent}>
                      <View
                        style={[
                          styles.addIcon,
                          { backgroundColor: theme.primaryLight },
                        ]}
                      >
                        <Ionicons name="add" size={34} color={theme.primary} />
                      </View>
                      <Text
                        style={[styles.addGardenText, { color: theme.primary }]}
                      >
                        Tạo vườn mới
                      </Text>
                    </View>
                  </TouchableOpacity>
                }
                ItemSeparatorComponent={() => (
                  <View style={styles.horizontalSeparator} />
                )}
              />
            ) : (
              <View
                style={[styles.emptyState, { backgroundColor: theme.cardAlt }]}
              >
                <MaterialCommunityIcons
                  name="flower-tulip-outline"
                  size={40}
                  color={theme.textTertiary}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Chưa có vườn nào. Hãy tạo vườn đầu tiên!
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(modules)/gardens/create")}
                  style={[
                    styles.emptyStateButton,
                    { backgroundColor: theme.primary },
                  ]}
                  accessibilityLabel="Tạo vườn mới"
                  accessibilityRole="button"
                >
                  <Text
                    style={[styles.emptyStateButtonText, { color: theme.card }]}
                  >
                    Tạo Vườn Mới
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        );

      case SectionType.SENSORS:
        // Use section.data which is the sensor display data
        return (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: sectionAnimationRefs.sensors,
                transform: [
                  {
                    translateY: sectionAnimationRefs.sensors.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Dữ liệu Cảm biến
              </Text>
              {selectedGardenId && (
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() =>
                    router.push(
                      `/(modules)/gardens/${selectedGardenId}/sensors`
                    )
                  }
                  accessibilityLabel="Xem chi tiết cảm biến"
                  accessibilityRole="button"
                >
                  <Text style={[styles.viewAllText, { color: theme.primary }]}>
                    Xem chi tiết
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
            {selectedGardenId ? (
              section.data && section.data.length > 0 ? (
                <FlatList
                  data={section.data}
                  renderItem={renderSensorItem}
                  keyExtractor={(item) => `sensor-${item.id}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalListContainer}
                  ItemSeparatorComponent={() => (
                    <View style={styles.horizontalSeparator} />
                  )}
                />
              ) : (
                <View
                  style={[
                    styles.emptyState,
                    { backgroundColor: theme.cardAlt },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="access-point-off"
                    size={40}
                    color={theme.textTertiary}
                  />
                  <Text
                    style={[
                      styles.emptyStateText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Không có dữ liệu cảm biến cho vườn này.
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/(modules)/gardens/${selectedGardenId}/add-sensor`
                      )
                    }
                    style={[
                      styles.emptyStateButton,
                      { backgroundColor: theme.primary },
                    ]}
                    accessibilityLabel="Thêm cảm biến mới"
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.emptyStateButtonText,
                        { color: theme.card },
                      ]}
                    >
                      Thêm Cảm Biến
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <View
                style={[styles.emptyState, { backgroundColor: theme.cardAlt }]}
              >
                <MaterialCommunityIcons
                  name="select-search"
                  size={40}
                  color={theme.textTertiary}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Chọn một vườn để xem dữ liệu cảm biến.
                </Text>
              </View>
            )}
          </Animated.View>
        );

      case SectionType.QUICK_ACTIONS:
        // Define the quick actions
        const quickActions = [
          {
            id: "tasks",
            icon: "add-task",
            iconType: "material" as const,
            label: "Công việc",
            onPress: () => router.push("/(modules)/tasks/index"),
            accessibilityLabel: "Xem danh sách công việc",
          },
          {
            id: "new-garden",
            icon: "sprout",
            iconType: "materialCommunity" as const,
            label: "Vườn mới",
            onPress: () => router.push("/(modules)/gardens/create"),
            accessibilityLabel: "Tạo vườn mới",
          },
          {
            id: "new-post",
            icon: "create-outline",
            iconType: "ionicons" as const,
            label: "Bài viết mới",
            onPress: () => router.push("/(modules)/community/new"),
            accessibilityLabel: "Tạo bài viết mới",
          },
          {
            id: "scan-sensor",
            icon: "qrcode-scan",
            iconType: "materialCommunity" as const,
            label: "Quét cảm biến",
            onPress: () => console.log("Navigate to Scan Sensor"),
            accessibilityLabel: "Quét cảm biến",
          },
          {
            id: "new-activity",
            icon: "watering-can",
            iconType: "materialCommunity" as const,
            label: "Tạo hoạt động",
            onPress: () => router.push("/(modules)/activities/create"),
            accessibilityLabel: "Tạo hoạt động mới",
          },
        ];

        return (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: sectionAnimationRefs.quickActions,
                transform: [
                  {
                    translateY: sectionAnimationRefs.quickActions.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <QuickActionsBar title="Tác vụ nhanh" actions={quickActions} />
          </Animated.View>
        );

      case SectionType.TIPS:
        const tip = section.data;
        if (!tip) return null;

        return (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: sectionAnimationRefs.tips,
                transform: [
                  {
                    translateY: sectionAnimationRefs.tips.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, marginBottom: 16, paddingHorizontal: 20 },
              ]}
            >
              Mẹo chăm sóc
            </Text>

            <GardeningTipCard
              title={tip.title}
              content={tip.content}
              imageUrl={tip.imageUrl}
              onPress={() => router.push(`/weather`)}
            />
          </Animated.View>
        );

      default:
        return null;
    }
  };

  // Animate sections on mount and when data changes
  useEffect(() => {
    // Animate all sections in sequence
    const animations = Object.values(sectionAnimationRefs).map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 100 + index * 100, // Stagger the animations
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, []);

  // Notification badge animation
  useEffect(() => {
    const hasNotifications = Object.values(gardenAlerts).flat().length > 0;

    if (hasNotifications) {
      // Notification alert animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(notificationPulse, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(notificationPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animation if no notifications
      notificationPulse.setValue(1);
    }
  }, [gardenAlerts, notificationPulse]);

  // --- Render Functions for sections ---
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Chào buổi sáng";
    if (currentHour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // Header with animated notification badge
  const renderHeader = () => {
    const hasNotifications = Object.values(gardenAlerts).flat().length > 0;

    return (
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: sectionAnimationRefs.header,
            transform: [
              {
                translateY: sectionAnimationRefs.header.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {getGreeting()},
          </Text>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.firstName || "Người dùng"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/(modules)/alerts")}
          accessibilityLabel={
            hasNotifications ? "Bạn có thông báo mới" : "Thông báo"
          }
          accessibilityRole="button"
        >
          <Ionicons
            name="notifications-outline"
            size={26}
            color={theme.textSecondary}
          />
          {hasNotifications && (
            <Animated.View
              style={[
                styles.notificationBadge,
                {
                  backgroundColor: theme.error,
                  opacity: notificationPulse,
                  transform: [{ scale: notificationPulse }],
                },
              ]}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={onRefresh}
            accessibilityLabel="Thử lại"
            accessibilityRole="button"
          >
            <Text style={[styles.retryButtonText, { color: theme.card }]}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sections}
          renderItem={renderSection}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
              progressViewOffset={20}
            />
          }
          ListFooterComponent={
            <Animated.View
              style={[
                styles.footer,
                {
                  opacity: refreshAnimationRef,
                },
              ]}
            >
              <Text style={[styles.footerText, { color: theme.textTertiary }]}>
                Phiên bản 1.0.0
              </Text>
            </Animated.View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    listContainer: {
      paddingBottom: 30,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "android" ? 15 : 10,
      paddingBottom: 16,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    greeting: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    userName: {
      fontSize: 24,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginTop: 4,
    },
    notificationButton: {
      padding: 8,
      position: "relative",
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    notificationBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.error,
    },
    section: {
      backgroundColor: theme.background,
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 19,
      fontFamily: "Inter-Bold",
      color: theme.text,
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      minWidth: 44,
      minHeight: 44,
      justifyContent: "center",
    },
    viewAllText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginRight: 2,
    },
    horizontalListContainer: {
      paddingHorizontal: 20,
      paddingVertical: 4,
    },
    horizontalSeparator: {
      width: 12,
    },
    addGardenCard: {
      width: 240,
      height: 260,
      borderRadius: 16,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.cardAlt,
      margin: 6,
    },
    addGardenContent: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    addIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.primaryLight,
      marginBottom: 16,
    },
    addGardenText: {
      fontFamily: "Inter-SemiBold",
      fontSize: 16,
      color: theme.primary,
      textAlign: "center",
    },
    emptyState: {
      height: 170,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      marginHorizontal: 20,
      backgroundColor: theme.cardAlt,
      marginTop: 10,
      ...theme.elevation1,
    },
    emptyStateText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 12,
      marginBottom: 16,
    },
    emptyStateButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      minWidth: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyStateButtonText: {
      fontFamily: "Inter-SemiBold",
      fontSize: 14,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      textAlign: "center",
      marginTop: 16,
      marginBottom: 24,
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      minWidth: 44,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    retryButtonText: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    footer: {
      paddingVertical: 20,
      alignItems: "center",
    },
    footerText: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
    },
  });
