import apiClient from "../apiClient";
import { ACTIVITY_ENDPOINTS } from "../endpoints";
import {
  GardenActivity,
  CreateActivityDto,
  CreateEvaluationDto,
  ActivityEvaluation,
  ActivityType,
} from "@/types";

/**
 * Activity Service
 *
 * Handles all garden activity-related API calls
 */
class ActivityService {
  /**
   * Get garden activities
   * @param params Query parameters
   * @returns List of activities
   */
  async getActivities(params?: {
    type?: ActivityType;
    startDate?: string;
    endDate?: string;
  }): Promise<GardenActivity[]> {
    try {
      const response = await apiClient.get(ACTIVITY_ENDPOINTS.LIST, { params });
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  }

  /**
   * Get activities for a specific garden
   * @param gardenId Garden ID
   * @param params Query parameters
   * @returns List of activities for the garden
   */
  async getActivitiesByGarden(
    gardenId: number | string,
    params?: {
      type?: ActivityType;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<GardenActivity[]> {
    try {
      const response = await apiClient.get(
        ACTIVITY_ENDPOINTS.LIST_BY_GARDEN(gardenId),
        { params }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error(`Error fetching activities for garden ${gardenId}:`, error);
      return [];
    }
  }

  /**
   * Get activity by ID
   * @param activityId Activity ID
   * @returns Activity details
   */
  async getActivityById(
    activityId: number | string
  ): Promise<GardenActivity | null> {
    try {
      const response = await apiClient.get(
        ACTIVITY_ENDPOINTS.DETAIL(activityId)
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error fetching activity ${activityId}:`, error);
      return null;
    }
  }

  /**
   * Create a new activity
   * @param activityData Activity creation data
   * @returns Created activity
   */
  async createActivity(
    activityData: CreateActivityDto
  ): Promise<GardenActivity | null> {
    try {
      const response = await apiClient.post(
        ACTIVITY_ENDPOINTS.CREATE,
        activityData
      );
      return response.data?.data || null;
    } catch (error) {
      console.error("Error creating activity:", error);
      return null;
    }
  }

  /**
   * Evaluate an activity
   * @param activityId Activity ID
   * @param evaluationData Evaluation data
   * @returns Activity evaluation
   */
  async evaluateActivity(
    activityId: number | string,
    evaluationData: CreateEvaluationDto
  ): Promise<ActivityEvaluation | null> {
    try {
      const response = await apiClient.post(
        ACTIVITY_ENDPOINTS.EVALUATE(activityId),
        evaluationData
      );
      return response.data?.data || null;
    } catch (error) {
      console.error(`Error evaluating activity ${activityId}:`, error);
      return null;
    }
  }

  /**
   * Get recent activities for a garden
   * @param gardenId Garden ID
   * @param limit Maximum number of activities to return
   * @returns List of recent activities
   */
  async getRecentActivities(
    gardenId: number | string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      const activities = await this.getActivitiesByGarden(gardenId, {
        endDate: new Date().toISOString(),
      });

      // Sort by date (newest first) and limit results
      return activities
        .sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA;
        })
        .slice(0, limit)
        .map((activity) => ({
          ...activity,
          completed: true, // Recent activities are already completed
        }));
    } catch (error) {
      console.error(
        `Error fetching recent activities for garden ${gardenId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Get upcoming scheduled activities for a garden
   * @param gardenId Garden ID
   * @param limit Maximum number of activities to return
   * @returns List of upcoming scheduled activities
   */
  async getUpcomingSchedules(
    gardenId: number | string,
    limit: number = 5
  ): Promise<any[]> {
    try {
      // This would typically come from a different endpoint in production
      // For now, we'll return mock data
      return [];
    } catch (error) {
      console.error(
        `Error fetching upcoming schedules for garden ${gardenId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Complete an activity
   * @param activityId Activity ID
   * @returns Whether the operation was successful
   */
  async completeActivity(activityId: number | string): Promise<boolean> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate success
      return true;
    } catch (error) {
      console.error(`Error completing activity ${activityId}:`, error);
      return false;
    }
  }

  /**
   * Skip a scheduled activity
   * @param scheduleId Schedule ID
   * @returns Whether the operation was successful
   */
  async skipScheduledActivity(scheduleId: number | string): Promise<boolean> {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate success
      return true;
    } catch (error) {
      console.error(`Error skipping scheduled activity ${scheduleId}:`, error);
      return false;
    }
  }
}

export default new ActivityService();
