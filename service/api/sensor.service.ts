import apiClient from "../apiClient";
import { Sensor, SensorData, SensorType } from "@/types/gardens/sensor.types";
import {
  CreateSensorDto,
  UpdateSensorDto,
  SensorDataQueryParams,
} from "@/types/gardens/sensor-dtos";
import { SENSOR_ENDPOINTS } from "../endpoints";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Cache keys
const CACHE_KEYS = {
  SENSOR_LIST: (gardenId: number | string) => `sensors_garden_${gardenId}`,
  SENSOR_DETAIL: (sensorId: number | string) => `sensor_${sensorId}`,
  SENSOR_DATA: (sensorId: number | string, params?: any) =>
    `sensor_data_${sensorId}_${params ? JSON.stringify(params) : "default"}`,
  GARDEN_SENSOR_DATA: (gardenId: number | string, params?: any) =>
    `garden_data_${gardenId}_${params ? JSON.stringify(params) : "default"}`,
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
  SENSOR_LIST: 5 * 60 * 1000, // 5 minutes
  SENSOR_DETAIL: 10 * 60 * 1000, // 10 minutes
  SENSOR_DATA: 2 * 60 * 1000, // 2 minutes
  GARDEN_SENSOR_DATA: 2 * 60 * 1000, // 2 minutes
};

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Sensor Service
 *
 * Handles all sensor-related API calls
 */
