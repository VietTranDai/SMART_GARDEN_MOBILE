import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
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
  TouchableOpacity,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { debounce } from "@/utils/themeUtils";

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
  [SensorUnit.LITER]: "L",
};

// Helper function to convert hex color to RGB string (e.g., "255,0,0")
// This is a simplified helper, assumes hex is in #RRGGBB or #RGB format
const hexToRgb = (hex: string): string => {
  let r = "0",
    g = "0",
    b = "0";
  if (hex.length === 4) {
    // #RGB
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    // #RRGGBB
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return `${+r},${+g},${+b}`;
};

// Simplified status color function
const getSimpleStatusColor = (
  status: "normal" | "warning" | "critical",
  theme: ReturnType<typeof useAppTheme>
) => {
  const colors = {
    normal: theme.success || "#10B981",
    warning: theme.warning || "#F59E0B",
    critical: theme.error || "#EF4444",
  };
  return colors[status] || colors.normal;
};

// Loading indicator tối giản
const SimpleLoading = ({
  message = "Đang tải...",
  theme,
}: {
  message?: string;
  theme: ReturnType<typeof useAppTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]); // Each sub-component gets styles via theme
  return (
    <View style={styles.loadingContainer_minimal}>
      {" "}
      {/* Use a distinct style name */}
      <ActivityIndicator size="small" color={theme.primary} />
      <Text style={styles.loadingText_minimal}>{message}</Text>
    </View>
  );
};

