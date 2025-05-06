/**
 * Sensor Types
 *
 * Type definitions for sensor-related data based on Prisma schema
 */

export enum SensorType {
  HUMIDITY = "HUMIDITY", // Sensor for measuring humidity
  TEMPERATURE = "TEMPERATURE", // Sensor for measuring temperature
  LIGHT = "LIGHT", // Sensor for measuring light intensity
  WATER_LEVEL = "WATER_LEVEL", // Sensor for measuring water level
  RAINFALL = "RAINFALL", // Sensor for measuring rainfall
  SOIL_MOISTURE = "SOIL_MOISTURE", // Sensor for measuring soil moisture
  SOIL_PH = "SOIL_PH", // Sensor for measuring soil pH
}

export enum SensorUnit {
  PERCENT = "PERCENT", // phần trăm (ví dụ: độ ẩm)
  CELSIUS = "CELSIUS", // độ C (nhiệt độ)
  LUX = "LUX", // đơn vị chiếu sáng
  METER = "METER", // mét (mực nước)
  MILLIMETER = "MILLIMETER", // milimét (lượng mưa)
  PH = "PH", // độ pH (độ chua, độ kiềm)
}

export interface Sensor {
  id: number; // Unique ID for the sensor
  sensorKey: string; // Unique UUID for the sensor
  type: SensorType;
  unit: SensorUnit;
  name: string;
  gardenId: number;
  sensorData?: SensorData[];
  createdAt: string;
  updatedAt: string;
}

export interface SensorData {
  id: number;
  sensorId: number;
  sensor?: Sensor;
  timestamp: string; // ISO format of DateTime
  value: number;
  gardenId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SensorWithLatestReading extends Sensor {
  latestReading?: SensorData;
}

// Import Garden type to prevent circular dependency
import { Garden } from "./garden.types";
