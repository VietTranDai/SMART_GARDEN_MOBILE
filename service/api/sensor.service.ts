import apiClient from "../apiClient";
import {
  Sensor,
  SensorData,
  SensorDataExtended,
  SensorType,
  SensorUnit,
} from "@/types/gardens/sensor.types";
import {
  CreateSensorDto,
  UpdateSensorDto,
  SensorDataQueryParams,
} from "@/types/gardens/sensor-dtos";
import {
  SensorStatisticsDto,
  SensorAnalyticsDto,
} from "@/types/gardens/sensor-statistics.types";
import { SENSOR_ENDPOINTS } from "../endpoints";
import { Platform } from "react-native";

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
    // Fetch from API with retry mechanism
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.LIST_BY_GARDEN(gardenId))
    );

    return response.data.data;
  }

  /**
   * Get sensor by id
   * @param sensorId Sensor id
   * @returns Sensor data
   */
  async getSensorById(sensorId: number | string): Promise<Sensor> {
    // Fetch from API with retry mechanism
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.DETAIL(sensorId))
    );

    return response.data.data;
  }

  /**
   * Create a new sensor for a garden
   * @param sensorData Sensor creation data
   * @returns Created sensor
   */
  async createSensor(sensorData: CreateSensorDto): Promise<Sensor> {
    const response = await this.retryApiCall(() =>
      apiClient.post(SENSOR_ENDPOINTS.CREATE(sensorData.gardenId), sensorData)
    );

    return response.data.data;
  }

  /**
   * Update a sensor
   * @param sensorId Sensor id
   * @param sensorData Sensor update data
   * @returns Updated sensor
   */
  async updateSensor(
    sensorId: number | string,
    sensorData: UpdateSensorDto
  ): Promise<Sensor> {
    const response = await this.retryApiCall(() =>
      apiClient.put(SENSOR_ENDPOINTS.DETAIL(sensorId), sensorData)
    );

    return response.data.data;
  }

  /**
   * Delete sensor
   * @param sensorId Sensor id
   */
  async deleteSensor(sensorId: number | string): Promise<void> {
    await this.retryApiCall(() =>
      apiClient.delete(SENSOR_ENDPOINTS.DELETE(sensorId))
    );
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
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.SENSOR_DATA(sensorId), { params })
    );
    return response.data.data;
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
  ): Promise<Record<string, SensorData[]>> {
    // Fetch from API with retry mechanism
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.GARDEN_SENSOR_DATA(gardenId), { params })
    );
    const validatedData = this.validateSensorData(response.data.data);

    return validatedData;
  }

  /**
   * Validates and converts sensor data to format needed by components
   * @param data Raw sensor data from API
   * @returns Formatted sensor data
   */
  validateSensorData(data: any): Record<string, SensorData[]> {
    // Khởi tạo một đối tượng rỗng với các khóa là chuỗi
    const result: Record<string, SensorData[]> = {};

    // Nếu dữ liệu không phải là object, trả về đối tượng rỗng
    if (!data || typeof data !== "object") {
      return result;
    }

    // Duyệt qua tất cả các thuộc tính của dữ liệu
    Object.keys(data).forEach((key) => {
      // Kiểm tra xem key có phải là kiểu SensorType không
      const sensorType = key as SensorType;

      // Kiểm tra xem giá trị có phải là mảng không
      if (Array.isArray(data[key])) {
        // Biến đổi mảng để đảm bảo mỗi phần tử có định dạng đúng
        const sensorDataArray = data[key]
          .map((item: any) => {
            return {
              id: item.id || 0,
              sensorId: item.sensorId || 0,
              type: sensorType,
              value: item.value || 0,
              unit: item.unit || this.getSensorUnitForType(sensorType),
              timestamp: item.timestamp || new Date().toISOString(),
              gardenId: item.gardenId,
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
            };
          })
          .filter(
            (item: any) => item.value !== undefined && item.value !== null
          );

        // Chỉ thêm vào kết quả nếu mảng không rỗng
        if (sensorDataArray.length > 0) {
          // Sử dụng chuỗi đại diện cho SensorType làm khóa
          result[sensorType.toString()] = sensorDataArray;
        }
      }
    });

    return result;
  }

  /**
   * Clears all sensor-related cache entries - now a no-op
   */
  async clearCache(): Promise<void> {
    // No-op since we removed caching
    return;
  }

  /**
   * Retry API call with exponential backoff
   * @param apiCall Function that makes the API call
   * @param maxRetries Maximum number of retries (default: 3)
   * @param baseDelay Base delay in milliseconds (default: 1000)
   * @returns API response
   */
  private async retryApiCall<T>(
    apiCall: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Try to make the API call
        return await apiCall();
      } catch (err) {
        lastError = err;

        // If it's the last attempt, don't delay just throw
        if (attempt === maxRetries) break;

        // Calculate delay with exponential backoff and jitter
        const delay =
          baseDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);

        // Wait before next retry
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    throw lastError;
  }

  /**
   * Get latest readings for all sensors in a garden
   */
  async getLatestReadingsByGarden(
    gardenId: string | number
  ): Promise<Sensor[]> {
    try {
      const response = await this.retryApiCall(() =>
        apiClient.get(SENSOR_ENDPOINTS.LATEST_READINGS_BY_GARDEN(gardenId))
      );

      return response.data.data || [];
    } catch (error) {
      console.error(
        `Error fetching latest readings for garden ${gardenId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Utility functions for SensorDisplay component
   */

  /**
   * Get human-readable name for a sensor type
   * @param type Sensor type
   * @returns Human-readable name
   */
  getSensorTypeName(type: SensorType): string {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "Nhiệt độ";
      case SensorType.HUMIDITY:
        return "Độ ẩm";
      case SensorType.SOIL_MOISTURE:
        return "Độ ẩm đất";
      case SensorType.LIGHT:
        return "Ánh sáng";
      case SensorType.WATER_LEVEL:
        return "Mực nước";
      case SensorType.RAINFALL:
        return "Lượng mưa";
      case SensorType.SOIL_PH:
        return "Độ pH đất";
      default:
        return type;
    }
  }

  /**
   * Get icon name for a sensor type
   * @param type Sensor type
   * @returns Icon name (for MaterialCommunityIcons)
   */
  getSensorIcon(type: SensorType): string {
    switch (type) {
      case SensorType.TEMPERATURE:
        return "thermometer";
      case SensorType.HUMIDITY:
        return "water-percent";
      case SensorType.SOIL_MOISTURE:
        return "water-outline";
      case SensorType.LIGHT:
        return "white-balance-sunny";
      case SensorType.WATER_LEVEL:
        return "water";
      case SensorType.RAINFALL:
        return "weather-pouring";
      case SensorType.SOIL_PH:
        return "flask-outline";
      default:
        return "gauge";
    }
  }

  /**
   * Get appropriate unit for a sensor type
   * @param type Sensor type
   * @returns Unit
   */
  getSensorUnitForType(type: SensorType): SensorUnit {
    switch (type) {
      case SensorType.TEMPERATURE:
        return SensorUnit.CELSIUS;
      case SensorType.HUMIDITY:
      case SensorType.SOIL_MOISTURE:
        return SensorUnit.PERCENT;
      case SensorType.LIGHT:
        return SensorUnit.LUX;
      case SensorType.WATER_LEVEL:
        return SensorUnit.METER;
      case SensorType.RAINFALL:
        return SensorUnit.MILLIMETER;
      case SensorType.SOIL_PH:
        return SensorUnit.PH;
      default:
        return SensorUnit.PERCENT;
    }
  }

  /**
   * Get human-readable text for a unit
   * @param unit Sensor unit
   * @returns Human-readable text
   */
  getSensorUnitText(unit: SensorUnit): string {
    switch (unit) {
      case SensorUnit.CELSIUS:
        return "°C";
      case SensorUnit.PERCENT:
        return "%";
      case SensorUnit.LUX:
        return "lux";
      case SensorUnit.MILLIMETER:
        return "mm";
      case SensorUnit.PH:
        return "pH";
      case SensorUnit.METER:
        return "m";
      default:
        return unit;
    }
  }

  /**
   * Determine sensor status based on value and type
   * @param value Sensor value
   * @param type Sensor type
   * @returns Status (normal, warning, critical)
   */
  getSensorStatus(
    value: number,
    type: string
  ): "normal" | "warning" | "critical" {
    switch (type) {
      case SensorType.TEMPERATURE:
        if (value > 35) return "critical";
        if (value > 30) return "warning";
        return "normal";
      case SensorType.HUMIDITY:
        if (value < 20) return "critical";
        if (value < 40) return "warning";
        return "normal";
      case SensorType.SOIL_MOISTURE:
        if (value < 15) return "critical";
        if (value < 30) return "warning";
        return "normal";
      case SensorType.LIGHT:
        return "normal";
      case SensorType.SOIL_PH:
        if (value < 4.5 || value > 8.5) return "critical";
        if (value < 5.5 || value > 7.5) return "warning";
        return "normal";
      default:
        return "normal";
    }
  }

  /**
   * Format timestamp to a friendly relative time
   * @param timestamp Timestamp to format
   * @returns Friendly relative time
   */
  formatTimeAgo(timestamp?: string): string {
    if (!timestamp) return "Chưa cập nhật";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Định dạng không hợp lệ";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Vừa cập nhật";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    }
  }

  /**
   * Generate dummy trend data for testing
   */
  generateDummyTrendData(
    value: number
  ): { value: number; timestamp: string }[] {
    const now = new Date();
    return Array.from({ length: 5 }, (_, i) => {
      const time = new Date(now);
      time.setHours(time.getHours() - (5 - i));
      return {
        value: value - 2 + Math.random() * 4,
        timestamp: time.toISOString(),
      };
    });
  }

  /**
   * Format data for SensorDisplay component
   */
  formatSensorDataForDisplay(
    sensorData: Record<string, SensorData[]>
  ): Record<string, SensorDataExtended[]> {
    const result: Record<string, SensorDataExtended[]> = {};

    Object.entries(sensorData).forEach(([type, dataArray]) => {
      result[type] = dataArray.map((data) => ({
        id: data.id,
        sensorId: data.sensorId,
        type: type as SensorType,
        name: this.getSensorTypeName(type as SensorType),
        value: data.value,
        unit: this.getSensorUnitText(
          this.getSensorUnitForType(type as SensorType)
        ),
        lastUpdated: data.timestamp,
        timestamp: data.timestamp,
        gardenId: data.gardenId,
        isActive: true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        trendData: this.generateDummyTrendData(data.value),
      }));
    });

    return result;
  }

  /**
   * Get statistics for a sensor within a date range
   * @param sensorId Sensor ID
   * @param startDate Start date for statistics (ISO format string)
   * @param endDate End date for statistics (ISO format string)
   * @returns Sensor statistics
   */
  async getSensorStatistics(
    sensorId: number | string,
    startDate: string,
    endDate: string
  ): Promise<SensorStatisticsDto> {
    const params = { startDate, endDate };
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.STATISTICS(sensorId), { params })
    );
    return response.data.data; // Assuming the backend returns SensorStatisticsDto directly in response.data
  }

  /**
   * Get daily analytics for a sensor within a date range
   * @param sensorId Sensor ID
   * @param startDate Start date for analytics (YYYY-MM-DD format string)
   * @param endDate End date for analytics (YYYY-MM-DD format string)
   * @returns Sensor analytics
   */
  async getSensorAnalytics(
    sensorId: number | string,
    startDate: string,
    endDate: string
  ): Promise<SensorAnalyticsDto> {
    const params = { startDate, endDate };
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.ANALYTICS(sensorId), { params })
    );
    return response.data.data; // Ensuring it returns response.data.data
  }
}

export default new SensorService();
