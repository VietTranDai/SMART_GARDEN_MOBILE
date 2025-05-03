/**
 * Garden DTOs
 *
 * Data Transfer Objects for garden-related API requests and responses
 */

import {GardenStatus, GardenType} from "@/types";

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
