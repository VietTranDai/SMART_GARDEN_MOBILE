import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

// Define SensorData interface (align with schema if needed)
interface SensorDataReading {
  timestamp: string;
  value: number;
}

interface SensorDetails {
  id: string; // sensor-1-temp, sensor-2-hum etc.
  gardenId: string;
  gardenName: string;
  type: string; // TEMPERATURE, HUMIDITY etc.
  name: string; // Nhiệt độ, Độ ẩm etc.
  currentValue: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  lastUpdated: string;
  icon: string;
  historicalData: SensorDataReading[];
}

// --- Mock Data Generation ---
const generateMockSensorDetails = (sensorId: string): SensorDetails | null => {
  const types = {
    "sensor-1-temp": {
      type: "TEMPERATURE",
      name: "Nhiệt độ",
      unit: "°C",
      icon: "thermometer",
    },
    "sensor-1-hum": {
      type: "HUMIDITY",
      name: "Độ ẩm",
      unit: "%",
      icon: "water-percent",
    },
    "sensor-1-soil": {
      type: "SOIL_MOISTURE",
      name: "Độ ẩm đất",
      unit: "%",
      icon: "water",
    },
    "sensor-1-light": {
      type: "LIGHT",
      name: "Ánh sáng",
      unit: " lux",
      icon: "white-balance-sunny",
    },
    "sensor-2-temp": {
      type: "TEMPERATURE",
      name: "Nhiệt độ",
      unit: "°C",
      icon: "thermometer",
    },
    "sensor-2-hum": {
      type: "HUMIDITY",
      name: "Độ ẩm",
      unit: "%",
      icon: "water-percent",
    },
    "sensor-3-temp": {
      type: "TEMPERATURE",
      name: "Nhiệt độ",
      unit: "°C",
      icon: "thermometer",
    },
    "sensor-3-soil": {
      type: "SOIL_MOISTURE",
      name: "Độ ẩm đất",
      unit: "%",
      icon: "water",
    },
  };

  const details = types[sensorId as keyof typeof types];
  if (!details) return null;

  const gardenInfo = sensorId.startsWith("sensor-1")
    ? { gardenId: "1", gardenName: "Vườn rau sân thượng" }
    : sensorId.startsWith("sensor-2")
    ? { gardenId: "2", gardenName: "Vườn hoa ban công" }
    : { gardenId: "3", gardenName: "Vườn thảo mộc cửa sổ" };

  const now = Date.now();
  const historicalData: SensorDataReading[] = [];
  for (let i = 11; i >= 0; i--) {
    // Last 12 readings (e.g., hourly for 12 hours)
    historicalData.push({
      timestamp: new Date(now - i * 60 * 60 * 1000).toISOString(), // Simulate hourly readings
      value: parseFloat(
        (
          Math.random() * 10 +
          (details.type === "TEMPERATURE" ? 15 : 50)
        ).toFixed(1)
      ), // Random value around a base
    });
  }

  const statuses: ("normal" | "warning" | "critical")[] = [
    "normal",
    "warning",
    "critical",
  ];

  return {
    id: sensorId,
    ...gardenInfo,
    ...details,
    currentValue: historicalData[historicalData.length - 1].value,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    lastUpdated: historicalData[historicalData.length - 1].timestamp,
    historicalData,
  };
};
// ---

