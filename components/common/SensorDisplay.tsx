import React, { JSX, memo, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  Animated,
  ActivityIndicator,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import useSectionAnimation from "@/hooks/ui/useSectionAnimation";
import {
  SensorData,
  SensorType,
  SensorUnit,
  SensorDataExtended,
  SensorDisplayProps,
} from "@/types";
import { sensorService } from "@/service/api";

// Tạo Skeleton UI component
const SensorCardSkeleton = memo(({ theme }: { theme: any }) => {
  return (
    <View
      style={[
        styles.sensorCard,
        {
          backgroundColor: theme.card,
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
    >
      {/* Header: Icon and Title skeleton */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.skeletonIcon,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        />
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.skeletonText,
              { width: "80%", backgroundColor: theme.backgroundSecondary },
            ]}
          />
          <View
            style={[
              styles.skeletonBadge,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          />
        </View>
      </View>

      {/* Main value skeleton */}
      <View
        style={[
          styles.skeletonValue,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      />

      {/* Sparkline skeleton */}
      <View style={styles.sparklineContainer}>
        <View style={styles.sparklineInner}>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <View key={i} style={styles.sparklineColumn}>
              <View
                style={[
                  styles.skeletonBar,
                  {
                    height: `${20 + Math.random() * 60}%`,
                    backgroundColor: theme.backgroundSecondary,
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Timestamp skeleton */}
      <View style={styles.timestampContainer}>
        <View
          style={[
            styles.skeletonTimestamp,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        />
      </View>
    </View>
  );
});

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
    // Sử dụng utility function từ sensorService
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

    // Render the card
    return (
      <View
        style={[
          styles.sensorCard,
          {
            backgroundColor: theme.card,
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
      >
        {/* Card header with icon and title */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            {iconComponent}
          </View>
          <View style={styles.titleContainer}>
            <Text
              style={[styles.sensorTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {sensorName}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    status === "normal"
                      ? theme.successLight
                      : status === "warning"
                        ? theme.warningLight
                        : theme.errorLight,
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
                {status === "normal"
                  ? "Bình thường"
                  : status === "warning"
                    ? "Cảnh báo"
                    : "Nguy hiểm"}
              </Text>
            </View>
          </View>
        </View>

        {/* Main value */}
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: statusColor }]}>
            {Math.round(item.value * 10) / 10}
            <Text style={styles.unitText}>{unitText}</Text>
          </Text>
        </View>

        {/* Sparkline chart */}
        <View style={styles.sparklineContainer}>
          <View style={styles.sparklineInner}>
            {trendData.map((data, i) => {
              // Calculate relative height
              const min = Math.min(...trendData.map((d) => d.value));
              const max = Math.max(...trendData.map((d) => d.value));
              const range = max - min > 0 ? max - min : 1;
              const heightPercent = ((data.value - min) / range) * 60 + 20; // 20% to 80% height

              return (
                <View key={i} style={styles.sparklineColumn}>
                  <View
                    style={[
                      styles.sparklineBar,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor:
                          status === "normal"
                            ? theme.primary
                            : status === "warning"
                              ? theme.warning
                              : theme.error,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Last updated timestamp */}
        <View style={styles.timestampContainer}>
          <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
          <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
            {formattedTimestamp}
          </Text>
        </View>
      </View>
    );
  }
);

export default memo(function SensorDisplay({
  selectedGardenId,
  sensorDataByType,
  getSensorStatus,
  getSensorIconName,
  showFullDetails = false,
  loading = false,
  error = null,
}: SensorDisplayProps) {
  const theme = useAppTheme();
  const { getAnimatedStyle } = useSectionAnimation("sensors");

  // Memoize utility functions để tối ưu hiệu suất
  const getSensorStatusFunc = useCallback(
    (value: number, type: SensorType) => {
      // Sử dụng function từ props nếu có, nếu không dùng từ service
      return getSensorStatus
        ? getSensorStatus(value, type)
        : sensorService.getSensorStatus(value, type);
    },
    [getSensorStatus]
  );

  const getSensorIconNameFunc = useCallback(
    (type: SensorType) => {
      // Sử dụng function từ props nếu có, nếu không dùng từ service
      return getSensorIconName
        ? getSensorIconName(type)
        : sensorService.getSensorIconName(type);
    },
    [getSensorIconName]
  );

  const getSensorTypeNameFunc = useCallback((type: SensorType) => {
    return sensorService.getSensorTypeName(type);
  }, []);

  const getSensorUnitTextFunc = useCallback((unit: string) => {
    return sensorService.getSensorUnitText(unit);
  }, []);

  // Function to render icons based on icon name
  const getIconComponent = useCallback((iconName: string, color: string) => {
    // Determine which icon library to use based on icon name
    if (iconName.includes("outline")) {
      return <Ionicons name={iconName as any} size={18} color={color} />;
    } else if (iconName.includes("fire")) {
      return <FontAwesome5 name={iconName as any} size={18} color={color} />;
    } else {
      return (
        <MaterialCommunityIcons
          name={iconName as any}
          size={18}
          color={color}
        />
      );
    }
  }, []);

  // Function to generate dummy trend data for testing
  const generateDummyTrendDataFunc = useCallback((value: number) => {
    return sensorService.generateDummyTrendData(value);
  }, []);

  // Memoize the processed sensor data to avoid recalculations on render
  const groupedSensorData = useMemo(() => {
    // Using service function for formatting
    const formattedData =
      sensorService.formatSensorDataForDisplay(sensorDataByType);

    // Further organization for display
    const result: { type: SensorType; data: SensorDataExtended[] }[] = [];

    Object.entries(formattedData).forEach(([type, data]) => {
      // For selected garden, filter by garden ID
      if (selectedGardenId) {
        const filteredData = data.filter(
          (item) => item.gardenId === selectedGardenId
        );
        if (filteredData.length > 0) {
          result.push({
            type: type as SensorType,
            data: filteredData,
          });
        }
      } else {
        // For overview, use all data
        if (data.length > 0) {
          result.push({
            type: type as SensorType,
            data,
          });
        }
      }
    });

    return result;
  }, [sensorDataByType, selectedGardenId]);

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

  if (error) {
    return (
      <Animated.View style={[styles.container, getAnimatedStyle()]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Cảm biến
          </Text>
        </View>
        <View style={[styles.errorContainer, { backgroundColor: theme.card }]}>
          <Ionicons name="alert-circle-outline" size={32} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: theme.primary }]}
            onPress={() =>
              router.push(`/garden/${selectedGardenId}/sensors?refresh=true`)
            }
          >
            <Text style={[styles.retryText, { color: theme.primary }]}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, getAnimatedStyle()]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Cảm biến
        </Text>
        <View style={styles.headerActions}>
          {!loading && groupedSensorData.length > 0 && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() =>
                router.push(`/garden/${selectedGardenId}/sensors?refresh=true`)
              }
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={theme.primary}
              />
            </TouchableOpacity>
          )}
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
      </View>

      {loading ? (
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <SensorCardSkeleton theme={theme} />
            <SensorCardSkeleton theme={theme} />
          </View>
          <View style={styles.row}>
            <SensorCardSkeleton theme={theme} />
            <SensorCardSkeleton theme={theme} />
          </View>
        </View>
      ) : groupedSensorData.length > 0 ? (
        <FlatList
          data={groupedSensorData}
          renderItem={({ item: { type, data } }) => (
            <View style={styles.row}>
              {data.map((item) => (
                <SensorCard
                  key={item.id}
                  item={item}
                  getSensorStatus={getSensorStatusFunc}
                  getSensorTypeName={getSensorTypeNameFunc}
                  getSensorUnitText={getSensorUnitTextFunc}
                  getSensorIcon={getSensorIconNameFunc}
                  getIconComponent={getIconComponent}
                  theme={theme}
                  generateDummyTrendData={generateDummyTrendDataFunc}
                />
              ))}
            </View>
          )}
          keyExtractor={(item) => String(item.type)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={4}
          initialNumToRender={4}
          windowSize={showFullDetails ? 5 : 2}
        />
      ) : (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Ionicons
            name="analytics-outline"
            size={32}
            color={theme.textSecondary}
          />
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
            Chưa có dữ liệu cảm biến cho vườn này
          </Text>
        </View>
      )}
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
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
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  valueContainer: {
    marginVertical: 8,
  },
  valueText: {
    fontSize: 28,
    fontFamily: "Inter-Bold",
    textAlign: "center",
  },
  unitText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
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
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  skeletonText: {
    height: 16,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 24,
    height: 16,
    borderRadius: 4,
    marginLeft: 4,
  },
  skeletonValue: {
    height: 28,
    width: "60%",
    borderRadius: 4,
    alignSelf: "center",
    marginVertical: 8,
  },
  skeletonBar: {
    width: "100%",
    borderRadius: 2,
  },
  skeletonTimestamp: {
    height: 12,
    width: 80,
    borderRadius: 4,
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
});
