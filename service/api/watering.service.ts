import { CreateWateringSchedule, WateringDecision, WateringScheduleQueryParams, WateringStatsQueryParams, WateringStats, WateringSchedule, WateringDecisionRequestDto } from "@/types/activities/watering-schedules.type";
import apiClient from "../apiClient";
import { WATERING_ENDPOINTS, WATERING_DECISION_ENDPOINTS } from "../endpoints";

/**
 * Watering Schedule Service
 * 
 * Handles all watering schedule-related API calls
 */
class WateringScheduleService {
  /**
   * Get all watering schedules of current user
   * @param params Query parameters
   * @returns List of watering schedules
   */
  async getAll(params?: WateringScheduleQueryParams): Promise<WateringSchedule[]> {
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
   * Get watering schedule by ID
   * @param scheduleId Schedule ID
   * @returns Watering schedule details
   */
  async getById(scheduleId: number | string): Promise<WateringSchedule | null> {
    try {
      const response = await apiClient.get(WATERING_ENDPOINTS.DETAIL(scheduleId));
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error fetching watering schedule ${scheduleId}:`, error);
      return null;
    }
  }

  /**
   * Get watering schedules for a garden
   * @param gardenId Garden ID
   * @param params Query parameters
   * @returns List of watering schedules for the garden
   */
  async getByGarden(
    gardenId: number | string,
    params?: WateringScheduleQueryParams
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
   * Create a new watering schedule
   * @param gardenId Garden ID
   * @param scheduleData Schedule data
   * @returns Created watering schedule
   */
  async create(
    gardenId: number | string,
    scheduleData: CreateWateringSchedule
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
   * Auto generate watering schedule for a garden
   * @param gardenId Garden ID
   * @returns Generated watering schedule
   */
  async autoGenerate(
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
   * Mark schedule as completed
   * @param scheduleId Schedule ID
   * @returns Updated watering schedule
   */
  async complete(
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
   * Mark schedule as skipped
   * @param scheduleId Schedule ID
   * @returns Updated watering schedule
   */
  async skip(
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
  async delete(scheduleId: number | string): Promise<boolean> {
    try {
      await apiClient.delete(WATERING_ENDPOINTS.DETAIL(scheduleId));
      return true;
    } catch (error) {
      console.error(`Error deleting watering schedule ${scheduleId}:`, error);
      return false;
    }
  }

  /**
   * Get upcoming watering schedules for a garden
   * @param gardenId Garden ID
   * @param limit Maximum number of schedules to return
   * @returns List of upcoming watering schedules
   */
  async getUpcomingSchedules(
    gardenId: number | string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      const now = new Date();

      // Get all pending schedules for this garden
      const schedules = await this.getByGarden(gardenId, {
        status: "PENDING",
      });

      // Filter for future schedules and sort by scheduled time
      return schedules
        .filter((schedule) => {
          const scheduleDate = new Date(schedule.scheduledAt);
          return scheduleDate > now;
        })
        .sort((a, b) => {
          const dateA = new Date(a.scheduledAt).getTime();
          const dateB = new Date(b.scheduledAt).getTime();
          return dateA - dateB; // Sort by earliest first
        })
        .slice(0, limit)
        .map((schedule) => ({
          id: schedule.id,
          activityType: "WATERING",
          name: "Tưới nước",
          scheduledTime: schedule.scheduledAt,
          gardenId: schedule.gardenId,
        }));
    } catch (error) {
      console.error(
        `Error fetching upcoming watering schedules for garden ${gardenId}:`,
        error
      );
      return [];
    }
  }
}

/**
 * Watering Decision Model Service
 * 
 * Handles all watering AI decision-related API calls
 */
class WateringDecisionService {
  /**
   * Get watering decision for garden from AI model
   * @param gardenId Garden ID
   * @param requestData Optional request data (wateringTime, notes)
   * @returns AI watering decision
   */
  async getDecisionByGarden(
    gardenId: number | string,
    requestData: WateringDecisionRequestDto = {}
  ): Promise<WateringDecision | null> {
    try {
      const response = await apiClient.post(
        WATERING_DECISION_ENDPOINTS.POST_DECISION(gardenId),
        requestData
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(
        `Error fetching watering decision for garden ${gardenId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get optimal water amount for specific time
   * @param gardenId Garden ID
   * @param wateringTime Planned watering time
   * @param notes Optional notes
   * @returns Recommended water amount from AI
   */
  async getOptimalWaterAmount(
    gardenId: number | string,
    wateringTime: Date | string,
    notes?: string
  ): Promise<number | null> {
    try {
      const decision = await this.getDecisionByGarden(gardenId, {
        wateringTime,
        notes: notes || `Đề xuất lượng nước cho thời gian ${new Date(wateringTime).toLocaleString()}`
      });
      
      return decision?.recommended_amount || null;
    } catch (error) {
      console.error(
        `Error getting optimal water amount for garden ${gardenId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get watering decision statistics for garden
   * @param gardenId Garden ID
   * @param params Query parameters
   * @returns Watering decision statistics
   */
  async getStatsByGarden(
    gardenId: number | string,
    params?: WateringStatsQueryParams
  ): Promise<WateringStats | null> {
    try {
      const response = await apiClient.get(
        WATERING_DECISION_ENDPOINTS.STATS(gardenId),
        { params }
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(
        `Error fetching watering stats for garden ${gardenId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Test AI model connection
   * @returns Test result
   */
  async testAIConnection(): Promise<any> {
    try {
      const response = await apiClient.get(WATERING_DECISION_ENDPOINTS.TEST_AI);
      return response.data || null;
    } catch (error) {
      console.error("Error testing AI connection:", error);
      return null;
    }
  }
}

// Export service instances
export const wateringScheduleService = new WateringScheduleService();
export const wateringDecisionService = new WateringDecisionService();

// Export default as watering schedule service for backward compatibility
export default wateringScheduleService;
