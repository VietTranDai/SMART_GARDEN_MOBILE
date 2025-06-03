/**
 * Watering Schedules Types
 *
 * Type definitions for watering schedules and AI decision models
 */

// Core Watering Schedule Types
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
  scheduledAt: Date;
  amount?: number;
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

// Watering Decision Request DTO - Updated to match backend
export interface WateringDecisionRequestDto {
  wateringTime?: Date | string;
  notes?: string;
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
