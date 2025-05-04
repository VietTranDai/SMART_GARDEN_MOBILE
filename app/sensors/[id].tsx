import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { TouchableOpacity } from "react-native-gesture-handler";

// Import proper types from schema
import { Sensor, SensorData, SensorType } from "@/types/gardens/sensor.types";
import { SensorDataQueryParams } from "@/types/gardens/sensor-dtos";
import { sensorService } from "@/service/api";

export default function SensorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSensorDetails = async () => {
      if (!id) {
        setError("Sensor ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Clean up the id if it contains non-numeric characters
        const cleanId = parseInt(id.toString().replace(/\D/g, ""));

        if (isNaN(cleanId)) {
          setError("Invalid sensor ID");
          setLoading(false);
          return;
        }

        // Fetch sensor details
        const sensorDetails = await sensorService.getSensorById(cleanId);
        setSensor(sensorDetails);

        // Fetch sensor data with limit
        const params: SensorDataQueryParams = {
          limit: 12, // Last 12 readings
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
        };
        const sensorReadings = await sensorService.getSensorData(
          cleanId,
          params
        );
        setSensorData(
          sensorReadings.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        );
      } catch (err) {
        console.error("Error fetching sensor details:", err);
        setError("Failed to load sensor details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSensorDetails();
  }, [id]);

  const getSensorName = (type: SensorType): string => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "Nhiệt độ";
      case SensorType.HUMIDITY:
        return "Độ ẩm";
      case SensorType.SOIL_MOISTURE:
        return "Độ ẩm đất";
      case SensorType.LIGHT:
        return "Ánh sáng";
      case SensorType.WATER_LEVEL:
        return "Mực nước";
      case SensorType.RAINFALL:
        return "Lượng mưa";
      case SensorType.SOIL_PH:
        return "Độ pH đất";
      default:
        return "Cảm biến";
    }
  };

  const getSensorUnit = (type: SensorType): string => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "°C";
      case SensorType.HUMIDITY:
        return "%";
      case SensorType.SOIL_MOISTURE:
        return "%";
      case SensorType.LIGHT:
        return "lux";
      case SensorType.SOIL_PH:
        return "pH";
      case SensorType.RAINFALL:
        return "mm";
      case SensorType.WATER_LEVEL:
        return "cm";
      default:
        return "";
    }
  };

  const getSensorIcon = (type: SensorType): string => {
    switch (type) {
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

  const getSensorStatus = (
    value: number,
    type: SensorType
  ): "normal" | "warning" | "critical" => {
    // Thresholds based on plant science
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

  // Prepare chart data
  const chartLabels = sensorData.map((reading) =>
    new Date(reading.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  );

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

  if (error || !sensor) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="sad-outline" size={40} color={theme.textSecondary} />
        <Text style={styles.errorText}>
          {error || "Sensor details not found."}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentValue =
    sensorData.length > 0 ? sensorData[sensorData.length - 1].value : 0;
  const lastUpdated =
    sensorData.length > 0
      ? sensorData[sensorData.length - 1].timestamp
      : sensor.updatedAt;
  const sensorStatus =
    sensorData.length > 0
      ? getSensorStatus(currentValue, sensor.type)
      : "normal";
  const statusStyle = getStatusStyle(sensorStatus);
  const sensorName = getSensorName(sensor.type);
  const sensorUnit = getSensorUnit(sensor.type);
  const sensorIcon = getSensorIcon(sensor.type);

  return (
    <>
      <Stack.Screen options={{ title: sensorName || "Sensor Detail" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Reading Section */}
        <View style={styles.currentReadingCard}>
          <View style={styles.currentReadingHeader}>
            <MaterialCommunityIcons
              name={sensorIcon as any}
              size={32}
              color={theme.primary}
            />
            <Text style={styles.sensorName}>{sensorName}</Text>
          </View>
          <Text style={styles.currentValueText}>
            {currentValue.toFixed(1)}
            <Text style={styles.unitText}> {sensorUnit}</Text>
          </Text>
          <View style={styles.statusContainer}>
            <Ionicons
              name={statusStyle.icon as any}
              size={18}
              color={statusStyle.color}
            />
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {sensorStatus.charAt(0).toUpperCase() + sensorStatus.slice(1)}
            </Text>
          </View>
          <Text style={styles.lastUpdatedText}>
            Last updated: {getFormattedTimestamp(lastUpdated)}
          </Text>
          {sensor.garden && (
            <TouchableOpacity
              style={styles.gardenLink}
              onPress={() =>
                router.push(`/(modules)/gardens/${sensor.gardenId}`)
              }
            >
              <Text style={styles.gardenLinkText}>
                Garden: {sensor.garden.name}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Historical Data Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            Historical Data (Last 12 readings)
          </Text>
          {sensorData.length > 0 ? (
            <LineChart
              data={{
                labels: chartLabelsFiltered,
                datasets: [
                  {
                    data: sensorData.map((reading) => reading.value),
                    color: (opacity = 1) => theme.primary, // Line color
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix={sensorUnit}
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
              verticalLabelRotation={0}
              bezier // Smooth line
              style={styles.chartStyle}
            />
          ) : (
            <Text style={styles.noDataText}>No historical data available.</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundAlt,
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
    retryButton: {
      marginTop: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      color: theme.card,
      fontFamily: "Inter-Medium",
      fontSize: 16,
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
    gardenLink: {
      marginTop: 15,
    },
    gardenLinkText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.primary,
      textAlign: "center",
    },
    chartCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingVertical: 16,
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
