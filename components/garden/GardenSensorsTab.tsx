import React, { useMemo } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { UISensor } from "@/components/garden/GardenSensorSection";
import SensorDetailView from "@/components/common/SensorDetailView";
import SensorHistoryChart from "@/components/garden/SensorHistoryChart";
import { SensorHistory } from "@/types";
import { SensorType } from "@/types/gardens/sensor.types";
import { GardenGrowthStage } from "@/types/gardens/garden.types";
import EmptyStateView from "@/components/common/EmptyStateView";

interface GardenSensorsTabProps {
  sensors: UISensor[];
  sensorHistory: Record<string, SensorHistory>;
  lastSensorUpdate?: string;
  isSensorDataLoading: boolean;
  isRefreshing: boolean;
  currentGrowthStage?: GardenGrowthStage;
  onRefresh: () => void;
  onSelectSensor: (sensor: UISensor) => void;
}

const GardenSensorsTab: React.FC<GardenSensorsTabProps> = ({
  sensors,
  sensorHistory,
  lastSensorUpdate,
  isSensorDataLoading,
  isRefreshing,
  currentGrowthStage,
  onRefresh,
  onSelectSensor,
}) => {
  const theme = useAppTheme();

  // Check if there's any actual history data
  const hasHistoryData = useMemo(() => {
    if (!sensorHistory) return false;
    return Object.values(sensorHistory).some(
      (history) => history && history.data && history.data.length > 0
    );
  }, [sensorHistory]);

  if (
    isSensorDataLoading &&
    !isRefreshing &&
    (!sensors || sensors.length === 0)
  ) {
    // Initial loading state for the whole tab if sensors aren't loaded yet
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Đang tải dữ liệu cảm biến...
        </Text>
      </View>
    );
  }

  if (!isSensorDataLoading && (!sensors || sensors.length === 0)) {
    return (
      <EmptyStateView
        icon="hardware-chip-outline"
        title="Không có cảm biến"
        message="Chưa có cảm biến nào được kết nối hoặc báo cáo dữ liệu cho khu vườn này."
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SensorDetailView
        sensors={sensors}
        sensorHistories={sensorHistory}
        currentGrowthStage={currentGrowthStage}
        isSensorDataLoading={isSensorDataLoading}
        isRefreshing={isRefreshing}
        lastSensorUpdate={lastSensorUpdate}
        onRefresh={onRefresh}
        onSelectSensor={onSelectSensor}
        title="Thông tin cảm biến vườn"
      />

      {/* History Section */}
      <View
        style={[
          styles.sensorHistoryContainer,
          { borderTopColor: theme.borderLight },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Lịch sử dữ liệu cảm biến
        </Text>

        {isSensorDataLoading && !hasHistoryData ? (
          // Show a loading indicator for history if data is loading and we don't have any history yet
          <View style={styles.centeredContainerMini}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text
              style={[styles.loadingTextMini, { color: theme.textSecondary }]}
            >
              Đang tải lịch sử...
            </Text>
          </View>
        ) : hasHistoryData ? (
          Object.entries(sensorHistory).map(([type, history]) => {
            // Only render chart if there's data for this specific history type
            if (history && history.data && history.data.length > 0) {
              return (
                <SensorHistoryChart
                  key={`sensor-history-${type}`}
                  sensorType={type as SensorType}
                  sensorHistory={history}
                />
              );
            }
            return null;
          })
        ) : (
          <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
            Chưa có dữ liệu lịch sử nào được ghi nhận.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  centeredContainerMini: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingTextMini: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  sensorHistoryContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    textAlign: "center",
    marginTop: 10,
  },
});

export default GardenSensorsTab;
