import apiClient from "../apiClient";
import { GARDEN_ENDPOINTS } from "../endpoints";
import {
  GardenActivityCalendarDto,
  RecentActivityDto,
  UpcomingTaskDto,
  WateringScheduleDto,
  ActivityType,
  TaskStatus,
  TaskPriority,
  ACTIVITY_TYPE_DISPLAY_MAP,
  TASK_PRIORITY_DISPLAY_MAP,
  ActivityTypeDisplayInfo,
  TaskPriorityDisplayInfo,
} from "@/types/gardens/garden-calendar.types";

/**
 * Garden Calendar Service
 *
 * Handles all garden calendar-related API calls and utility functions
 * Provides comprehensive calendar functionality including activities, tasks, and schedules
 */

class GardenCalendarService {
  /**
   * Get garden calendar data by garden ID
   * @param gardenId Garden ID to get calendar data for
   * @returns Garden calendar data with activities, tasks, and schedules
   */
  async getGardenCalendar(
    gardenId: number | string
  ): Promise<GardenActivityCalendarDto | null> {
    try {
      const response = await apiClient.get(GARDEN_ENDPOINTS.CALENDAR(gardenId));
      
      if (!response || !response.data) {
        console.warn(`No calendar data returned for garden ${gardenId}`);
        return null;
      }

      const calendarData = response.data.data;
      
      if (!calendarData) {
        console.warn(`Calendar data is null for garden ${gardenId}`);
        return null;
      }

      // Process and normalize the calendar data
      const processedData = this.processCalendarData(calendarData);

      return processedData;
    } catch (error) {
      console.error(`Error fetching calendar for garden ${gardenId}:`, error);
      return null;
    }
  }

  /**
   * Process and normalize calendar data from API response
   * @param rawData Raw calendar data from API
   * @returns Processed calendar data with normalized dates and enhanced information
   */
  private processCalendarData(
    rawData: GardenActivityCalendarDto
  ): GardenActivityCalendarDto {
    return {
      ...rawData,
      recentActivities: rawData.recentActivities.map((activity) => ({
        ...activity,
        timestamp: this.normalizeDate(activity.timestamp),
      })),
      upcomingTasks: rawData.upcomingTasks.map((task) => ({
        ...task,
        dueDate: this.normalizeDate(task.dueDate),
      })),
      upcomingWateringSchedules: rawData.upcomingWateringSchedules.map(
        (schedule) => ({
          ...schedule,
          scheduledTime: this.normalizeDate(schedule.scheduledTime),
          createdAt: this.normalizeDate(schedule.createdAt),
          updatedAt: this.normalizeDate(schedule.updatedAt),
        })
      ),
    };
  }

  /**
   * Normalize date from string to Date object
   * @param dateValue Date string or Date object
   * @returns Date object or original value if invalid
   */
  private normalizeDate(dateValue: Date | string): Date | string {
    if (typeof dateValue === "string") {
      try {
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? dateValue : parsed;
      } catch (error) {
        console.warn("Invalid date format:", dateValue);
        return dateValue;
      }
    }
    return dateValue;
  }

  /**
   * Get activity type display information
   * @param activityType Activity type enum
   * @returns Display information for the activity type
   */
  getActivityTypeDisplay(activityType: ActivityType): ActivityTypeDisplayInfo {
    return (
      ACTIVITY_TYPE_DISPLAY_MAP[activityType] ||
      ACTIVITY_TYPE_DISPLAY_MAP["OTHER"]
    );
  }

  /**
   * Get task priority display information
   * @param priority Task priority level
   * @returns Display information for the priority level
   */
  getTaskPriorityDisplay(priority: TaskPriority): TaskPriorityDisplayInfo {
    return (
      TASK_PRIORITY_DISPLAY_MAP[priority] ||
      TASK_PRIORITY_DISPLAY_MAP["LOW"]
    );
  }

  /**
   * Format activity timestamp for display
   * @param timestamp Activity timestamp
   * @param format Display format ('relative' | 'full' | 'time')
   * @returns Formatted timestamp string
   */
  formatActivityTimestamp(
    timestamp: Date | string,
    format: "relative" | "full" | "time" = "relative"
  ): string {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        return "Không xác định";
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      switch (format) {
        case "relative":
          if (diffMinutes < 1) return "Vừa xong";
          if (diffMinutes < 60) return `${diffMinutes} phút trước`;
          if (diffHours < 24) return `${diffHours} giờ trước`;
          if (diffDays < 7) return `${diffDays} ngày trước`;
          return date.toLocaleDateString("vi-VN");

        case "time":
          return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });

