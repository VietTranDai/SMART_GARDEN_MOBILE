import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import EnhancedSensorCard from "@/components/garden/EnhancedSensorCard";
import { SensorType, SensorUnit } from "@/types/gardens/sensor.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Tạo phiên bản ghi nhớ của EnhancedSensorCard để cải thiện hiệu suất
const EnhancedSensorCardMemo = React.memo(EnhancedSensorCard);

/**
 * Interface for Sensor data display
 */
export interface Sensor {
  id: number;
  type: SensorType;
  name?: string;
  value: number;
  unit: SensorUnit;
  lastUpdated?: string;
  lastReadingAt?: string;
  recentValues?: { timestamp: string; value: number }[]; // Dữ liệu xu hướng
}

interface SensorDetailViewProps {
  sensors: Sensor[];
  onSelectSensor: (sensor: Sensor) => void;
  title?: string;
}

// Create a separate component for sensor items to properly use hooks
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
    item: Sensor;
    index: number;
    onSelectSensor: (sensor: Sensor) => void;
    getSensorName: (type: string) => string;
    getSensorDisplayName: (sensor: Sensor) => string;
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

    // Animation with a slight delay based on index for staggered effect
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const pressedAnim = useRef(new Animated.Value(1)).current;

    // Setup press animations
    const handlePressIn = () => {
      Animated.spring(pressedAnim, {
        toValue: 0.96,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(pressedAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    useEffect(() => {
      // Start animations with staggered delay
      Animated.sequence([
        Animated.delay(index * 80),
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
          activeOpacity={0.85}
          accessible={true}
          accessibilityLabel={`Cảm biến ${displayName}`}
          accessibilityHint={`Hiển thị chi tiết về cảm biến ${displayName} với giá trị ${item.value} ${item.unit}`}
          accessibilityRole="button"
          style={styles.cardWrapper}
        >
          <EnhancedSensorCardMemo
            id={String(item.id)}
            type={item.type as SensorType}
            name={displayName}
            value={item.value}
            unit={item.unit}
            status={status}
            timestamp={timestamp}
            onPress={() => onSelectSensor(item)}
            iconName={getSensorIcon(item.type)}
          />

          {/* Status and time indicator */}
          <View style={styles.infoContainer}>
            <View style={styles.statusContainer}>
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status === "critical"
                  ? "Nguy hiểm"
                  : status === "warning"
                  ? "Cảnh báo"
                  : "Bình thường"}
              </Text>
            </View>

            <View style={styles.timeContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={12}
                color={theme.textSecondary}
              />
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                {timeAgo}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

export default function SensorDetailView({
  sensors,
  onSelectSensor,
  title = "Số liệu Cảm biến",
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
  const getSensorDisplayName = (sensor: Sensor): string => {
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
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Chưa có cảm biến nào được thêm vào vườn này.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
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
          // Đảm bảo luôn có key duy nhất ngay cả khi id là undefined
          return item.id !== undefined && item.id !== null
            ? String(item.id)
            : `sensor-${index}`;
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        initialNumToRender={4}
        maxToRenderPerBatch={8}
        windowSize={5}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Không có dữ liệu cảm biến
          </Text>
        }
        // Thêm điều khiển của thanh cuộn
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={280} // Điều chỉnh theo chiều rộng thẻ + margin
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 15,
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
      marginHorizontal: 16,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 16,
    },
    cardContainer: {
      width: 260,
      margin: 2, // For shadow
    },
    cardWrapper: {
      borderRadius: 12,
      backgroundColor: theme.card,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.borderLight || "rgba(0,0,0,0.05)",
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow || "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    infoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight || "rgba(0,0,0,0.05)",
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 10,
      backgroundColor: "rgba(0,0,0,0.03)",
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 4,
    },
    statusText: {
      fontSize: 10,
      fontFamily: "Inter-Medium",
      marginRight: 2,
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeText: {
      fontSize: 10,
      fontFamily: "Inter-Regular",
      marginLeft: 4,
    },
    emptyContainer: {
      margin: 16,
      padding: 20,
      borderRadius: 12,
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
          elevation: 1,
        },
      }),
    },
    emptyText: {
      fontSize: 16,
      textAlign: "center",
      fontFamily: "Inter-Regular",
    },
  });
