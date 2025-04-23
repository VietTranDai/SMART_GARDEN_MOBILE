import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  FlatList,
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

// Mocked data for development
const GARDENS_DATA = [
  {
    id: "1",
    name: "Backyard Garden",
    cropName: "Tomatoes",
    cropStage: "Flowering",
    thumbnail: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e",
    location: "Home",
    alerts: 2,
    sensors: {
      temperature: 24.5,
      humidity: 65,
      soilMoisture: 58,
    },
    lastActivity: "Water tomato plants (2 hours ago)",
  },
  {
    id: "2",
    name: "Rooftop Herbs",
    cropName: "Basil, Mint, Rosemary",
    cropStage: "Growing",
    thumbnail: "https://images.unsplash.com/photo-1599273374206-833f244ef7d7",
    location: "Apartment",
    alerts: 0,
    sensors: {
      temperature: 26.8,
      humidity: 55,
      soilMoisture: 42,
    },
    lastActivity: "Added new mint plant (1 day ago)",
  },
  {
    id: "3",
    name: "Community Plot",
    cropName: "Mixed Vegetables",
    cropStage: "Various",
    thumbnail: "https://images.unsplash.com/photo-1627660829983-81d7a3e6cc42",
    location: "Downtown Garden Club",
    alerts: 1,
    sensors: {
      temperature: 22.3,
      humidity: 70,
      soilMoisture: 65,
    },
    lastActivity: "Harvested carrots (5 hours ago)",
  },
];

const SENSOR_DATA = [
  {
    id: "1",
    gardenId: "1",
    gardenName: "Backyard Garden",
    type: "temperature",
    icon: "thermometer",
    value: 24.5,
    unit: "°C",
    status: "normal",
    timestamp: "2025-04-20T14:30:00Z",
  },
  {
    id: "2",
    gardenId: "1",
    gardenName: "Backyard Garden",
    type: "humidity",
    icon: "water-percent",
    value: 65,
    unit: "%",
    status: "normal",
    timestamp: "2025-04-20T14:30:00Z",
  },
  {
    id: "3",
    gardenId: "1",
    gardenName: "Backyard Garden",
    type: "soilMoisture",
    icon: "water",
    value: 58,
    unit: "%",
    status: "warning",
    timestamp: "2025-04-20T14:30:00Z",
  },
  {
    id: "4",
    gardenId: "2",
    gardenName: "Rooftop Herbs",
    type: "temperature",
    icon: "thermometer",
    value: 26.8,
    unit: "°C",
    status: "warning",
    timestamp: "2025-04-20T14:15:00Z",
  },
  {
    id: "5",
    gardenId: "2",
    gardenName: "Rooftop Herbs",
    type: "light",
    icon: "white-balance-sunny",
    value: 85,
    unit: "%",
    status: "normal",
    timestamp: "2025-04-20T14:15:00Z",
  },
];

// Define Garden and SensorData interfaces
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
    soilMoisture?: number;
  };
  lastActivity: string;
}

interface SensorData {
  id: string;
  gardenId: string;
  gardenName: string;
  type: string;
  icon: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  timestamp: string;
}

