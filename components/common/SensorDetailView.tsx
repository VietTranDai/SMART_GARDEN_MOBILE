import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
// LineChart is no longer needed for SensorItem sparklines
// import { LineChart } from "react-native-chart-kit";
import { SensorType, SensorUnit } from "@/types/gardens/sensor.types";
import { UISensor } from "@/components/garden/GardenSensorSection";
// SensorHistory and GardenGrowthStage are no longer needed for SensorDetailViewProps
// import { SensorHistory, GardenGrowthStage } from "@/types/gardens/garden.types";
import SensorService from "@/service/api/sensor.service";

// screenWidth and CHART_WIDTH are no longer used
// const screenWidth = Dimensions.get("window").width;
// const CHART_WIDTH = screenWidth - 32;

interface SensorDetailViewProps {
  sensors: UISensor[];
  onSelectSensor: (sensor: UISensor) => void;
  title?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isSensorDataLoading?: boolean;
  // sensorHistories?: Record<string, SensorHistory>; // Removed
  // currentGrowthStage?: GardenGrowthStage; // Removed
  // lastSensorUpdate?: string; // Removed
}

// Separate component for sensor items
const SensorItem = React.memo(
  ({
    item,
    onSelectSensor,
    theme,
  }: {
    item: UISensor;
    onSelectSensor: (sensor: UISensor) => void;
    theme: ReturnType<typeof useAppTheme>;
  }) => {
    const styles = useMemo(() => createSensorItemStyles(theme), [theme]);

    const displayName =
      item.name || SensorService.getSensorTypeName(item.type as SensorType);
    const timestamp = item.lastUpdated || item.lastReadingAt;
    const timeAgo = SensorService.formatTimeAgo(timestamp);

    const status = SensorService.getSensorStatus(
      item.value,
      item.type as SensorType
    );

    let statusColor = theme.text;
    if (status === "critical") statusColor = theme.error;
    else if (status === "warning") statusColor = theme.warning;
    else if (status === "normal") statusColor = theme.success;

    const iconName = SensorService.getSensorIcon(item.type as SensorType);

    const displayValue =
      item.value !== undefined
        ? item.value.toFixed(
            item.type === SensorType.SOIL_PH ? 1 : item.value % 1 === 0 ? 0 : 1
          )
        : "N/A";
    const displayUnit = item.unit
      ? SensorService.getSensorUnitText(item.unit as SensorUnit)
      : "";

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          onPress={() => onSelectSensor(item)}
          style={styles.cardWrapper}
          activeOpacity={0.7}
        >
          <View style={styles.headerRow}>
            <MaterialCommunityIcons
              name={iconName as any}
              size={22}
              color={theme.text}
              style={styles.icon}
            />
            <Text style={styles.sensorName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          <View style={styles.valueRow}>
            <Text style={[styles.valueText, { color: statusColor }]}>
              {displayValue}
            </Text>
            <Text style={styles.unitText}>{displayUnit}</Text>
          </View>

          <View style={styles.footerRow}>
            <View
              style={[styles.statusIndicator, { backgroundColor: statusColor }]}
            />
            <Text style={styles.timeAgoText}>{timeAgo}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
);

export default function SensorDetailView({
  sensors,
  onSelectSensor,
  title = "Số liệu Cảm biến",
  isRefreshing = false,
  onRefresh,
  isSensorDataLoading,
}: SensorDetailViewProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createDetailViewStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              style={styles.headerRefreshButton}
              disabled={isSensorDataLoading || isRefreshing}
            >
              <MaterialCommunityIcons
                name="refresh"
                size={20}
                color={
                  isSensorDataLoading || isRefreshing
                    ? theme.textSecondary
                    : theme.primary
                }
              />
            </TouchableOpacity>
          )}
        </View>
      )}
      <FlatList
        data={sensors}
        renderItem={({ item }) => (
          <SensorItem
            item={item}
            onSelectSensor={onSelectSensor}
            theme={theme}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          isSensorDataLoading ? (
            <View style={styles.centeredMessageContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.messageText}>
                Đang tải dữ liệu cảm biến...
              </Text>
            </View>
          ) : (
            <View style={styles.centeredMessageContainer}>
              <Ionicons
                name="hardware-chip-outline"
                size={48}
                color={theme.textSecondary}
              />
              <Text style={styles.messageText}>Không có cảm biến nào.</Text>
            </View>
          )
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing ?? false}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const createSensorItemStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    cardContainer: {
      flex: 1 / 2,
      margin: 8,
    },
    cardWrapper: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 12,
      justifyContent: "space-between",
      height: 160,
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
        },
        android: { elevation: 2, borderColor: theme.border, borderWidth: 0.5 },
      }),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    icon: {
      marginRight: 8,
    },
    sensorName: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
      marginVertical: 12,
    },
    valueText: {
      fontSize: 30,
      fontFamily: "Inter-Bold",
    },
    unitText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.textSecondary,
      marginLeft: 4,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: "auto",
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    statusIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    timeAgoText: {
      fontSize: 11,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
  });

const createDetailViewStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: Platform.OS === "ios" ? 16 : 20,
      paddingBottom: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: "Inter-Bold",
      color: theme.text,
    },
    headerRefreshButton: {
      padding: 8,
    },
    gridContent: {
      paddingHorizontal: 8,
      paddingBottom: 16,
    },
    centeredMessageContainer: {
      flex: 1,
      minHeight: Dimensions.get("window").height * 0.5,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    messageText: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
    },
  });
