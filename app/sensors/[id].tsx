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
  DAY = "24 giờ",
  WEEK = "7 ngày",
  MONTH = "30 ngày",
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

// Helper function to convert hex color to RGB string
const hexToRgb = (hex: string): string => {
  let r = "0",
    g = "0",
    b = "0";
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return `${+r},${+g},${+b}`;
};

// Simplified status color function
const getSimpleStatusColor = (
  status: "normal" | "warning" | "critical",
  theme: ReturnType<typeof getEnhancedTheme>
) => {
  const colors = {
    normal: theme.semantic.success,
    warning: theme.semantic.warning,
    critical: theme.semantic.error,
  };
  return colors[status] || colors.normal;
};

// Loading indicator
const SimpleLoading = ({
  message = "Đang tải...",
  theme,
}: {
  message?: string;
  theme: ReturnType<typeof getEnhancedTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.infoText}>{message}</Text>
    </View>
  );
};

// Error display
const ErrorDisplay = ({
  error,
  onRetry,
  theme,
}: {
  error: string;
  onRetry: () => void;
  theme: ReturnType<typeof getEnhancedTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.centeredContainer}>
      <Ionicons name="cloud-offline-outline" size={48} color={theme.error} />
      <Text
        style={[styles.infoText, { color: theme.error, marginVertical: 15 }]}
      >
        {error}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
};

// Loading Card (for use within other cards)
const LoadingCard = ({
  theme,
  message = "Đang tải dữ liệu...",
}: {
  theme: ReturnType<typeof getEnhancedTheme>;
  message?: string;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.cardContentPlaceholder, styles.loadingCard]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

// Skeleton Card (for placeholder UI)
const SkeletonCard = ({
  theme,
}: {
  theme: ReturnType<typeof getEnhancedTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View
      style={[
        styles.card,
        styles.skeletonCard,
        { backgroundColor: theme.card },
      ]}
    >
      <View
        style={[
          styles.skeletonTitle,
          { backgroundColor: `${theme.textSecondary}20` },
        ]}
      />
      <View
        style={[
          styles.skeletonContent,
          { backgroundColor: `${theme.textSecondary}15` },
        ]}
      />
      <View
        style={[
          styles.skeletonFooter,
          { backgroundColor: `${theme.textSecondary}10` },
        ]}
      />
    </View>
  );
};

// Error Card (for displaying errors within a card context)
const ErrorCard = ({
  error,
  onRetry,
  theme,
}: {
  error: string;
  onRetry?: () => void;
  theme: ReturnType<typeof getEnhancedTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.cardContentPlaceholder}>
      <Ionicons name="alert-circle-outline" size={32} color={theme.error} />
      <Text
        style={[
          styles.infoText,
          { color: theme.error, marginVertical: 10, fontSize: 14 },
        ]}
      >
        {error}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[
            styles.retryButton,
            { paddingVertical: 8, paddingHorizontal: 20, marginTop: 10 },
          ]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { fontSize: 14 }]}>Thử lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Empty Data Card (for displaying no data message within a card context)
const EmptyDataCard = ({
  theme,
  message = "Không có dữ liệu để hiển thị.",
}: {
  theme: ReturnType<typeof getEnhancedTheme>;
  message?: string;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.cardContentPlaceholder}>
      <Ionicons
        name="information-circle-outline"
        size={32}
        color={theme.textSecondary}
      />
      <Text style={[styles.infoText, { marginTop: 10, fontSize: 14 }]}>
        {message}
      </Text>
    </View>
  );
};

// --- Helper functions ---
const getSensorName = (type: SensorType): string =>
  ({
    [SensorType.TEMPERATURE]: "Nhiệt độ",
    [SensorType.HUMIDITY]: "Độ ẩm",
    [SensorType.SOIL_MOISTURE]: "Độ ẩm đất",
    [SensorType.LIGHT]: "Ánh sáng",
    [SensorType.WATER_LEVEL]: "Mực nước",
    [SensorType.RAINFALL]: "Lượng mưa",
    [SensorType.SOIL_PH]: "Độ pH đất",
  })[type] || "Cảm biến";

const getSensorIcon = (
  type: SensorType
): keyof typeof MaterialCommunityIcons.glyphMap =>
  (({
    [SensorType.TEMPERATURE]: "thermometer",
    [SensorType.HUMIDITY]: "water-percent",
    [SensorType.SOIL_MOISTURE]: "water-outline",
    [SensorType.LIGHT]: "white-balance-sunny",
    [SensorType.WATER_LEVEL]: "water",
    [SensorType.RAINFALL]: "weather-pouring",
    [SensorType.SOIL_PH]: "flask-outline",
  })[type] || "gauge") as keyof typeof MaterialCommunityIcons.glyphMap;

