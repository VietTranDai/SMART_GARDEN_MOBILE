import { ActivityType } from "./activity.types";
import { TaskStatus } from "./task.types";

export interface CreateTaskDto {
  gardenId: number;
  plantTypeName?: string;
  plantStageName?: string;
  type: string;
  description: string;
  dueDate: string;
  wateringScheduleId?: number;
}

export interface UpdateTaskDto {
  plantTypeName?: string;
  plantStageName?: string;
  type?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
}

export interface CreateActivityDto {
  gardenId: number;
  name: string;
  activityType: ActivityType;
  timestamp: string;
  plantName?: string;
  plantGrowStage?: string;
  humidity?: number;
  temperature?: number;
  lightIntensity?: number;
  waterLevel?: number;
  rainfall?: number;
  soilMoisture?: number;
  soilPH?: number;
  details?: string;
  reason?: string;
  notes?: string;
}

export interface CreateEvaluationDto {
  evaluatorType: "USER" | "SYSTEM";
  humidity?: number;
  temperature?: number;
  lightIntensity?: number;
  waterLevel?: number;
  rainfall?: number;
  soilMoisture?: number;
  soilPH?: number;
  outcome?: string;
  rating?: number;
  metrics?: Record<string, any>;
  comments?: string;
}
