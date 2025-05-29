import apiClient from "../apiClient";
import { TASK_ENDPOINTS } from "../endpoints";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  GetTasksQueryDto,
  PaginatedTaskResult,
} from "@/types";

/**
 * Task Service
 *
 * Handles all task-related API calls aligned with the new backend structure.
 * Uses the updated API endpoints defined in the TaskController.
 */
class TaskService {
  /**
   * Retrieves a paginated list of tasks with optional filters.
   * 
   * @param query Optional filtering and pagination parameters (gardenerId, gardenId, status, etc.)
   * @returns A paginated list of tasks with metadata
   */
  async getTasks(query?: GetTasksQueryDto): Promise<PaginatedTaskResult> {
    try {
      const response = await apiClient.get(TASK_ENDPOINTS.TASKS_BASE, { params: query });
      return response.data;
    } catch (error) {
      console.error('[TaskService] Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Retrieves a specific task by its ID.
   * 
   * @param taskId The ID of the task to retrieve
   * @returns The requested task data
   */
  async getTaskById(taskId: number | string): Promise<Task> {
    try {
      const response = await apiClient.get(TASK_ENDPOINTS.TASK_BY_ID(taskId));
      return response.data;
    } catch (error) {
      console.error(`[TaskService] Error fetching task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new task.
   * 
   * @param createTaskDto Data for creating a new task (gardenerId, gardenId, type, description, etc.)
   * @returns The newly created task
   */
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const response = await apiClient.post(TASK_ENDPOINTS.CREATE, createTaskDto);
      return response.data;
    } catch (error) {
      console.error('[TaskService] Error creating task:', error);
      throw error;
    }
  }

  /**
   * Updates an existing task.
   * 
   * @param taskId The ID of the task to update
   * @param updateTaskDto Data to update (can include status, description, dueDate, etc.)
   * @returns The updated task
   */
  async updateTask(
    taskId: number | string,
    updateTaskDto: UpdateTaskDto
  ): Promise<Task> {
    try {
      const response = await apiClient.put(TASK_ENDPOINTS.TASK_BY_ID(taskId), updateTaskDto);
      return response.data;
    } catch (error) {
      console.error(`[TaskService] Error updating task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a task.
   * 
   * @param taskId The ID of the task to delete
   */
  async deleteTask(taskId: number | string): Promise<void> {
    try {
      await apiClient.delete(TASK_ENDPOINTS.TASK_BY_ID(taskId));
    } catch (error) {
      console.error(`[TaskService] Error deleting task ${taskId}:`, error);
      throw error;
    }
  }
}

export default new TaskService();