const getSensorStatus = (
  value: number,
  type: SensorType
): "normal" | "warning" | "critical" => {
  const range = OPTIMAL_RANGES[type];
  if (!range) return "normal";
  if (value < range.min * 0.7 || value > range.max * 1.3) return "critical";
  if (value < range.min || value > range.max) return "warning";
  return "normal";
};

const getStatusText = (status: "normal" | "warning" | "critical"): string =>
  ({
    normal: "Bình thường",
    warning: "Cảnh báo",
    critical: "Nguy hiểm",
  })[status];

// --- Responsive Utils (Phase 7) ---
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const isTablet = screenWidth > 768;
const isSmallScreen = screenWidth < 375;

const getResponsiveSize = (base: number, tablet?: number, small?: number) => {
  if (isTablet && tablet !== undefined) return tablet;
  if (isSmallScreen && small !== undefined) return small;
  return base;
};

// --- Color System Enhancement (Phase 7) ---
const getEnhancedTheme = (baseTheme: ReturnType<typeof useAppTheme>) => ({
  ...baseTheme,
  semantic: {
    success: baseTheme.success || "#10B981",
    warning: baseTheme.warning || "#F59E0B",
    error: baseTheme.error || "#EF4444",
    info: baseTheme.info || "#3B82F6", // Assuming baseTheme might have an info color
  },
  surface: {
    primary: baseTheme.card, // Assuming baseTheme has card
    secondary: `${baseTheme.primary}0A`, // Adjusted alpha from 08 to 0A for better visibility if used as background
    tertiary: `${baseTheme.textSecondary}05`,
  },
  shadows: {
    light: "#00000008",
    medium: "#00000015",
    heavy: "#00000025",
  },
});

// --- UI Components ---

