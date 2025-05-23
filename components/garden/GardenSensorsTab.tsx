import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { UISensor } from "@/components/garden/GardenSensorSection";
import SensorDetailView from "@/components/common/SensorDetailView";
import SensorHistoryChart from "@/components/garden/SensorHistoryChart";
import { SensorHistory } from "@/types";
import { SensorType } from "@/types/gardens/sensor.types";
import { GardenGrowthStage } from "@/types/gardens/garden.types";

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

      {sensorHistory && Object.keys(sensorHistory).length > 0 && (
        <View style={styles.sensorHistoryContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Lịch sử dữ liệu cảm biến
          </Text>

          {Object.entries(sensorHistory).map(([type, history]) => (
            <SensorHistoryChart
              key={`sensor-history-${type}`}
              sensorType={type as SensorType}
              sensorHistory={history}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sensorHistoryContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginBottom: 16,
  },
});

export default GardenSensorsTab;
