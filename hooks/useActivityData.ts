import { useState, useCallback } from "react";
import {
  ActivityDisplay,
  ScheduleDisplay,
} from "@/types/activities/activity.types";
import { activityService, wateringService } from "@/service/api";

/**
 * Custom hook for activity and schedule data management
 */
export default function useActivityData() {
  // State for activities and schedules
  const [recentActivities, setRecentActivities] = useState<ActivityDisplay[]>(
    []
  );
  const [upcomingSchedules, setUpcomingSchedules] = useState<ScheduleDisplay[]>(
    []
  );

  // Status states
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);

  /**
   * Fetch recent activities for a garden
   */
  const fetchRecentActivities = useCallback(async (gardenId: number | null) => {
    // Skip if no garden selected
    if (gardenId === null) {
      setRecentActivities([]);
      return [];
    }

    setActivitiesLoading(true);
    setActivitiesError(null);

    try {
      const activities = await activityService.getRecentActivities(gardenId);
      setRecentActivities(activities);
      return activities;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      setActivitiesError("Không thể tải hoạt động gần đây");
      return [];
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  /**
   * Fetch upcoming schedules for a garden
   */
  const fetchUpcomingSchedules = useCallback(
    async (gardenId: number | null) => {
      // Skip if no garden selected
      if (gardenId === null) {
        setUpcomingSchedules([]);
        return [];
      }

      setSchedulesLoading(true);
      setSchedulesError(null);

      try {
        // Get watering schedules
        const wateringSchedules =
          await wateringService.getUpcomingWateringSchedules(gardenId);

        // Get other scheduled activities
        const scheduledActivities = await activityService.getUpcomingSchedules(
          gardenId
        );

        // Combine and sort by scheduled time
        const allSchedules = [
          ...wateringSchedules,
          ...scheduledActivities,
        ].sort(
          (a, b) =>
            new Date(a.scheduledTime).getTime() -
            new Date(b.scheduledTime).getTime()
        );

        setUpcomingSchedules(allSchedules);
        return allSchedules;
      } catch (error) {
        console.error("Error fetching upcoming schedules:", error);
        setSchedulesError("Không thể tải lịch sắp tới");
        return [];
      } finally {
        setSchedulesLoading(false);
      }
    },
    []
  );

  /**
   * Complete an activity
   */
  const completeActivity = useCallback(async (activityId: number) => {
    try {
      await activityService.completeActivity(activityId);

      // Update activities list
      setRecentActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? { ...activity, completed: true }
            : activity
        )
      );

      return true;
    } catch (error) {
      console.error(`Error completing activity ${activityId}:`, error);
      return false;
    }
  }, []);

  /**
   * Mark watering schedule as completed
   */
  const completeWateringSchedule = useCallback(async (scheduleId: number) => {
    try {
      await wateringService.completeWateringSchedule(scheduleId);

      // Remove from upcoming schedules
      setUpcomingSchedules((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleId)
      );

      return true;
    } catch (error) {
      console.error(`Error completing watering schedule ${scheduleId}:`, error);
      return false;
    }
  }, []);

  /**
   * Skip a scheduled activity
   */
  const skipScheduledActivity = useCallback(async (scheduleId: number) => {
    try {
      await activityService.skipScheduledActivity(scheduleId);

      // Remove from upcoming schedules
      setUpcomingSchedules((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleId)
      );

      return true;
    } catch (error) {
      console.error(`Error skipping activity ${scheduleId}:`, error);
      return false;
    }
  }, []);

  /**
   * Load both activities and schedules for a garden
   */
  const loadActivitiesAndSchedules = useCallback(
    async (gardenId: number | null) => {
      if (gardenId === null) {
        setRecentActivities([]);
        setUpcomingSchedules([]);
        return;
      }

      try {
        await Promise.all([
          fetchRecentActivities(gardenId),
          fetchUpcomingSchedules(gardenId),
        ]);
      } catch (error) {
        console.error("Error loading activities and schedules:", error);
      }
    },
    [fetchRecentActivities, fetchUpcomingSchedules]
  );

  return {
    // Data
    recentActivities,
    upcomingSchedules,

    // Status
    activitiesLoading,
    schedulesLoading,
    activitiesError,
    schedulesError,

    // Functions
    fetchRecentActivities,
    fetchUpcomingSchedules,
    loadActivitiesAndSchedules,
    completeActivity,
    completeWateringSchedule,
    skipScheduledActivity,
  };
}