// Current Reading Card
const CurrentReadingCard = ({
  sensor,
  theme,
}: {
  sensor: Sensor;
  theme: ReturnType<typeof getEnhancedTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const status = getSensorStatus(sensor.lastReading ?? 0, sensor.type);
  const statusColor = getSimpleStatusColor(status, theme);
  const iconName = getSensorIcon(sensor.type);
  const unitDisplay = UNIT_DISPLAY[sensor.unit] || "";

  return (
    <View style={[styles.card, styles.currentReadingCard]}>
      <View style={styles.currentReadingTitleContainer}>
        <MaterialCommunityIcons
          name={iconName}
          size={28}
          color={theme.primary}
          style={styles.currentReadingTitleIcon}
        />
        <Text style={[styles.cardTitle, styles.currentReadingCardTitle]}>
          {getSensorName(sensor.type)}
        </Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={[styles.mainValue, { color: statusColor }]}>
          {(sensor.lastReading ?? 0).toFixed(1)}
        </Text>
        <Text style={[styles.unitText, { color: statusColor }]}>
          {unitDisplay}
        </Text>
      </View>

      <View
        style={[
          styles.statusContainer,
          { backgroundColor: `${statusColor}15` },
        ]}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {getStatusText(status)}
        </Text>
      </View>

      <Text style={styles.timestampText}>
        Cập nhật lúc:{" "}
        {new Date(sensor.lastReadingAt ?? Date.now()).toLocaleString("vi-VN")}
      </Text>
    </View>
  );
};

// Time Range Selector
const TimeRangeSelector = ({
  selected,
  onChange,
  theme,
}: {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
  theme: ReturnType<typeof getEnhancedTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.timeRangeSelectorContainer}>
      <Text style={styles.selectorLabel}>Khoảng thời gian</Text>
      <View style={styles.timeRangeSelector}>
        {Object.values(TimeRange).map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeOption,
              selected === range && styles.selectedTimeRange,
            ]}
            onPress={() => onChange(range)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.timeRangeLabel,
                selected === range && styles.selectedTimeRangeLabel,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Chart Card
const ChartCard = ({
  sensorData,
  sensor,
  selectedTimeRange,
  error,
  loading,
  onRetry,
  theme,
  chartLabelsFiltered,
}: {
  sensorData: SensorData[];
  sensor: Sensor;
  selectedTimeRange: TimeRange;
  error: string | null;
  loading: boolean;
  onRetry: () => void;
  theme: ReturnType<typeof getEnhancedTheme>;
  chartLabelsFiltered: string[];
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const optimalRange = OPTIMAL_RANGES[sensor.type as SensorType];
  const unitDisplay = UNIT_DISPLAY[sensor.unit] || "";
  const [chartError, setChartError] = useState(false);

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 1,
    color: () => theme.primary,
    labelColor: () => theme.textSecondary,
    style: { borderRadius: 8 },
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

  const chartDatasets = useMemo(() => {
    const mainDataset = { data: sensorData.map((d) => d.value) };
    if (!optimalRange) {
      return [mainDataset];
    }
    return [
      mainDataset,
      {
        data: Array(sensorData.length).fill(optimalRange.min),
        color: (opacity = 1) =>
          `rgba(${hexToRgb(theme.success)}, ${opacity * 0.3})`,
        strokeWidth: 1,
        withDots: false,
        strokeDashArray: [2, 2],
      },
      {
        data: Array(sensorData.length).fill(optimalRange.max),
        color: (opacity = 1) =>
          `rgba(${hexToRgb(theme.success)}, ${opacity * 0.3})`,
        strokeWidth: 1,
        withDots: false,
        strokeDashArray: [2, 2],
      },
    ];
  }, [sensorData, optimalRange, theme.success]);

  return (
    <View style={styles.chartSectionContainer}>
      <View style={styles.chartHeader}>
        <Text style={[styles.cardTitle, styles.centeredChartTitle]}>
          Biểu đồ dữ liệu
        </Text>
        {!loading && !error && sensorData.length > 0 && (
          <TouchableOpacity onPress={onRetry} style={styles.refreshButton}>
            <Ionicons name="refresh" size={18} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <LoadingCard theme={theme} message="Đang tải biểu đồ..." />
      ) : error ? (
        <ErrorCard error={error} onRetry={onRetry} theme={theme} />
      ) : sensorData.length === 0 ? (
        <EmptyDataCard
          theme={theme}
          message="Không có dữ liệu biểu đồ cho khoảng thời gian này."
        />
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: chartLabelsFiltered,
              datasets: chartDatasets,
            }}
            width={screenWidth - 40}
            height={280}
            yAxisSuffix={` ${unitDisplay}`}
            yAxisInterval={1}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
            withShadow={false}
            segments={4}
            fromZero={false}
            formatYLabel={(value) => `${parseFloat(value).toFixed(1)}`}
            onDataPointClick={(data) => {
              console.log("Chart point clicked:", data);
              const clickedLabel = chartLabelsFiltered[data.index] || "";
              const message = `Giá trị: ${data.value}${unitDisplay} lúc ${clickedLabel}`;
              console.log(message);
            }}
          />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: theme.primary }]}
              />
              <Text style={styles.legendText}>Giá trị đo được</Text>
            </View>
            {optimalRange && (
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: theme.success }]}
                />
                <Text style={styles.legendText}>
                  {`Khoảng tối ưu (${optimalRange.min}-${optimalRange.max}${unitDisplay})`}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

// Stats Card
const StatsCard = ({
  stats,
  unit,
  timeRange,
  sensor,
  theme,
}: {
  stats: { min: number; max: number; avg: number };
  unit: string;
  timeRange: TimeRange;
  sensor: Sensor;
  theme: ReturnType<typeof getEnhancedTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Thống kê ({timeRange})</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Thấp nhất</Text>
          <Text style={styles.statValue}>
            {stats.min.toFixed(1)}
            {unit}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Trung bình</Text>
          <Text style={styles.statValue}>
            {stats.avg.toFixed(1)}
            {unit}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Cao nhất</Text>
          <Text style={styles.statValue}>
            {stats.max.toFixed(1)}
            {unit}
          </Text>
        </View>
      </View>
    </View>
  );
};

// --- Main Screen Component ---
export default function SensorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const baseTheme = useAppTheme(); // Renamed to baseTheme to avoid conflict
  const theme = getEnhancedTheme(baseTheme); // Enhance the theme
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false); // Specific loading for data/chart
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null); // Specific error for data
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(
    TimeRange.DAY
  );
  const [stats, setStats] = useState<{
    min: number;
    max: number;
    avg: number;
  } | null>(null);

  const parsedId = useMemo(() => {
    if (!id) return null;
    const cleanId = parseInt(id.toString().replace(/\D/g, ""));
    return isNaN(cleanId) ? null : cleanId;
  }, [id]);

  // Fetch sensor data based on time range
  const fetchSensorData = useCallback(
    async (sensorId: number, timeRange: TimeRange) => {
      setDataLoading(true);
      setDataError(null);
      try {
        const now = new Date();
        let startDate: Date;
        let limit: number;

        switch (timeRange) {
          case TimeRange.DAY:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            limit = 24 * 4; // More data points for 24h
            break;
          case TimeRange.WEEK:
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            limit = 7 * 24;
            break;
          case TimeRange.MONTH:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            limit = 30 * 12;
            break;
          default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            limit = 24 * 4;
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
          setStats(null);
        }
      } catch (err) {
        console.error("Error fetching sensor data:", err);
        setDataError("Không thể tải dữ liệu lịch sử.");
        setSensorData([]); // Clear data on error
        setStats(null);
      } finally {
        setDataLoading(false);
      }
    },
    []
  );

  // Fetch initial details and data
  const fetchAll = useCallback(
    async (isRefresh = false) => {
      if (!parsedId) {
        setError("ID cảm biến không hợp lệ");
        setLoading(false);
        return;
      }
      if (!isRefresh) setLoading(true);
      setError(null);
      setDataError(null);

      try {
        const sensorDetails = await sensorService.getSensorById(parsedId);
        setSensor(sensorDetails);
        await fetchSensorData(parsedId, selectedTimeRange); // Fetch data with the current range
      } catch (err) {
        console.error("Error fetching sensor details:", err);
        setError("Không thể tải thông tin cảm biến.");
        setSensor(null);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [parsedId, selectedTimeRange, fetchSensorData]
  );

  useEffect(() => {
    fetchAll();
    // Set up an interval if needed (consider battery life and API limits)
    // const interval = setInterval(() => fetchAll(true), 5 * 60 * 1000);
    // return () => clearInterval(interval);
  }, [fetchAll]); // Only run on initial mount/id change

  // Handle time range change
  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setSelectedTimeRange(range);
      if (parsedId) {
        fetchSensorData(parsedId, range);
      }
    },
    [parsedId, fetchSensorData]
  );

  // Handle manual refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll(true);
    setRefreshing(false);
  }, [fetchAll]);

  // Export data
  const exportData = useCallback(async () => {
    if (!sensor || sensorData.length === 0) {
      showToast("Không có dữ liệu để xuất");
      return;
    }
    try {
      let csvContent = "Timestamp,Value\n";
      sensorData.forEach((reading) => {
        csvContent += `${reading.timestamp},${reading.value}\n`;
      });
      await Share.share({
        message: csvContent,
        title: `${sensor.name} Data Export`,
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast("Không thể xuất dữ liệu");
    }
  }, [sensor, sensorData]);

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Thông báo", message);
    }
  };

  // Prepare chart labels (filtered)
  const chartLabelsFiltered = useMemo(() => {
    if (sensorData.length === 0) return [];
    const labels = sensorData.map((reading) => {
      const date = new Date(reading.timestamp);
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
        });
      }
    });
    const maxLabels = 6; // Show a max of 6 labels for clarity
    const step = Math.max(1, Math.ceil(labels.length / maxLabels));
    return labels.filter((_, index) => index % step === 0);
  }, [sensorData, selectedTimeRange]);

  // --- Render ---

  if (loading && !sensor) {
    return (
      <>
        <Stack.Screen options={{ title: "Đang tải..." }} />
        <SimpleLoading theme={theme} />
      </>
    );
  }

  if (error && !sensor) {
    return (
      <>
        <Stack.Screen options={{ title: "Lỗi" }} />
        <ErrorDisplay theme={theme} error={error} onRetry={() => fetchAll()} />
      </>
    );
  }

  if (!sensor) {
    return (
      <View style={styles.centeredContainer}>
        <Stack.Screen options={{ title: "Không tìm thấy" }} />
        <Text style={styles.infoText}>Không tìm thấy cảm biến. ID: {id}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: sensor.name || "Chi tiết Cảm biến",
          headerStyle: { backgroundColor: theme.card },
          headerShadowVisible: false,
          headerTintColor: theme.text,
          headerTitleStyle: { fontFamily: "Inter-SemiBold", fontSize: 18 },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.text} />
              <Text style={styles.headerBackButtonText}>Quay lại</Text>
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
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* Current Reading */}
        <CurrentReadingCard sensor={sensor} theme={theme} />

        {/* Time Range Selector */}
        <TimeRangeSelector
          selected={selectedTimeRange}
          onChange={handleTimeRangeChange}
          theme={theme}
        />

        {/* Chart Section */}
        <ChartCard
          sensorData={sensorData}
          sensor={sensor}
          selectedTimeRange={selectedTimeRange}
          error={dataError}
          loading={dataLoading}
          onRetry={() => fetchSensorData(parsedId!, selectedTimeRange)}
          theme={theme}
          chartLabelsFiltered={chartLabelsFiltered}
        />

        {/* Stats Section (Moved After Chart) */}
        {stats && sensor && (
          <StatsCard
            stats={stats}
            unit={UNIT_DISPLAY[sensor.unit] || ""}
            timeRange={selectedTimeRange}
            sensor={sensor}
            theme={theme}
          />
        )}
      </ScrollView>
    </View>
  );
}

