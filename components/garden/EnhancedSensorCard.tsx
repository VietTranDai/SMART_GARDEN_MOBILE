import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { SensorType, SensorUnit } from "@/types/gardens/sensor.types";

// Define a type for trend data
type TrendPoint = {
  value: number;
  timestamp: string;
};

interface EnhancedSensorCardProps {
  id: string;
  type: SensorType;
  name: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  timestamp: string;
  trendData?: TrendPoint[];
  iconName?: string; // Custom icon name
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: ViewStyle;
}

// Map of sensor units to display strings
// const UNIT_DISPLAY = {
//   [SensorUnit.CELSIUS]: "°C",
//   [SensorUnit.PERCENT]: "%",
//   [SensorUnit.LUX]: "lux",
//   [SensorUnit.METER]: "m",
//   [SensorUnit.MILLIMETER]: "mm",
//   [SensorUnit.PH]: "pH",
// };

// Map of sensor types to human-readable names
const SENSOR_NAME_MAP: Record<SensorType, string> = {
  [SensorType.TEMPERATURE]: "Nhiệt độ",
  [SensorType.HUMIDITY]: "Độ ẩm",
  [SensorType.SOIL_MOISTURE]: "Độ ẩm đất",
  [SensorType.LIGHT]: "Ánh sáng",
  [SensorType.WATER_LEVEL]: "Mực nước",
  [SensorType.SOIL_PH]: "Độ pH đất",
  [SensorType.RAINFALL]: "Lượng mưa",
};

