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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { AlertStatus } from "@/types";

// Import services and types from API services
import { gardenService, sensorService, weatherService } from "@/service/api";

// Import UI specific types
import {
  Alert,
  Garden,
  GardenUI,
  SensorData,
  SensorDataUI,
} from "@/types/gardens";
import { WeatherObservation } from "@/types";

// Define Section Types
enum SectionType {
  HEADER = "HEADER",
  GARDENS = "GARDENS",
  SENSORS = "SENSORS",
  QUICK_ACTIONS = "QUICK_ACTIONS",
  TIPS = "TIPS",
}

// Structure for the main FlatList data
interface Section {
  type: SectionType;
  key: string;
  data?: any;
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const { user } = useUser();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // State for real API data
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gardens, setGardens] = useState<GardenUI[]>([]);
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

      // Convert API gardens to UI format
      const uiGardens: GardenUI[] = gardensData.map((garden) => ({
        id: garden.id,
        name: garden.name,
        type: garden.type,
        status: garden.status,
        cropName: garden.plantName || "Không xác định",
        cropStage: garden.plantGrowStage || "Không xác định",
        thumbnail: `/gardens/${garden.id}/thumbnail`, // Placeholder URL for garden image
        location: getLocationString(garden),
        alerts: 0, // Will be updated when alerts are fetched
        sensors: {}, // Will be updated when sensor data is fetched
        lastActivity: new Date(garden.updatedAt || "").toLocaleString("vi-VN"),
      }));

      setGardens(uiGardens);

      // Set initial selected garden if none selected
      if (selectedGardenId === null && uiGardens.length > 0) {
        setSelectedGardenId(uiGardens[0].id);
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
    } catch (err) {
      console.error("Failed to load sensor data:", err);
      // We don't set error state here as it would override other errors
    }
  }, [selectedGardenId]);

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
          alerts: alertsByGarden[garden.id]?.length || 0,
        }))
      );
    } catch (err) {
      console.error("Failed to load alerts:", err);
    }
  }, []);

  // Main data fetching function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchGardens(), fetchAlerts()]);

      // These depend on selectedGardenId which might be set after fetchGardens
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

  // Transform sensor data for UI display
  const getSensorDisplayData = useMemo((): SensorDataUI[] => {
    if (!selectedGardenId || !sensorDataByType) return [];

    const result: SensorDataUI[] = [];
    const selectedGarden = gardens.find((g) => g.id === selectedGardenId);

    // Process temperature sensors
    if (sensorDataByType["TEMPERATURE"]?.length) {
      const latest = sensorDataByType["TEMPERATURE"][0];
      result.push({
        id: `temp-${latest.id}`,
        gardenId: selectedGardenId,
        gardenName: selectedGarden?.name || "",
        type: "TEMPERATURE",
        icon: "thermometer",
        value: latest.value,
        unit: "°C",
        status: getSensorStatus(latest.value, "TEMPERATURE"),
        timestamp: latest.timestamp,
      });
    }

    // Process humidity sensors
    if (sensorDataByType["HUMIDITY"]?.length) {
      const latest = sensorDataByType["HUMIDITY"][0];
      result.push({
        id: `humidity-${latest.id}`,
        gardenId: selectedGardenId,
        gardenName: selectedGarden?.name || "",
        type: "HUMIDITY",
        icon: "water-percent",
        value: latest.value,
        unit: "%",
        status: getSensorStatus(latest.value, "HUMIDITY"),
        timestamp: latest.timestamp,
      });
    }

    // Process soil moisture sensors
    if (sensorDataByType["SOIL_MOISTURE"]?.length) {
      const latest = sensorDataByType["SOIL_MOISTURE"][0];
      result.push({
        id: `soil-${latest.id}`,
        gardenId: selectedGardenId,
        gardenName: selectedGarden?.name || "",
        type: "SOIL_MOISTURE",
        icon: "water",
        value: latest.value,
        unit: "%",
        status: getSensorStatus(latest.value, "SOIL_MOISTURE"),
        timestamp: latest.timestamp,
      });
    }

    // Process light sensors
    if (sensorDataByType["LIGHT"]?.length) {
      const latest = sensorDataByType["LIGHT"][0];
      result.push({
        id: `light-${latest.id}`,
        gardenId: selectedGardenId,
        gardenName: selectedGarden?.name || "",
        type: "LIGHT",
        icon: "weather-sunny",
        value: latest.value,
        unit: "lux",
        status: getSensorStatus(latest.value, "LIGHT"),
        timestamp: latest.timestamp,
      });
    }

    return result;
  }, [selectedGardenId, sensorDataByType, gardens]);

  // Helper to determine sensor status
  const getSensorStatus = (
    value: number,
    type: string
  ): "normal" | "warning" | "critical" => {
    // These thresholds should be customized based on plant requirements and garden type
    switch (type) {
      case "TEMPERATURE":
        if (value < 10 || value > 35) return "critical";
        if (value < 15 || value > 30) return "warning";
        return "normal";
      case "HUMIDITY":
        if (value < 20 || value > 90) return "critical";
        if (value < 30 || value > 80) return "warning";
        return "normal";
      case "SOIL_MOISTURE":
        if (value < 10 || value > 90) return "critical";
        if (value < 20 || value > 80) return "warning";
        return "normal";
      case "LIGHT":
        if (value < 1000 || value > 100000) return "critical";
        if (value < 5000 || value > 80000) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  // Generate sections for the home screen
  const sections: Section[] = useMemo(() => {
    const constructedSections: Section[] = [];

    constructedSections.push({ type: SectionType.HEADER, key: "header" });
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
    } else {
      // Add a placeholder/prompt section if no garden selected
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
          title: "Dự báo thời tiết",
          content: `Hiện tại: ${weatherData.temp}°C, ${weatherData.weatherDesc}`,
          imageUrl: `https://openweathermap.org/img/wn/${weatherData.iconCode}@2x.png`,
        },
      });
    }

    return constructedSections;
  }, [gardens, selectedGardenId, getSensorDisplayData, weatherData]);

  // --- Render Functions (largely the same, but ensure they use state variables) ---
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Chào buổi sáng";
    if (currentHour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const renderGardenItem = ({ item }: { item: GardenUI }) => (
    <TouchableOpacity
      style={[
        styles.gardenCard,
        {
          backgroundColor: theme.card,
          borderColor:
            selectedGardenId === item.id ? theme.primary : theme.card,
        },
      ]}
      onPress={() => setSelectedGardenId(item.id)} // Use state setter
      onLongPress={() => router.push(`/(modules)/gardens/${item.id}`)}
    >
      <Image
        source={{ uri: item.thumbnail }} // Use thumbnail from data
        style={styles.gardenThumbnail}
        resizeMode="cover"
        defaultSource={require("@/assets/images/icon.png")} // Keep placeholder
      />
      <View style={styles.gardenContent}>
        <View style={styles.gardenHeader}>
          <Text
            style={[styles.gardenTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.alerts > 0 && (
            <View style={[styles.alertBadge, { backgroundColor: theme.error }]}>
              <Text style={styles.alertBadgeText}>{item.alerts}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.gardenLocation, { color: theme.textSecondary }]}>
          <Ionicons name="location-outline" size={14} />
          {" " + item.location}
        </Text>

        <Text style={[styles.gardenCrop, { color: theme.textSecondary }]}>
          {item.cropName} • {item.cropStage}
        </Text>

        <View style={styles.sensorPreviewContainer}>
          {item.sensors?.temperature != null && ( // Check for null/undefined
            <View style={styles.sensorPreview}>
              <MaterialCommunityIcons
                name="thermometer"
                size={16}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.sensorValue, { color: theme.textSecondary }]}
              >
                {item.sensors.temperature}°C
              </Text>
            </View>
          )}
          {item.sensors?.humidity != null && (
            <View style={styles.sensorPreview}>
              <MaterialCommunityIcons
                name="water-percent"
                size={16}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.sensorValue, { color: theme.textSecondary }]}
              >
                {item.sensors.humidity}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.gardenFooter}>
          <Text style={[styles.lastActivity, { color: theme.textTertiary }]}>
            {item.lastActivity}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSensorItem = ({ item }: { item: SensorDataUI }) => {
    // --- Sensor Name, Color, Icon Logic (Map from schema types) ---
    let sensorName: string;
    // Use schema types (adjust if SensorType enum imported)
    switch (item.type.toUpperCase()) {
      case "TEMPERATURE":
        sensorName = "Nhiệt độ";
        break;
      case "HUMIDITY":
        sensorName = "Độ ẩm";
        break;
      case "SOIL_MOISTURE":
        sensorName = "Độ ẩm đất";
        break;
      case "LIGHT":
        sensorName = "Ánh sáng";
        break;
      case "WATER_LEVEL":
        sensorName = "Mực nước";
        break;
      case "RAINFALL":
        sensorName = "Lượng mưa";
        break;
      case "SOIL_PH":
        sensorName = "Độ pH đất";
        break;
      default:
        sensorName = item.type;
    }

    const getStatusColor = (status: string) => {
      // ... (status color logic remains same) ...
      switch (status) {
        case "critical":
          return theme.error;
        case "warning":
          return theme.warning;
        default:
          return theme.success;
      }
    };

    const getSensorIcon = (type: string, iconName: string) => {
      // Determine icon based on sensor type if iconName is not provided
      if (!iconName) {
        switch (type.toUpperCase()) {
          case "TEMPERATURE":
            return (
              <MaterialCommunityIcons
                name="thermometer"
                size={24}
                color={theme.textSecondary}
              />
            );
          case "HUMIDITY":
            return (
              <MaterialCommunityIcons
                name="water-percent"
                size={24}
                color={theme.textSecondary}
              />
            );
          case "SOIL_MOISTURE":
            return (
              <MaterialCommunityIcons
                name="water"
                size={24}
                color={theme.textSecondary}
              />
            );
          case "LIGHT":
            return (
              <MaterialCommunityIcons
                name="white-balance-sunny"
                size={24}
                color={theme.textSecondary}
              />
            );
          case "WATER_LEVEL":
            return (
              <MaterialCommunityIcons
                name="water-outline"
                size={24}
                color={theme.textSecondary}
              />
            );
          case "RAINFALL":
            return (
              <MaterialCommunityIcons
                name="weather-pouring"
                size={24}
                color={theme.textSecondary}
              />
            );
          case "SOIL_PH":
            return (
              <MaterialCommunityIcons
                name="flask-outline"
                size={24}
                color={theme.textSecondary}
              />
            );
          default:
            return (
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={24}
                color={theme.textSecondary}
              />
            );
        }
      }

      // Use provided iconName if available
      if (iconName === "thermometer") {
        return (
          <MaterialCommunityIcons
            name="thermometer"
            size={24}
            color={theme.textSecondary}
          />
        );
      }
      if (iconName === "water-percent") {
        return (
          <MaterialCommunityIcons
            name="water-percent"
            size={24}
            color={theme.textSecondary}
          />
        );
      }
      if (iconName === "water") {
        return (
          <MaterialCommunityIcons
            name="water"
            size={24}
            color={theme.textSecondary}
          />
        );
      }
      if (iconName === "white-balance-sunny") {
        return (
          <MaterialCommunityIcons
            name="white-balance-sunny"
            size={24}
            color={theme.textSecondary}
          />
        );
      }
      // Default icon
      return (
        <MaterialCommunityIcons
          name="gauge"
          size={24}
          color={theme.textSecondary}
        />
      );
    };

    return (
      <TouchableOpacity
        style={[styles.sensorCard, { backgroundColor: theme.card }]}
        onPress={() => router.push(`/sensors/${item.id}`)}
      >
        <View style={styles.sensorIconContainer}>
          {getSensorIcon(item.type, item.icon)}
        </View>
        <View style={styles.sensorInfo}>
          <Text style={[styles.sensorName, { color: theme.text }]}>
            {sensorName}
          </Text>
          <Text
            style={[
              styles.sensorValueSmall,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.value}
            {item.unit}
          </Text>
        </View>
      </TouchableOpacity>
    );
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
            </TouchableOpacity>
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
                data={section.data} // Use gardens from state
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
                  style={styles.emptyStateButton}
                >
                  <Text style={styles.emptyStateButtonText}>Tạo Vườn Mới</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      case SectionType.SENSORS:
        // Use section.data which is the filteredSensorData state variable
        return (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Dữ liệu Cảm biến
              </Text>
            </View>
            {selectedGardenId ? (
              section.data && section.data.length > 0 ? (
                <FlatList
                  data={section.data} // Use filteredSensorData from state
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
                { color: theme.text, marginBottom: 16 },
              ]}
            >
              Tác vụ nhanh
            </Text>
            <View style={styles.quickActionsContainer}>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.quickAction}
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
                  style={styles.quickAction}
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
              </View>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.quickAction}
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
                  style={styles.quickAction}
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
              </View>
            </View>
          </View>
        );

      case SectionType.TIPS:
        const tip = section.data; // Weather forecast data
        if (!tip) return null;
        return (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, marginBottom: 16 },
              ]}
            >
              Mẹo chăm sóc
            </Text>
            <TouchableOpacity
              style={[styles.tipCard, { backgroundColor: theme.primaryLight }]}
              onPress={() => router.push(`/tips/${tip.id}`)} // Use tip id
            >
              <Image
                source={{ uri: tip.image || tip.imageUrl }}
                style={styles.tipImage}
                defaultSource={require("@/assets/images/icon.png")} // Keep placeholder
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
                  numberOfLines={2}
                >
                  {tip.description || tip.content}
                </Text>
                <Text style={[styles.tipLink, { color: theme.primary }]}>
                  Đọc thêm
                </Text>
              </View>
            </TouchableOpacity>
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
      <FlatList
        data={sections} // Use simplified sections array
        renderItem={renderSection}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing} // Use local refreshing state
            onRefresh={onRefresh} // Use mock refresh logic
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ItemSeparatorComponent={() => (
          <View style={styles.mainSectionSeparator} />
        )}
      />
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
    },
    section: {
      backgroundColor: theme.background,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      marginBottom: 16,
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
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1.5,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      overflow: "hidden",
    },
    gardenThumbnail: { width: "100%", height: 120 },
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
    alertBadge: {
      backgroundColor: theme.error,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    alertBadgeText: { color: theme.card, fontSize: 12, fontWeight: "bold" },
    gardenLocation: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginBottom: 5,
    },
    gardenCrop: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginBottom: 10,
    },
    sensorPreviewContainer: { flexDirection: "row", marginBottom: 10, gap: 16 },
    sensorPreview: { flexDirection: "row", alignItems: "center" },
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
      marginTop: 10,
    },
    lastActivity: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
    },
    addGardenCard: {
      width: 160,
      height: 225,
      borderRadius: 12,
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
      borderRadius: 12,
      padding: 14,
      backgroundColor: theme.card,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    sensorIconContainer: {
      marginBottom: 10,
      alignSelf: "flex-start",
    },
    sensorInfo: {},
    sensorName: {
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 5,
    },
    sensorValueSmall: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
    },
    emptyState: {
      height: 150,
      borderRadius: 12,
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
      color: theme.card,
      fontFamily: "Inter-SemiBold",
      fontSize: 14,
    },
    quickActionsContainer: {
      paddingHorizontal: 20,
      gap: 15,
    },
    quickActionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 15,
    },
    quickAction: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 18,
      paddingHorizontal: 10,
      alignItems: "center",
      backgroundColor: theme.card,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      minHeight: 130,
      justifyContent: "center",
    },
    quickActionIconWrapper: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary + "20",
      marginBottom: 10,
    },
    quickActionText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.text,
      textAlign: "center",
    },
    tipCard: {
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: theme.card,
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      marginHorizontal: 20,
    },
    tipImage: { width: "100%", height: 150 },
    tipContent: { padding: 16 },
    tipTitle: {
      fontSize: 17,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 8,
    },
    tipDescription: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      lineHeight: 20,
    },
    tipLink: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginTop: 12,
      alignSelf: "flex-start",
    },
    mainSectionSeparator: {
      height: 10,
      backgroundColor: theme.backgroundSecondary,
    },
  });
