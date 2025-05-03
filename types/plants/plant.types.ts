/**
 * Plant Types
 *
 * Type definitions for plant-related data
 */

export interface PlantType {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;

  // Relation data
  plants?: Plant[];
}

export interface Plant {
  id: number;

  // Plant type relation
  plantTypeId?: number;
  plantType?: PlantType;

  // Botanical information
  name: string;
  scientificName?: string;
  family?: string;

  // Description and growth details
  description?: string;
  growthDuration?: number; // in days

  // UI elements
  imageUrl?: string;
  thumbnailUrl?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Relation data
  growthStages?: GrowthStage[];
}

export interface GrowthStage {
  id: number;

  // Plant relation
  plantId: number;

  // Stage details
  stageName: string;
  order: number;
  duration: number; // in days
  description?: string;

  // Optimal growing conditions
  optimalTemperatureMin: number;
  optimalTemperatureMax: number;
  optimalHumidityMin: number;
  optimalHumidityMax: number;
  optimalPHMin?: number;
  optimalPHMax?: number;
  optimalLightMin?: number;
  optimalLightMax?: number;

  // Care requirements
  lightRequirement?: string;
  waterRequirement?: string;
  nutrientRequirement?: string;
  careInstructions?: string;
  pestSusceptibility?: string;

  // UI elements
  imageUrl?: string;
  iconUrl?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
