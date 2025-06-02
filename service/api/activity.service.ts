import apiClient from "../apiClient";
import { ACTIVITY_ENDPOINTS } from "../endpoints";
import {
  ActivityType,
} from "@/types/activities/activity.types";
import {
  CreateActivityDto,
  GardenActivityDto,
  PaginatedGardenActivitiesResultDto,
  GardenActivityAnalyticsDto,
  ActivityStatsResponseDto,
  PaginationMeta,
} from "@/types/activities/dtos";

/**
 * Activity Service
 *
 * Handles all garden activity-related API calls
 */
class ActivityService {
  /**
   * Get garden activities (paginated and filtered)
   * @param params Query parameters including pagination and filters
   * @returns Paginated list of activities
   */
  async getActivities(params?: {
    gardenId?: number;
    type?: ActivityType;
    startDate?: string; // ISO 8601
    endDate?: string; // ISO 8601
    page?: number;
    limit?: number;
  }): Promise<PaginatedGardenActivitiesResultDto> {
    try {
      const response = await apiClient.get(ACTIVITY_ENDPOINTS.LIST_CREATE, { params });
      // Assuming the backend returns data in the shape of PaginatedGardenActivitiesResultDto directly
      return response.data.data || { items: [], meta: { totalItems: 0, itemsPerPage: params?.limit || 10, currentPage: params?.page || 1, totalPages: 0 } };
    } catch (error) {
      console.error("Error fetching activities:", error);
      return { items: [], meta: { totalItems: 0, itemsPerPage: params?.limit || 10, currentPage: params?.page || 1, totalPages: 0 } };
    }
  }

  /**
   * Create a new activity
   * @param activityData Activity creation data
   * @returns Created activity
   */
  async createActivity(
    activityData: CreateActivityDto
  ): Promise<GardenActivityDto | null> {
    try {
      const response = await apiClient.post(
        ACTIVITY_ENDPOINTS.LIST_CREATE,
        activityData
      );
      return response.data.data || null; // Assuming backend returns the created activity object directly
    } catch (error) {
      console.error("Error creating activity:", error);
      return null;
    }
  }

  /**
   * Get activity by ID
   * @param activityId Activity ID
   * @returns Activity details
   */
  async getActivityById(
    activityId: number | string
  ): Promise<GardenActivityDto | null> {
    try {
      const response = await apiClient.get(
        ACTIVITY_ENDPOINTS.DETAIL(activityId)
      );
      return response.data.data || null; // Assuming backend returns the activity object directly
    } catch (error) {
      console.error(`Error fetching activity ${activityId}:`, error);
      return null;
    }
  }

  /**
   * Get activity analysis by ID
   * @param activityId Activity ID
   * @returns Activity analysis details
   */
  async getActivityAnalysis(
    activityId: number | string
  ): Promise<GardenActivityAnalyticsDto | null> {
    try {
      const response = await apiClient.get(
        ACTIVITY_ENDPOINTS.ANALYSIS(activityId)
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching activity analysis for ${activityId}:`, error);
      return null;
    }
  }

  /**
   * Get activity statistics
   * @param params Query parameters for statistics
   * @returns Activity statistics
   */
  async getActivityStats(params: {
    gardenId?: number;
    activityType?: ActivityType;
    startDate: string; // ISO 8601 Required
    endDate: string; // ISO 8601 Required
  }): Promise<ActivityStatsResponseDto | null> {
    try {
      const response = await apiClient.get(ACTIVITY_ENDPOINTS.STATS, { params });
      return response.data.data || null;
    } catch (error) {
      console.error("Error fetching activity statistics:", error);
      return null;
    }
  }
}

export default new ActivityService();
