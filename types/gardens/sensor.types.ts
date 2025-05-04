/**
 * Sensor Types
 *
 * Type definitions for sensor-related data based on Prisma schema
 */

export enum SensorType {
  HUMIDITY = "HUMIDITY",
  TEMPERATURE = "TEMPERATURE",
  LIGHT = "LIGHT",
  WATER_LEVEL = "WATER_LEVEL",
  RAINFALL = "RAINFALL",
  SOIL_MOISTURE = "SOIL_MOISTURE",
  SOIL_PH = "SOIL_PH",
}

export interface Sensor {
  id: number;
  sensorKey: string;
  type: SensorType;
  gardenId: number;
  garden?: Garden;
  sensorData?: SensorData[];
  createdAt: string;
  updatedAt: string;
}

export interface SensorData {
  id: number;
  sensorId: number;
  sensor?: Sensor;
  timestamp: string;
  value: number;
  gardenId?: number;
  garden?: Garden;
  createdAt: string;
  updatedAt: string;
}

// Import Garden type to prevent circular dependency
import { Garden } from "./garden.types";
