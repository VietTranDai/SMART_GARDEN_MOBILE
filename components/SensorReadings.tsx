import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SensorType, SensorUnit } from "@/types";

interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightLevel: number;
}

interface SensorReadingsProps {
  data: SensorData;
}

const UNIT_DISPLAY = {
  [SensorUnit.CELSIUS]: "°C",
  [SensorUnit.PERCENT]: "%",
  [SensorUnit.LUX]: "lux",
  [SensorUnit.METER]: "m",
  [SensorUnit.MILLIMETER]: "mm",
  [SensorUnit.PH]: "pH",
};

export default function SensorReadings({ data }: SensorReadingsProps) {
  const theme = useAppTheme();

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
        return theme.plantHealthy;
      case "warning":
        return theme.plantWarning;
      case "critical":
        return theme.plantDanger;
      default:
        return theme.textSecondary;
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

  const getSensorColor = (type: string) => {
    switch (type) {
      case "temperature":
        return theme.error;
      case "humidity":
        return theme.waterLevel;
      case "soilMoisture":
        return theme.soilQuality;
      case "lightLevel":
        return theme.sunlight;
      default:
        return theme.primary;
    }
  };

  const renderSensorItem = (type: string, value: number, label: string) => {
    const status = getSensorStatus(type, value);
    const icon = getSensorIcon(type);
    const unit = sensorUnit ? UNIT_DISPLAY[sensorUnit] : "";
    const sensorTypeColor = getSensorColor(type);
    const statusColor = getStatusColor(status);

    return (
      <View style={styles.sensorItem} key={type}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${sensorTypeColor}15` },
          ]}
        >
          <FontAwesome5 name={icon} size={20} color={sensorTypeColor} />
        </View>
        <View style={styles.sensorInfo}>
          <Text style={[styles.sensorLabel, { color: theme.textSecondary }]}>
            {label}
          </Text>
          <View style={styles.valueRow}>
            <Text style={[styles.sensorValue, { color: statusColor }]}>
              {value}
              <Text style={[styles.unit, { color: theme.textSecondary }]}>
                {unit}
              </Text>
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: `${statusColor}20`, borderColor: statusColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.borderLight },
      ]}
    >
      {renderSensorItem("temperature", data.temperature, "Temperature")}
      {renderSensorItem("humidity", data.humidity, "Humidity")}
      {renderSensorItem("soilMoisture", data.soilMoisture, "Soil Moisture")}
      {renderSensorItem("lightLevel", data.lightLevel, "Light Level")}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sensorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorLabel: {
    fontSize: 14,
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
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
