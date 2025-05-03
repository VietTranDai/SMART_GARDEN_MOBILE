import apiClient from "../apiClient";
import { Sensor, SensorData, SensorType } from "@/types/gardens/sensor.types";
import {
  CreateSensorDto,
  UpdateSensorDto,
  SensorDataQueryParams,
} from "@/types/gardens/sensor-dtos";
import { SENSOR_ENDPOINTS } from "../endpoints";

/**
 * Sensor Service
 *
 * Handles all sensor-related API calls
 */
class SensorService {
  /**
   * Get all sensors for a garden
   * @param gardenId Garden ID
   * @returns List of sensors
   */
  async getSensorsByGarden(gardenId: number | string): Promise<Sensor[]> {
    const response = await apiClient.get(
      SENSOR_ENDPOINTS.LIST_BY_GARDEN(gardenId)
    );
    return response.data;
  }

  /**
   * Get sensor by id
   * @param sensorId Sensor id
   * @returns Sensor data
   */
  async getSensorById(sensorId: number | string): Promise<Sensor> {
    const response = await apiClient.get(SENSOR_ENDPOINTS.DETAIL(sensorId));
    return response.data;
  }

  /**
   * Create a new sensor for a garden
   * @param sensorData Sensor creation data
   * @returns Created sensor
   */
  async createSensor(sensorData: CreateSensorDto): Promise<Sensor> {
    const response = await apiClient.post(
      SENSOR_ENDPOINTS.CREATE(sensorData.gardenId),
      sensorData
    );
    return response.data;
  }

  /**
   * Update sensor
   * @param sensorId Sensor id
   * @param sensorData Sensor update data
   * @returns Updated sensor
   */
  async updateSensor(
    sensorId: number | string,
    sensorData: UpdateSensorDto
  ): Promise<Sensor> {
    const response = await apiClient.patch(
      SENSOR_ENDPOINTS.UPDATE(sensorId),
      sensorData
    );
    return response.data;
  }

  /**
   * Delete sensor
   * @param sensorId Sensor id
   */
  async deleteSensor(sensorId: number | string): Promise<void> {
    await apiClient.delete(SENSOR_ENDPOINTS.DELETE(sensorId));
  }

  /**
   * Get sensor data for a specific sensor
   * @param sensorId Sensor id
   * @param params Query parameters
   * @returns Sensor data
   */
  async getSensorData(
    sensorId: number | string,
    params?: SensorDataQueryParams
  ): Promise<SensorData[]> {
    const response = await apiClient.get(
      SENSOR_ENDPOINTS.SENSOR_DATA(sensorId),
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Get all sensor data for a garden (across all sensors)
   * @param gardenId Garden id
   * @param params Query parameters
   * @returns Garden sensor data
   */
  async getGardenSensorData(
    gardenId: number | string,
    params?: SensorDataQueryParams & { sensorType?: SensorType }
  ): Promise<Record<SensorType, SensorData[]>> {
    const response = await apiClient.get(
      SENSOR_ENDPOINTS.GARDEN_SENSOR_DATA(gardenId),
      {
        params,
      }
    );
    return response.data;
  }
}

export default new SensorService();
