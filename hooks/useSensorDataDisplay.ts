import { useMemo } from "react";
import { SensorType } from "@/types/gardens/sensor.types";
import { getSensorStatus } from "./useSensorData";

export default function useSensorDataDisplay(
  sensorData: Record<string, any[]> = {},
  sensorDataLoading: boolean = false,
  sensorDataError: string | null = null
) {
  // Transform raw sensor data into display-ready format
  const formattedSensors = useMemo(() => {
    const result = [];

    try {
      if (!sensorData || typeof sensorData !== "object") {
        return [];
      }

      // Process each sensor type
      Object.entries(sensorData).forEach(([type, dataPoints]) => {
        if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
          return;
        }

        // Get the most recent data point
        const latestDataPoint = dataPoints[dataPoints.length - 1];
        if (!latestDataPoint || typeof latestDataPoint !== "object") {
          return;
        }

        const sensorType = type as SensorType;
        const value = latestDataPoint.value;
        const trendData = dataPoints
          .slice(Math.max(0, dataPoints.length - 10))
          .map((point) => point.value);

        result.push({
          id: `${sensorType}-${latestDataPoint.id || Date.now()}`,
          name: getSensorName(sensorType),
          value: formatSensorValue(value, sensorType),
          unit: getSensorUnit(sensorType),
          type: sensorType,
          trendData,
          status: getSensorStatus(value, sensorType),
          icon: getSensorIconName(sensorType),
          lastUpdated: latestDataPoint.timestamp || Date.now(),
          rawValue: value,
        });
      });
    } catch (error) {
      console.error("Error formatting sensor data:", error);
    }

    return result;
  }, [sensorData]);

  // Get status color based on status
  const getStatusColor = (
    status: "normal" | "warning" | "critical"
  ): string => {
    switch (status) {
      case "critical":
        return "#FF3B30";
      case "warning":
        return "#FF9500";
      case "normal":
      default:
        return "#34C759";
    }
  };

  // Get name for sensor type
  const getSensorName = (type: SensorType): string => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "Nhiệt độ";
      case SensorType.HUMIDITY:
        return "Độ ẩm";
      case SensorType.SOIL_MOISTURE:
        return "Độ ẩm đất";
      case SensorType.LIGHT:
        return "Ánh sáng";
      default:
        return type;
    }
  };

  // Format sensor value for display
  const formatSensorValue = (value: number, type: SensorType): string => {
    if (typeof value !== "number") return "N/A";

    switch (type) {
      case SensorType.TEMPERATURE:
        return value.toFixed(1);
      case SensorType.HUMIDITY:
      case SensorType.SOIL_MOISTURE:
        return Math.round(value).toString();
      case SensorType.LIGHT:
        return Math.round(value).toString();
      default:
        return value.toString();
    }
  };

  // Get unit for sensor type
  const getSensorUnit = (type: SensorType): string => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "°C";
      case SensorType.HUMIDITY:
        return "%";
      case SensorType.SOIL_MOISTURE:
        return "%";
      case SensorType.LIGHT:
        return "lux";
      default:
        return "";
    }
  };

  // Get icon name for sensor type
  const getSensorIconName = (type: SensorType): string => {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "thermometer-outline";
      case SensorType.HUMIDITY:
        return "water-outline";
      case SensorType.SOIL_MOISTURE:
        return "leaf-outline";
      case SensorType.LIGHT:
        return "sunny-outline";
      default:
        return "hardware-chip-outline";
    }
  };

  return {
    formattedSensors,
    isLoading: sensorDataLoading,
    error: sensorDataError,
    getStatusColor,
    getSensorIconName,
    getSensorName,
    getSensorUnit,
    formatSensorValue,
  };
}
