import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  SensorWithLatestReading,
  SensorType,
  SensorUnit,
} from "@/types/gardens/sensor.types";

interface SensorGridProps {
  sensors: SensorWithLatestReading[];
  onSensorPress?: (sensor: SensorWithLatestReading) => void;
}

const SENSOR_ICONS: Record<SensorType, string> = {
  [SensorType.HUMIDITY]: "water-percent",
  [SensorType.TEMPERATURE]: "thermometer",
  [SensorType.LIGHT]: "white-balance-sunny",
  [SensorType.WATER_LEVEL]: "water",
  [SensorType.RAINFALL]: "weather-pouring",
  [SensorType.SOIL_MOISTURE]: "water-outline",
  [SensorType.SOIL_PH]: "flask-outline",
};

const UNIT_DISPLAY: Record<SensorUnit, string> = {
  [SensorUnit.PERCENT]: "%",
  [SensorUnit.CELSIUS]: "°C",
  [SensorUnit.LUX]: "lux",
  [SensorUnit.METER]: "m",
  [SensorUnit.MILLIMETER]: "mm",
  [SensorUnit.PH]: "pH",
};

export default function SensorGrid({
  sensors,
  onSensorPress,
}: SensorGridProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const getSensorStatus = (
    value: number,
    type: SensorType
  ): "normal" | "warning" | "critical" => {
    // Define optimal ranges for each sensor type
    const ranges = {
      [SensorType.TEMPERATURE]: { min: 15, max: 32 },
      [SensorType.HUMIDITY]: { min: 30, max: 80 },
      [SensorType.SOIL_MOISTURE]: { min: 20, max: 80 },
      [SensorType.LIGHT]: { min: 5000, max: 80000 },
      [SensorType.SOIL_PH]: { min: 5.5, max: 7.5 },
      [SensorType.RAINFALL]: { min: 0, max: 50 },
      [SensorType.WATER_LEVEL]: { min: 10, max: 80 },
    };

    const range = ranges[type];
    if (!range) return "normal";

    if (value < range.min * 0.7 || value > range.max * 1.3) return "critical";
    if (value < range.min || value > range.max) return "warning";
    return "normal";
  };

  const getStatusColor = (status: "normal" | "warning" | "critical") => {
    switch (status) {
      case "critical":
        return theme.error;
      case "warning":
        return theme.warning;
      default:
        return theme.success;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.container}>
      {sensors.map((sensor) => {
        const value = sensor.latestReading?.value ?? 0;
        const status = getSensorStatus(value, sensor.type);
        const statusColor = getStatusColor(status);

        return (
          <TouchableOpacity
            key={sensor.id}
            style={styles.sensorCard}
            onPress={() => onSensorPress?.(sensor)}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name={SENSOR_ICONS[sensor.type] as any}
                size={24}
                color={theme.primary}
              />
              <Text style={styles.sensorName}>{sensor.name}</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.sensorValue}>
                {value.toFixed(1)}
                <Text style={styles.sensorUnit}>
                  {" "}
                  {UNIT_DISPLAY[sensor.unit]}
                </Text>
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={styles.lastUpdated}>
                {sensor.latestReading
                  ? formatTimestamp(sensor.latestReading.timestamp)
                  : "No data"}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      padding: 16,
    },
    sensorCard: {
      width: "48%",
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    sensorName: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.text,
      marginLeft: 8,
    },
    cardBody: {
      alignItems: "center",
      marginVertical: 8,
    },
    sensorValue: {
      fontSize: 24,
      fontFamily: "Inter-Bold",
      color: theme.primary,
    },
    sensorUnit: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    lastUpdated: {
      fontSize: 12,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
  });
