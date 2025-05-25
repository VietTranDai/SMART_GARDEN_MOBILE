import { useMemo } from "react";
import {
  ActivityDisplay,
  ScheduleDisplay,
} from "@/types/activities/activity.types";

export default function useActivityDisplay(
  gardenId: number | null,
  recentActivities: ActivityDisplay[] = [],
  upcomingSchedules: ScheduleDisplay[] = []
) {
  // Get activities for a specific garden with safety checks
  const filteredActivities = useMemo(() => {
    if (!gardenId || !Array.isArray(recentActivities)) {
      return [];
    }

    return recentActivities.filter(
      (activity) => activity && activity.gardenId === gardenId
    );
  }, [gardenId, recentActivities]);

  // Get schedules for a specific garden with safety checks
  const filteredSchedules = useMemo(() => {
    if (!gardenId || !Array.isArray(upcomingSchedules)) {
      return [];
    }

    return upcomingSchedules.filter(
      (schedule) => schedule && schedule.gardenId === gardenId
    );
  }, [gardenId, upcomingSchedules]);

  // Format activity time
  const formatActivityTime = (timestamp?: string | number) => {
    if (!timestamp) return "";

    try {
      const activityTime = new Date(timestamp);
      const now = new Date();

      // If it's today, just show the time
      if (activityTime.toDateString() === now.toDateString()) {
        return activityTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }

      // If it's within a week, show the day and time
      const diffMs = now.getTime() - activityTime.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 7) {
        return (
          activityTime.toLocaleDateString("vi-VN", {
            weekday: "short",
          }) +
          " " +
          activityTime.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      }

      // Otherwise, show the full date
      return activityTime.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "";
    }
  };

  // Get color for activity type
  const getActivityColor = (type?: string) => {
    if (!type) return "#8E8E93"; // Default gray

    const typeLower = type.toLowerCase();

    if (typeLower.includes("water")) {
      return "#007AFF"; // Blue for watering
    }

    if (typeLower.includes("fertilize")) {
      return "#34C759"; // Green for fertilizing
    }

    if (typeLower.includes("harvest")) {
      return "#FF9500"; // Orange for harvesting
    }

    if (typeLower.includes("plant")) {
      return "#5856D6"; // Purple for planting
    }

    if (typeLower.includes("prune")) {
      return "#FF2D55"; // Pink for pruning
    }

    return "#8E8E93"; // Default gray
  };

  // Get icon for activity type
  const getActivityIcon = (type?: string) => {
    if (!type) return "leaf-outline";

    const typeLower = type.toLowerCase();

    if (typeLower.includes("water")) {
      return "water-outline";
    }

    if (typeLower.includes("fertilize")) {
      return "flask-outline";
    }

    if (typeLower.includes("harvest")) {
      return "basket-outline";
    }

    if (typeLower.includes("plant")) {
      return "leaf-outline";
    }

    if (typeLower.includes("prune")) {
      return "cut-outline";
    }

    return "leaf-outline";
  };

  // Format schedule time for display
  const formatScheduleTime = (time?: string) => {
    if (!time) return "";

    try {
      const scheduleTime = new Date(time);
      const now = new Date();

      // Calculate difference in days
      const isToday = scheduleTime.toDateString() === now.toDateString();

      // Tomorrow check
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const isTomorrow =
        scheduleTime.toDateString() === tomorrow.toDateString();

      // Format the time part
      const timeStr = scheduleTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      if (isToday) {
        return `Hôm nay, ${timeStr}`;
      }

      if (isTomorrow) {
        return `Ngày mai, ${timeStr}`;
      }

      // If it's within a week
      const diffMs = scheduleTime.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 7) {
        return (
          scheduleTime.toLocaleDateString("vi-VN", {
            weekday: "long",
          }) + `, ${timeStr}`
        );
      }

      // Otherwise, show the full date
      return (
        scheduleTime.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) + `, ${timeStr}`
      );
    } catch (error) {
      return "";
    }
  };

  return {
    activities: filteredActivities,
    schedules: filteredSchedules,
    formatActivityTime,
    formatScheduleTime,
    getActivityColor,
    getActivityIcon,
    hasActivities: filteredActivities.length > 0,
    hasSchedules: filteredSchedules.length > 0,
  };
}