        case "full":
        default:
          return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
      }
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Không xác định";
    }
  }

  /**
   * Format task due date with time remaining information
   * @param dueDate Task due date
   * @returns Formatted due date with urgency indication
   */
  formatTaskDueDate(dueDate: Date | string): {
    formatted: string;
    isOverdue: boolean;
    urgencyLevel: "critical" | "urgent" | "normal";
  } {
    try {
      const date = dueDate instanceof Date ? dueDate : new Date(dueDate);
      
      if (isNaN(date.getTime())) {
        return {
          formatted: "Không xác định",
          isOverdue: false,
          urgencyLevel: "normal",
        };
      }

      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      const isOverdue = diffMs < 0;
      let urgencyLevel: "critical" | "urgent" | "normal" = "normal";

      if (isOverdue) {
        urgencyLevel = "critical";
      } else if (diffHours < 24) {
        urgencyLevel = "critical";
      } else if (diffDays < 3) {
        urgencyLevel = "urgent";
      }

      let formatted: string;
      if (isOverdue) {
        const overdueDays = Math.abs(diffDays);
        formatted = `Quá hạn ${overdueDays} ngày`;
      } else if (diffHours < 24) {
        formatted = `Còn ${diffHours} giờ`;
      } else if (diffDays < 7) {
        formatted = `Còn ${diffDays} ngày`;
      } else {
        formatted = date.toLocaleDateString("vi-VN");
      }

      return { formatted, isOverdue, urgencyLevel };
    } catch (error) {
      console.error("Error formatting due date:", error);
      return {
        formatted: "Không xác định",
        isOverdue: false,
        urgencyLevel: "normal",
      };
    }
  }

  /**
   * Get task status display text
   * @param status Task status enum
   * @returns Vietnamese display text for task status
   */
  getTaskStatusText(status: TaskStatus): string {
    switch (status) {
      case "PENDING":
        return "Chờ thực hiện";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "OVERDUE":
        return "Quá hạn";
      default:
        return "Không xác định";
    }
  }

  /**
   * Calculate calendar summary statistics
   * @param calendarData Garden calendar data
   * @returns Enhanced summary with additional statistics
   */
  calculateCalendarSummary(calendarData: GardenActivityCalendarDto) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Calculate additional statistics
    const overdueTasks = calendarData.upcomingTasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return dueDate < now && task.status !== "COMPLETED";
    }).length;

    const todaysTasks = calendarData.upcomingTasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= startOfToday && dueDate <= endOfToday;
    }).length;

    const upcomingWatering = calendarData.upcomingWateringSchedules.filter(
      (schedule) => !schedule.isCompleted && !schedule.isSkipped
    ).length;

    return {
      ...calendarData.summary,
      overdueTasks,
      todaysTasks,
      upcomingWatering,
      lastActivityDate: calendarData.recentActivities[0]?.timestamp || null,
    };
  }

  /**
   * Filter activities by type
   * @param activities List of activities to filter
   * @param activityType Activity type to filter by
   * @returns Filtered activities
   */
  filterActivitiesByType(
    activities: RecentActivityDto[],
    activityType: ActivityType
  ): RecentActivityDto[] {
    return activities.filter(
      (activity) => activity.activityType === activityType
    );
  }

  /**
   * Sort tasks by priority and due date
   * @param tasks List of tasks to sort
   * @returns Sorted tasks (high priority and overdue first)
   */
  sortTasksByPriority(tasks: UpcomingTaskDto[]): UpcomingTaskDto[] {
    return [...tasks].sort((a, b) => {
      // First sort by overdue status
      if (a.timeRemaining.isOverdue !== b.timeRemaining.isOverdue) {
        return a.timeRemaining.isOverdue ? -1 : 1;
      }

      // Then by priority
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Finally by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  /**
   * Get upcoming watering schedules for today
   * @param schedules List of watering schedules
   * @returns Today's pending watering schedules
   */
  getTodaysWateringSchedules(
    schedules: WateringScheduleDto[]
  ): WateringScheduleDto[] {
    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    return schedules.filter((schedule) => {
      if (schedule.isCompleted || schedule.isSkipped) return false;
      
      const scheduleDate = new Date(schedule.scheduledTime);
      return scheduleDate >= startOfToday && scheduleDate <= endOfToday;
    });
  }
}

export default new GardenCalendarService();
