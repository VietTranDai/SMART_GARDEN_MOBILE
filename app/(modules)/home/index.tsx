import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useUser } from "@/contexts/UserContext";
import { router } from "expo-router";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

// --- Re-add Mock Data Definitions ---

// Corresponds to the 'Garden' interface used in HomeScreen
const GARDENS_MOCK_DATA: Garden[] = [
  {
    id: "1", // Garden ID
    name: "Vườn rau sân thượng",
    cropName: "Cà chua, Húng quế", // Corresponds to plantName
    cropStage: "Đang ra quả", // Corresponds to plantGrowStage
    thumbnail: "https://via.placeholder.com/280x120/ADD8E6/000000?text=Vườn+1", // Placeholder image
    location: "Quận Bình Thạnh", // Simplified location from schema (e.g., city/district)
    alerts: 1, // Example alert count
    sensors: {
      // Simplified sensor overview for the card
      temperature: 28.5,
      humidity: 62,
      soilMoisture: 55, // Added based on schema
    },
    lastActivity: "Tưới nước (1 giờ trước)", // Example activity summary
  },
  {
    id: "2",
    name: "Vườn hoa ban công",
    cropName: "Hoa hồng, Hoa giấy",
    cropStage: "Đang nở rộ",
    thumbnail: "https://via.placeholder.com/280x120/FFB6C1/000000?text=Vườn+2",
    location: "Quận 1",
    alerts: 0,
    sensors: {
      temperature: 26.1,
      humidity: 58,
      // soilMoisture: 60, // Optional
    },
    lastActivity: "Bón phân (Hôm qua)",
  },
  {
    id: "3",
    name: "Vườn thảo mộc cửa sổ",
    cropName: "Hương thảo, Bạc hà",
    cropStage: "Đang lớn",
    thumbnail: "https://via.placeholder.com/280x120/90EE90/000000?text=Vườn+3",
    location: "Quận Thủ Đức",
    alerts: 0,
    sensors: {
      temperature: 27.0,
      humidity: 60,
      soilMoisture: 65,
    },
    lastActivity: "Tỉa lá (2 ngày trước)",
  },
];

