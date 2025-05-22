/**
 * Sensor Types
 *
 * Type definitions for sensor-related data based on Prisma schema
 */

export enum SensorType {
  TEMPERATURE = "TEMPERATURE",
  HUMIDITY = "HUMIDITY",
  SOIL_MOISTURE = "SOIL_MOISTURE",
  LIGHT = "LIGHT",
  SOIL_PH = "SOIL_PH",
  WATER_LEVEL = "WATER_LEVEL",
  RAINFALL = "RAINFALL",
}

export enum SensorUnit {
  CELSIUS = "°C",
  PERCENT = "%",
  LUX = "lux",
  PH = "pH",
  LITER = "L",
  METER = "m",
  MILLIMETER = "mm",
}

export interface Sensor {
  id: number;
  name: string;
  type: SensorType;
  unit: SensorUnit;
  gardenId: number;
  isActive: boolean;
  lastReading?: number;
  lastReadingAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SensorData {
  id: number;
  sensorId: number;
  value: number;
  timestamp: string;
  gardenId?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface definitions for UI components
 */

export interface SensorDataExtended {
  id: number;
  sensorId: number;
  type: SensorType;
  name: string;
  value: number;
  unit: string;
  lastUpdated: string;
  timestamp: string;
  gardenId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  trendData?: { value: number; timestamp: string }[];
}

export interface SensorDisplayProps {
  selectedGardenId?: number | null;
  sensorDataByType: Record<SensorType, SensorData[]>;
  getSensorStatus: (
    value: number,
    type: SensorType
  ) => "normal" | "warning" | "critical";
  getSensorIconName: (sensorType: SensorType) => string;
  showFullDetails?: boolean;
  loading?: boolean;
  error?: string | null;
}
