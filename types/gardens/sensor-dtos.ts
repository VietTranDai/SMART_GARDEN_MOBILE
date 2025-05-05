/**
 * Sensor DTOs
 *
 * Data Transfer Objects for sensor-related API requests and responses
 */
import { SensorType, SensorUnit } from "@/types/gardens/sensor.types";

/**
 * DTO for creating a new sensor
 */
export interface CreateSensorDto {
  type: SensorType;
  unit: SensorUnit;
  name: string;
  gardenId: number;
  sensorKey?: string;
}

/**
 * DTO for updating a sensor
 */
export interface UpdateSensorDto {
  type?: SensorType;
  unit?: SensorUnit;
  name?: string;
}

/**
 * Query parameters for fetching sensor data
 */
export interface SensorDataQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
