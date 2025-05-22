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
import SensorDetailView from "@/components/common/SensorDetailView";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { SensorType, SensorUnit } from "@/types/gardens/sensor.types";
import Colors from "@/constants/Colors"; // Import Colors for theme type

// Define a more specific type for the theme object
type AppThemeType = typeof Colors.light;

// Define the interface for UI display of sensors
export interface UISensor {
  id: number;
  type: SensorType;
  name?: string;
  value: number;
  unit: SensorUnit;
  lastUpdated?: string;
  lastReadingAt?: string;
  recentValues?: { timestamp: string; value: number }[];
}

interface GardenSensorSectionProps {
  sensors: UISensor[];
  isSensorDataLoading: boolean;
  sensorDataError: string | null;
  lastSensorUpdate: Date | null;
  getTimeSinceUpdate: () => string;
  onSelectSensor: (sensor: UISensor) => void;
  onRefreshSensors: () => void;
  title?: string;
}

/**
 * Garden Sensor Section Component with loading states and refresh capability
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

  // Loading state
  if (isSensorDataLoading && sensors.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {title}
          </Text>
        </View>

        <View style={styles.sensorLoadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={styles.loadingIndicator}
          />
          <Text style={styles.loadingText}>Đang tải dữ liệu cảm biến...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (sensorDataError && sensors.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sensorErrorContainer}>
          <LinearGradient
            colors={[`${theme.error}10`, "transparent"]}
            style={styles.errorGradient}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={48}
              color={theme.error}
            />
            <Text style={[styles.errorText, styles.errorTextMargin]}>
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
              <Feather
                name="refresh-cw"
                size={16}
                color="white"
                style={styles.retryIcon}
              />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  }

  // Normal state with data
  return (
    <View style={styles.container}>
      <SensorDetailView
        sensors={sensors}
        onSelectSensor={onSelectSensor}
        title={title}
        isRefreshing={isSensorDataLoading}
        onRefresh={onRefreshSensors}
      />

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

const createStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    container: {
      marginVertical: 8,
      paddingBottom: 4,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      marginHorizontal: 16,
      height: 28,
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
    },
    sensorLoadingContainer: {
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card,
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 8,
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
    loadingIndicator: {
      marginBottom: 12,
    },
    sensorErrorContainer: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.cardAlt,
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: `${theme.error}20`,
      overflow: "hidden",
    },
    errorGradient: {
      width: "100%",
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
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
    errorTextMargin: {
      marginTop: 16,
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
      marginTop: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: theme.primary,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    retryButtonText: {
      color: "#fff",
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
    },
    retryIcon: {
      marginLeft: 8,
    },
    lastUpdateContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 0,
      marginBottom: 8,
      marginHorizontal: 16,
    },
    updateInfoContainer: {
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
