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
    try {
      const response = await apiClient.get(WATERING_ENDPOINTS.LIST, {
        params,
      });
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching watering schedules:", error);
      return [];
    }
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
    try {
      const response = await apiClient.get(
        WATERING_ENDPOINTS.LIST_BY_GARDEN(gardenId),
        { params }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error(
        `Error fetching watering schedules for garden ${gardenId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Get watering schedule by ID
   * @param scheduleId Schedule ID
   * @returns Watering schedule details
   */
  async getWateringScheduleById(
    scheduleId: number | string
  ): Promise<WateringSchedule | null> {
    try {
      const response = await apiClient.get(
        WATERING_ENDPOINTS.DETAIL(scheduleId)
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error fetching watering schedule ${scheduleId}:`, error);
      return null;
    }
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
  ): Promise<WateringSchedule | null> {
    try {
      const response = await apiClient.post(
        WATERING_ENDPOINTS.LIST_BY_GARDEN(gardenId),
        scheduleData
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(
        `Error creating watering schedule for garden ${gardenId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Generate automatic watering schedule for a garden
   * @param gardenId Garden ID
   * @returns Generated watering schedule
   */
  async generateAutomaticSchedule(
    gardenId: number | string
  ): Promise<WateringSchedule | null> {
    try {
      const response = await apiClient.post(
        WATERING_ENDPOINTS.AUTO_GENERATE(gardenId)
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(
        `Error generating automatic schedule for garden ${gardenId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Complete a watering schedule
   * @param scheduleId Schedule ID
   * @returns Updated watering schedule
   */
  async completeWateringSchedule(
    scheduleId: number | string
  ): Promise<WateringSchedule | null> {
    try {
      const response = await apiClient.post(
        WATERING_ENDPOINTS.COMPLETE(scheduleId)
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error completing watering schedule ${scheduleId}:`, error);
      return null;
    }
  }

  /**
   * Skip a watering schedule
   * @param scheduleId Schedule ID
   * @returns Updated watering schedule
   */
  async skipWateringSchedule(
    scheduleId: number | string
  ): Promise<WateringSchedule | null> {
    try {
      const response = await apiClient.post(
        WATERING_ENDPOINTS.SKIP(scheduleId)
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error skipping watering schedule ${scheduleId}:`, error);
      return null;
    }
  }

  /**
   * Delete a watering schedule
   * @param scheduleId Schedule ID
   */
  async deleteWateringSchedule(scheduleId: number | string): Promise<boolean> {
    try {
      await apiClient.delete(WATERING_ENDPOINTS.DETAIL(scheduleId));
      return true;
    } catch (error) {
      console.error(`Error deleting watering schedule ${scheduleId}:`, error);
      return false;
    }
  }
}

export default new WateringService();
