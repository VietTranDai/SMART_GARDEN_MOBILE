import apiClient from "../apiClient";

import { TASK_ENDPOINTS } from "../endpoints";
import {
  CreateTaskDto,
  UpdateTaskDto,
  PhotoEvaluation,
  GardenActivity,
  CreateActivityDto,
  CreateEvaluationDto,
  ActivityEvaluation,
  ActivityType,
  Task,
  TaskStatus,
  WateringSchedule,
} from "@/types";
/**
 * Task Service
 *
 * Handles all task and activity-related API calls
 */
class TaskService {
  /**
   * Get tasks for the current user
   * @param params Query parameters
   * @returns List of tasks
   */
  async getTasks(params?: {
    status?: TaskStatus;
    dueDate?: string;
  }): Promise<Task[]> {
    const response = await apiClient.get(TASK_ENDPOINTS.TASKS, { params });
    return response.data;
  }

  /**
   * Get tasks for a specific garden
   * @param gardenId Garden ID
   * @param params Query parameters
   * @returns List of tasks for the garden
   */
  async getTasksByGarden(
    gardenId: number | string,
    params?: { status?: TaskStatus; dueDate?: string }
  ): Promise<Task[]> {
    const response = await apiClient.get(
      TASK_ENDPOINTS.TASKS_BY_GARDEN(gardenId),
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Get task by ID
   * @param taskId Task ID
   * @returns Task details
   */
  async getTaskById(taskId: number | string): Promise<Task> {
    const response = await apiClient.get(TASK_ENDPOINTS.TASK_DETAIL(taskId));
    return response.data;
  }

  /**
   * Create a new task
   * @param taskData Task creation data
   * @returns Created task
   */
  async createTask(taskData: CreateTaskDto): Promise<Task> {
    const response = await apiClient.post(TASK_ENDPOINTS.TASKS, taskData);
    return response.data;
  }

  /**
   * Update a task
   * @param taskId Task ID
   * @param taskData Task update data
   * @returns Updated task
   */
  async updateTask(
    taskId: number | string,
    taskData: UpdateTaskDto
  ): Promise<Task> {
    const response = await apiClient.patch(
      TASK_ENDPOINTS.TASK_DETAIL(taskId),
      taskData
    );
    return response.data;
  }

  /**
   * Mark a task as completed
   * @param taskId Task ID
   * @returns Updated task
   */
  async completeTask(taskId: number | string): Promise<Task> {
    const response = await apiClient.post(TASK_ENDPOINTS.COMPLETE_TASK(taskId));
    return response.data;
  }

  /**
   * Mark a task as skipped
   * @param taskId Task ID
   * @returns Updated task
   */
  async skipTask(taskId: number | string): Promise<Task> {
    const response = await apiClient.post(TASK_ENDPOINTS.SKIP_TASK(taskId));
    return response.data;
  }

  /**
   * Upload a photo for a task (photo evaluation)
   * @param taskId Task ID
   * @param photoData Form data with photo
   * @returns Photo evaluation
   */
  async uploadTaskPhoto(
    taskId: number | string,
    photoData: FormData
  ): Promise<PhotoEvaluation> {
    const response = await apiClient.post(
      TASK_ENDPOINTS.UPLOAD_PHOTO(taskId),
      photoData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

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
    const response = await apiClient.get(TASK_ENDPOINTS.ACTIVITIES, { params });
    return response.data;
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
    const response = await apiClient.get(
      TASK_ENDPOINTS.ACTIVITIES_BY_GARDEN(gardenId),
      { params }
    );
    return response.data;
  }

  /**
   * Get activity by ID
   * @param activityId Activity ID
   * @returns Activity details
   */
  async getActivityById(activityId: number | string): Promise<GardenActivity> {
    const response = await apiClient.get(
      TASK_ENDPOINTS.ACTIVITY_DETAIL(activityId)
    );
    return response.data;
  }

  /**
   * Create a new activity
   * @param activityData Activity creation data
   * @returns Created activity
   */
  async createActivity(
    activityData: CreateActivityDto
  ): Promise<GardenActivity> {
    const response = await apiClient.post(
      TASK_ENDPOINTS.ACTIVITIES,
      activityData
    );
    return response.data;
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
  ): Promise<ActivityEvaluation> {
    const response = await apiClient.post(
      TASK_ENDPOINTS.EVALUATE_ACTIVITY(activityId),
      evaluationData
    );
    return response.data;
  }

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
    const response = await apiClient.get(TASK_ENDPOINTS.WATERING_SCHEDULES, {
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
      TASK_ENDPOINTS.GARDEN_WATERING_SCHEDULES(gardenId),
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
    const response = await apiClient.get(
      TASK_ENDPOINTS.WATERING_SCHEDULE_DETAIL(scheduleId)
    );
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
      TASK_ENDPOINTS.GARDEN_WATERING_SCHEDULES(gardenId),
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
      TASK_ENDPOINTS.AUTO_GENERATE_SCHEDULE(gardenId)
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
      TASK_ENDPOINTS.COMPLETE_WATERING(scheduleId)
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
    const response = await apiClient.post(
      TASK_ENDPOINTS.SKIP_WATERING(scheduleId)
    );
    return response.data;
  }

  /**
   * Delete a watering schedule
   * @param scheduleId Schedule ID
   */
  async deleteWateringSchedule(scheduleId: number | string): Promise<void> {
    await apiClient.delete(TASK_ENDPOINTS.WATERING_SCHEDULE_DETAIL(scheduleId));
  }
}

export default new TaskService();