// --- Styles ---
const createStyles = (theme: ReturnType<typeof getEnhancedTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerBackButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 0,
    },
    headerBackButtonText: {
      color: theme.text,
      fontSize: 16,
      marginLeft: 6,
      fontFamily: "Inter-Medium",
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    centeredContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.background,
    },
    infoText: {
      marginTop: 15,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: theme.primary,
      paddingVertical: 10,
      paddingHorizontal: 25,
      borderRadius: 8,
      marginTop: 10,
    },
    retryText: {
      color: theme.buttonText,
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
    },
    // --- Card Style (Improved as per Phase 1) ---
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: getResponsiveSize(24, 32, 20),
      marginBottom: 20,
      borderWidth: 0,
      shadowColor: theme.shadows.medium,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    cardTitle: {
      fontSize: 20,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 24,
      textAlign: "left",
    },
    centeredChartTitle: {
      flex: 1,
      textAlign: "center",
      marginBottom: 0,
      marginLeft: 26,
    },
    // --- Current Reading (Styles will be merged/added in Phase 2) ---
    currentReadingCard: {
      alignItems: "center",
    },
    currentReadingTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
      alignSelf: "stretch",
    },
    currentReadingTitleIcon: {
      marginRight: 10,
    },
    currentReadingCardTitle: {
      marginBottom: 0,
      textAlign: "center",
      flex: 0,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      alignSelf: "stretch",
    },
    cardTitleInHeader: {
      fontSize: 20,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginLeft: 12,
      flex: 1,
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: 16,
    },
    mainValue: {
      fontSize: 56,
      fontFamily: "Inter-Bold",
      lineHeight: 64,
    },
    unitText: {
      fontSize: 24,
      fontFamily: "Inter-Medium",
      marginLeft: 8,
      opacity: 0.8,
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 12,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
    },
    timestampText: {
      fontSize: 13,
      color: theme.textTertiary,
      fontFamily: "Inter-Regular",
    },
    // --- Time Range Selector (Improved - Phase 4) ---
    timeRangeSelectorContainer: {
      marginBottom: 24,
    },
    selectorLabel: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    timeRangeSelector: {
      flexDirection: "row",
      backgroundColor: theme.backgroundSecondary || `${theme.primary}0A`,
      borderRadius: 12,
      padding: 4,
    },
    timeRangeOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedTimeRange: {
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    timeRangeLabel: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
    },
    selectedTimeRangeLabel: {
      color: theme.buttonText,
      fontFamily: "Inter-Bold",
    },
    // --- Chart (Styles will be merged/added in Phase 6) ---
    chartHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    refreshButton: {
      padding: 8,
    },
    chartContainer: {
      // This container can be used for additional chart elements if needed
    },
    chartStyle: {
      borderRadius: 8,
    },
    chartMessageContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    chartLegend: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
      flexWrap: "wrap",
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
      marginBottom: 8,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    legendText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
    // --- Stats (Styles will be merged/added in Phase 3) ---
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
    },
    statItem: {
      alignItems: "center",
      padding: 10,
      flex: 1,
    },
    statLabel: {
      fontSize: 13,
      color: theme.textSecondary,
      fontFamily: "Inter-Medium",
      marginBottom: 5,
    },
    statValue: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    // Improved spacing system (as per Phase 1)
    sectionSpacing: {
      marginBottom: 32,
    },
    elementSpacing: {
      marginBottom: 16,
    },
    cardContentPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 30,
      minHeight: 150,
    },
    loadingCard: {},
    loadingText: {
      marginTop: 15,
      fontSize: 15,
      color: theme.textSecondary,
      fontFamily: "Inter-Medium",
    },
    skeletonCard: {
      padding: 24,
    },
    skeletonTitle: {
      width: "60%",
      height: 20,
      borderRadius: 4,
      marginBottom: 16,
    },
    skeletonContent: {
      width: "100%",
      height: 60,
      borderRadius: 4,
      marginBottom: 16,
    },
    skeletonFooter: {
      width: "40%",
      height: 16,
      borderRadius: 4,
    },
    chartSectionContainer: {
      marginBottom: 20,
    },
  });
