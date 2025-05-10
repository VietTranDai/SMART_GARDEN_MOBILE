/**
 * Garden DTOs
 *
 * Data Transfer Objects for garden-related API requests and responses
 */

import { GardenStatus, GardenType } from "@/types";

/**
 * DTO for creating a new garden
 */
export interface CreateGardenDto {
  name: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  lat?: number;
  lng?: number;
  type: GardenType;
  plantName?: string;
  plantGrowStage?: string;
  plantStartDate?: string;
  plantDuration?: number;
}

/**
 * DTO for updating an existing garden
 */
export interface UpdateGardenDto {
  name?: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  lat?: number;
  lng?: number;
  type?: GardenType;
  status?: GardenStatus;
  plantName?: string;
  plantGrowStage?: string;
  plantStartDate?: string;
  plantDuration?: number;
}

/**
 * DTO for garden display with UI-specific properties
 */
export interface GardenDisplayDto {
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
  location: string; // Formatted location string

  // Ownership
  gardenerId: number;

  // Garden configuration
  type: GardenType;
  status: GardenStatus;

  sensorCount?: number;

  // UI related properties
  alertCount: number;
  sensorData: {
    temperature?: number;
    humidity?: number;
    soilMoisture?: number;
    light?: number;
  };
  isPinned: boolean;
  lastVisitedAt?: string;
  statusColor: string;
  isSelected?: boolean;
  daysUntilHarvest?: number;
  growthProgress?: number;

  // Plant information
  plantName?: string;
  plantGrowStage?: string;
  plantStartDate?: string;
  plantDuration?: number;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
