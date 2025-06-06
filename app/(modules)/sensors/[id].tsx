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
  StatusBar,
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
import {
  SensorStatisticsDto,
  SensorAnalyticsDto,
  DailyAggregateDto,
} from "@/types/gardens/sensor-statistics.types";
import sensorService from "@/service/api/sensor.service";

// Import sensor components
import {
  // Utils
  getEnhancedTheme,
  getResponsiveSize,
  hexToRgb,
  TimeRange,
  OPTIMAL_RANGES,
  UNIT_DISPLAY,
  getSensorName,
  getSensorIcon,
  getSensorStatus,
  getStatusText,
  getSimpleStatusColor,
  // UI Components  
  SimpleLoading,
  ErrorDisplay,
  LoadingCard,
  ErrorCard,
  EmptyDataCard,
  // Cards
  CurrentReadingCard,
  // Selectors
  TimeRangeSelector,
} from "@/components/sensor";

// Remaining components to be refactored later

// Screenwidth for chart
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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
            yAxisSuffix={``}
            yAxisInterval={1}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
            withShadow={false}
            segments={4}
            fromZero={false}
            formatYLabel={(value) => `${parseFloat(value).toFixed(1)}`}
            onDataPointClick={(data) => {
              const clickedLabel = chartLabelsFiltered[data.index] || "";
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

// Stats Card (Modified)
const StatsCard = ({
  stats,
  unit,
  timeRange,
  theme,
}: {
  stats: SensorStatisticsDto | null;
  unit: string;
  timeRange: TimeRange;
  theme: ReturnType<typeof getEnhancedTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!stats) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thống kê ({timeRange})</Text>
        <EmptyDataCard theme={theme} message="Không có dữ liệu thống kê." />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Thống kê ({timeRange})</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Thấp nhất</Text>
          <Text style={styles.statValue}>
            {stats.minValue.toFixed(1)}
            {unit}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Trung bình</Text>
          <Text style={styles.statValue}>
            {stats.averageValue.toFixed(1)}
            {unit}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Cao nhất</Text>
          <Text style={styles.statValue}>
            {stats.maxValue.toFixed(1)}
            {unit}
          </Text>
        </View>
      </View>
      <View style={[styles.statsRow, { marginTop: 15 }]}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Tổng số đọc</Text>
          <Text style={styles.statValue}>{stats.totalReadings}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Độ lệch chuẩn</Text>
          <Text style={styles.statValue}>{stats.stdDeviation.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

// Analytics Card (Corrected)
const AnalyticsCard = ({
  sensorAnalytics,
  theme,
}: {
  sensorAnalytics: SensorAnalyticsDto | null;
  theme: ReturnType<typeof getEnhancedTheme>;
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (
    !sensorAnalytics ||
    !sensorAnalytics.dailyData ||
    sensorAnalytics.dailyData.length === 0
  ) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Phân tích hàng ngày</Text>
        <EmptyDataCard
          theme={theme}
          message="Không có dữ liệu phân tích hàng ngày."
        />
      </View>
    );
  }

  const unitDisplay =
    UNIT_DISPLAY[sensorAnalytics.unit as SensorUnit] || sensorAnalytics.unit;

  const displayedDailyData = sensorAnalytics.dailyData.slice(0, 4);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Phân tích hàng ngày</Text>
      <View style={styles.dailyDataGridContainer}>
        {displayedDailyData.map((dailyEntry, index) => (
          <View key={index} style={styles.dailyDataItemCard}>
            <Text style={styles.dailyDateText}>
              {new Date(dailyEntry.date).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              })}
            </Text>
            <View style={styles.dailyStatRow}>
              <Text style={styles.dailyStatLabel}>TB:</Text>
              <Text style={styles.dailyStatValue}>
                {dailyEntry.averageValue.toFixed(1)}
                {unitDisplay}
              </Text>
            </View>
            <View style={styles.dailyStatRow}>
              <Text style={styles.dailyStatLabel}>Min:</Text>
              <Text style={styles.dailyStatValue}>
                {dailyEntry.minValue.toFixed(1)}
                {unitDisplay}
              </Text>
            </View>
            <View style={styles.dailyStatRow}>
              <Text style={styles.dailyStatLabel}>Max:</Text>
              <Text style={styles.dailyStatValue}>
                {dailyEntry.maxValue.toFixed(1)}
                {unitDisplay}
              </Text>
            </View>
            <View style={styles.dailyStatRow}>
              <Text style={styles.dailyStatLabel}>Đọc:</Text>
              <Text style={styles.dailyStatValue}>
                {dailyEntry.readingsCount}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// --- Main Screen Component ---
export default function SensorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const baseTheme = useAppTheme();
  const theme = getEnhancedTheme(baseTheme);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [detailedStats, setDetailedStats] =
    useState<SensorStatisticsDto | null>(null);
  const [sensorAnalytics, setSensorAnalytics] =
    useState<SensorAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(
    TimeRange.DAY
  );

  const parsedId = useMemo(() => {
    if (!id) return null;
    const cleanId = parseInt(id.toString().replace(/\D/g, ""));
    return isNaN(cleanId) ? null : cleanId;
  }, [id]);

  const fetchChartDataAndStatistics = useCallback(
    async (sensorId: number, timeRange: TimeRange) => {
      setDataLoading(true);
      setDataError(null);
      setDetailedStats(null);
      setSensorAnalytics(null);

      try {
        const now = new Date();
        let RangedStartDate: Date;
        let RangedEndDate: Date = now;
        let chartLimit: number;

        switch (timeRange) {
          case TimeRange.DAY:
            RangedStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            chartLimit = 24 * 4;
            break;
          case TimeRange.WEEK:
            RangedStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            chartLimit = 7 * 24;
            break;
          case TimeRange.MONTH:
            RangedStartDate = new Date(
              now.getTime() - 30 * 24 * 60 * 60 * 1000
            );
            chartLimit = 30 * 12;
            break;
          default:
            RangedStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            chartLimit = 24 * 4;
        }

        const chartParams: SensorDataQueryParams = {
          limit: chartLimit,
          startDate: RangedStartDate.toISOString(),
        };

        const sensorReadings = await sensorService.getSensorData(
          sensorId,
          chartParams
        );
        const sortedData = sensorReadings.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setSensorData(sortedData);

        const statsStartDateISO = RangedStartDate.toISOString();
        const statsEndDateISO = RangedEndDate.toISOString();

        const newDetailedStats = await sensorService.getSensorStatistics(
          sensorId,
          statsStartDateISO,
          statsEndDateISO
        );
        setDetailedStats(newDetailedStats);

        const formatDateToYYYYMMDD = (date: Date) => {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        // Calculate specific dates for 4-day analytics
        const todayForAnalytics = new Date();
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(todayForAnalytics.getDate() - 3);

        const analyticsStartDate = formatDateToYYYYMMDD(fourDaysAgo);
        const analyticsEndDate = formatDateToYYYYMMDD(todayForAnalytics);

        const newSensorAnalytics = await sensorService.getSensorAnalytics(
          sensorId,
          analyticsStartDate, // Use the new 4-day start date
          analyticsEndDate // Use the new 4-day end date
        );
        setSensorAnalytics(newSensorAnalytics);
      } catch (err) {
        console.error(
          "Error fetching sensor data, statistics, or analytics:",
          err
        );
        setDataError("Không thể tải dữ liệu lịch sử, thống kê hoặc phân tích.");
        setSensorData([]);
        setDetailedStats(null);
        setSensorAnalytics(null);
      } finally {
        setDataLoading(false);
      }
    },
    []
  );

  const fetchAll = useCallback(
    async (isRefresh = false) => {
      if (!parsedId) {
        setError("ID cảm biến không hợp lệ");
        setLoading(false);
        return;
      }
      if (!isRefresh) setLoading(true);
      setError(null);

      try {
        const sensorDetails = await sensorService.getSensorById(parsedId);
        setSensor(sensorDetails);
        await fetchChartDataAndStatistics(parsedId, selectedTimeRange);
      } catch (err) {
        console.error("Error fetching sensor details:", err);
        setError("Không thể tải thông tin cảm biến.");
        setSensor(null);
      } finally {
        if (!isRefresh) setLoading(false);
      }
    },
    [parsedId, selectedTimeRange, fetchChartDataAndStatistics]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setSelectedTimeRange(range);
      if (parsedId) {
        fetchChartDataAndStatistics(parsedId, range);
      }
    },
    [parsedId, fetchChartDataAndStatistics]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll(true);
    setRefreshing(false);
  }, [fetchAll]);

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
    const maxLabels = 6;
    const step = Math.max(1, Math.ceil(labels.length / maxLabels));
    return labels.filter((_, index) => index % step === 0);
  }, [sensorData, selectedTimeRange]);

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
      <StatusBar 
        backgroundColor={theme.card} 
        barStyle="default"
      />
      
      {/* Custom Header with Back Button */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={12} color={theme.text} />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
        
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>
            {sensor.name || "Chi tiết Cảm biến"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={exportData}
          style={styles.exportButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="download-outline"
            size={22}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

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
        <CurrentReadingCard sensor={sensor} theme={theme} />

        <TimeRangeSelector
          selected={selectedTimeRange}
          onChange={handleTimeRangeChange}
          theme={theme}
        />

        {sensor && (
          <ChartCard
            sensorData={sensorData}
            sensor={sensor}
            selectedTimeRange={selectedTimeRange}
            error={dataError}
            loading={dataLoading}
            onRetry={() =>
              parsedId &&
              fetchChartDataAndStatistics(parsedId, selectedTimeRange)
            }
            theme={theme}
            chartLabelsFiltered={chartLabelsFiltered}
          />
        )}

        {sensor && (
          <StatsCard
            stats={detailedStats}
            unit={UNIT_DISPLAY[sensor.unit] || ""}
            timeRange={selectedTimeRange}
            theme={theme}
          />
        )}

        {sensorAnalytics && (
          <AnalyticsCard sensorAnalytics={sensorAnalytics} theme={theme} />
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof getEnhancedTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    customHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: Platform.OS === 'ios' ? 50 : 12,
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      shadowColor: theme.shadows.light,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 2,
      minWidth: 60,
    },
    backButtonText: {
      color: theme.text,
      fontSize: 14,
      marginLeft: 4,
      fontFamily: "Inter-Medium",
    },
    headerTitle: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    headerTitleText: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      textAlign: "center",
    },
    exportButton: {
      padding: 8,
      borderRadius: 6,
      minWidth: 40,
      alignItems: "center",
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
    chartHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    refreshButton: {
      padding: 8,
    },
    chartContainer: {},
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
    dailyDataGridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "flex-start",
      paddingVertical: 10,
    },
    dailyDataItemCard: {
      backgroundColor: theme.surface.secondary,
      borderRadius: 12,
      padding: 12,
      width: "47%",
      margin: "1.5%",
      elevation: 2,
      shadowColor: theme.shadows.light,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    dailyDateText: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginBottom: 8,
      textAlign: "center",
    },
    dailyStatRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    dailyStatLabel: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    dailyStatValue: {
      fontSize: 13,
      fontFamily: "Inter-Medium",
      color: theme.text,
    },
  });