export default function HomeScreen() {
  const theme = useAppTheme();
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [gardens, setGardens] = useState(GARDENS_DATA);
  const [sensorData, setSensorData] = useState(SENSOR_DATA);
  const [selectedGarden, setSelectedGarden] = useState<string | null>("1"); // Default selected garden ID

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Format greeting based on time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setGardens(GARDENS_DATA);
      setSensorData(SENSOR_DATA);
      setRefreshing(false);
    }, 1500);
  }, []);

  const filteredSensorData = selectedGarden
    ? sensorData.filter((sensor) => sensor.gardenId === selectedGarden)
    : sensorData;

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

  const getSensorIcon = (type: string, icon: string) => {
    // Use the provided icon or fall back to a default based on type
    switch (icon) {
      case "thermometer":
      case "water-percent":
      case "water":
      case "white-balance-sunny":
        return (
          <MaterialCommunityIcons name={icon} size={24} color={theme.primary} />
        );
      default:
        return <Ionicons name="leaf-outline" size={24} color={theme.primary} />;
    }
  };

  const renderGardenItem = ({ item }: { item: Garden }) => (
    <TouchableOpacity
      style={[
        styles.gardenCard,
        {
          backgroundColor: theme.card,
          borderColor:
            selectedGarden === item.id ? theme.primary : "transparent",
        },
      ]}
      onPress={() => {
        setSelectedGarden(item.id);
      }}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.gardenThumbnail}
        resizeMode="cover"
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
            <View style={styles.alertBadge}>
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
          {item.sensors.temperature && (
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

          {item.sensors.humidity && (
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

  const renderSensorItem = ({ item }: { item: SensorData }) => (
    <TouchableOpacity
      style={[styles.sensorCard, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/(modules)/sensors/${item.id}`)}
    >
      <View style={styles.sensorHeader}>
        <View
          style={[
            styles.sensorIconContainer,
            { backgroundColor: getStatusColor(item.status) + "15" },
          ]}
        >
          {getSensorIcon(item.type, item.icon)}
        </View>
        <View
          style={[
            styles.sensorStatus,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.sensorStatusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={[styles.sensorType, { color: theme.text }]}>
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
      </Text>

      <View style={styles.sensorValueContainer}>
        <Text style={[styles.sensorValueText, { color: theme.text }]}>
          {item.value}
          <Text style={[styles.sensorUnit, { color: theme.textSecondary }]}>
            {item.unit}
          </Text>
        </Text>
      </View>

      <Text style={[styles.sensorGarden, { color: theme.textSecondary }]}>
        {item.gardenName}
      </Text>

      <Text style={[styles.sensorTimestamp, { color: theme.textTertiary }]}>
        {new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      edges={["bottom"]}
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.username, { color: theme.text }]}>
              {user?.firstName
                ? `${user?.firstName} ${user?.lastName}`
                : "Gardener"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.weatherButton, { backgroundColor: theme.card }]}
            onPress={() => {
              router.push("/(modules)/weather" as any);
            }}
          >
            <MaterialCommunityIcons
              name="weather-partly-cloudy"
              size={22}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>

        {/* My Gardens Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              My Gardens
            </Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => {
                router.push("/(modules)/gardens/all" as any);
              }}
            >
              <Text style={[styles.viewAllText, { color: theme.primary }]}>
                View All
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={14}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>

          {gardens.length > 0 ? (
            <FlatList
              data={gardens}
              renderItem={renderGardenItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gardensListContent}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            />
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <MaterialCommunityIcons
                name="sprout"
                size={40}
                color={theme.textTertiary}
              />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No gardens yet
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                Add your first garden to get started
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyStateButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={() => router.push("/(modules)/gardens/new" as any)}
              >
                <Text style={styles.emptyStateButtonText}>Add Garden</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sensor Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Sensor Data
            </Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => {
                router.push("/(modules)/sensors" as any);
              }}
            >
              <Text style={[styles.viewAllText, { color: theme.primary }]}>
                All Sensors
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={14}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>

          {filteredSensorData.length > 0 ? (
            <FlatList
              data={filteredSensorData as SensorData[]}
              renderItem={renderSensorItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sensorListContent}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            />
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <MaterialCommunityIcons
                name="access-point"
                size={40}
                color={theme.textTertiary}
              />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No sensor data
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
                {selectedGarden
                  ? "No sensors found for this garden"
                  : "Add sensors to your garden to monitor conditions"}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.card }]}
              onPress={() => router.push("/(modules)/tasks/new" as any)}
            >
              <View
                style={[
                  styles.quickActionIcon,
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
                Add Task
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.card }]}
              onPress={() => router.push("/(modules)/gardens/new" as any)}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="flower"
                  size={24}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.quickActionText, { color: theme.text }]}>
                New Garden
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.card }]}
              onPress={() => router.push("/(modules)/community/new" as any)}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <Ionicons name="create" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: theme.text }]}>
                New Post
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.card }]}
              onPress={() => router.push("/(modules)/sensors/scan" as any)}
            >
              <View
                style={[
                  styles.quickActionIcon,
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
                Scan Sensor
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/(modules)/gardens/new" as any)}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    welcomeSection: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
    },
    greeting: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
    },
    username: {
      fontSize: 24,
      fontFamily: "Inter-Bold",
      marginTop: 4,
    },
    weatherButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    viewAllText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      marginRight: 4,
    },
    gardensListContent: {
      paddingRight: 20,
    },
    gardenCard: {
      width: 280,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 2,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    gardenThumbnail: {
      width: "100%",
      height: 120,
    },
    gardenContent: {
      padding: 12,
    },
    gardenHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    gardenTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      flex: 1,
    },
    alertBadge: {
      backgroundColor: "#D32F2F",
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    alertBadgeText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "bold",
    },
    gardenLocation: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      marginBottom: 6,
    },
    gardenCrop: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      marginBottom: 8,
    },
    sensorPreviewContainer: {
      flexDirection: "row",
      marginBottom: 8,
    },
    sensorPreview: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    sensorValue: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      marginLeft: 4,
    },
    gardenFooter: {
      borderTopWidth: 1,
      borderTopColor: "#EEEEEE",
      paddingTop: 8,
    },
    lastActivity: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
    },
    sensorListContent: {
      paddingRight: 20,
    },
    sensorCard: {
      width: 140,
      borderRadius: 12,
      padding: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    sensorHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sensorIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    sensorStatus: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    sensorStatusText: {
      fontSize: 10,
      fontFamily: "Inter-Medium",
    },
    sensorType: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      marginBottom: 4,
    },
    sensorValueContainer: {
      marginBottom: 8,
    },
    sensorValueText: {
      fontSize: 20,
      fontFamily: "Inter-Bold",
    },
    sensorUnit: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
    sensorGarden: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      marginBottom: 4,
    },
    sensorTimestamp: {
      fontSize: 11,
      fontFamily: "Inter-Regular",
    },
    emptyState: {
      alignItems: "center",
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    emptyStateTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      marginTop: 12,
      marginBottom: 4,
    },
    emptyStateSubtitle: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginBottom: 16,
    },
    emptyStateButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.primary,
    },
    emptyStateButtonText: {
      color: "#FFFFFF",
      fontFamily: "Inter-Medium",
      fontSize: 14,
    },
    quickActionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: 8,
    },
    quickAction: {
      width: "48%",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      backgroundColor: theme.card,
    },
    quickActionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    addButton: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      backgroundColor: theme.primary,
    },
  });