// Corresponds to the 'SensorData' interface used in HomeScreen
const SENSORS_MOCK_DATA: SensorData[] = [
  // Garden 1 Sensors
  {
    id: "sensor-1-temp", // Unique reading ID or sensor ID
    gardenId: "1",
    gardenName: "Vườn rau sân thượng", // Not in schema, added for component
    type: "TEMPERATURE", // Use SensorType Enum values from schema
    icon: "thermometer", // Corresponding icon name
    value: 28.5,
    unit: "°C",
    status: "normal",
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
  },
  {
    id: "sensor-1-hum",
    gardenId: "1",
    gardenName: "Vườn rau sân thượng",
    type: "HUMIDITY",
    icon: "water-percent",
    value: 62,
    unit: "%",
    status: "normal",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "sensor-1-soil",
    gardenId: "1",
    gardenName: "Vườn rau sân thượng",
    type: "SOIL_MOISTURE",
    icon: "water",
    value: 55,
    unit: "%",
    status: "warning", // Example status
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: "sensor-1-light",
    gardenId: "1",
    gardenName: "Vườn rau sân thượng",
    type: "LIGHT",
    icon: "white-balance-sunny",
    value: 15000, // Example Lux value
    unit: " lux", // Example unit
    status: "normal",
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  // Garden 2 Sensors
  {
    id: "sensor-2-temp",
    gardenId: "2",
    gardenName: "Vườn hoa ban công",
    type: "TEMPERATURE",
    icon: "thermometer",
    value: 26.1,
    unit: "°C",
    status: "normal",
    timestamp: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
  },
  {
    id: "sensor-2-hum",
    gardenId: "2",
    gardenName: "Vườn hoa ban công",
    type: "HUMIDITY",
    icon: "water-percent",
    value: 58,
    unit: "%",
    status: "normal",
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  // Garden 3 Sensors
  {
    id: "sensor-3-temp",
    gardenId: "3",
    gardenName: "Vườn thảo mộc cửa sổ",
    type: "TEMPERATURE",
    icon: "thermometer",
    value: 27.0,
    unit: "°C",
    status: "normal",
    timestamp: new Date(Date.now() - 120000).toISOString(), // 2 mins ago
  },
  {
    id: "sensor-3-soil",
    gardenId: "3",
    gardenName: "Vườn thảo mộc cửa sổ",
    type: "SOIL_MOISTURE",
    icon: "water",
    value: 65,
    unit: "%",
    status: "normal",
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
];

// Corresponds to the Tip structure needed by component
const TIP_MOCK_DATA = {
  id: "cach-tuoi-nuoc-hieu-qua",
  title: "Tưới nước thông minh",
  description:
    "Kiểm tra độ ẩm đất trước khi tưới và tưới vào sáng sớm hoặc chiều mát để giảm bay hơi.",
  image: "https://via.placeholder.com/300x150/E0FFFF/000000?text=Mẹo+Tưới+Nước", // Placeholder
};

// Keep existing interfaces (or import from a central types file if defined there)
interface Garden {
  id: string;
  name: string;
  cropName: string;
  cropStage: string;
  thumbnail: string;
  location: string;
  alerts: number;
  sensors: {
    temperature?: number;
    humidity?: number;
    soilMoisture?: number; // Add if needed by preview
  };
  lastActivity: string;
}

interface SensorData {
  id: string;
  gardenId: string;
  gardenName: string;
  type: string; // Consider using SensorType enum here if available/imported
  icon: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  timestamp: string;
}

// Define Section Types
enum SectionType {
  HEADER = "HEADER",
  GARDENS = "GARDENS",
  SENSORS = "SENSORS",
  QUICK_ACTIONS = "QUICK_ACTIONS",
  TIPS = "TIPS",
  // Remove LOADING/ERROR types
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

  // --- Re-instate useState for mock data ---
  const [refreshing, setRefreshing] = useState(false);
  const [gardens, setGardens] = useState<Garden[]>(GARDENS_MOCK_DATA);
  const [sensorData, setSensorData] = useState<SensorData[]>(SENSORS_MOCK_DATA);
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null); // Initialize as null

  // --- Effect to set initial selected garden ID ---
  useEffect(() => {
    // Set the initial garden only if it hasn't been set yet and mock data exists
    if (selectedGardenId === null && gardens && gardens.length > 0) {
      console.log("Setting initial selected garden (mock):", gardens[0].id);
      setSelectedGardenId(gardens[0].id);
    }
    // This effect should primarily react to the 'gardens' array populating.
  }, [gardens]); // Remove selectedGardenId from dependency array

  // Remove TanStack Query Hook Usage
  // const gardensQuery = useUserGardens();
  // const sensorsQuery = useGardenLatestSensors(selectedGardenId);
  // const tipsQuery = useCareTips();

  // Remove Effect related to query hooks
  // useEffect(() => { ... }, []);

  // --- Restore Refresh Logic with Mock Data ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    console.log("Refreshing data with mocks...");
    setTimeout(() => {
      setGardens(GARDENS_MOCK_DATA); // Reset with mock data
      setSensorData(SENSORS_MOCK_DATA);
      setSelectedGardenId(GARDENS_MOCK_DATA[0]?.id || null);
      setRefreshing(false);
      console.log("Mock refresh complete.");
    }, 1500);
  }, []); // No dependencies needed for mock refresh

  // Filter sensor data based on local state
  const filteredSensorData = useMemo(() => {
    return selectedGardenId
      ? sensorData.filter((sensor) => sensor.gardenId === selectedGardenId)
      : [];
  }, [sensorData, selectedGardenId]);

  // --- Simplify Sections Definition ---
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
        data: filteredSensorData,
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
    constructedSections.push({
      type: SectionType.TIPS,
      key: "tips",
      data: TIP_MOCK_DATA,
    }); // Pass single tip object

    return constructedSections;
  }, [gardens, filteredSensorData, selectedGardenId]);

  // --- Render Functions (largely the same, but ensure they use state variables) ---
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Chào buổi sáng";
    if (currentHour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const renderGardenItem = ({ item }: { item: Garden }) => (
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

  const renderSensorItem = ({ item }: { item: SensorData }) => {
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
      // Logic based on icon name provided in mock data
      // This assumes mock data provides appropriate icon names
      if (
        iconName === "thermometer" ||
        iconName === "water-percent" ||
        iconName === "water" ||
        iconName === "white-balance-sunny" ||
        iconName === "waves" ||
        iconName === "weather-pouring"
      ) {
        return (
          <MaterialCommunityIcons
            name={iconName as any}
            size={24}
            color={theme.primary}
          />
        );
      } else if (iconName === "flask-outline") {
        return (
          <Ionicons name="flask-outline" size={24} color={theme.primary} />
        );
      } else {
        return <Ionicons name="leaf-outline" size={24} color={theme.primary} />;
      }
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
        const tip = section.data; // Data is the single tip object (TIP_MOCK_DATA)
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
                source={{ uri: tip.image }}
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
                  {tip.description}
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