export default function SensorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [sensorDetails, setSensorDetails] = useState<SensorDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      if (id) {
        const data = generateMockSensorDetails(id);
        setSensorDetails(data);
      }
      setLoading(false);
    }, 500); // Short delay for mock fetch
  }, [id]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "critical":
        return { color: theme.error, icon: "alert-circle" };
      case "warning":
        return { color: theme.warning, icon: "alert" };
      default:
        return { color: theme.success, icon: "checkmark-circle" };
    }
  };

  const getFormattedTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

  const screenWidth = Dimensions.get("window").width;
  const chartLabels =
    sensorDetails?.historicalData.map((reading) =>
      new Date(reading.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    ) || [];
  // Show fewer labels if too many
  const chartLabelsFiltered = chartLabels.filter(
    (_, index) => index % Math.ceil(chartLabels.length / 4) === 0 // Show max ~4-5 labels
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!sensorDetails) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="sad-outline" size={40} color={theme.textSecondary} />
        <Text style={styles.errorText}>Sensor details not found.</Text>
      </View>
    );
  }

  const statusStyle = getStatusStyle(sensorDetails.status);

  return (
    <>
      <Stack.Screen
        options={{ title: sensorDetails.name || "Sensor Detail" }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Reading Section */}
        <View style={styles.currentReadingCard}>
          <View style={styles.currentReadingHeader}>
            <MaterialCommunityIcons
              name={sensorDetails.icon as any}
              size={32}
              color={theme.primary}
            />
            <Text style={styles.sensorName}>{sensorDetails.name}</Text>
          </View>
          <Text style={styles.currentValueText}>
            {sensorDetails.currentValue}
            <Text style={styles.unitText}> {sensorDetails.unit}</Text>
          </Text>
          <View style={styles.statusContainer}>
            <Ionicons
              name={statusStyle.icon as any}
              size={18}
              color={statusStyle.color}
            />
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {sensorDetails.status.charAt(0).toUpperCase() +
                sensorDetails.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.lastUpdatedText}>
            Last updated: {getFormattedTimestamp(sensorDetails.lastUpdated)}
          </Text>
          <Text style={styles.gardenLinkText}>
            Garden: {sensorDetails.gardenName}
          </Text>
        </View>

        {/* Historical Data Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Historical Data (Last 12 hours)</Text>
          {sensorDetails.historicalData.length > 0 ? (
            <LineChart
              data={{
                labels: chartLabelsFiltered,
                datasets: [
                  {
                    data: sensorDetails.historicalData.map(
                      (reading) => reading.value
                    ),
                    color: (opacity = 1) => theme.primary, // Line color
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 40} // from react-native
              height={220}
              yAxisLabel=""
              yAxisSuffix={sensorDetails.unit}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 1,
                color: (opacity = 1) =>
                  theme.primary + (opacity * 255).toString(16).padStart(2, "0"), // Use primary with opacity
                labelColor: (opacity = 1) => theme.textSecondary, // Label color
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "1",
                  stroke: theme.primaryDark,
                },
                propsForBackgroundLines: {
                  stroke: theme.border, // Color of grid lines
                  strokeDasharray: "", // Solid lines
                },
              }}
              verticalLabelRotation={30} // Rotate labels to prevent overlap
              bezier // Smooth line
              style={styles.chartStyle}
            />
          ) : (
            <Text style={styles.noDataText}>No historical data available.</Text>
          )}
        </View>

        {/* Add more sections if needed: Optimal Range, Settings, etc. */}
      </ScrollView>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundAlt, // Light gray background
    },
    scrollContent: {
      padding: 20,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    currentReadingCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    currentReadingHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    sensorName: {
      fontSize: 22,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginLeft: 12,
    },
    currentValueText: {
      fontSize: 48,
      fontFamily: "Inter-Bold",
      color: theme.primary,
      textAlign: "center",
      marginBottom: 10,
    },
    unitText: {
      fontSize: 20,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    statusText: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      marginLeft: 6,
    },
    lastUpdatedText: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
      textAlign: "center",
      marginTop: 5,
    },
    gardenLinkText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 15,
    },
    chartCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingVertical: 16,
      //   paddingHorizontal: 10, // Padding handled by chart itself
      marginBottom: 20,
      alignItems: "center",
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    chartTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 16,
      alignSelf: "flex-start",
      marginLeft: 16,
    },
    chartStyle: {
      borderRadius: 16,
    },
    noDataText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      padding: 20,
    },
  });
