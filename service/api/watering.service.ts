import apiClient from "../apiClient";
import { WATERING_ENDPOINTS } from "../endpoints";
import { TaskStatus, WateringSchedule } from "@/types";

/**
 * Watering Service
 *
 * Handles all watering schedule-related API calls
 */
class WateringService {
  /**
   * Get all watering schedules
   * @param params Query parameters
   * @returns List of watering schedules
   */
  async getWateringSchedules(params?: {
    status?: TaskStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<WateringSchedule[]> {
    const response = await apiClient.get(WATERING_ENDPOINTS.LIST, {
      params,
    });
    return response.data;
  }

  /**
   * Get watering schedules for a garden
   * @param gardenId Garden ID
   * @param params Query parameters
   * @returns List of watering schedules for the garden
   */
  async getGardenWateringSchedules(
    gardenId: number | string,
    params?: {
      status?: TaskStatus;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<WateringSchedule[]> {
    const response = await apiClient.get(
      WATERING_ENDPOINTS.LIST_BY_GARDEN(gardenId),
      { params }
    );
    return response.data;
  }

  /**
   * Get watering schedule by ID
   * @param scheduleId Schedule ID
   * @returns Watering schedule details
   */
  async getWateringScheduleById(
    scheduleId: number | string
  ): Promise<WateringSchedule> {
    const response = await apiClient.get(WATERING_ENDPOINTS.DETAIL(scheduleId));
    return response.data;
  }

  /**
   * Create a new watering schedule
   * @param gardenId Garden ID
   * @param scheduleData Schedule data
   * @returns Created watering schedule
   */
  async createWateringSchedule(
    gardenId: number | string,
    scheduleData: {
      scheduledAt: string;
      amount: number;
    }
  ): Promise<WateringSchedule> {
    const response = await apiClient.post(
      WATERING_ENDPOINTS.LIST_BY_GARDEN(gardenId),
      scheduleData
    );
    return response.data;
  }

  /**
   * Generate automatic watering schedule for a garden
   * @param gardenId Garden ID
   * @returns Generated watering schedule
   */
  async generateAutomaticSchedule(
    gardenId: number | string
  ): Promise<WateringSchedule> {
    const response = await apiClient.post(
      WATERING_ENDPOINTS.AUTO_GENERATE(gardenId)
    );
    return response.data;
  }

  /**
   * Complete a watering schedule
   * @param scheduleId Schedule ID
   * @returns Updated watering schedule
   */
  async completeWateringSchedule(
    scheduleId: number | string
  ): Promise<WateringSchedule> {
    const response = await apiClient.post(
      WATERING_ENDPOINTS.COMPLETE(scheduleId)
    );
    return response.data;
  }

  /**
   * Skip a watering schedule
   * @param scheduleId Schedule ID
   * @returns Updated watering schedule
   */
  async skipWateringSchedule(
    scheduleId: number | string
  ): Promise<WateringSchedule> {
    const response = await apiClient.post(WATERING_ENDPOINTS.SKIP(scheduleId));
    return response.data;
  }

  /**
   * Delete a watering schedule
   * @param scheduleId Schedule ID
   */
  async deleteWateringSchedule(scheduleId: number | string): Promise<void> {
    await apiClient.delete(WATERING_ENDPOINTS.DETAIL(scheduleId));
  }
}

export default new WateringService();
