/**
 * Activity Types
 *
 * Type definitions for garden activity-related data
 */

export enum ActivityType {
  PLANTING = "PLANTING", // Planting
  WATERING = "WATERING", // Watering
  FERTILIZING = "FERTILIZING", // Applying fertilizer
  PRUNING = "PRUNING", // Pruning branches
  HARVESTING = "HARVESTING", // Harvesting
  PEST_CONTROL = "PEST_CONTROL", // Pest and disease control
  SOIL_TESTING = "SOIL_TESTING", // Testing soil conditions
  WEEDING = "WEEDING", // Removing weeds
  OTHER = "OTHER", // Other unspecified activities
}

export enum EvaluatorType {
  USER = "USER", // Evaluation performed by the gardener
  SYSTEM = "SYSTEM", // Evaluation performed automatically by the system
}

export interface GardenActivity {
  id: number;

  // Relations
  gardenId: number;
  gardenerId: number;

  // Activity details
  name: string;
  activityType: ActivityType;
  timestamp: string;

  // Plant information
  plantName?: string;
  plantGrowStage?: string;

  // Weather and sensor data
  humidity?: number;
  temperature?: number;
  lightIntensity?: number;
  waterLevel?: number;
  rainfall?: number;
  soilMoisture?: number;
  soilPH?: number;

  // Activity execution
  details?: string;
  reason?: string;
  notes?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEvaluation {
  id: number;

  // Relations
  gardenActivityId: number;

  // Evaluator information
  evaluatorType: EvaluatorType;
  gardenerId?: number;
  userId?: number;

  // Sensor data at evaluation time
  humidity?: number;
  temperature?: number;
  lightIntensity?: number;
  waterLevel?: number;
  rainfall?: number;
  soilMoisture?: number;
  soilPH?: number;

  // Evaluation details
  evaluatedAt: string;
  outcome?: string;
  rating?: number;
  metrics?: any; // JSON object for metrics
  comments?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface PhotoEvaluation {
  id: number;

  // Relations
  taskId: number;
  gardenerId: number;

  // Plant information
  plantName?: string;
  plantGrowStage?: string;

  // Photo details
  photoUrl: string;
  aiFeedback?: string;
  confidence?: number;

  // User feedback
  userNotes?: string;

  // Timestamps
  evaluatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
