import React, {
  memo,
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { View, Text, StyleSheet, ScrollView, Animated } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import {
  SensorType,
  SensorUnit,
  SensorData,
} from "@/types/gardens/sensor.types";

interface SensorStripProps {
  sensorData: Record<string, SensorData[]>;
  theme: any;
  compact?: boolean;
}

// Helper functions for sensor data display - moved outside component for memoization
const getSensorIconAndUnit = (
  type: SensorType
): {
  icon: string;
  iconProvider: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome5";
  unit: string;
} => {
  switch (type) {
    case SensorType.TEMPERATURE:
      return {
        icon: "thermometer-half",
        iconProvider: "FontAwesome5",
        unit: "°C",
      };
    case SensorType.HUMIDITY:
      return {
        icon: "water-outline",
        iconProvider: "Ionicons",
        unit: "%",
      };
    case SensorType.SOIL_MOISTURE:
      return {
        icon: "water",
        iconProvider: "Ionicons",
        unit: "%",
      };
    case SensorType.LIGHT:
      return {
        icon: "sunny-outline",
        iconProvider: "Ionicons",
        unit: "lux",
      };
    case SensorType.WATER_LEVEL:
      return {
        icon: "cup-water",
        iconProvider: "MaterialCommunityIcons",
        unit: "m",
      };
    case SensorType.RAINFALL:
      return {
        icon: "cloud-rain",
        iconProvider: "FontAwesome5",
        unit: "mm",
      };
    case SensorType.SOIL_PH:
      return {
        icon: "flask-outline",
        iconProvider: "MaterialCommunityIcons",
        unit: "pH",
      };
    default:
      return {
        icon: "help-circle-outline",
        iconProvider: "Ionicons",
        unit: "",
      };
  }
};

const getSensorName = (type: SensorType): string => {
  switch (type) {
    case SensorType.TEMPERATURE:
      return "Nhiệt độ";
    case SensorType.HUMIDITY:
      return "Độ ẩm";
    case SensorType.SOIL_MOISTURE:
      return "Ẩm đất";
    case SensorType.LIGHT:
      return "Ánh sáng";
    case SensorType.WATER_LEVEL:
      return "Mực nước";
    case SensorType.RAINFALL:
      return "Lượng mưa";
    case SensorType.SOIL_PH:
      return "pH đất";
    default:
      return "Cảm biến";
  }
};

const getSensorStatusText = (status: string): string => {
  switch (status) {
    case "normal":
      return "Tốt";
    case "warning":
      return "Cảnh báo";
    case "critical":
      return "Nguy hiểm";
    default:
      return "Không xác định";
  }
};

const getSensorStatus = (
  value: number,
  type: SensorType
): "normal" | "warning" | "critical" => {
  switch (type) {
    case SensorType.TEMPERATURE:
      if (value < 10 || value > 35) return "critical";
      if (value < 15 || value > 30) return "warning";
      return "normal";

    case SensorType.HUMIDITY:
    case SensorType.SOIL_MOISTURE:
      if (value < 20 || value > 90) return "critical";
      if (value < 30 || value > 80) return "warning";
      return "normal";

    case SensorType.LIGHT:
      if (value < 100 || value > 10000) return "critical";
      if (value < 500 || value > 8000) return "warning";
      return "normal";

    default:
      return "normal";
  }
};

// Render icon component memoized
const SensorIcon = memo(
  ({
    iconInfo,
    color,
    size = 16,
  }: {
    iconInfo: {
      icon: string;
      iconProvider: "Ionicons" | "MaterialCommunityIcons" | "FontAwesome5";
    };
    color: string;
    size?: number;
  }) => {
    switch (iconInfo.iconProvider) {
      case "Ionicons":
        return (
          <Ionicons name={iconInfo.icon as any} size={size} color={color} />
        );
      case "MaterialCommunityIcons":
        return (
          <MaterialCommunityIcons
            name={iconInfo.icon as any}
            size={size}
            color={color}
          />
        );
      case "FontAwesome5":
        return (
          <FontAwesome5 name={iconInfo.icon as any} size={size} color={color} />
        );
      default:
        return (
          <Ionicons name="help-circle-outline" size={size} color={color} />
        );
    }
  }
);

// Memoized animated sensor item component
const SensorItem = memo(
  ({
    sensorType,
    value,
    theme,
    previousValue,
    compact = false,
  }: {
    sensorType: SensorType;
    value: number;
    theme: any;
    previousValue?: number | null;
    compact?: boolean;
  }) => {
    // Animation value for value change highlight
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Effect to highlight value when it changes
    useEffect(() => {
      if (
        previousValue !== undefined &&
        previousValue !== null &&
        previousValue !== value
      ) {
        // Reset and start animations
        fadeAnim.setValue(1);
        scaleAnim.setValue(1.2);

        // Fade out background highlight
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }).start();

        // Scale back to normal size
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    }, [value, previousValue, fadeAnim, scaleAnim]);

    // Memoize calculations
    const status = useMemo(
      () => getSensorStatus(value, sensorType),
      [value, sensorType]
    );

    const statusColor = useMemo(() => {
      switch (status) {
        case "normal":
          return theme.success;
        case "warning":
          return theme.warning;
        case "critical":
          return theme.error;
        default:
          return theme.textSecondary;
      }
    }, [status, theme]);

    const { icon, iconProvider, unit } = useMemo(
      () => getSensorIconAndUnit(sensorType),
      [sensorType]
    );

    const sensorName = useMemo(() => getSensorName(sensorType), [sensorType]);
    const statusText = useMemo(() => getSensorStatusText(status), [status]);

    // Có hiệu ứng khi dữ liệu thay đổi - animated background
    const animatedBackgroundStyle = {
      backgroundColor: fadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
          "transparent",
          status === "normal" ? `${theme.success}20` : `${statusColor}20`,
        ],
      }),
    };

    // Animated text value style
    const animatedValueStyle = {
      transform: [{ scale: scaleAnim }],
    };

    // Nếu compact, hiển thị phiên bản nhỏ gọn
    if (compact) {
      return (
        <Animated.View
          style={[styles.compactSensorItem, animatedBackgroundStyle]}
        >
          <View style={styles.compactIconContainer}>
            <SensorIcon
              iconInfo={{ icon, iconProvider }}
              color={status === "normal" ? theme.primary : statusColor}
              size={14}
            />
          </View>
          <View style={styles.compactTextContainer}>
            <Text style={styles.compactSensorName}>{sensorName}</Text>
            <Animated.Text
              style={[
                styles.compactSensorValue,
                { color: status === "normal" ? theme.text : statusColor },
                animatedValueStyle,
              ]}
            >
              {value.toFixed(1)}
              <Text style={styles.compactUnit}>{unit}</Text>
            </Animated.Text>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[styles.sensorCard, animatedBackgroundStyle]}>
        <View style={styles.sensorHeader}>
          <View style={styles.sensorNameContainer}>
            <SensorIcon
              iconInfo={{ icon, iconProvider }}
              color={status === "normal" ? theme.primary : statusColor}
              size={18}
            />
            <Text style={[styles.sensorName, { color: theme.text }]}>
              {sensorName}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  status === "normal"
                    ? `${theme.success}30`
                    : status === "warning"
                      ? `${theme.warning}30`
                      : `${theme.error}30`,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    status === "normal"
                      ? theme.success
                      : status === "warning"
                        ? theme.warning
                        : theme.error,
                },
              ]}
            >
              {statusText}
            </Text>
          </View>
        </View>
        <View style={styles.sensorValueContainer}>
          <Animated.Text
            style={[
              styles.sensorValue,
              { color: status === "normal" ? theme.text : statusColor },
              animatedValueStyle,
            ]}
          >
            {value.toFixed(1)}
          </Animated.Text>
          <Text style={[styles.sensorUnit, { color: theme.textSecondary }]}>
            {unit}
          </Text>
        </View>
      </Animated.View>
    );
  }
);

