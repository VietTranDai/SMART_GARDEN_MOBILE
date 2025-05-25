import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Share,
  Alert,
  Button,
  ToastAndroid,
  Platform,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { TouchableOpacity } from "react-native-gesture-handler";

// Import proper types from schema
import {
  Sensor,
  SensorData,
  SensorType,
  SensorUnit,
} from "@/types/gardens/sensor.types";
import { SensorDataQueryParams } from "@/types/gardens/sensor-dtos";
import sensorService from "@/service/api/sensor.service";

// Define time range options
enum TimeRange {
  DAY = "24h",
  WEEK = "7 days",
  MONTH = "30 days",
}

// Define optimal ranges for each sensor type
const OPTIMAL_RANGES = {
  [SensorType.TEMPERATURE]: { min: 15, max: 32 },
  [SensorType.HUMIDITY]: { min: 30, max: 80 },
  [SensorType.SOIL_MOISTURE]: { min: 20, max: 80 },
  [SensorType.LIGHT]: { min: 5000, max: 80000 },
  [SensorType.SOIL_PH]: { min: 5.5, max: 7.5 },
  [SensorType.RAINFALL]: { min: 0, max: 50 },
  [SensorType.WATER_LEVEL]: { min: 10, max: 80 },
};

// Map SensorUnit to display string
const UNIT_DISPLAY = {
  [SensorUnit.CELSIUS]: "°C",
  [SensorUnit.PERCENT]: "%",
  [SensorUnit.LUX]: "lux",
  [SensorUnit.METER]: "m",
  [SensorUnit.MILLIMETER]: "mm",
  [SensorUnit.PH]: "pH",
};

