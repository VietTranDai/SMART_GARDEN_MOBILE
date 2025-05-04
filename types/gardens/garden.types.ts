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

  // Plant information
  plantName?: string;
  plantGrowStage?: string;
  plantStartDate?: string;
  plantDuration?: number;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}
