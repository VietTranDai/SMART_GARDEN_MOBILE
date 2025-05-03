/**
 * Sensor Types
 *
 * Type definitions for sensor-related data
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

export interface Sensor {
  // Identification
  id: number;
  sensorKey: string;
  type: SensorType;

  // Relation
  gardenId: number;

  // Optional metadata
  name?: string;
  description?: string;
  location?: string;
  manufacturer?: string;
  model?: string;

  // Status
  isActive?: boolean;
  lastReading?: string;
  batteryLevel?: number;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface SensorData {
  id: number;
  sensorId: number;

  // Data specifics
  timestamp: string;
  value: number;
  unit?: string;

  // Optional metadata
  gardenId?: number;
  notes?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
