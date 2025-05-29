/**
 * Task Types
 *
 * Type definitions for task-related data
 */

export enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
}

export interface Task {
  id: number;

  // Relations
  gardenerId: number;
  gardenId: number;

  // Plant information
  plantTypeName?: string;
  plantStageName?: string;

  // Task details
  type: string;
  description: string;
  dueDate: string; // ISO 8601 string (corresponds to Date on backend)
  status: TaskStatus;
  completedAt?: string; // ISO 8601 string (corresponds to Date on backend)

  // Timestamps
  createdAt: string; // ISO 8601 string (corresponds to Date on backend)
  updatedAt: string; // ISO 8601 string (corresponds to Date on backend)
}

export interface WateringSchedule {
  id: number;
  gardenId: number;

  // Schedule details
  scheduledAt: string;
  amount?: number;
  status: TaskStatus;

  notes?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

