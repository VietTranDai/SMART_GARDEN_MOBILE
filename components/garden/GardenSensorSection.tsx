import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import SensorDetailView, {
  Sensor as SensorViewData,
} from "@/components/common/SensorDetailView";
import { useAppTheme } from "@/hooks/useAppTheme";

interface GardenSensorSectionProps {
  sensors: SensorViewData[];
  isSensorDataLoading: boolean;
  sensorDataError: string | null;
  lastSensorUpdate: Date | null;
  getTimeSinceUpdate: () => string;
  onSelectSensor: (sensor: SensorViewData) => void;
  onRefreshSensors: () => void;
  title?: string;
}

/**
 * Enhanced Garden Sensor Section Component with loading states and refresh capability
 */
const GardenSensorSection: React.FC<GardenSensorSectionProps> = ({
  sensors,
  isSensorDataLoading,
  sensorDataError,
  lastSensorUpdate,
  getTimeSinceUpdate,
  onSelectSensor,
  onRefreshSensors,
  title = "Thông tin cảm biến vườn",
}) => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {isSensorDataLoading && sensors.length === 0 ? (
        <View style={styles.sensorLoadingContainer}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.loadingText, { marginTop: 8 }]}>
            Đang tải dữ liệu cảm biến...
          </Text>
        </View>
      ) : sensorDataError && sensors.length === 0 ? (
        <View style={styles.sensorErrorContainer}>
          <Feather name="alert-circle" size={24} color={theme.error} />
          <Text style={[styles.errorText, { fontSize: 14, marginTop: 8 }]}>
            {sensorDataError}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefreshSensors}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <SensorDetailView
            sensors={sensors}
            onSelectSensor={onSelectSensor}
            title={title}
          />

          {lastSensorUpdate && (
            <View style={styles.lastUpdateContainer}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefreshSensors}
                disabled={isSensorDataLoading}
              >
                {isSensorDataLoading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Feather name="refresh-cw" size={14} color={theme.primary} />
                )}
                <Text style={styles.lastUpdateText}>
                  {isSensorDataLoading
                    ? "Đang cập nhật..."
                    : `Cập nhật ${getTimeSinceUpdate()}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
      paddingHorizontal: 16,
    },
    sensorLoadingContainer: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card,
      borderRadius: 12,
      marginVertical: 10,
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
    sensorErrorContainer: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
      borderRadius: 12,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: theme.borderLight || "rgba(0,0,0,0.05)",
    },
    loadingText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center",
    },
    errorText: {
      color: theme.error,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginVertical: 8,
    },
    retryButton: {
      marginTop: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.primary,
      borderRadius: 6,
    },
    retryButtonText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "Inter-Medium",
    },
    lastUpdateContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
      marginBottom: 8,
    },
    refreshButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 6,
      borderRadius: 16,
      backgroundColor: theme.backgroundSecondary || "rgba(0,0,0,0.03)",
    },
    lastUpdateText: {
      marginLeft: 6,
      fontSize: 12,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
  });

export default React.memo(GardenSensorSection);