// Error state user-friendly
const ErrorDisplay = ({
  error,
  onRetry,
  theme,
}: {
  error: string;
  onRetry: () => void;
  theme: ReturnType<typeof useAppTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.errorContainer_userFriendly}>
      {" "}
      {/* Use a distinct style name */}
      <Text style={styles.errorText_userFriendly}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Helper functions moved to module scope for use by sub-components ---
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

const getSensorIcon = (
  type: SensorType
): keyof typeof MaterialCommunityIcons.glyphMap => {
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
  const optimalRange = OPTIMAL_RANGES[type]; // OPTIMAL_RANGES is in module scope
  if (!optimalRange) return "normal";
  if (value < optimalRange.min * 0.7 || value > optimalRange.max * 1.3)
    return "critical";
  if (value < optimalRange.min || value > optimalRange.max) return "warning";
  return "normal";
};

// Component hiển thị giá trị hiện tại
const CurrentReading = ({
  sensor,
  theme,
  statusColor,
  unitDisplay,
  formattedTimestamp,
}: {
  sensor: Sensor;
  theme: ReturnType<typeof useAppTheme>;
  statusColor: string;
  unitDisplay: string;
  formattedTimestamp: string;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconName = getSensorIcon(sensor.type); // Now correctly accesses module-scope function

  return (
    <View style={styles.section}>
      {" "}
      {/* Use common section style */}
      <View style={styles.currentReadingHeader}>
        <MaterialCommunityIcons name={iconName} size={32} color={statusColor} />
        <Text style={[styles.currentValue, { color: statusColor }]}>
          {(sensor.lastReading ?? 0).toFixed(1)}
          <Text style={[styles.unit, { color: statusColor }]}>
            {unitDisplay}
          </Text>
        </Text>
      </View>
      <Text style={[styles.statusText, { color: statusColor }]}>
        Trạng thái:{" "}
        {getSensorStatus(sensor.lastReading ?? 0, sensor.type) === "normal" // Correctly accesses module-scope function
          ? "Bình thường"
          : getSensorStatus(sensor.lastReading ?? 0, sensor.type) === "warning" // Correctly accesses module-scope function
            ? "Cảnh báo"
            : "Nguy hiểm"}
      </Text>
      <Text style={styles.sensorNameDisplay}>{getSensorName(sensor.type)}</Text>{" "}
      {/* Use module-scope getSensorName */}
      <Text style={styles.lastUpdatedText}>{formattedTimestamp}</Text>
    </View>
  );
};

// Component cho time range selector đơn giản
const TimeRangeSelector = ({
  selected,
  onChange,
  theme,
}: {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
  theme: ReturnType<typeof useAppTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.timeRangeContainer_minimal}>
      {" "}
      {/* Use distinct style name */}
      {Object.values(TimeRange).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton_minimal, // Use distinct style name
            selected === range && styles.activeButton_minimal, // Use distinct style name
          ]}
          onPress={() => onChange(range)}
        >
          <Text
            style={[
              styles.timeRangeText_minimal, // Use distinct style name
              selected === range && styles.activeText_minimal, // Use distinct style name
            ]}
          >
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Stats section tối giản
const StatsSection = ({
  stats,
  unit,
  timeRange,
  theme,
}: {
  stats: { min: number; max: number; avg: number };
  unit: string;
  timeRange: TimeRange;
  theme: ReturnType<typeof useAppTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.section}>
      {" "}
      {/* Use common section style */}
      <Text style={styles.statsTitle_minimal}>Thống kê ({timeRange})</Text>{" "}
      {/* Use distinct style name */}
      <View style={styles.statsGrid_minimal}>
        {" "}
        {/* Use distinct style name */}
        {[
          { label: "Thấp nhất", value: stats.min },
          { label: "Trung bình", value: stats.avg },
          { label: "Cao nhất", value: stats.max },
        ].map((stat, index) => (
          <View key={index} style={styles.statCard_minimal}>
            {" "}
            {/* Use distinct style name */}
            <Text style={styles.statValue_minimal}>
              {stat.value.toFixed(1)}
              {unit ? ` ${unit}` : ""}
            </Text>
            <Text style={styles.statLabel_minimal}>{stat.label}</Text>{" "}
            {/* Use distinct style name */}
          </View>
        ))}
      </View>
    </View>
  );
};

export default function SensorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

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
  const lastFetchTimeRef = useRef<number>(0); // Ref for debouncing initial/interval fetch

  // Parse sensor ID
  const parsedId = useMemo(() => {
    if (!id) return null;
    const cleanId = parseInt(id.toString().replace(/\D/g, ""));
    return isNaN(cleanId) ? null : cleanId;
  }, [id]);

  // Fetch sensor details and initial data
  const fetchSensorDetailsAndData = useCallback(async () => {
    if (!parsedId) {
      setError("ID cảm biến không hợp lệ");
      setLoading(false);
      return;
    }
    setLoading(true); // Ensure loading is true at the start of a full fetch
    setError(null); // Clear previous errors
    try {
      // Debounce logic for fetchSensorDetailsAndData itself
      // const now = Date.now();
      // if (now - lastFetchTimeRef.current < 5000 && !isRefreshing) { // 5s debounce, allow if manually refreshing
      //   console.log("Debouncing full data fetch - too frequent");
      //   setLoading(false); // Ensure loading is false if we skip
      //   return;
      // }
      // lastFetchTimeRef.current = now;

      const sensorDetails = await sensorService.getSensorById(parsedId);
      setSensor(sensorDetails);
      // Pass the fetched sensor's type to fetchSensorData if needed for specific logic there
      await fetchSensorData(parsedId, selectedTimeRange, sensorDetails.type);
    } catch (err) {
      console.error("Error fetching sensor details:", err);
      setError("Không thể tải thông tin cảm biến. Vui lòng thử lại.");
      setSensor(null); // Clear sensor on error
    } finally {
      setLoading(false);
    }
  }, [parsedId, selectedTimeRange]);

  // Fetch sensor data based on time range
  const fetchSensorData = useCallback(
    async (sensorId: number, timeRange: TimeRange, sensorType?: SensorType) => {
      try {
        const now = new Date();
        let startDate: Date;
        let limit: number = 50;

        switch (timeRange) {
          case TimeRange.DAY:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            limit = 24; // e.g., hourly data for 24h
            break;
          case TimeRange.WEEK:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            limit = 7 * 24; // e.g., hourly data for 7 days
            break;
          case TimeRange.MONTH:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            limit = 30 * 12; // e.g., bi-hourly data for 30 days, or adjust as needed
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

        if (sortedData.length > 0) {
          const values = sortedData.map((reading) => reading.value);
          setStats({
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          });
        } else {
          setStats(null); // Clear stats if no data
        }
      } catch (err) {
        console.error("Error fetching sensor data:", err);
        if (!error && !refreshing) {
          setError("Không thể tải dữ liệu lịch sử cảm biến.");
        }
      }
    },
    [refreshing, error]
  );

  useEffect(() => {
    // Debounce the initial fetch and subsequent interval fetches slightly
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 3000) {
      // 3s debounce for automated calls
      // console.log("Debouncing automated fetchSensorDetailsAndData call");
      return;
    }
    lastFetchTimeRef.current = now;

    fetchSensorDetailsAndData();
    const refreshInterval = setInterval(
      () => {
        const intervalNow = Date.now();
        if (intervalNow - lastFetchTimeRef.current < 5 * 60 * 1000) {
          // Ensure interval respects its own timing relative to last fetch
          // console.log("Debouncing interval fetchSensorData call");
          return;
        }
        if (parsedId && sensor?.type) {
          lastFetchTimeRef.current = intervalNow;
          fetchSensorData(parsedId, selectedTimeRange, sensor.type);
        }
      },
      5 * 60 * 1000
    );
    return () => clearInterval(refreshInterval);
  }, [fetchSensorDetailsAndData, parsedId, selectedTimeRange, sensor?.type]);

  const debouncedRefresh = useCallback(
    debounce(() => {
      setRefreshing(true);
      setError(null);
      fetchSensorDetailsAndData().finally(() => setRefreshing(false));
    }, 500), // 500ms debounce for manual refresh
    [fetchSensorDetailsAndData] // fetchSensorDetailsAndData is already a callback
  );

  const onRefreshInternal = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    await fetchSensorDetailsAndData();
    setRefreshing(false);
  }, [fetchSensorDetailsAndData]);

  const debouncedOnRefresh = useCallback(debounce(onRefreshInternal, 500), [
    onRefreshInternal,
  ]);

  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setSelectedTimeRange(range);
      if (parsedId && sensor?.type) {
        setLoading(true); // Show loading indicator for chart data change
        fetchSensorData(parsedId, range, sensor.type).finally(() =>
          setLoading(false)
        );
      }
    },
    [parsedId, sensor?.type, fetchSensorData]
  );

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

  const getFormattedTimestamp = (
    isoString: string,
    short: boolean = false
  ): string => {
    const date = new Date(isoString);
    if (short)
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${date.toLocaleTimeString("vi-VN")} ${date.toLocaleDateString("vi-VN")}`;
  };

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
  if (loading && !refreshing && !sensor) {
    return (
      <SimpleLoading theme={theme} message="Đang tải chi tiết cảm biến..." />
    );
  }

  // Error state
  if (error && !sensor) {
    return (
      <>
        <Stack.Screen options={{ title: "Lỗi" }} />
        <ErrorDisplay theme={theme} error={error} onRetry={onRefreshInternal} />
      </>
    );
  }

  if (!sensor) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: "Không tìm thấy" }} />
        <Text style={styles.errorText}>
          Không tìm thấy thông tin cảm biến. ID: {id}
        </Text>
      </View>
    );
  }

  const currentStatus = getSensorStatus(sensor.lastReading ?? 0, sensor.type);
  const simpleStatusColor = getSimpleStatusColor(currentStatus, theme);
  const optimalRange = OPTIMAL_RANGES[sensor.type as SensorType];

  // Simplified chart config
  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 1,
    color: () => theme.primary,
    labelColor: () => theme.textSecondary,
    style: {
      borderRadius: 8,
    },
    propsForDots: {
      r: "3",
      strokeWidth: "1",
      stroke: theme.card,
      fill: theme.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: theme.borderLight,
      strokeWidth: 0.5,
    },
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: sensor.name || "Chi tiết Cảm biến",
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerShadowVisible: false,
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontFamily: "Inter-Medium",
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={theme.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={exportData}
              style={{ paddingHorizontal: 15 }}
            >
              <Ionicons
                name="download-outline"
                size={22}
                color={theme.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={debouncedOnRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {loading && refreshing && (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={styles.chartLoadingText}>
              Đang cập nhật dữ liệu...
            </Text>
          </View>
        )}

        {/* Current Reading Section */}
        {sensor && (
          <CurrentReading
            sensor={sensor}
            theme={theme}
            statusColor={simpleStatusColor}
            unitDisplay={UNIT_DISPLAY[sensor.unit] || ""}
            formattedTimestamp={getFormattedTimestamp(
              sensor.lastReadingAt ?? new Date().toISOString()
            )}
          />
        )}

        {/* Time Range Selector - Restored */}
        {sensor && (
          <TimeRangeSelector
            selected={selectedTimeRange}
            onChange={handleTimeRangeChange}
            theme={theme}
          />
        )}

        {/* Chart Section */}
        {sensor && ( // Ensure sensor exists before rendering chart section which might depend on sensor.unit etc.
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử dữ liệu</Text>
            {error && !sensorData.length && (
              <View style={styles.chartErrorContainer}>
                <Text style={styles.chartErrorText}>{error}</Text>
                <Button
                  title="Tải lại biểu đồ"
                  onPress={() => {
                    if (parsedId && sensor?.type)
                      fetchSensorData(parsedId, selectedTimeRange, sensor.type);
                  }}
                  color={theme.primary}
                />
              </View>
            )}
            {!error && sensorData.length > 0 && (
              <LineChart
                data={{
                  labels: chartLabelsFiltered,
                  datasets: [
                    {
                      data: sensorData.map((d) => d.value),
                    },
                    ...(optimalRange
                      ? [
                          {
                            data: Array(sensorData.length).fill(
                              optimalRange.min
                            ),
                            color: (opacity = 1) =>
                              `rgba(${hexToRgb(theme.success)}, ${opacity * 0.3})`,
                            strokeWidth: 1,
                            withDots: false,
                            strokeDashArray: [2, 2],
                          },
                          {
                            data: Array(sensorData.length).fill(
                              optimalRange.max
                            ),
                            color: (opacity = 1) =>
                              `rgba(${hexToRgb(theme.success)}, ${opacity * 0.3})`,
                            strokeWidth: 1,
                            withDots: false,
                            strokeDashArray: [2, 2],
                          },
                        ]
                      : []),
                  ],
                  legend: optimalRange
                    ? [
                        "Đo được",
                        `Tối ưu (${optimalRange.min}-${optimalRange.max}${UNIT_DISPLAY[sensor.unit] || ""})`,
                      ]
                    : ["Đo được"],
                }}
                width={Dimensions.get("window").width - 64}
                height={220}
                yAxisSuffix={` ${UNIT_DISPLAY[sensor.unit] || ""}`}
                yAxisInterval={1}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
                withShadow={false}
                segments={4}
                fromZero={false}
                formatYLabel={(value) => `${parseFloat(value).toFixed(1)}`}
              />
            )}
            {!error && !loading && sensorData.length === 0 && (
              <Text style={styles.noDataText}>
                Không có dữ liệu lịch sử cho khoảng thời gian này.
              </Text>
            )}
          </View>
        )}

        {/* Stats Section - Temporarily commented out */}
        {/* {stats && sensor && (
          <StatsSection
            stats={stats}
            unit={UNIT_DISPLAY[sensor.unit] || ''} 
            timeRange={selectedTimeRange}
            theme={theme}
          />
        )} */}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    chartLoadingContainer: {
      paddingVertical: 20,
      alignItems: "center",
    },
    chartLoadingText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.background,
    },
    errorText: {
      fontSize: 16,
      color: theme.error,
      textAlign: "center",
      marginBottom: 20,
      fontFamily: "Inter-Medium",
    },
    chartErrorContainer: {
      paddingVertical: 20,
      alignItems: "center",
    },
    chartErrorText: {
      fontSize: 14,
      color: theme.error,
      textAlign: "center",
      marginBottom: 10,
      fontFamily: "Inter-Regular",
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    currentReadingHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      marginBottom: 12,
    },
    currentValue: {
      fontSize: 48,
      fontFamily: "Inter-Bold",
    },
    unit: {
      fontSize: 20,
      fontFamily: "Inter-Medium",
      marginLeft: 4,
    },
    statusText: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
      marginBottom: 8,
    },
    lastUpdatedText: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
      textAlign: "center",
    },
    timeRangeContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginHorizontal: 0,
      marginTop: 0,
      marginBottom: 16,
      backgroundColor: theme.card,
      borderRadius: 8,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    timeRangeButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    timeRangeButtonSelected: {
      backgroundColor: `rgba(${hexToRgb(theme.primary)}, 0.15)`,
    },
    timeRangeButtonText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Medium",
    },
    timeRangeButtonTextSelected: {
      color: theme.primary,
      fontFamily: "Inter-Bold",
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 16,
    },
    chartStyle: {
      borderRadius: 8,
      marginTop: 8,
    },
    noDataText: {
      textAlign: "center",
      paddingVertical: 30,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      fontSize: 15,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      alignItems: "center",
      backgroundColor: theme.backgroundSecondary,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 6,
      flex: 1,
      marginHorizontal: 4,
    },
    statLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    loadingContainer_minimal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.background,
    },
    loadingText_minimal: {
      marginTop: 12,
      fontSize: 15,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    errorContainer_userFriendly: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.background,
    },
    errorText_userFriendly: {
      fontSize: 16,
      color: theme.error,
      textAlign: "center",
      marginBottom: 24,
      fontFamily: "Inter-Medium",
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    retryText: {
      color: theme.buttonText,
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    sensorNameDisplay: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 4,
      marginBottom: 8,
    },
    timeRangeContainer_minimal: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 16,
      backgroundColor: theme.card,
      borderRadius: 8,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    timeRangeButton_minimal: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    activeButton_minimal: {
      backgroundColor: `rgba(${hexToRgb(theme.primary)}, 0.15)`,
    },
    timeRangeText_minimal: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: "Inter-Medium",
    },
    activeText_minimal: {
      color: theme.primary,
      fontFamily: "Inter-Bold",
    },
    statsTitle_minimal: {
      fontSize: 18,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 16,
    },
    statsGrid_minimal: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statCard_minimal: {
      alignItems: "center",
      backgroundColor: theme.backgroundSecondary,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 6,
      flex: 1,
      marginHorizontal: 4,
    },
    statLabel_minimal: {
      fontSize: 13,
      color: theme.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: 4,
    },
    statValue_minimal: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
  });
