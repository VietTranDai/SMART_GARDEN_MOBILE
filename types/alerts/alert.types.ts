/**
 * Alert Types
 *
 * Type definitions for alert-related data
 */

export enum AlertType {
  WEATHER = "WEATHER", // Weather-related alerts (e.g., storms, heavy rain)
  SENSOR_ERROR = "SENSOR_ERROR", // Sensor malfunctions (e.g., failure, disconnection)
  SYSTEM = "SYSTEM", // System issues (e.g., power outage, software errors)
  PLANT_CONDITION = "PLANT_CONDITION", // Plant health issues (e.g., pests, water deficiency)
  ACTIVITY = "ACTIVITY", // Activity-related issues (e.g., overwatering, wrong fertilizing)
  MAINTENANCE = "MAINTENANCE", // Maintenance reminders (e.g., sensor or equipment check)
  SECURITY = "SECURITY", // Security concerns (e.g., intrusion, anomalies)
  OTHER = "OTHER", // Miscellaneous alerts not covered by other types
}

export enum AlertStatus {
  PENDING = "PENDING", // Alert is awaiting action
  IN_PROGRESS = "IN_PROGRESS", // Alert is being addressed
  RESOLVED = "RESOLVED", // Alert has been resolved
  IGNORED = "IGNORED", // Alert has been dismissed
  ESCALATED = "ESCALATED", // Alert has been escalated to a higher level
}

export enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface Alert {
  id: number;

  // Garden relationship (optional)
  gardenId?: number;
  gardenName?: string;

  // User relationship (mandatory)
  userId: number;

  // Alert details
  type: AlertType;
  message: string;
  suggestion?: string;

  // Status information
  status: AlertStatus;

  // Severity level
  severity?: Severity;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAlertDto {
  status?: AlertStatus;
  message?: string;
  suggestion?: string;
  severity?: Severity;
}
