import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUser } from "@/contexts/UserContext";
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
import { Sensor, SensorData, SensorType } from "@/types/gardens/sensor.types";
import { WeatherObservation } from "@/types/weather/weather.types";
import { Alert } from "@/types/gardens/alert.types";

// Import services
import { gardenService, sensorService, weatherService } from "@/service/api";
import { API_URL } from "@env";

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
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const { user } = useUser();
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
      const displayGardens: GardenDisplay[] = gardensData.map((garden) => ({
        ...garden,
        alertCount: 0, // Will be updated when alerts are fetched
        sensorData: {}, // Will be updated when sensor data is fetched
        location: getLocationString(garden),
      }));

      setGardens(displayGardens);

      // Set initial selected garden if none selected
      if (selectedGardenId === null && displayGardens.length > 0) {
        setSelectedGardenId(displayGardens[0].id);
      }
    } catch (err) {
      console.error("Failed to load gardens:", err);
      setError("Không thể tải danh sách vườn. Vui lòng thử lại sau.");
    }
  }, [selectedGardenId]);

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
      const alertsData = await weatherService.getAlerts({
        status: AlertStatus.PENDING,
      });

      // Group alerts by garden ID
      const alertsByGarden: Record<number, Alert[]> = {};
      alertsData.forEach((alert) => {
        if (!alertsByGarden[alert.gardenId]) {
          alertsByGarden[alert.gardenId] = [];
        }
        alertsByGarden[alert.gardenId].push(alert);
      });

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
      const data = await weatherService.getCurrentWeather(selectedGardenId);
      setWeatherData(data);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

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

        let unit = "";
        switch (sensorType) {
          case SensorType.TEMPERATURE:
            unit = "°C";
            break;
          case SensorType.HUMIDITY:
            unit = "%";
            break;
          case SensorType.SOIL_MOISTURE:
            unit = "%";
            break;
          case SensorType.LIGHT:
            unit = "lux";
            break;
          case SensorType.SOIL_PH:
            unit = "pH";
            break;
          case SensorType.RAINFALL:
            unit = "mm";
            break;
          case SensorType.WATER_LEVEL:
            unit = "cm";
            break;
          default:
            unit = "";
        }

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

  // Generate sections for the home screen
  const sections: Section[] = useMemo(() => {
    const constructedSections: Section[] = [];

    constructedSections.push({ type: SectionType.HEADER, key: "header" });

    // Add weather section if data is available
    if (weatherData) {
      constructedSections.push({
        type: SectionType.WEATHER,
        key: "weather",
        data: weatherData,
      });
    }

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
          imageUrl: `https://openweathermap.org/img/wn/${weatherData.iconCode}@2x.png`,
        },
      });
    }

    return constructedSections;
  }, [gardens, selectedGardenId, getSensorDisplayData, weatherData]);

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

  // Render functions for list items
  const renderGardenItem = ({ item }: { item: GardenDisplay }) => (
    <TouchableOpacity
      style={[
        styles.gardenCard,
        {
          backgroundColor: theme.card,
          borderColor:
            selectedGardenId === item.id ? theme.primary : theme.card,
        },
      ]}
      onPress={() => setSelectedGardenId(item.id)}
      onLongPress={() => router.push(`/(modules)/gardens/${item.id}`)}
    >
      <Image
        source={{ uri: `${env.apiUrl}${item.profilePicture}` }}
        style={styles.gardenThumbnail}
        resizeMode="cover"
        defaultSource={require("@/assets/images/icon.png")}
      />
      <View style={styles.gardenContent}>
        <View style={styles.gardenHeader}>
          <Text
            style={[styles.gardenTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.alertCount > 0 && (
            <View style={[styles.alertBadge, { backgroundColor: theme.error }]}>
              <Text style={styles.alertBadgeText}>{item.alertCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.gardenTypeContainer}>
          <Text style={[styles.gardenType, { color: theme.textSecondary }]}>
            {getGardenTypeIcon(item.type)} {getGardenTypeLabel(item.type)}
          </Text>
        </View>

        <Text style={[styles.gardenLocation, { color: theme.textSecondary }]}>
          <Ionicons name="location-outline" size={14} />
          {" " + item.location}
        </Text>

        {item.plantName && (
          <View style={styles.plantInfoContainer}>
            <FontAwesome5 name="seedling" size={14} color={theme.success} />
            <Text style={[styles.gardenCrop, { color: theme.textSecondary }]}>
              {item.plantName}
              {item.plantGrowStage && ` • ${item.plantGrowStage}`}
            </Text>
          </View>
        )}

        <View style={styles.sensorPreviewContainer}>
          {item.sensorData?.temperature != null && (
            <View style={styles.sensorPreview}>
              <MaterialCommunityIcons
                name="thermometer"
                size={16}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.sensorValue, { color: theme.textSecondary }]}
              >
                {item.sensorData.temperature}°C
              </Text>
            </View>
          )}
          {item.sensorData?.humidity != null && (
            <View style={styles.sensorPreview}>
              <MaterialCommunityIcons
                name="water-percent"
                size={16}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.sensorValue, { color: theme.textSecondary }]}
              >
                {item.sensorData.humidity}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.gardenFooter}>
          <Text style={[styles.lastActivity, { color: theme.textTertiary }]}>
            {new Date(item.updatedAt || "").toLocaleString("vi-VN")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSensorItem = ({ item }: { item: SensorDisplay }) => {
    const sensorNameMap: Record<SensorType, string> = {
      [SensorType.TEMPERATURE]: "Nhiệt độ",
      [SensorType.HUMIDITY]: "Độ ẩm",
      [SensorType.SOIL_MOISTURE]: "Độ ẩm đất",
      [SensorType.LIGHT]: "Ánh sáng",
      [SensorType.WATER_LEVEL]: "Mực nước",
      [SensorType.RAINFALL]: "Lượng mưa",
      [SensorType.SOIL_PH]: "Độ pH đất",
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "critical":
          return theme.error;
        case "warning":
          return theme.warning;
        default:
          return theme.success;
      }
    };

    return (
      <TouchableOpacity
        style={[styles.sensorCard, { backgroundColor: theme.card }]}
        onPress={() => router.push(`/sensors/${item.id}`)}
      >
        <View
          style={[
            styles.sensorIconContainer,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          {renderSensorIcon(item.type, item.icon, getStatusColor(item.status))}
        </View>
        <View style={styles.sensorInfo}>
          <Text style={[styles.sensorName, { color: theme.text }]}>
            {sensorNameMap[item.type] || item.type}
          </Text>
          <Text
            style={[
              styles.sensorValueLarge,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.value.toFixed(1)}
            {item.unit}
          </Text>
          <Text style={[styles.sensorTimestamp, { color: theme.textTertiary }]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSensorIcon = (
    type: SensorType,
    iconName: string,
    color: string
  ) => {
    switch (iconName) {
      case "thermometer":
        return (
          <MaterialCommunityIcons name="thermometer" size={28} color={color} />
        );
      case "water-percent":
        return (
          <MaterialCommunityIcons
            name="water-percent"
            size={28}
            color={color}
          />
        );
      case "water-outline":
        return (
          <MaterialCommunityIcons
            name="water-outline"
            size={28}
            color={color}
          />
        );
      case "white-balance-sunny":
        return (
          <MaterialCommunityIcons
            name="white-balance-sunny"
            size={28}
            color={color}
          />
        );
      case "water":
        return <MaterialCommunityIcons name="water" size={28} color={color} />;
      case "weather-pouring":
        return (
          <MaterialCommunityIcons
            name="weather-pouring"
            size={28}
            color={color}
          />
        );
      case "flask-outline":
        return (
          <MaterialCommunityIcons
            name="flask-outline"
            size={28}
            color={color}
          />
        );
      default:
        return <MaterialCommunityIcons name="gauge" size={28} color={color} />;
    }
  };

  // Helper functions
  const getGardenTypeIcon = (type: GardenType) => {
    switch (type) {
      case GardenType.INDOOR:
        return <MaterialCommunityIcons name="home" size={14} />;
      case GardenType.OUTDOOR:
        return <MaterialCommunityIcons name="tree" size={14} />;
      case GardenType.BALCONY:
        return <MaterialCommunityIcons name="balcony" size={14} />;
      case GardenType.ROOFTOP:
        return <MaterialCommunityIcons name="office-building" size={14} />;
      case GardenType.WINDOW_SILL:
        return (
          <MaterialCommunityIcons name="window-closed-variant" size={14} />
        );
      default:
        return <MaterialCommunityIcons name="flower" size={14} />;
    }
  };

  const getGardenTypeLabel = (type: GardenType): string => {
    switch (type) {
      case GardenType.INDOOR:
        return "Trong nhà";
      case GardenType.OUTDOOR:
        return "Ngoài trời";
      case GardenType.BALCONY:
        return "Ban công";
      case GardenType.ROOFTOP:
        return "Sân thượng";
      case GardenType.WINDOW_SILL:
        return "Bậu cửa sổ";
      default:
        return "Không xác định";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Render Functions for sections ---
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Chào buổi sáng";
    if (currentHour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // Render function for main sections
  const renderSection = ({ item: section }: { item: Section }) => {
    switch (section.type) {
      case SectionType.HEADER:
        return (
          <View style={styles.headerContainer}>
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
              onPress={() => router.push("/(modules)/notifications/index")}
            >
              <Ionicons
                name="notifications-outline"
                size={26}
                color={theme.textSecondary}
              />
              {Object.values(gardenAlerts).flat().length > 0 && (
                <View
                  style={[
                    styles.notificationBadge,
                    { backgroundColor: theme.error },
                  ]}
                />
              )}
            </TouchableOpacity>
          </View>
        );

      case SectionType.WEATHER:
        const weather = section.data as WeatherObservation;
        if (!weather) return null;

        return (
          <View style={styles.weatherContainer}>
            <View
              style={[styles.weatherCard, { backgroundColor: theme.cardAlt }]}
            >
              <View style={styles.weatherHeader}>
                <Text style={[styles.weatherTitle, { color: theme.text }]}>
                  Thời tiết hiện tại
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(modules)/weather/index")}
                  style={styles.weatherMore}
                >
                  <Text style={{ color: theme.primary, fontSize: 14 }}>
                    Chi tiết
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.weatherContent}>
                <View style={styles.weatherIconContainer}>
                  <Image
                    source={{
                      uri: `https://openweathermap.org/img/wn/${weather.iconCode}@4x.png`,
                    }}
                    style={styles.weatherIcon}
                  />
                </View>

                <View style={styles.weatherDataContainer}>
                  <Text style={[styles.temperatureText, { color: theme.text }]}>
                    {Math.round(weather.temp)}°C
                  </Text>
                  <Text
                    style={[
                      styles.weatherDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {weather.weatherDesc}
                  </Text>

                  <View style={styles.weatherDetailsRow}>
                    <View style={styles.weatherDetail}>
                      <MaterialCommunityIcons
                        name="water-percent"
                        size={16}
                        color={theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.weatherDetailText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {weather.humidity}%
                      </Text>
                    </View>

                    <View style={styles.weatherDetail}>
                      <MaterialCommunityIcons
                        name="weather-windy"
                        size={16}
                        color={theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.weatherDetailText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {Math.round(weather.windSpeed * 3.6)} km/h
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );

      case SectionType.GARDENS:
        // Use section.data which is the gardens state variable
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Vườn của tôi
              </Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push("/(modules)/gardens/index")}
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
                      { borderColor: theme.border },
                    ]}
                    onPress={() => router.push("/(modules)/gardens/create")}
                  >
                    <View style={styles.addGardenContent}>
                      <View
                        style={[
                          styles.addIcon,
                          { backgroundColor: theme.primaryLight },
                        ]}
                      >
                        <Ionicons name="add" size={30} color={theme.primary} />
                      </View>
                      <Text
                        style={[styles.addGardenText, { color: theme.primary }]}
                      >
                        Thêm vườn
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
                >
                  <Text
                    style={[styles.emptyStateButtonText, { color: theme.card }]}
                  >
                    Tạo Vườn Mới
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      case SectionType.SENSORS:
        // Use section.data which is the sensor display data
        return (
          <View style={styles.section}>
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
          </View>
        );

      case SectionType.QUICK_ACTIONS:
        return (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, marginBottom: 16, paddingHorizontal: 20 },
              ]}
            >
              Tác vụ nhanh
            </Text>
            <View style={styles.quickActionsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: theme.card }]}
                  onPress={() => router.push("/(modules)/tasks/index")}
                >
                  <View
                    style={[
                      styles.quickActionIconWrapper,
                      { backgroundColor: theme.primary + "20" },
                    ]}
                  >
                    <MaterialIcons
                      name="add-task"
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.text }]}>
                    Công việc
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: theme.card }]}
                  onPress={() => router.push("/(modules)/gardens/create")}
                >
                  <View
                    style={[
                      styles.quickActionIconWrapper,
                      { backgroundColor: theme.primary + "20" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="sprout"
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.text }]}>
                    Vườn mới
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: theme.card }]}
                  onPress={() => router.push("/(modules)/community/new")}
                >
                  <View
                    style={[
                      styles.quickActionIconWrapper,
                      { backgroundColor: theme.primary + "20" },
                    ]}
                  >
                    <Ionicons
                      name="create-outline"
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.text }]}>
                    Bài viết mới
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: theme.card }]}
                  onPress={() => console.log("Navigate to Scan Sensor")}
                >
                  <View
                    style={[
                      styles.quickActionIconWrapper,
                      { backgroundColor: theme.primary + "20" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="qrcode-scan"
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.text }]}>
                    Quét cảm biến
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickAction, { backgroundColor: theme.card }]}
                  onPress={() => router.push("/(modules)/activities/create")}
                >
                  <View
                    style={[
                      styles.quickActionIconWrapper,
                      { backgroundColor: theme.primary + "20" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="watering-can"
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.text }]}>
                    Tạo hoạt động
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        );

      case SectionType.TIPS:
        const tip = section.data;
        if (!tip) return null;
        return (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, marginBottom: 16, paddingHorizontal: 20 },
              ]}
            >
              Mẹo chăm sóc
            </Text>
            <View style={styles.tipContainer}>
              <TouchableOpacity
                style={[
                  styles.tipCard,
                  { backgroundColor: theme.primaryLight },
                ]}
                onPress={() => router.push(`/weather`)}
              >
                <Image
                  source={{ uri: tip.imageUrl }}
                  style={styles.tipImage}
                  resizeMode="contain"
                />
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: theme.primaryDark }]}>
                    {tip.title}
                  </Text>
                  <Text
                    style={[
                      styles.tipDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {tip.content}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
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
            />
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textTertiary }]}>
                Phiên bản 1.0.0
              </Text>
            </View>
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
    gardenCard: {
      width: 280,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1.5,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      overflow: "hidden",
    },
    gardenThumbnail: {
      width: "100%",
      height: 120,
      backgroundColor: theme.cardAlt,
    },
    gardenContent: { padding: 14 },
    gardenHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6,
    },
    gardenTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      flex: 1,
    },
    gardenTypeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    gardenType: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
    },
    alertBadge: {
      backgroundColor: theme.error,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    alertBadgeText: {
      color: theme.card,
      fontSize: 12,
      fontWeight: "bold",
      fontFamily: "Inter-Bold",
    },
    gardenLocation: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginBottom: 8,
    },
    plantInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 6,
    },
    gardenCrop: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    sensorPreviewContainer: {
      flexDirection: "row",
      marginBottom: 10,
      gap: 16,
    },
    sensorPreview: {
      flexDirection: "row",
      alignItems: "center",
    },
    sensorValue: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginLeft: 4,
    },
    gardenFooter: {
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      paddingTop: 10,
      marginTop: 6,
    },
    lastActivity: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
    },
    addGardenCard: {
      width: 160,
      height: 230,
      borderRadius: 16,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.cardAlt,
    },
    addGardenContent: {
      alignItems: "center",
    },
    addIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.primaryLight,
      marginBottom: 12,
    },
    addGardenText: {
      fontFamily: "Inter-Medium",
      fontSize: 15,
      color: theme.primary,
      textAlign: "center",
    },
    sensorCard: {
      width: 140,
      height: 160,
      borderRadius: 16,
      padding: 16,
      backgroundColor: theme.card,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    sensorIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    sensorInfo: {
      flex: 1,
    },
    sensorName: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 6,
    },
    sensorValueLarge: {
      fontSize: 22,
      fontFamily: "Inter-Bold",
      marginBottom: 6,
    },
    sensorTimestamp: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginTop: "auto",
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
    },
    emptyStateButtonText: {
      fontFamily: "Inter-SemiBold",
      fontSize: 14,
    },
    quickActionsContainer: {
      marginBottom: 16,
    },
    quickAction: {
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: "center",
      backgroundColor: theme.card,
      width: 110,
      marginRight: 12,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    quickActionIconWrapper: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    quickActionText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.text,
      textAlign: "center",
    },
    tipContainer: {
      paddingHorizontal: 20,
    },
    tipCard: {
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: theme.primaryLight,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    tipImage: {
      width: 60,
      height: 60,
      marginRight: 14,
    },
    tipContent: {
      flex: 1,
    },
    tipTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    tipDescription: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    tipLink: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginTop: 12,
      alignSelf: "flex-start",
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
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
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
    weatherContainer: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    weatherCard: {
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: theme.cardAlt,
      padding: 16,
    },
    weatherHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    weatherMore: {
      flexDirection: "row",
      alignItems: "center",
    },
    weatherContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    weatherIconContainer: {
      marginRight: 16,
    },
    weatherIcon: {
      width: 80,
      height: 80,
    },
    weatherDataContainer: {
      flex: 1,
    },
    temperatureText: {
      fontSize: 36,
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    weatherDescription: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      marginBottom: 12,
      textTransform: "capitalize",
    },
    weatherDetailsRow: {
      flexDirection: "row",
      justifyContent: "flex-start",
      gap: 16,
    },
    weatherDetail: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    weatherDetailText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
    weatherTitle: {
      fontSize: 17,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
  });
