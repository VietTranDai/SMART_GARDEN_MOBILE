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
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import EnhancedSensorCard from "@/components/garden/EnhancedSensorCard";
import { SensorType, SensorUnit } from "@/types/gardens/sensor.types";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

// Memorized version of EnhancedSensorCard for performance
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
  recentValues?: { timestamp: string; value: number }[]; // Trend data
}

interface SensorDetailViewProps {
  sensors: Sensor[];
  onSelectSensor: (sensor: Sensor) => void;
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

    // Setup press animations
    const handlePressIn = () => {
      Animated.spring(pressedAnim, {
        toValue: 0.97,
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

    // Get border color based on status
    const statusBorderColor =
      status === "critical"
        ? `rgba(255,59,48,0.3)`
        : status === "warning"
        ? `rgba(255,204,0,0.3)`
        : `rgba(52,199,89,0.2)`;

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
          accessibilityHint={`Hiển thị chi tiết về cảm biến ${displayName} với giá trị ${item.value} ${item.unit}`}
          accessibilityRole="button"
          style={[styles.cardWrapper, { borderColor: statusBorderColor }]}
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
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusBadgeText}>
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
            <Text style={styles.valueText}>
              {typeof item.value === "number"
                ? item.value % 1 === 0
                  ? item.value.toString()
                  : item.value.toFixed(1)
                : "0"}
            </Text>
            <Text style={styles.unitText}>{item.unit}</Text>
          </View>

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
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
        // Scroll controls
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={240} // Adjusted to card width + margin
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        removeClippedSubviews={Platform.OS === "android"} // Performance optimization
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 15,
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
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 16,
    },
    cardContainer: {
      width: 220,
      margin: 2, // For shadow
    },
    cardWrapper: {
      borderRadius: 16,
      backgroundColor: theme.card,
      overflow: "hidden",
      borderWidth: 1.5,
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow || "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    sensorIcon: {
      marginRight: 8,
    },
    sensorName: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.text,
    },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 10,
      marginLeft: 6,
    },
    statusBadgeText: {
      fontSize: 9,
      fontFamily: "Inter-SemiBold",
      color: "white",
    },
    valueContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 8,
    },
    valueText: {
      fontSize: 36,
      fontFamily: "Inter-Bold",
      color: theme.text,
    },
    unitText: {
      fontSize: 15,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginTop: 4,
    },
    infoContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight || "rgba(0,0,0,0.05)",
    },
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeText: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginLeft: 4,
    },
    detailButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    detailButtonText: {
      fontSize: 12,
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