const SensorStrip = memo(
  ({ sensorData, theme, compact = false }: SensorStripProps) => {
    const processedData = useMemo(() => {
      if (!sensorData || typeof sensorData !== "object") {
        console.log("SensorStrip: Invalid sensor data");
        return {} as Record<string, SensorData[]>;
      }

      // Tạo đối tượng mới với các key là string (đại diện cho SensorType)
      const result: Record<string, SensorData[]> = {};

      // Xử lý dữ liệu theo từng loại
      Object.keys(sensorData).forEach((typeKey) => {
        // Kiểm tra xem giá trị có phải là mảng không
        if (
          Array.isArray(sensorData[typeKey]) &&
          sensorData[typeKey].length > 0
        ) {
          result[typeKey] = sensorData[typeKey];
        }
      });

      return result;
    }, [sensorData]);

    // State to track previous values for animation
    const [previousValues, setPreviousValues] = useState<
      Record<SensorType, number | null>
    >({
      [SensorType.TEMPERATURE]: null,
      [SensorType.HUMIDITY]: null,
      [SensorType.SOIL_MOISTURE]: null,
      [SensorType.LIGHT]: null,
      [SensorType.SOIL_PH]: null,
      [SensorType.WATER_LEVEL]: null,
      [SensorType.RAINFALL]: null,
    });

    // Get the important sensor types to display
    const importantSensorTypes = useMemo(
      () => [
        SensorType.TEMPERATURE,
        SensorType.HUMIDITY,
        SensorType.SOIL_MOISTURE,
        SensorType.LIGHT,
      ],
      []
    );

    // Get latest value for each sensor type - memoized
    const getLatestValue = useCallback(
      (type: SensorType): number | null => {
        const typeKey = type.toString();
        if (!processedData[typeKey] || !Array.isArray(processedData[typeKey])) {
          return null;
        }

        const typeData = processedData[typeKey];
        if (typeData.length === 0) return null;

        // Sort by timestamp and get the latest
        try {
          const sorted = [...typeData].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          return sorted[0].value;
        } catch (error) {
          console.error(`Error sorting sensor data for ${typeKey}:`, error);
          return typeData[0]?.value ?? null;
        }
      },
      [processedData]
    );

    // Update previous values when current values change
    useEffect(() => {
      const newValues: Record<SensorType, number | null> = {
        [SensorType.TEMPERATURE]: null,
        [SensorType.HUMIDITY]: null,
        [SensorType.SOIL_MOISTURE]: null,
        [SensorType.LIGHT]: null,
        [SensorType.SOIL_PH]: null,
        [SensorType.WATER_LEVEL]: null,
        [SensorType.RAINFALL]: null,
      };

      importantSensorTypes.forEach((type) => {
        // Store current values to compare next time
        newValues[type] = getLatestValue(type);
      });

      setPreviousValues((prevState) => {
        // Only update if we have previous state to compare with
        if (Object.keys(prevState).length > 0) {
          return newValues;
        }
        return prevState;
      });
    }, [processedData, getLatestValue, importantSensorTypes]);

    // Chia dữ liệu cảm biến thành 2 dòng
    const getRowSensorData = useCallback(() => {
      const availableSensors = importantSensorTypes.filter(
        (type) => getLatestValue(type) !== null
      );

      const row1 = availableSensors.slice(
        0,
        Math.ceil(availableSensors.length / 2)
      );
      const row2 = availableSensors.slice(
        Math.ceil(availableSensors.length / 2)
      );

      return { row1, row2 };
    }, [importantSensorTypes, getLatestValue]);

    // Compact view for garden cards
    if (compact) {
      const { row1, row2 } = getRowSensorData();

      return (
        <View style={styles.compactContainer}>
          {/* Row 1 */}
          <View style={styles.compactRow}>
            {row1.map((type) => {
              const value = getLatestValue(type);
              return value !== null ? (
                <SensorItem
                  key={`sensor-${type}-row1-${value}`}
                  sensorType={type}
                  value={value}
                  theme={theme}
                  previousValue={previousValues[type]}
                  compact={true}
                />
              ) : null;
            })}
          </View>

          {/* Row 2 */}
          {row2.length > 0 && (
            <View style={styles.compactRow}>
              {row2.map((type) => {
                const value = getLatestValue(type);
                return value !== null ? (
                  <SensorItem
                    key={`sensor-${type}-row2-${value}`}
                    sensorType={type}
                    value={value}
                    theme={theme}
                    previousValue={previousValues[type]}
                    compact={true}
                  />
                ) : null;
              })}
            </View>
          )}
        </View>
      );
    }

    // Full view for detailed pages
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {importantSensorTypes.map((type) => {
          const value = getLatestValue(type);
          return value !== null ? (
            <SensorItem
              key={`sensor-${type}-full-${value}`}
              sensorType={type}
              value={value}
              theme={theme}
              previousValue={previousValues[type]}
            />
          ) : null;
        })}
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  sensorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  compactContainer: {
    paddingTop: 0,
    paddingBottom: 2,
    marginTop: 6,
    marginBottom: 0,
  },
  compactSensorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 3,
  },
  sensorCard: {
    width: 130,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sensorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sensorNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sensorName: {
    fontSize: 13,
    fontFamily: "Inter-Medium",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Inter-SemiBold",
  },
  sensorValueContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 4,
  },
  sensorValue: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
  },
  sensorUnit: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginLeft: 2,
    marginBottom: 4,
  },
  compactSensorItem: {
    width: "49%",
    padding: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    marginBottom: 4,
    gap: 3,
  },
  compactIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  compactTextContainer: {
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
  },
  compactSensorName: {
    fontSize: 9,
    fontFamily: "Inter-Medium",
    color: "rgba(0,0,0,0.6)",
    marginBottom: 1,
  },
  compactSensorValue: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
  },
  compactUnit: {
    fontSize: 9,
    fontFamily: "Inter-Regular",
    opacity: 0.7,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    padding: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    padding: 4,
  },
  sensorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  compactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  scrollContent: {
    paddingVertical: 8,
  },
});

export default SensorStrip;
