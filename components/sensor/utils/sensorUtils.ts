import { SensorType, SensorUnit } from "@/types/gardens/sensor.types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Define optimal ranges for each sensor type
export const OPTIMAL_RANGES = {
  [SensorType.TEMPERATURE]: { min: 15, max: 32 },
  [SensorType.HUMIDITY]: { min: 30, max: 80 },
  [SensorType.SOIL_MOISTURE]: { min: 20, max: 80 },
  [SensorType.LIGHT]: { min: 5000, max: 12000 },
  [SensorType.SOIL_PH]: { min: 5.5, max: 7.5 },
  [SensorType.RAINFALL]: { min: 0, max: 50 },
  [SensorType.WATER_LEVEL]: { min: 10, max: 80 },
};

// Map SensorUnit to display string
export const UNIT_DISPLAY = {
  [SensorUnit.CELSIUS]: "°C",
  [SensorUnit.PERCENT]: "%",
  [SensorUnit.LUX]: "lux",
  [SensorUnit.METER]: "m",
  [SensorUnit.MILLIMETER]: "mm",
  [SensorUnit.PH]: "pH",
  [SensorUnit.LITER]: "L",
};

// Time range options
export enum TimeRange {
  DAY = "24 giờ",
  WEEK = "7 ngày",
  MONTH = "30 ngày",
}

// Helper functions
export const getSensorName = (type: SensorType): string =>
  ({
    [SensorType.TEMPERATURE]: "Nhiệt độ",
    [SensorType.HUMIDITY]: "Độ ẩm",
    [SensorType.SOIL_MOISTURE]: "Độ ẩm đất",
    [SensorType.LIGHT]: "Ánh sáng",
    [SensorType.WATER_LEVEL]: "Mực nước",
    [SensorType.RAINFALL]: "Lượng mưa",
    [SensorType.SOIL_PH]: "Độ pH đất",
  })[type] || "Cảm biến";

export const getSensorIcon = (
  type: SensorType
): keyof typeof MaterialCommunityIcons.glyphMap =>
  (({
    [SensorType.TEMPERATURE]: "thermometer",
    [SensorType.HUMIDITY]: "water-percent",
    [SensorType.SOIL_MOISTURE]: "water-outline",
    [SensorType.LIGHT]: "white-balance-sunny",
    [SensorType.WATER_LEVEL]: "water",
    [SensorType.RAINFALL]: "weather-pouring",
    [SensorType.SOIL_PH]: "flask-outline",
  })[type] || "gauge") as keyof typeof MaterialCommunityIcons.glyphMap;

export const getSensorStatus = (
  value: number,
  type: SensorType
): "normal" | "warning" | "critical" => {
  const range = OPTIMAL_RANGES[type];
  if (!range) return "normal";
  if (value < range.min * 0.7 || value > range.max * 1.3) return "critical";
  if (value < range.min || value > range.max) return "warning";
  return "normal";
};

export const getStatusText = (status: "normal" | "warning" | "critical"): string =>
  ({
    normal: "Bình thường",
    warning: "Cảnh báo",
    critical: "Nguy hiểm",
  })[status]; 