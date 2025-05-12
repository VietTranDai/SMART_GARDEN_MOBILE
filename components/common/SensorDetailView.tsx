import React, { useRef, useEffect } from "react";
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
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import EnhancedSensorCard from "@/components/garden/EnhancedSensorCard";
import { SensorType, SensorUnit } from "@/types/gardens/sensor.types";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { UISensor } from "@/components/garden/GardenSensorSection";

// Get screen width for responsive grid
const screenWidth = Dimensions.get("window").width;

// Memorized version of EnhancedSensorCard for performance
const EnhancedSensorCardMemo = React.memo(EnhancedSensorCard);

interface SensorDetailViewProps {
  sensors: UISensor[];
  onSelectSensor: (sensor: UISensor) => void;
  title?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

// Separate component for sensor items to properly use hooks
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

    // Gradient colors based on status
    const gradientColors =
      status === "critical"
        ? [theme.errorLight || "rgba(255,59,48,0.05)", "transparent"]
        : status === "warning"
          ? [theme.warningLight || "rgba(255,204,0,0.05)", "transparent"]
          : [theme.successLight || "rgba(52,199,89,0.05)", "transparent"];

    // Animation with a slight delay based on index for staggered effect
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const pressedAnim = useRef(new Animated.Value(1)).current;

    // Setup improved press animations
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
      // Start animations with staggered delay
      Animated.sequence([
        Animated.delay(index * 50), // Faster delay for better UX
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

    // Get card background color based on sensor type (lighter than header but still themed)
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

    // Prepare data for sparkline chart
    const chartData = {
      labels: [],
      datasets: [
        {
          data:
            item.recentValues && item.recentValues.length > 1
              ? item.recentValues.map((rv) => rv.value)
              : [0, 0], // Default dummy data if no values
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

    // Format value based on sensor type for better display
    const formatSensorValue = (value: number, type: SensorType): string => {
      if (typeof value !== "number") return "0";

      // Add specific formatting for different sensor types
      switch (type) {
        case SensorType.SOIL_PH:
          // pH values usually have 1 decimal place
          return value.toFixed(1);
        case SensorType.HUMIDITY:
        case SensorType.SOIL_MOISTURE:
          // Moisture/humidity as whole numbers
          return Math.round(value).toString();
        default:
          // Default formatting: show decimals only if present
          return value % 1 === 0 ? value.toString() : value.toFixed(1);
      }
    };

    // Format unit display for better visual
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
              backgroundColor: theme.card, // Base card color
            },
          ]}
        >
          <LinearGradient
            colors={[getCardBgColor(item.type), "transparent"]}
            style={styles.cardGradient}
          >
            {/* Enhanced card header with icon and type-based color */}
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

              {/* Improved status badge with icon */}
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

            {/* Sensor value display with large text */}
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

            {/* Sparkline chart for trend visualization */}
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

            {/* Status and time indicator */}
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
}: SensorDetailViewProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  /**
   * Get display name for sensor type
   */
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

  /**
   * Get icon name for sensor type (compatible with MaterialCommunityIcons)
   */
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

  /**
   * Determine sensor status based on value and type
   */
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
        // Implement light threshold logic
        return "normal";
      case SensorType.SOIL_PH:
        if (value < 4.5 || value > 8.5) return "critical";
        if (value < 5.5 || value > 7.5) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  /**
   * Format timestamp to display in a friendly way
   */
  const formatTimeAgo = (timestamp?: string): string => {
    if (!timestamp) return "Chưa cập nhật";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Định dạng không hợp lệ";

    // Simple relative time formatting (can be replaced with date-fns if available)
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

  /**
   * Get display label for a sensor
   * Combines name (if available) with location or identifier
   */
  const getSensorDisplayName = (sensor: UISensor): string => {
    // Use custom name if available, otherwise use type name
    const baseName = sensor.name || getSensorName(sensor.type);

    // Add identifier if sensor doesn't have a custom name
    if (!sensor.name) {
      return `${baseName} #${sensor.id}`;
    }

    return baseName;
  };

  /**
   * Render empty state when no sensors available
   */
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
              disabled={isRefreshing}
              accessibilityLabel="Làm mới dữ liệu cảm biến"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="refresh"
                size={16}
                color={theme.primary}
                style={isRefreshing ? styles.refreshingIcon : null}
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
          // Ensure unique key even if id is undefined
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
              refreshing={isRefreshing}
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
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 10, // Reduced vertical margin for more compact layout
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
      paddingHorizontal: 12, // Reduced padding for better card fit
      paddingBottom: 12,
      paddingTop: 4,
    },
    columnWrapper: {
      justifyContent: "space-between",
      marginBottom: 8, // Consistent spacing between rows
    },
    cardContainer: {
      width: (screenWidth - 36) / 2, // Adjusted for better spacing
      height: 180, // Reduced height for more compact cards
      marginBottom: 8, // Consistent margin between rows
    },
    cardWrapper: {
      borderRadius: 14, // Slightly reduced border radius
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
      borderRadius: 16,
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
      fontSize: 12, // Smaller font size for better fit
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
      fontSize: 8, // Smaller for better fit
      fontFamily: "Inter-SemiBold",
    },
    valueContainer: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1, // Take available space
      paddingVertical: 6,
      paddingHorizontal: 6,
    },
    valueText: {
      fontSize: 36, // Larger for emphasis
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
      marginTop: "auto", // Push to bottom
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeText: {
      fontSize: 10, // Smaller for better fit
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
  });
