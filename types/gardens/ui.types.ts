/**
 * Garden UI Types
 *
 * Type definitions for UI-specific garden and sensor data
 */

import { GardenStatus, GardenType } from "@/constants/database";

/**
 * Garden UI representation with additional display properties
 */
export interface GardenUI {
  id: number;
  name: string;
  type: GardenType;
  status: GardenStatus;
  cropName?: string;
  cropStage?: string;
  thumbnail: string;
  location: string;
  alerts: number;
  sensors: {
    temperature?: number;
    humidity?: number;
    soilMoisture?: number;
  };
  lastActivity: string;
}

/**
 * Sensor data UI representation with display properties
 */
export interface SensorDataUI {
  id: string;
  gardenId: number;
  gardenName: string;
  type: string;
  icon: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  timestamp: string;
}
