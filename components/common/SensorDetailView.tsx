import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
  RefreshControl,
  Dimensions,
  ScrollView,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { SensorType, SensorUnit } from "@/types/gardens/sensor.types";
import { UISensor } from "@/components/garden/GardenSensorSection";
import {
  SensorHistory,
  SensorHistoryPoint,
  GardenGrowthStage,
} from "@/types/gardens/garden.types";

// Get screen width for responsive grid
const screenWidth = Dimensions.get("window").width;
const CHART_WIDTH = screenWidth - 32;

interface SensorDetailViewProps {
  sensors: UISensor[];
  onSelectSensor: (sensor: UISensor) => void;
  title?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  sensorHistories?: Record<string, SensorHistory>;
  currentGrowthStage?: GardenGrowthStage;
  isSensorDataLoading?: boolean;
  lastSensorUpdate?: string;
}

// Separate component for sensor items
const SensorItem = React.memo(
  ({
    item,
    index,
    onSelectSensor,
    getSensorName,
    getSensorDisplayName,
    getSensorIcon,
    getSensorStatus,
    formatTimeAgo,
    theme,
  }: {
    item: UISensor;
    index: number;
    onSelectSensor: (sensor: UISensor) => void;
    getSensorName: (type: string) => string;
    getSensorDisplayName: (sensor: UISensor) => string;
    getSensorIcon: (type: SensorType) => string;
    getSensorStatus: (
      value: number,
      type: string
    ) => "normal" | "warning" | "critical";
    formatTimeAgo: (timestamp?: string) => string;
    theme: any;
  }) => {
    const styles = createStyles(theme);

    // Get formatted display name and timestamp
    const displayName = getSensorDisplayName(item);
    const timestamp =
      item.lastUpdated || item.lastReadingAt || new Date().toISOString();
    const timeAgo = formatTimeAgo(timestamp);

    // Status information
    const status = getSensorStatus(item.value, item.type);
    const statusColor =
      status === "critical"
        ? theme.error
        : status === "warning"
          ? theme.warning
          : theme.success;

    // Animation refs
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const pressedAnim = useRef(new Animated.Value(1)).current;

    // Press animations
    const handlePressIn = () => {
      Animated.spring(pressedAnim, {
        toValue: 0.96,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressedAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    useEffect(() => {
      // Staggered animation on mount
      Animated.sequence([
        Animated.delay(index * 50),
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, [index, opacityAnim, scaleAnim]);

    // Get a background color based on sensor type
    const getSensorTypeColor = (type: SensorType): string => {
      switch (type) {
        case SensorType.TEMPERATURE:
          return "rgba(255,59,48,0.08)";
        case SensorType.HUMIDITY:
          return "rgba(0,122,255,0.08)";
        case SensorType.SOIL_MOISTURE:
          return "rgba(52,199,89,0.08)";
        case SensorType.LIGHT:
          return "rgba(255,204,0,0.08)";
        case SensorType.WATER_LEVEL:
          return "rgba(0,122,255,0.08)";
        case SensorType.RAINFALL:
          return "rgba(0,122,255,0.08)";
        case SensorType.SOIL_PH:
          return "rgba(175,82,222,0.08)";
        default:
          return "rgba(142,142,147,0.08)";
      }
    };

    // Get card background color
    const getCardBgColor = (type: SensorType): string => {
      switch (type) {
        case SensorType.TEMPERATURE:
          return "rgba(255,59,48,0.03)";
        case SensorType.HUMIDITY:
          return "rgba(0,122,255,0.03)";
        case SensorType.SOIL_MOISTURE:
          return "rgba(52,199,89,0.03)";
        case SensorType.LIGHT:
          return "rgba(255,204,0,0.03)";
        case SensorType.WATER_LEVEL:
          return "rgba(0,122,255,0.03)";
        case SensorType.RAINFALL:
          return "rgba(0,122,255,0.03)";
        case SensorType.SOIL_PH:
          return "rgba(175,82,222,0.03)";
        default:
          return "rgba(142,142,147,0.03)";
      }
    };

    // Get border color based on status
    const statusBorderColor =
      status === "critical"
        ? `rgba(255,59,48,0.3)`
        : status === "warning"
          ? `rgba(255,204,0,0.3)`
          : `rgba(52,199,89,0.2)`;

    // Chart configuration
    const chartData = {
      labels: [],
      datasets: [
        {
          data:
            item.recentValues && item.recentValues.length > 1
              ? item.recentValues.map((rv) => rv.value)
              : [0, 0],
          color: () => statusColor,
          strokeWidth: 2,
        },
      ],
    };

    const chartConfig = {
      backgroundGradientFrom: "transparent",
      backgroundGradientTo: "transparent",
      decimalPlaces: 1,
      color: () => statusColor,
      labelColor: () => "transparent",
      propsForDots: {
        r: "0",
      },
      propsForBackgroundLines: {
        stroke: "transparent",
      },
    };

    // Format value based on sensor type
    const formatSensorValue = (value: number, type: SensorType): string => {
      if (typeof value !== "number") return "0";

      switch (type) {
        case SensorType.SOIL_PH:
          return value.toFixed(1);
        case SensorType.HUMIDITY:
        case SensorType.SOIL_MOISTURE:
          return Math.round(value).toString();
        default:
          return value % 1 === 0 ? value.toString() : value.toFixed(1);
      }
    };

    // Format unit display
    const formatUnitDisplay = (unit: SensorUnit): string => {
      switch (unit) {
        case SensorUnit.PERCENT:
          return "%";
        case SensorUnit.PH:
          return "pH";
        default:
          return unit;
      }
    };

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pressedAnim) }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => onSelectSensor(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          accessible={true}
          accessibilityLabel={`Cảm biến ${displayName}`}
          accessibilityHint={`${item.value} ${item.unit}. Trạng thái: ${
            status === "critical"
              ? "Nguy hiểm"
              : status === "warning"
                ? "Cảnh báo"
                : "Bình thường"
          }`}
          accessibilityRole="button"
          accessibilityState={{ selected: false }}
          style={[
            styles.cardWrapper,
            {
              borderColor: statusBorderColor,
              backgroundColor: theme.card,
            },
          ]}
        >
          <LinearGradient
            colors={[getCardBgColor(item.type), "transparent"]}
            style={styles.cardGradient}
          >
            <View
              style={[
                styles.cardHeader,
                { backgroundColor: getSensorTypeColor(item.type) },
              ]}
            >
              <MaterialCommunityIcons
                name={getSensorIcon(item.type) as any}
                size={20}
                color={theme.text}
                style={styles.sensorIcon}
              />
              <Text
                style={styles.sensorName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayName}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + "1A" },
                ]}
              >
                <Ionicons
                  name={
                    status === "critical"
                      ? "alert-circle"
                      : status === "warning"
                        ? "warning"
                        : "checkmark-circle"
                  }
                  size={12}
                  color={statusColor}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                  {status === "critical"
                    ? "Nguy hiểm"
                    : status === "warning"
                      ? "Cảnh báo"
                      : "Bình thường"}
                </Text>
              </View>
            </View>

            <View style={styles.valueContainer}>
              <Text
                style={styles.valueText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatSensorValue(item.value, item.type)}
              </Text>
              <Text style={styles.unitText}>
                {formatUnitDisplay(item.unit)}
              </Text>
            </View>

            {item.recentValues && item.recentValues.length > 1 && (
              <View style={styles.sparklineContainer}>
                <LineChart
                  data={chartData}
                  width={styles.cardContainer.width - 24}
                  height={30}
                  chartConfig={chartConfig}
                  bezier
                  withDots={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withHorizontalLabels={false}
                  withVerticalLabels={false}
                />
              </View>
            )}

            <View style={styles.infoContainer}>
              <View style={styles.timeContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.timeText}>{timeAgo}</Text>
              </View>

              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => onSelectSensor(item)}
                accessibilityLabel={`Xem chi tiết ${displayName}`}
              >
                <Text style={styles.detailButtonText}>Chi tiết</Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

export default function SensorDetailView({
  sensors,
  onSelectSensor,
  title = "Số liệu Cảm biến",
  isRefreshing = false,
  onRefresh,
  sensorHistories,
  currentGrowthStage,
  isSensorDataLoading,
  lastSensorUpdate,
}: SensorDetailViewProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [selectedSensorType, setSelectedSensorType] = useState<string | null>(
    sensorHistories && Object.keys(sensorHistories).length > 0
      ? Object.keys(sensorHistories)[0]
      : null
  );

  // Use isSensorDataLoading for refresh state if provided
  const effectiveIsRefreshing =
    isSensorDataLoading !== undefined ? isSensorDataLoading : isRefreshing;

  // Get display name for sensor type
  const getSensorName = (type: string): string => {
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
        return type;
    }
  };

  // Get icon name for sensor type
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

  // Determine sensor status based on value and type
  const getSensorStatus = (
    value: number,
    type: string
  ): "normal" | "warning" | "critical" => {
    switch (type) {
      case SensorType.TEMPERATURE:
        if (value > 35) return "critical";
        if (value > 30) return "warning";
        return "normal";
      case SensorType.HUMIDITY:
        if (value < 20) return "critical";
        if (value < 40) return "warning";
        return "normal";
      case SensorType.SOIL_MOISTURE:
        if (value < 15) return "critical";
        if (value < 30) return "warning";
        return "normal";
      case SensorType.LIGHT:
        return "normal";
      case SensorType.SOIL_PH:
        if (value < 4.5 || value > 8.5) return "critical";
        if (value < 5.5 || value > 7.5) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  // Format timestamp to display in a friendly way
  const formatTimeAgo = (timestamp?: string): string => {
    if (!timestamp) return "Chưa cập nhật";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Định dạng không hợp lệ";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Vừa cập nhật";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }
  };

  // Get display label for a sensor
  const getSensorDisplayName = (sensor: UISensor): string => {
    const baseName = sensor.name || getSensorName(sensor.type);
    if (!sensor.name) {
      return `${baseName} #${sensor.id}`;
    }
    return baseName;
  };

  // Render empty state
  if (!sensors || sensors.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <MaterialCommunityIcons
          name="devices"
          size={40}
          color={theme.textSecondary}
          style={{ marginBottom: 12 }}
        />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Chưa có cảm biến nào được thêm vào vườn này.
        </Text>
      </View>
    );
  }

  // Helper functions for sensor history chart
  const getSelectedSensorHistory = (): SensorHistory | null => {
    if (
      !selectedSensorType ||
      !sensorHistories ||
      !sensorHistories[selectedSensorType]
    ) {
      return null;
    }
    return sensorHistories[selectedSensorType];
  };

  // Get optimal range for the selected sensor type
  const getOptimalRange = (sensorType: string): [number, number] | null => {
    if (!currentGrowthStage) return null;

    switch (sensorType) {
      case SensorType.TEMPERATURE:
        return [
          currentGrowthStage.optimalTemperatureMin,
          currentGrowthStage.optimalTemperatureMax,
        ];
      case SensorType.HUMIDITY:
        return [
          currentGrowthStage.optimalHumidityMin,
          currentGrowthStage.optimalHumidityMax,
        ];
      case SensorType.SOIL_MOISTURE:
        return [
          currentGrowthStage.optimalSoilMoistureMin,
          currentGrowthStage.optimalSoilMoistureMax,
        ];
      default:
        return null;
    }
  };

  // Format date for display on chart
  const formatChartDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Get color for sensor chart
  const getSensorColor = (type: string): string => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "#FF3B30";
      case SensorType.HUMIDITY:
        return "#007AFF";
      case SensorType.SOIL_MOISTURE:
        return "#34C759";
      case SensorType.LIGHT:
        return "#FFCC00";
      case SensorType.RAINFALL:
        return "#5856D6";
      case SensorType.WATER_LEVEL:
        return "#5AC8FA";
      case SensorType.SOIL_PH:
        return "#AF52DE";
      default:
        return "#8E8E93";
    }
  };

  // Get unit display text
  const getUnitDisplay = (unit: string): string => {
    switch (unit) {
      case SensorUnit.CELSIUS:
        return "°C";
      case SensorUnit.PERCENT:
        return "%";
      case SensorUnit.LUX:
        return "lux";
      case SensorUnit.MILLIMETER:
        return "mm";
      case SensorUnit.PH:
        return "pH";
      // Fix linter errors by using strings instead of enum values
      case "METER":
        return "m";
      case "LITER":
        return "L";
      default:
        return unit;
    }
  };

  // Get display values for chart
  const getChartData = () => {
    const selectedHistory = getSelectedSensorHistory();
    if (
      !selectedHistory ||
      !selectedHistory.data ||
      selectedHistory.data.length === 0
    ) {
      return {
        labels: ["", "", "", "", ""],
        datasets: [
          {
            data: [0, 0, 0, 0, 0],
            color: () => getSensorColor(selectedSensorType || ""),
            strokeWidth: 2,
          },
        ],
      };
    }

    // Sort data points by timestamp
    const sortedData = [...selectedHistory.data].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Get last 7 points or all if less than 7
    const displayData = sortedData.slice(-7);

    return {
      labels: displayData.map((point) => formatChartDate(point.timestamp)),
      datasets: [
        {
          data: displayData.map((point) => point.value),
          color: () => getSensorColor(selectedSensorType || ""),
          strokeWidth: 2,
        },
      ],
    };
  };

  // Get current value and trend
  const getCurrentValueAndTrend = (): {
    value: number;
    trend: "up" | "down" | "stable";
  } => {
    const selectedHistory = getSelectedSensorHistory();
    if (
      !selectedHistory ||
      !selectedHistory.data ||
      selectedHistory.data.length < 2
    ) {
      return { value: 0, trend: "stable" };
    }

    // Sort data points by timestamp
    const sortedData = [...selectedHistory.data].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const lastValue = sortedData[sortedData.length - 1].value;
    const previousValue = sortedData[sortedData.length - 2].value;

    let trend: "up" | "down" | "stable" = "stable";
    if (lastValue > previousValue + 0.1) {
      trend = "up";
    } else if (lastValue < previousValue - 0.1) {
      trend = "down";
    }

    return { value: lastValue, trend };
  };

  // Render sensor history chart
  const renderSensorHistoryChart = () => {
    if (!sensorHistories || Object.keys(sensorHistories).length === 0) {
      return null;
    }

    const selectedHistory = getSelectedSensorHistory();
    if (!selectedHistory) return null;

    const { value, trend } = getCurrentValueAndTrend();
    const optimalRange = getOptimalRange(selectedSensorType || "");

    let statusColor = theme.success;
    let statusText = "Tối ưu";

    if (optimalRange) {
      const [min, max] = optimalRange;
      if (value < min) {
        statusColor = theme.warning;
        statusText = "Thấp";
      } else if (value > max) {
        statusColor = theme.error;
        statusText = "Cao";
      }
    }

    return (
      <View style={styles.historyChartContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Lịch sử cảm biến</Text>
        </View>

        {/* Sensor type selection buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sensorTypeScroll}
          contentContainerStyle={styles.sensorTypeContainer}
        >
          {Object.keys(sensorHistories).map((sensorType) => (
            <TouchableOpacity
              key={sensorType}
              style={[
                styles.sensorTypeButton,
                selectedSensorType === sensorType && {
                  backgroundColor: `${getSensorColor(sensorType)}20`,
                },
              ]}
              onPress={() => setSelectedSensorType(sensorType)}
            >
              <MaterialCommunityIcons
                name={getSensorIcon(sensorType as SensorType) as any}
                size={18}
                color={
                  selectedSensorType === sensorType
                    ? getSensorColor(sensorType)
                    : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.sensorTypeText,
                  selectedSensorType === sensorType
                    ? {
                        color: getSensorColor(sensorType),
                        fontFamily: "Inter-SemiBold",
                      }
                    : { color: theme.textSecondary },
                ]}
              >
                {getSensorName(sensorType)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Current value and status */}
        <View style={styles.currentValueContainer}>
          <View style={styles.valueAndTrend}>
            <Text style={styles.currentValue}>{value.toFixed(1)}</Text>
            <Text style={styles.unitText}>
              {getUnitDisplay(selectedHistory.unit)}
            </Text>
            {trend === "up" && (
              <Ionicons
                name="arrow-up"
                size={20}
                color={theme.warning}
                style={styles.trendIcon}
              />
            )}
            {trend === "down" && (
              <Ionicons
                name="arrow-down"
                size={20}
                color={theme.info}
                style={styles.trendIcon}
              />
            )}
          </View>

          <View
            style={[
              styles.historyStatusBadge,
              { backgroundColor: statusColor },
            ]}
          >
            <Text style={styles.historyStatusText}>{statusText}</Text>
          </View>
        </View>

        {/* Optimal range */}
        {optimalRange && (
          <View style={styles.optimalRangeContainer}>
            <Text style={styles.optimalRangeLabel}>Khoảng tối ưu:</Text>
            <Text style={styles.optimalRangeValue}>
              {optimalRange[0]} - {optimalRange[1]}{" "}
              {getUnitDisplay(selectedHistory.unit)}
            </Text>
          </View>
        )}

        {/* Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={getChartData()}
            width={CHART_WIDTH}
            height={220}
            chartConfig={{
              backgroundColor: theme.background,
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              decimalPlaces: 1,
              color: (opacity = 1) =>
                `${getSensorColor(selectedSensorType || "")}${Math.round(
                  opacity * 255
                )
                  .toString(16)
                  .padStart(2, "0")}`,
              labelColor: (opacity = 1) => theme.text,
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: theme.background,
              },
              propsForBackgroundLines: {
                stroke: theme.borderLight,
                strokeDasharray: "5, 5",
              },
              useShadowColorFromDataset: true,
            }}
            bezier
            style={styles.chart}
            fromZero={
              selectedSensorType === SensorType.RAINFALL ||
              selectedSensorType === SensorType.WATER_LEVEL
            }
            yAxisSuffix={
              selectedHistory.unit
                ? ` ${getUnitDisplay(selectedHistory.unit)}`
                : ""
            }
            yAxisInterval={1}
          />
        </View>

        <Text style={styles.chartHint}>Dữ liệu 7 ngày gần nhất</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {title}
          </Text>
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              style={styles.headerRefreshButton}
              disabled={effectiveIsRefreshing}
              accessibilityLabel="Làm mới dữ liệu cảm biến"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="refresh"
                size={16}
                color={theme.primary}
                style={effectiveIsRefreshing ? styles.refreshingIcon : null}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={sensors}
        renderItem={({ item, index }) => (
          <SensorItem
            item={item}
            index={index}
            onSelectSensor={onSelectSensor}
            getSensorName={getSensorName}
            getSensorDisplayName={getSensorDisplayName}
            getSensorIcon={getSensorIcon}
            getSensorStatus={getSensorStatus}
            formatTimeAgo={formatTimeAgo}
            theme={theme}
          />
        )}
        keyExtractor={(item, index) => {
          return item.id !== undefined && item.id !== null
            ? String(item.id)
            : `sensor-${index}`;
        }}
        horizontal={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        initialNumToRender={4}
        maxToRenderPerBatch={8}
        windowSize={5}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={effectiveIsRefreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Không có dữ liệu cảm biến
          </Text>
        }
        removeClippedSubviews={Platform.OS === "android"} // Performance optimization
        ListFooterComponent={renderSensorHistoryChart}
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 10,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      marginHorizontal: 16,
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    headerRefreshButton: {
      padding: 8,
      borderRadius: 16,
      backgroundColor: theme.backgroundSecondary || "rgba(0,0,0,0.05)",
    },
    refreshingIcon: {
      transform: [{ rotate: "45deg" }],
    },
    gridContent: {
      paddingHorizontal: 12,
      paddingBottom: 12,
      paddingTop: 4,
    },
    columnWrapper: {
      justifyContent: "space-between",
      marginBottom: 8,
    },
    cardContainer: {
      width: (screenWidth - 36) / 2,
      height: 180,
      marginBottom: 8,
    },
    cardWrapper: {
      borderRadius: 14,
      backgroundColor: theme.card,
      overflow: "hidden",
      borderWidth: 1,
      height: "100%",
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow || "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    cardGradient: {
      borderRadius: 14,
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    sensorIcon: {
      marginRight: 6,
    },
    sensorName: {
      flex: 1,
      fontSize: 12,
      fontFamily: "Inter-Medium",
      color: theme.text,
    },
    statusBadge: {
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    statusBadgeText: {
      fontSize: 8,
      fontFamily: "Inter-SemiBold",
    },
    valueContainer: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 6,
    },
    valueText: {
      fontSize: 36,
      fontFamily: "Inter-Bold",
      color: theme.text,
      textAlign: "center",
    },
    unitText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginTop: 2,
    },
    sparklineContainer: {
      height: 24,
      width: "100%",
      paddingHorizontal: 8,
    },
    infoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight || "rgba(0,0,0,0.05)",
      marginTop: "auto",
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeText: {
      fontSize: 10,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginLeft: 4,
    },
    detailButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    detailButtonText: {
      fontSize: 11,
      fontFamily: "Inter-Medium",
      color: theme.primary,
      marginRight: 2,
    },
    emptyContainer: {
      margin: 16,
      padding: 20,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.borderLight || "rgba(0,0,0,0.05)",
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow || "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    emptyText: {
      fontSize: 16,
      textAlign: "center",
      fontFamily: "Inter-Regular",
    },

    // Sensor history chart styles
    historyChartContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      marginHorizontal: 16,
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    historyTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    sensorTypeScroll: {
      marginBottom: 16,
    },
    sensorTypeContainer: {
      paddingRight: 16,
    },
    sensorTypeButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.backgroundSecondary,
      borderRadius: 16,
      marginRight: 8,
    },
    sensorTypeText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      marginLeft: 6,
    },
    currentValueContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    valueAndTrend: {
      flexDirection: "row",
      alignItems: "center",
    },
    currentValue: {
      fontSize: 28,
      fontFamily: "Inter-Bold",
      color: theme.text,
    },
    trendIcon: {
      marginLeft: 8,
    },
    historyStatusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    historyStatusText: {
      fontSize: 12,
      fontFamily: "Inter-SemiBold",
      color: "#fff",
    },
    optimalRangeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    optimalRangeLabel: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
    },
    optimalRangeValue: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.success,
      marginLeft: 6,
    },
    chartContainer: {
      marginVertical: 8,
      alignItems: "center",
    },
    chart: {
      borderRadius: 16,
    },
    chartHint: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textTertiary,
      textAlign: "center",
      marginTop: 8,
    },
  });
