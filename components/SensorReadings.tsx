import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightLevel: number;
}

interface SensorReadingsProps {
  data: SensorData;
}

export default function SensorReadings({ data }: SensorReadingsProps) {
  const getSensorStatus = (
    type: string,
    value: number
  ): "normal" | "warning" | "critical" => {
    switch (type) {
      case "temperature":
        if (value < 10 || value > 35) return "critical";
        if (value < 15 || value > 30) return "warning";
        return "normal";
      case "humidity":
        if (value < 30 || value > 90) return "critical";
        if (value < 40 || value > 80) return "warning";
        return "normal";
      case "soilMoisture":
        if (value < 20) return "critical";
        if (value < 40) return "warning";
        return "normal";
      case "lightLevel":
        if (value < 30) return "critical";
        if (value < 50) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  const getStatusColor = (status: "normal" | "warning" | "critical") => {
    switch (status) {
      case "normal":
        return colors.success;
      case "warning":
        return colors.warning;
      case "critical":
        return colors.error;
      default:
        return colors.neutral;
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temperature":
        return "temperature-high";
      case "humidity":
        return "cloud-rain";
      case "soilMoisture":
        return "water";
      case "lightLevel":
        return "sun";
      default:
        return "question";
    }
  };

  const getSensorUnit = (type: string) => {
    switch (type) {
      case "temperature":
        return "°C";
      case "humidity":
      case "soilMoisture":
      case "lightLevel":
        return "%";
      default:
        return "";
    }
  };

  const renderSensorItem = (type: string, value: number, label: string) => {
    const status = getSensorStatus(type, value);
    const icon = getSensorIcon(type);
    const unit = getSensorUnit(type);

    return (
      <View style={styles.sensorItem} key={type}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name={icon} size={20} color={getStatusColor(status)} />
        </View>
        <View style={styles.sensorInfo}>
          <Text style={styles.sensorLabel}>{label}</Text>
          <View style={styles.valueRow}>
            <Text
              style={[styles.sensorValue, { color: getStatusColor(status) }]}
            >
              {value}
              <Text style={styles.unit}>{unit}</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSensorItem("temperature", data.temperature, "Temperature")}
      {renderSensorItem("humidity", data.humidity, "Humidity")}
      {renderSensorItem("soilMoisture", data.soilMoisture, "Soil Moisture")}
      {renderSensorItem("lightLevel", data.lightLevel, "Light Level")}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sensorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  sensorValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 14,
    fontWeight: "normal",
    marginLeft: 2,
  },
});