export default function EnhancedSensorCard({
  id,
  type,
  name,
  value,
  unit,
  status,
  timestamp,
  trendData,
  iconName,
  onPress,
  onPressIn,
  onPressOut,
  style,
}: EnhancedSensorCardProps) {
  const theme = useAppTheme();

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Touch animation
  const handlePressIn = () => {
    if (onPressIn) {
      onPressIn();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPressOut) {
      onPressOut();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  // Mount animation
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: theme.animationTiming.medium,
      delay: 100, // Stagger effect if multiple cards
      useNativeDriver: true,
    }).start();
  }, [opacityAnim, theme.animationTiming.medium]);

  // Status glow animation for critical status
  useEffect(() => {
    if (status === "critical") {
      // Create pulsing glow effect for critical status
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animation for non-critical status
      glowAnim.setValue(0);
    }
  }, [status, glowAnim]);

  // Get status color
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

  // Get status background color (for badges)
  const getStatusBadgeBgColor = (status: string) => {
    switch (status) {
      case "critical":
        return theme.statusDangerBg;
      case "warning":
        return theme.statusWarningBg || "#FFF8E1"; // Fallback to light yellow if theme doesn't define it
      default:
        return theme.statusHealthyBg;
    }
  };

  // Get icon name for sensor type
  const getSensorIconName = (
    sensorType: SensorType
  ): React.ComponentProps<typeof MaterialCommunityIcons>["name"] => {
    // Use custom iconName if provided and is a valid MDI icon name
    // This check is simplified; a proper check would involve a list of all MDI names.
    if (iconName && typeof iconName === "string") {
      // Basic check
      return iconName as React.ComponentProps<
        typeof MaterialCommunityIcons
      >["name"];
    }

    // Otherwise use default icon mapping
    switch (sensorType) {
      case SensorType.TEMPERATURE:
        return "thermometer";
      case SensorType.HUMIDITY:
        return "water-percent";
      case SensorType.SOIL_MOISTURE:
        return "water-outline"; // Assuming this is MaterialCommunityIcons, not Ionicons
      case SensorType.LIGHT:
        return "white-balance-sunny";
      case SensorType.WATER_LEVEL:
        return "water"; // or "cup-water" or "waves"
      // case SensorType.RAINFALL: // RAINFALL is not in the SENSOR_NAME_MAP, might not be a used type here
      //   return "weather-pouring";
      case SensorType.SOIL_PH:
        return "flask-outline";
      default:
        return "gauge"; // Default icon
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "critical":
        return "Nguy cấp";
      case "warning":
        return "Cảnh báo";
      default:
        return "Bình thường";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return "alert-circle";
      case "warning":
        return "alert";
      default:
        return "check-circle";
    }
  };

  // Render trend line with improved visualization
  const renderTrendLine = () => {
    if (!trendData || trendData.length < 2) return null;

    // Find min and max values to normalize
    const values = trendData.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1; // Avoid division by zero

    // Calculate the overall trend direction
    const firstValue = trendData[0].value;
    const lastValue = trendData[trendData.length - 1].value;
    const overallTrend =
      lastValue > firstValue ? "up" : lastValue < firstValue ? "down" : "flat";

    // Primary trend color based on status and direction
    const trendColor =
      status === "critical"
        ? overallTrend === "down"
          ? theme.success
          : theme.error
        : overallTrend === "up"
          ? theme.success
          : theme.warning;

    return (
      <View style={styles.trendContainer}>
        {/* Add a small trend indicator */}
        <View style={styles.trendIndicator}>
          <MaterialCommunityIcons
            name={
              overallTrend === "up"
                ? "trending-up"
                : overallTrend === "down"
                  ? "trending-down"
                  : "trending-neutral"
            }
            size={14}
            color={trendColor}
          />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {overallTrend === "up"
              ? "Tăng"
              : overallTrend === "down"
                ? "Giảm"
                : "Ổn định"}
          </Text>
        </View>

        {/* Render trend lines */}
        <View style={styles.trendLineWrapper}>
          {trendData.map((point, index) => {
            // Skip rendering the first point's line
            if (index === 0) return null;

            // Calculate the normalized height for this point and the previous one
            const prevPoint = trendData[index - 1];
            const prevHeight = ((prevPoint.value - minValue) / range) * 20;
            const currHeight = ((point.value - minValue) / range) * 20;

            // Calculate the direction (up, down, flat)
            const direction =
              point.value > prevPoint.value
                ? "up"
                : point.value < prevPoint.value
                  ? "down"
                  : "flat";

            // Determine line color based on direction and status
            const lineColor =
              direction === "up"
                ? status === "critical"
                  ? theme.error
                  : theme.success
                : direction === "down"
                  ? status === "critical"
                    ? theme.success
                    : theme.error
                  : theme.textTertiary;

            return (
              <View key={index} style={styles.trendLineContainer}>
                <View
                  style={[
                    styles.trendLine,
                    {
                      height: Math.max(2, Math.abs(currHeight - prevHeight)),
                      backgroundColor: lineColor,
                      transform: [
                        {
                          translateY:
                            currHeight < prevHeight
                              ? -Math.abs(currHeight - prevHeight) / 2
                              : Math.abs(currHeight - prevHeight) / 2,
                        },
                        {
                          rotate:
                            direction === "up"
                              ? "-45deg"
                              : direction === "down"
                                ? "45deg"
                                : "0deg",
                        },
                      ],
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const statusColor = getStatusColor(status);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          borderLeftColor: statusColor,
          backgroundColor: theme.card,
          ...theme.elevation2,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${
        name || SENSOR_NAME_MAP[type] || type
      }: ${value} ${unit}`}
      accessibilityHint={`Trạng thái: ${getStatusText(
        status
      )}. Nhấn để xem chi tiết.`}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.headerRow}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getStatusBadgeBgColor(status) },
            ]}
          >
            <MaterialCommunityIcons
              name={getSensorIconName(type)}
              size={22}
              color={statusColor}
            />
          </View>

          <View style={styles.headerTextContainer}>
            <Text
              style={[styles.sensorName, { color: theme.text }]}
              numberOfLines={1}
            >
              {SENSOR_NAME_MAP[type] || name || type}
            </Text>

            <View
              style={[
                styles.statusContainer,
                status !== "normal" && {
                  backgroundColor: getStatusBadgeBgColor(status),
                },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <MaterialCommunityIcons
                name={getStatusIcon(status)}
                size={12}
                color={statusColor}
                style={{ marginRight: 2 }}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: statusColor }]}>
            {value !== undefined && value !== null ? value.toFixed(1) : "-"}
            <Text style={styles.unitText}>{unit}</Text>
          </Text>

          {/* Add trend indicator below the value */}
          <View style={styles.trendIndicatorCompact}>
            <MaterialCommunityIcons
              name={
                trendData && trendData.length > 1
                  ? trendData[trendData.length - 1].value > trendData[0].value
                    ? "trending-up"
                    : "trending-down"
                  : "trending-neutral"
              }
              size={15}
              color={statusColor}
            />
            <Text style={[styles.trendIndicatorText, { color: statusColor }]}>
              {trendData && trendData.length > 1
                ? trendData[trendData.length - 1].value > trendData[0].value
                  ? "Tăng"
                  : "Giảm"
                : ""}
            </Text>
          </View>
        </View>

        {renderTrendLine()}

        <Text style={[styles.timestampText, { color: theme.textTertiary }]}>
          {formatTimestamp(timestamp)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    borderRadius: 20,
    overflow: "hidden",
    borderLeftWidth: 4,
    margin: 4,
  },
  touchable: {
    padding: 16,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  sensorName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    backgroundColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter-SemiBold",
  },
  valueContainer: {
    marginVertical: 8,
    alignItems: "flex-start",
  },
  valueText: {
    fontSize: 38,
    fontFamily: "Inter-Bold",
    marginBottom: 4,
  },
  unitText: {
    fontSize: 20,
    fontFamily: "Inter-Regular",
    marginLeft: 2,
  },
  trendContainer: {
    marginTop: 8,
  },
  trendIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  trendText: {
    fontSize: 10,
    fontFamily: "Inter-Medium",
    marginLeft: 2,
  },
  trendLineWrapper: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  trendLineContainer: {
    width: 10,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  trendLine: {
    width: 2,
    minHeight: 2,
  },
  trendIndicatorCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -5,
  },
  trendIndicatorText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    marginLeft: 2,
  },
  timestampText: {
    fontSize: 11,
    fontFamily: "Inter-Regular",
    marginTop: 6,
  },
});
