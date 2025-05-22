/**
 * Garden Types
 *
 * Type definitions for garden-related data
 */
import { Gardener } from "../users/user.types";

export enum GardenStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum GardenType {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  BALCONY = "BALCONY",
  ROOFTOP = "ROOFTOP",
  WINDOW_SILL = "WINDOW_SILL",
}

export interface Garden {
  id: number;
  gardenKey: string;

  name: string;
  profilePicture?: string;
  description?: string;

  // Location information
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  lat?: number;
  lng?: number;

  // Ownership
  gardenerId: number;
  gardener?: Gardener;

  // Garden configuration
  type: GardenType;
  status: GardenStatus;

  sensorCount?: number;

  // Plant information
  plantName?: string;
  plantGrowStage?: string;
  plantStartDate?: string;
  plantDuration?: number;

  daysUntilHarvest: number;
  growthProgress: number;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for garden advice data
 */
export interface GardenAdvice {
  id: number;
  gardenId: number;
  category: string;
  priority: number;
  action: string;
  description: string;
  reason: string;
  suggestedTime: string;
  createdAt: string;
  updatedAt?: string;
  completed?: boolean;
  thumbnail?: string;
}

/**
 * Interface for garden plant details with growth stage information
 */
export interface GardenPlantDetails {
  plantId: number;
  name: string;
  scientificName?: string;
  family?: string;
  description?: string;
  growthDuration: number;
  currentGrowthStage: GardenGrowthStage;
  nextGrowthStage?: GardenGrowthStage;
  growthStages: GardenGrowthStage[];
  daysSincePlanting: number;
  daysUntilHarvest: number;
  growthProgress: number;
  imageUrl?: string;
  waterRequirement?: string;
  lightRequirement?: string;
  plantedAt?: string;
  expectedHarvestDate?: string;
  plantVariety?: string;
}

/**
 * Interface for garden growth stage information
 */
export interface GardenGrowthStage {
  id: number;
  plantId: number;
  stageName: string;
  order: number;
  duration: number;
  description?: string;
  optimalTemperatureMin: number;
  optimalTemperatureMax: number;
  optimalHumidityMin: number;
  optimalHumidityMax: number;
  optimalSoilMoistureMin: number;
  optimalSoilMoistureMax: number;
  optimalPHMin?: number;
  optimalPHMax?: number;
  optimalLightMin?: number;
  optimalLightMax?: number;
  lightRequirement?: string;
  waterRequirement?: string;
  nutrientRequirement?: string;
  careInstructions?: string;
  pestSusceptibility?: string;
  imageUrl?: string;
  iconUrl?: string;
}

/**
 * Interface for garden photo evaluations
 */
export interface GardenPhoto {
  id: number;
  gardenId: number;
  taskId?: number;
  gardenerId: number;
  photoUrl: string;
  thumbnailUrl?: string;
  plantName?: string;
  plantGrowStage?: string;
  aiFeedback?: string;
  confidence?: number;
  notes?: string;
  evaluatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for sensor history data
 */
export interface SensorHistory {
  sensorId: number;
  sensorType: string;
  sensorName: string;
  unit: string;
  data: SensorHistoryPoint[];
}

/**
 * Interface for a single sensor history data point
 */
export interface SensorHistoryPoint {
  timestamp: string;
  value: number;
}

/**
 * Interface for the complete garden detail data
 */
export interface GardenDetailData {
  garden: Garden;
  plantDetails?: GardenPlantDetails;
  photos: GardenPhoto[];
  sensorHistory: Record<string, SensorHistory>;
  tasks: any[];
  activities: any[];
  alerts: any[];
  wateringSchedules: any[];
  weather: any;
}
