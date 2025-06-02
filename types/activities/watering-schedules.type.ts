/**
 * Watering Schedules Types
 *
 * Type definitions for watering schedules and AI decision models
 */

// Watering Schedule Types
export interface WateringSchedule {
  id: number;
  gardenId: number;
  scheduledAt: Date | string;
  amount?: number;
  reason?: string;
  status: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateWateringSchedule {
  gardenId: number;
  scheduledAt: Date | string;
  amount?: number;
  notes?: string;
}

export interface UpdateWateringSchedule {
  scheduledAt?: Date | string;
  amount?: number;
  status?: string;
  notes?: string;
}

// Sensor Data Types for AI Model
export interface SensorDataForRequestModelAIDto {
  soil_moisture: number;
  air_humidity: number;
  temperature: number;
  light_intensity: number;
  water_level: number;
} 

// Watering Decision Model Types
export interface WateringDecision {
  decision: string;
  confidence: number;
  reasons: string[];
  recommended_amount: number;
  sensor_data: SensorDataForRequestModelAIDto;
  timestamp: Date | string;
}

export interface CreateWateringDecision {
  sensorData: SensorDataForRequestModelAIDto;
  notes?: string;
}

export interface WateringStats {
  gardenId: number;
  totalDecisions: number;
  waterRecommendations: number;
  noWaterRecommendations: number;
  averageConfidence: number;
  averageWaterAmount: number;
  fromDate: Date | string;
  toDate: Date | string;
}

// Query parameter types
export interface WateringScheduleQueryParams {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface WateringStatsQueryParams {
  days?: number;
}

// Status enums
export enum WateringScheduleStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
  CANCELLED = "CANCELLED",
}

export enum WateringDecisionType {
  WATER_NOW = "water_now",
  NO_WATER = "no_water",
  CHECK_LATER = "check_later",
}
