import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import SensorDetailView, { Sensor } from "@/components/common/SensorDetailView";
import { useAppTheme } from "@/hooks/useAppTheme";

interface GardenSensorSectionProps {
  sensors: Sensor[];
  isSensorDataLoading: boolean;
  sensorDataError: string | null;
  lastSensorUpdate: Date | null;
  getTimeSinceUpdate: () => string;
  onSelectSensor: (sensor: Sensor) => void;
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

  // Loading state with skeleton effect
  if (isSensorDataLoading && sensors.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sensorLoadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { marginTop: 12 }]}>
            Đang tải dữ liệu cảm biến...
          </Text>
        </View>
      </View>
    );
  }

  // Error state with retry option
  if (sensorDataError && sensors.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sensorErrorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={40}
            color={theme.error}
          />
          <Text style={[styles.errorText, { marginTop: 12 }]}>
            {sensorDataError}
          </Text>
          <Text style={styles.errorHelpText}>
            Không thể tải dữ liệu cảm biến. Vui lòng kiểm tra kết nối mạng.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefreshSensors}
            accessible={true}
            accessibilityLabel="Thử lại tải dữ liệu cảm biến"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Pass the refresh capabilities to SensorDetailView */}
      <SensorDetailView
        sensors={sensors}
        onSelectSensor={onSelectSensor}
        title={title}
        isRefreshing={isSensorDataLoading}
        onRefresh={onRefreshSensors}
      />

      {/* Last update info */}
      {lastSensorUpdate && (
        <View style={styles.lastUpdateContainer}>
          <View style={styles.updateInfoContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={theme.textSecondary}
            />
            <Text style={styles.lastUpdateText}>
              {isSensorDataLoading
                ? "Đang cập nhật dữ liệu..."
                : `Cập nhật lần cuối: ${getTimeSinceUpdate()}`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 12,
      paddingBottom: 8,
    },
    sensorLoadingContainer: {
      padding: 30,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card,
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: theme.borderLight || "rgba(0,0,0,0.05)",
      ...Platform.select({
        ios: {
          shadowColor: theme.shadow || "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    sensorErrorContainer: {
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 10,
      borderWidth: 1,
      borderColor:
        `rgba(${theme.error.replace(/[^\d,]/g, "")},0.2)` ||
        "rgba(255,59,48,0.2)",
    },
    loadingText: {
      color: theme.textSecondary,
      fontSize: 15,
      fontFamily: "Inter-Medium",
      textAlign: "center",
    },
    errorText: {
      color: theme.error,
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      textAlign: "center",
    },
    errorHelpText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      textAlign: "center",
      marginTop: 8,
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    retryButton: {
      marginTop: 8,
      paddingHorizontal: 24,
      paddingVertical: 10,
      backgroundColor: theme.primary,
      borderRadius: 10,
    },
    retryButtonText: {
      color: "#fff",
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
    },
    lastUpdateContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
      marginHorizontal: 16,
    },
    updateInfoContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.backgroundSecondary || "rgba(0,0,0,0.03)",
    },
    lastUpdateText: {
      marginLeft: 6,
      fontSize: 13,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
    },
  });

export default React.memo(GardenSensorSection);
