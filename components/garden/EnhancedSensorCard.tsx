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
  onPress: () => void;
  style?: ViewStyle;
}

// Map of sensor units to display strings
const UNIT_DISPLAY = {
  [SensorUnit.CELSIUS]: "°C",
  [SensorUnit.PERCENT]: "%",
  [SensorUnit.LUX]: "lux",
  [SensorUnit.METER]: "m",
  [SensorUnit.MILLIMETER]: "mm",
  [SensorUnit.PH]: "pH",
};

// Map of sensor types to human-readable names
const SENSOR_NAME_MAP: Record<SensorType, string> = {
  [SensorType.TEMPERATURE]: "Nhiệt độ",
  [SensorType.HUMIDITY]: "Độ ẩm",
  [SensorType.SOIL_MOISTURE]: "Độ ẩm đất",
  [SensorType.LIGHT]: "Ánh sáng",
  [SensorType.WATER_LEVEL]: "Mực nước",
  [SensorType.RAINFALL]: "Lượng mưa",
  [SensorType.SOIL_PH]: "Độ pH đất",
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
  onPress,
  style,
}: EnhancedSensorCardProps) {
  const theme = useAppTheme();

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Touch animation
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
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

  // Get status background color
  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "critical":
        return theme.statusDangerBg;
      case "warning":
        return theme.statusWarningBg;
      default:
        return theme.statusHealthyBg;
    }
  };

  // Get icon name for sensor type
  const getSensorIconName = (sensorType: SensorType): string => {
    switch (sensorType) {
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

  // Render trend line
  const renderTrendLine = () => {
    if (!trendData || trendData.length < 2) return null;

    // Find min and max values to normalize
    const values = trendData.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1; // Avoid division by zero

    return (
      <View style={styles.trendContainer}>
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
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderLeftColor: getStatusColor(status),
          ...theme.elevation2,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${
        name || SENSOR_NAME_MAP[type] || type
      }: ${value} ${unit}`}
      accessibilityHint={`Trạng thái: ${getStatusText(status)}`}
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
              { backgroundColor: getStatusBgColor(status) },
            ]}
          >
            <MaterialCommunityIcons
              name={getSensorIconName(type) as any}
              size={22}
              color={getStatusColor(status)}
            />
          </View>

          <View style={styles.headerTextContainer}>
            <Text
              style={[styles.sensorName, { color: theme.text }]}
              numberOfLines={1}
            >
              {name || SENSOR_NAME_MAP[type] || type}
            </Text>

            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(status) },
                ]}
              />
              <Text
                style={[styles.statusText, { color: getStatusColor(status) }]}
              >
                {getStatusText(status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: getStatusColor(status) }]}>
            {value !== undefined && value !== null ? value.toFixed(1) : "-"}
            <Text style={styles.unitText}>{unit}</Text>
          </Text>
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
    width: 150,
    borderRadius: 16,
    overflow: "hidden",
    borderLeftWidth: 4,
    margin: 6,
  },
  touchable: {
    padding: 12,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  sensorName: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter-Medium",
  },
  valueContainer: {
    marginVertical: 8,
    alignItems: "center",
  },
  valueText: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
  },
  unitText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  trendContainer: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginVertical: 8,
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
  timestampText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    textAlign: "right",
    marginTop: 8,
  },
});
