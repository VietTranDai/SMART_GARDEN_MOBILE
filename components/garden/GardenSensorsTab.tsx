import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { UISensor } from "@/components/garden/GardenSensorSection";
import SensorDetailView from "@/components/common/SensorDetailView";
import { SensorHistory } from "@/types";
import { GardenGrowthStage } from "@/types/gardens/garden.types";
import EmptyStateView from "@/components/common/EmptyStateView";
import { useGardenSensors } from "@/hooks/sensor/useGardenSensors";

interface GardenSensorsTabProps {
  gardenId: string | number | undefined;
  sensorHistory: Record<string, SensorHistory>;
  lastSensorUpdate?: string;
  currentGrowthStage?: GardenGrowthStage;
  onSelectSensor: (sensor: UISensor) => void;
}

// Define createStyles function outside the component
const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
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
      color: theme.textSecondary,
    },
    centeredContainerMini: {
      alignItems: "center",
      paddingVertical: 20,
    },
    loadingTextMini: {
      marginTop: 8,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    sensorHistoryContainer: {
      marginTop: 24,
      borderTopWidth: 1,
      paddingTop: 16,
      borderTopColor: theme.borderLight,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      marginBottom: 16,
      color: theme.text,
    },
    noDataText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 10,
      color: theme.textSecondary,
    },
    retryButton: {
      marginTop: 15,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      color: theme.background,
      fontFamily: "Inter-SemiBold",
      fontSize: 16,
    },
  });

const GardenSensorsTab: React.FC<GardenSensorsTabProps> = ({
  gardenId,
  sensorHistory,
  lastSensorUpdate,
  currentGrowthStage,
  onSelectSensor,
}) => {
  const theme = useAppTheme();
  // Use useMemo to create styles with the theme
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    sensors: processedSensors,
    isLoading: isSensorDataLoading,
    error: sensorError,
    refreshSensors,
  } = useGardenSensors({ gardenId: gardenId ?? null });

  if (sensorError) {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={{ color: theme.error, textAlign: "center" }}>
          Lỗi tải dữ liệu cảm biến: {sensorError.message}
        </Text>
        <TouchableOpacity onPress={refreshSensors} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (
    isSensorDataLoading &&
    (!processedSensors || processedSensors.length === 0)
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
        <Text style={[styles.loadingText]}>Đang tải dữ liệu cảm biến...</Text>
      </View>
    );
  }

  if (
    !isSensorDataLoading &&
    (!processedSensors || processedSensors.length === 0)
  ) {
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
        sensors={processedSensors}
        isSensorDataLoading={isSensorDataLoading}
        isRefreshing={isSensorDataLoading}
        onRefresh={refreshSensors}
        onSelectSensor={onSelectSensor}
        title="Thông tin cảm biến vườn"
      />
    </View>
  );
};

export default GardenSensorsTab;
