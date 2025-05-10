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
  dueDate: string;
  status: TaskStatus;
  completedAt?: string;

  // Optional relation
  wateringScheduleId?: number;

  // Metadata
  notes?: string;

  // Photo evaluation count
  photoEvaluationsCount?: number;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
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

