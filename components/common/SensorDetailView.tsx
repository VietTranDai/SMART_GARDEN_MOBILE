import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import EnhancedSensorCard from "@/components/garden/EnhancedSensorCard";
import { SensorType } from "@/types/gardens/sensor.types";

export function getSensorName(type: string): string {
  switch (type) {
    case "TEMPERATURE":
      return "Nhiệt độ";
    case "HUMIDITY":
      return "Độ ẩm";
    case "SOIL_MOISTURE":
      return "Độ ẩm đất";
    case "LIGHT":
      return "Ánh sáng";
    case "WATER_LEVEL":
      return "Mực nước";
    case "RAINFALL":
      return "Lượng mưa";
    case "SOIL_PH":
      return "Độ pH đất";
    default:
      return type;
  }
}

interface SensorDetailViewProps {
  sensors: any[];
  data?: any[];
  onSelectSensor: (sensor: any) => void;
}

export default function SensorDetailView({
  sensors,
  data,
  onSelectSensor,
}: SensorDetailViewProps) {
  const theme = useAppTheme();

  const getSensorStatus = (
    value: number,
    type: string
  ): "normal" | "warning" | "critical" => {
    // Giả định logic xác định trạng thái cảm biến
    // Có thể thay đổi tùy theo loại cảm biến và giá trị
    if (type === "TEMPERATURE") {
      if (value > 35) return "critical";
      if (value > 30) return "warning";
      return "normal";
    }
    if (type === "HUMIDITY") {
      if (value < 20) return "critical";
      if (value < 40) return "warning";
      return "normal";
    }
    return "normal";
  };

  if (!sensors || sensors.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Chưa có cảm biến nào được thêm vào vườn này.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sensors.map((sensor) => (
          <TouchableOpacity
            key={sensor.id}
            onPress={() => onSelectSensor(sensor)}
          >
            <EnhancedSensorCard
              id={sensor.id}
              type={sensor.type as SensorType}
              name={sensor.name || getSensorName(sensor.type)}
              value={sensor.value}
              unit={sensor.unit}
              status={getSensorStatus(sensor.value, sensor.type)}
              timestamp={sensor.lastUpdated || new Date().toISOString()}
              onPress={() => onSelectSensor(sensor)}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
