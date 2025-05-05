import apiClient from "../apiClient";

import { TASK_ENDPOINTS } from "../endpoints";
import {
  CreateTaskDto,
  UpdateTaskDto,
  PhotoEvaluation,
  Task,
  TaskStatus,
} from "@/types";

/**
 * Task Service
 *
 * Handles all task-related API calls
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
    const response = await apiClient.get(TASK_ENDPOINTS.LIST, { params });
    return response.data.data;
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
      TASK_ENDPOINTS.LIST_BY_GARDEN(gardenId),
      {
        params,
      }
    );
    return response.data.data;
  }

  /**
   * Get task by ID
   * @param taskId Task ID
   * @returns Task details
   */
  async getTaskById(taskId: number | string): Promise<Task> {
    const response = await apiClient.get(TASK_ENDPOINTS.DETAIL(taskId));
    return response.data.data;
  }

  /**
   * Create a new task
   * @param taskData Task creation data
   * @returns Created task
   */
  async createTask(taskData: CreateTaskDto): Promise<Task> {
    const response = await apiClient.post(TASK_ENDPOINTS.CREATE, taskData);
    return response.data.data;
  }

  /**
   * Create a task for a specific garden
   * @param gardenId Garden ID
   * @param taskData Task creation data
   * @returns Created task
   */
  async createTaskForGarden(
    gardenId: number | string,
    taskData: CreateTaskDto
  ): Promise<Task> {
    const response = await apiClient.post(
      TASK_ENDPOINTS.CREATE_FOR_GARDEN(gardenId),
      taskData
    );
    return response.data.data;
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
      TASK_ENDPOINTS.DETAIL(taskId),
      taskData
    );
    return response.data.data;
  }

  /**
   * Delete a task
   * @param taskId Task ID
   */
  async deleteTask(taskId: number | string): Promise<void> {
    await apiClient.delete(TASK_ENDPOINTS.DELETE(taskId));
  }

  /**
   * Mark a task as completed
   * @param taskId Task ID
   * @returns Updated task
   */
  async completeTask(taskId: number | string): Promise<Task> {
    const response = await apiClient.post(TASK_ENDPOINTS.COMPLETE(taskId));
    return response.data.data;
  }

  /**
   * Mark a task as skipped
   * @param taskId Task ID
   * @returns Updated task
   */
  async skipTask(taskId: number | string): Promise<Task> {
    const response = await apiClient.post(TASK_ENDPOINTS.SKIP(taskId));
    return response.data.data;
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
    return response.data.data;
  }
}

export default new TaskService();