export default function SensorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // State
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(
    TimeRange.DAY
  );
  const [stats, setStats] = useState<{
    min: number;
    max: number;
    avg: number;
  } | null>(null);

  // Parse sensor ID
  const parsedId = useMemo(() => {
    if (!id) return null;
    const cleanId = parseInt(id.toString().replace(/\D/g, ""));
    return isNaN(cleanId) ? null : cleanId;
  }, [id]);

  // Fetch sensor details
  const fetchSensorDetails = useCallback(async () => {
    if (!parsedId) {
      setError("ID cảm biến không hợp lệ");
      setLoading(false);
      return;
    }

    try {
      // Fetch sensor details
      const sensorDetails = await sensorService.getSensorById(parsedId);
      setSensor(sensorDetails);

      // Fetch sensor data based on selected time range
      await fetchSensorData(parsedId, selectedTimeRange);
    } catch (err) {
      console.error("Error fetching sensor details:", err);
      setError("Không thể tải thông tin cảm biến. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [parsedId, selectedTimeRange]);

  // Fetch sensor data based on time range
  const fetchSensorData = useCallback(
    async (sensorId: number, timeRange: TimeRange) => {
      try {
        // Calculate start date based on time range
        const now = new Date();
        let startDate: Date;
        let limit: number = 50;

        switch (timeRange) {
          case TimeRange.DAY:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            limit = 24;
            break;
          case TimeRange.WEEK:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            limit = 7 * 24;
            break;
          case TimeRange.MONTH:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            limit = 30 * 24;
            break;
          default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            limit = 24;
        }

        const params: SensorDataQueryParams = {
          limit,
          startDate: startDate.toISOString(),
        };

        const sensorReadings = await sensorService.getSensorData(
          sensorId,
          params
        );

        const sortedData = sensorReadings.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setSensorData(sortedData);

        // Calculate stats
        if (sortedData.length > 0) {
          const values = sortedData.map((reading) => reading.value);
          setStats({
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          });
        }
      } catch (err) {
        console.error("Error fetching sensor data:", err);
        if (!refreshing) {
          setError("Không thể tải dữ liệu cảm biến. Vui lòng thử lại.");
        }
      }
    },
    [refreshing]
  );

  // Initial load
  useEffect(() => {
    fetchSensorDetails();

    // Set up auto-refresh interval (every 5 minutes)
    const refreshInterval = setInterval(
      () => {
        if (parsedId) {
          fetchSensorData(parsedId, selectedTimeRange);
        }
      },
      5 * 60 * 1000
    );

    return () => clearInterval(refreshInterval);
  }, [fetchSensorDetails, parsedId, selectedTimeRange]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchSensorDetails();
    } finally {
      setRefreshing(false);
    }
  }, [fetchSensorDetails]);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setSelectedTimeRange(range);
  }, []);

  // Export sensor data as CSV
  const exportData = useCallback(async () => {
    if (!sensor || sensorData.length === 0) {
      showToast("Không có dữ liệu để xuất");
      return;
    }

    try {
      // Create CSV content
      let csvContent = "Timestamp,Value\n";
      sensorData.forEach((reading) => {
        csvContent += `${reading.timestamp},${reading.value}\n`;
      });

      // Share CSV content
      await Share.share({
        message: csvContent,
        title: `${sensor.name} Data Export`,
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast("Không thể xuất dữ liệu");
    }
  }, [sensor, sensorData]);

  // Toast helper
  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Thông báo", message);
    }
  };

  // Helper functions
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
    // Get optimal range for sensor type
    const optimalRange = OPTIMAL_RANGES[type];
    if (!optimalRange) return "normal";

    if (value < optimalRange.min * 0.7 || value > optimalRange.max * 1.3)
      return "critical";
    if (value < optimalRange.min || value > optimalRange.max) return "warning";
    return "normal";
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
  const chartLabels = useMemo(() => {
    if (sensorData.length === 0) return [];

    return sensorData.map((reading) => {
      const date = new Date(reading.timestamp);

      // Format based on time range
      if (selectedTimeRange === TimeRange.DAY) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } else {
        return date.toLocaleDateString([], {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
        });
      }
    });
  }, [sensorData, selectedTimeRange]);

  // Show fewer labels if too many
  const chartLabelsFiltered = useMemo(() => {
    if (chartLabels.length === 0) return [];

    const step = Math.ceil(
      chartLabels.length / Math.min(5, chartLabels.length)
    );
    return chartLabels.filter((_, index) => index % step === 0);
  }, [chartLabels]);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu cảm biến...</Text>
      </View>
    );
  }

  // Error state
  if (error || !sensor) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="sad-outline" size={40} color={theme.textSecondary} />
        <Text style={styles.errorText}>
          {error || "Không tìm thấy thông tin cảm biến."}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchSensorDetails()}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.goBackButton, { marginTop: 10 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.goBackButtonText}>Quay lại</Text>
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
  const sensorUnit = UNIT_DISPLAY[sensor.unit];
  const sensorIcon = getSensorIcon(sensor.type);

  // Get optimal range for current sensor
  const optimalRange = OPTIMAL_RANGES[sensor.type];

  return (
    <>
      <Stack.Screen
        options={{
          title: sensorName || "Chi tiết cảm biến",
          headerRight: () => (
            <TouchableOpacity onPress={exportData} style={{ marginRight: 16 }}>
              <Ionicons name="share-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
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
              {sensorStatus === "normal"
                ? "Bình thường"
                : sensorStatus === "warning"
                  ? "Cảnh báo"
                  : "Nguy hiểm"}
            </Text>
          </View>

          {/* Optimal Range Section */}
          {optimalRange && (
            <View style={styles.optimalRangeContainer}>
              <Text style={styles.optimalRangeTitle}>Ngưỡng tối ưu:</Text>
              <Text style={styles.optimalRangeValue}>
                {optimalRange.min} - {optimalRange.max} {sensorUnit}
              </Text>
            </View>
          )}

          <Text style={styles.lastUpdatedText}>
            Cập nhật lần cuối: {getFormattedTimestamp(lastUpdated)}
          </Text>

          {sensor.garden && (
            <TouchableOpacity
              style={styles.gardenLink}
              onPress={() =>
                router.push(`/(modules)/gardens/${sensor.gardenId}`)
              }
            >
              <Text style={styles.gardenLinkText}>
                Vườn: {sensor.garden.name}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Card */}
        {stats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Thống kê</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Thấp nhất</Text>
                <Text style={styles.statValue}>
                  {stats.min.toFixed(1)} {sensorUnit}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Trung bình</Text>
                <Text style={styles.statValue}>
                  {stats.avg.toFixed(1)} {sensorUnit}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Cao nhất</Text>
                <Text style={styles.statValue}>
                  {stats.max.toFixed(1)} {sensorUnit}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Time Range Selector */}
        <View style={styles.timeRangeCard}>
          <Text style={styles.timeRangeTitle}>Khoảng thời gian</Text>
          <View style={styles.timeRangeButtons}>
            {Object.values(TimeRange).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  selectedTimeRange === range && styles.timeRangeButtonActive,
                ]}
                onPress={() => handleTimeRangeChange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeButtonText,
                    selectedTimeRange === range &&
                      styles.timeRangeButtonTextActive,
                  ]}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Historical Data Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            Dữ liệu theo thời gian ({selectedTimeRange})
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
                  // Add optimal range reference if available
                  ...(optimalRange
                    ? [
                        {
                          data: Array(sensorData.length).fill(optimalRange.min),
                          color: () => theme.warning + "80", // Lower bound with opacity
                          strokeWidth: 1,
                          withDots: false,
                        },
                        {
                          data: Array(sensorData.length).fill(optimalRange.max),
                          color: () => theme.warning + "80", // Upper bound with opacity
                          strokeWidth: 1,
                          withDots: false,
                        },
                      ]
                    : []),
                ],
              }}
              width={screenWidth - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix={sensorUnit}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 1,
                color: (opacity = 1) =>
                  theme.primary + (opacity * 255).toString(16).padStart(2, "0"),
                labelColor: (opacity = 1) => theme.textSecondary,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "1",
                  stroke: theme.primaryDark,
                },
                propsForBackgroundLines: {
                  stroke: theme.border,
                  strokeDasharray: "",
                },
              }}
              bezier
              style={styles.chartStyle}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <MaterialCommunityIcons
                name="chart-line-variant"
                size={40}
                color={theme.textTertiary}
              />
              <Text style={styles.noDataText}>
                Không có dữ liệu trong khoảng thời gian này.
              </Text>
            </View>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push(`/(modules)/alerts/index`)}
          >
            <Ionicons name="notifications-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Xem cảnh báo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.secondary }]}
            onPress={exportData}
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Xuất dữ liệu</Text>
          </TouchableOpacity>
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
      paddingBottom: 40,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    errorText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
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
    goBackButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 8,
    },
    goBackButtonText: {
      color: theme.textSecondary,
      fontFamily: "Inter-Medium",
      fontSize: 16,
    },
    currentReadingCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
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
    optimalRangeContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 10,
      backgroundColor: theme.backgroundAlt,
      padding: 10,
      borderRadius: 8,
    },
    optimalRangeTitle: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginRight: 8,
    },
    optimalRangeValue: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
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
      padding: 10,
      backgroundColor: theme.primaryLight,
      borderRadius: 8,
    },
    gardenLinkText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      textAlign: "center",
    },
    statsCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statsTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      flex: 1,
      alignItems: "center",
      padding: 8,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontFamily: "Inter-Bold",
      color: theme.primary,
    },
    timeRangeCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    timeRangeTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 12,
    },
    timeRangeButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    timeRangeButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 20,
      marginHorizontal: 4,
      alignItems: "center",
      backgroundColor: theme.backgroundSecondary,
    },
    timeRangeButtonActive: {
      backgroundColor: theme.primary,
    },
    timeRangeButtonText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
    },
    timeRangeButtonTextActive: {
      color: "#fff",
    },
    chartCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingVertical: 16,
      marginBottom: 16,
      alignItems: "center",
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    chartTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 16,
      alignSelf: "flex-start",
      marginLeft: 16,
    },
    chartStyle: {
      borderRadius: 16,
    },
    noDataContainer: {
      padding: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    noDataText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 12,
    },
    actionsCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      flexDirection: "row",
      justifyContent: "space-around",
      elevation: 3,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginHorizontal: 8,
      flex: 1,
      justifyContent: "center",
    },
    actionButtonText: {
      color: "#fff",
      fontFamily: "Inter-Medium",
      fontSize: 14,
      marginLeft: 8,
    },
  });
