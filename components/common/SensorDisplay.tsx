import React, { JSX, memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  Animated,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import useSectionAnimation from "@/hooks/useSectionAnimation";
import { SensorType, SensorUnit } from "@/types";

// Định nghĩa lại SensorData nếu cần
interface SensorDataExtended {
  id: string;
  type: SensorType;
  name: string;
  value: number;
  unit: string;
  lastUpdated: string;
  isActive: boolean;
  trendData?: { value: number; timestamp: string }[]; // Optional historical data for sparkline
}

interface SensorDisplayProps {
  selectedGardenId?: number | null;
  sensorDataByType: Record<SensorType, SensorDataExtended[]>;
  getSensorStatus: (
    value: number,
    type: SensorType
  ) => "normal" | "warning" | "critical";
  getSensorIconName: (sensorType: SensorType) => string;
  showFullDetails?: boolean;
}

// Define a separate SensorCard component to optimize rendering
const SensorCard = memo(
  ({
    item,
    getSensorStatus,
    getSensorTypeName,
    getSensorUnitText,
    getSensorIcon,
    getIconComponent,
    theme,
    generateDummyTrendData,
  }: {
    item: SensorDataExtended;
    getSensorStatus: (
      value: number,
      type: SensorType
    ) => "normal" | "warning" | "critical";
    getSensorTypeName: (type: SensorType) => string;
    getSensorUnitText: (unit: string) => string;
    getSensorIcon: (type: SensorType) => string;
    getIconComponent: (iconName: string, color: string) => JSX.Element;
    theme: any;
    generateDummyTrendData: (
      value: number
    ) => { value: number; timestamp: string }[];
  }) => {
    const status = getSensorStatus(item.value, item.type);
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

    const sensorName = item.name || getSensorTypeName(item.type);
    const unitText = getSensorUnitText(item.unit);
    const iconName = getSensorIcon(item.type);
    const iconComponent = getIconComponent(
      iconName,
      status === "normal" ? theme.primary : statusColor
    );

    // Generate trend data only once for this render
    const trendData = useMemo(
      () => item.trendData || generateDummyTrendData(item.value),
      [item.value, item.trendData, generateDummyTrendData]
    );

    // Format timestamp once
    const formattedTimestamp = useMemo(() => {
      const date = new Date(item.lastUpdated);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }, [item.lastUpdated]);

    // Simple custom sparkline component using basic React Native views
    const SimpleSparklLine = useMemo(() => {
      if (!trendData || trendData.length < 2) return null;

      // Find min and max to normalize the heights
      const values = trendData.map((d) => d.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min === 0 ? 1 : max - min; // Prevent division by zero

      return (
        <View style={styles.sparklineContainer}>
          <View style={styles.sparklineInner}>
            {trendData.map((point, index) => {
              const normalizedHeight = ((point.value - min) / range) * 100;

              return (
                <View key={index} style={styles.sparklineColumn}>
                  <View
                    style={[
                      styles.sparklineBar,
                      {
                        height: `${normalizedHeight}%`,
                        backgroundColor:
                          status !== "normal" ? statusColor : theme.primary,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>
      );
    }, [trendData, status, statusColor, theme.primary]);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.sensorCard,
          {
            backgroundColor: theme.card,
            borderColor: status !== "normal" ? statusColor : "transparent",
            ...Platform.select({
              ios: {
                shadowColor: theme.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 2,
              },
            }),
          },
        ]}
        onPress={() => router.push(`/sensor/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Header: Icon and Title */}
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>{iconComponent}</View>
          <View style={styles.titleContainer}>
            <Text style={[styles.sensorTitle, { color: theme.text }]}>
              {sensorName}
            </Text>
            <View
              style={[
                styles.unitBadge,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Text style={[styles.unitText, { color: theme.textSecondary }]}>
                {unitText}
              </Text>
            </View>
          </View>
        </View>

        {/* Main value */}
        <Text
          style={[
            styles.valueText,
            {
              color: status !== "normal" ? statusColor : theme.primary,
            },
          ]}
        >
          {item.value.toFixed(1)}
        </Text>

        {/* Custom sparkline */}
        {SimpleSparklLine}

        {/* Last updated timestamp */}
        <View style={styles.timestampContainer}>
          <Ionicons
            name="time-outline"
            size={12}
            color={theme.textSecondary}
            style={styles.timeIcon}
          />
          <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
            Cập nhật: {formattedTimestamp}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

export default memo(function SensorDisplay({
  selectedGardenId,
  sensorDataByType,
  getSensorStatus,
  getSensorIconName,
  showFullDetails = false,
}: SensorDisplayProps) {
  const theme = useAppTheme();
  const { getAnimatedStyle } = useSectionAnimation("sensors");

  const getStatusColor = useMemo(
    () => (status: "normal" | "warning" | "critical") => {
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
    },
    [theme]
  );

  const getSensorUnitText = useMemo(
    () => (unit: string) => {
      switch (unit) {
        case SensorUnit.CELSIUS:
          return "°C";
        case SensorUnit.PERCENT:
          return "%";
        case SensorUnit.LUX:
          return "lux";
        case SensorUnit.METER:
          return "m";
        case SensorUnit.MILLIMETER:
          return "mm";
        case SensorUnit.PH:
          return "pH";
        default:
          return unit;
      }
    },
    []
  );

  const getSensorIcon = useMemo(
    () => (type: SensorType) => {
      switch (type) {
        case SensorType.TEMPERATURE:
          return "thermometer-half";
        case SensorType.HUMIDITY:
          return "water";
        case SensorType.LIGHT:
          return "sunny";
        case SensorType.WATER_LEVEL:
          return "cup-water";
        case SensorType.RAINFALL:
          return "rainy";
        case SensorType.SOIL_MOISTURE:
          return "seed";
        case SensorType.SOIL_PH:
          return "flask";
        default:
          return "analytics";
      }
    },
    []
  );

  const getIconComponent = useMemo(
    () => (iconName: string, color: string) => {
      // Return the appropriate icon component based on the icon name
      switch (iconName) {
        case "thermometer-half":
          return (
            <FontAwesome5 name="thermometer-half" size={24} color={color} />
          );
        case "water":
          return <Ionicons name="water" size={24} color={color} />;
        case "sunny":
          return <Ionicons name="sunny" size={24} color={color} />;
        case "cup-water":
          return (
            <MaterialCommunityIcons name="cup-water" size={24} color={color} />
          );
        case "rainy":
          return <Ionicons name="rainy" size={24} color={color} />;
        case "seed":
          return <MaterialCommunityIcons name="seed" size={24} color={color} />;
        case "flask":
          return (
            <MaterialCommunityIcons name="flask" size={24} color={color} />
          );
        default:
          return <Ionicons name="analytics" size={24} color={color} />;
      }
    },
    []
  );

  // Function to get readable name for sensor type
  const getSensorTypeName = useMemo(
    () => (type: SensorType) => {
      switch (type) {
        case SensorType.TEMPERATURE:
          return "Nhiệt độ";
        case SensorType.HUMIDITY:
          return "Độ ẩm";
        case SensorType.LIGHT:
          return "Ánh sáng";
        case SensorType.WATER_LEVEL:
          return "Mực nước";
        case SensorType.RAINFALL:
          return "Lượng mưa";
        case SensorType.SOIL_MOISTURE:
          return "Độ ẩm đất";
        case SensorType.SOIL_PH:
          return "Độ pH đất";
        default:
          return "Cảm biến";
      }
    },
    []
  );

  // Generate trend data for the sparkline if it doesn't exist
  const generateDummyTrendData = useMemo(
    () => (value: number) => {
      // Generate 5 trend points with slight variation
      const now = new Date();
      const data = [];
      for (let i = 0; i < 5; i++) {
        const variance = Math.random() * 0.4 - 0.2; // Random value between -0.2 and 0.2
        const timestamp = new Date(now.getTime() - (4 - i) * 12000); // Past minutes
        data.push({
          value: Math.max(0, value * (1 + variance)),
          timestamp: timestamp.toISOString(),
        });
      }
      return data;
    },
    []
  );

  const renderSensorCard = useMemo(
    () =>
      ({ item }: { item: SensorDataExtended }) => {
        return (
          <SensorCard
            item={item}
            getSensorStatus={getSensorStatus}
            getSensorTypeName={getSensorTypeName}
            getSensorUnitText={getSensorUnitText}
            getSensorIcon={getSensorIcon}
            getIconComponent={getIconComponent}
            theme={theme}
            generateDummyTrendData={generateDummyTrendData}
          />
        );
      },
    [
      getSensorStatus,
      getSensorTypeName,
      getSensorUnitText,
      getSensorIcon,
      getIconComponent,
      theme,
      generateDummyTrendData,
    ]
  );

  // Get important sensors first (temperature, humidity, soil_moisture, light)
  const prioritySensors = useMemo(() => {
    const priorityOrder = [
      SensorType.TEMPERATURE,
      SensorType.HUMIDITY,
      SensorType.SOIL_MOISTURE,
      SensorType.LIGHT,
      SensorType.WATER_LEVEL,
      SensorType.RAINFALL,
      SensorType.SOIL_PH,
    ];

    const result: SensorDataExtended[] = [];

    priorityOrder.forEach((type) => {
      if (sensorDataByType[type] && sensorDataByType[type].length > 0) {
        result.push(sensorDataByType[type][0]);
      }
    });

    return result;
  }, [sensorDataByType]);

  if (!selectedGardenId) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
        <Ionicons name="leaf-outline" size={48} color={theme.textSecondary} />
        <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
          Vui lòng chọn một vườn để xem thông tin cảm biến
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Cảm biến
        </Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push(`/garden/${selectedGardenId}/sensors`)}
        >
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            Xem tất cả
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={prioritySensors}
        renderItem={renderSensorCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        initialNumToRender={4}
        windowSize={2}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginRight: 2,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
  },
  sensorCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sensorTitle: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    flex: 1,
  },
  unitBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  unitText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  valueText: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    textAlign: "center",
    marginVertical: 8,
  },
  sparklineContainer: {
    height: 40,
    marginVertical: 8,
    width: "100%",
  },
  sparklineInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
  },
  sparklineColumn: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    paddingHorizontal: 1,
  },
  sparklineBar: {
    width: "100%",
    borderRadius: 2,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  timeIcon: {
    marginRight: 4,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  emptyState: {
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
});