class SensorService {
  /**
   * Get all sensors for a garden
   * @param gardenId Garden ID
   * @param forceRefresh Force refresh data from API
   * @returns List of sensors
   */
  async getSensorsByGarden(
    gardenId: number | string,
    forceRefresh = false
  ): Promise<Sensor[]> {
    const cacheKey = CACHE_KEYS.SENSOR_LIST(gardenId);

    // Try to get from cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = await this.getFromCache<Sensor[]>(
        cacheKey,
        CACHE_EXPIRY.SENSOR_LIST
      );
      if (cachedData) return cachedData;
    }

    // Fetch from API with retry mechanism
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.LIST_BY_GARDEN(gardenId))
    );

    // Store in cache
    await this.saveToCache(cacheKey, response.data.data);

    return response.data.data;
  }

  /**
   * Get sensor by id
   * @param sensorId Sensor id
   * @param forceRefresh Force refresh data from API
   * @returns Sensor data
   */
  async getSensorById(
    sensorId: number | string,
    forceRefresh = false
  ): Promise<Sensor> {
    const cacheKey = CACHE_KEYS.SENSOR_DETAIL(sensorId);

    // Try to get from cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = await this.getFromCache<Sensor>(
        cacheKey,
        CACHE_EXPIRY.SENSOR_DETAIL
      );
      if (cachedData) return cachedData;
    }

    // Fetch from API with retry mechanism
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.DETAIL(sensorId))
    );

    // Store in cache
    await this.saveToCache(cacheKey, response.data.data);

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

    // Invalidate relevant caches
    await this.invalidateCache(CACHE_KEYS.SENSOR_LIST(sensorData.gardenId));

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

    // Invalidate relevant caches
    await this.invalidateCache(CACHE_KEYS.SENSOR_DETAIL(sensorId));
    if (response.data.data.gardenId) {
      await this.invalidateCache(
        CACHE_KEYS.SENSOR_LIST(response.data.data.gardenId)
      );
    }

    return response.data.data;
  }

  /**
   * Delete sensor
   * @param sensorId Sensor id
   * @param gardenId Garden id (optional, for cache invalidation)
   */
  async deleteSensor(
    sensorId: number | string,
    gardenId?: number | string
  ): Promise<void> {
    // Get garden ID first if not provided (for cache invalidation)
    if (!gardenId) {
      try {
        const sensor = await this.getSensorById(sensorId);
        gardenId = sensor.gardenId;
      } catch (err) {
        console.error("Error getting sensor for cache invalidation:", err);
      }
    }

    await this.retryApiCall(() =>
      apiClient.delete(SENSOR_ENDPOINTS.DELETE(sensorId))
    );

    // Invalidate relevant caches
    await this.invalidateCache(CACHE_KEYS.SENSOR_DETAIL(sensorId));
    if (gardenId) {
      await this.invalidateCache(CACHE_KEYS.SENSOR_LIST(gardenId));
    }
  }

  /**
   * Get sensor data for a specific sensor
   * @param sensorId Sensor id
   * @param params Query parameters
   * @param forceRefresh Force refresh data from API
   * @returns Sensor data
   */
  async getSensorData(
    sensorId: number | string,
    params?: SensorDataQueryParams,
    forceRefresh = false
  ): Promise<SensorData[]> {
    const cacheKey = CACHE_KEYS.SENSOR_DATA(sensorId, params);

    // Try to get from cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = await this.getFromCache<SensorData[]>(
        cacheKey,
        CACHE_EXPIRY.SENSOR_DATA
      );
      if (cachedData) return cachedData;
    }

    // Fetch from API with retry mechanism
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.SENSOR_DATA(sensorId), { params })
    );

    // Store in cache
    await this.saveToCache(cacheKey, response.data.data);

    return response.data.data;
  }

  /**
   * Get all sensor data for a garden (across all sensors)
   * @param gardenId Garden id
   * @param params Query parameters
   * @param forceRefresh Force refresh data from API
   * @returns Garden sensor data
   */
  async getGardenSensorData(
    gardenId: number | string,
    params?: SensorDataQueryParams & { sensorType?: SensorType },
    forceRefresh = false
  ): Promise<Record<SensorType, SensorData[]>> {
    const cacheKey = CACHE_KEYS.GARDEN_SENSOR_DATA(gardenId, params);

    // Try to get from cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = await this.getFromCache<
        Record<SensorType, SensorData[]>
      >(cacheKey, CACHE_EXPIRY.GARDEN_SENSOR_DATA);
      if (cachedData) return cachedData;
    }

    // Fetch from API with retry mechanism
    const response = await this.retryApiCall(() =>
      apiClient.get(SENSOR_ENDPOINTS.GARDEN_SENSOR_DATA(gardenId), { params })
    );

    // Store in cache
    await this.saveToCache(cacheKey, response.data.data);

    return response.data.data;
  }

  /**
   * Clears all sensor-related cache entries
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sensorKeys = keys.filter(
        (key) =>
          key.startsWith("sensors_") ||
          key.startsWith("sensor_") ||
          key.startsWith("garden_data_")
      );

      if (sensorKeys.length > 0) {
        await AsyncStorage.multiRemove(sensorKeys);
      }
    } catch (err) {
      console.error("Error clearing sensor cache:", err);
    }
  }

  // Helper methods for caching

  /**
   * Save data to cache
   * @param key Cache key
   * @param data Data to cache
   */
  private async saveToCache<T>(key: string, data: T): Promise<void> {
    try {
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (err) {
      console.error("Error saving to cache:", err);
    }
  }

  /**
   * Get data from cache if not expired
   * @param key Cache key
   * @param expiryTime Expiry time in milliseconds
   * @returns Cached data or null if expired/not found
   */
  private async getFromCache<T>(
    key: string,
    expiryTime: number
  ): Promise<T | null> {
    try {
      const cachedDataString = await AsyncStorage.getItem(key);
      if (!cachedDataString) return null;

      const cachedEntry = JSON.parse(cachedDataString) as CacheEntry<T>;
      const now = Date.now();

      // Return data if not expired
      if (now - cachedEntry.timestamp < expiryTime) {
        return cachedEntry.data;
      }

      // If expired, remove from cache
      await AsyncStorage.removeItem(key);
      return null;
    } catch (err) {
      console.error("Error getting from cache:", err);
      return null;
    }
  }

  /**
   * Invalidate a cache entry
   * @param key Cache key
   */
  private async invalidateCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.error("Error invalidating cache:", err);
    }
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
}

export default new SensorService();
