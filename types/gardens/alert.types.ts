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

export enum NotificationMethod {
  EMAIL = "EMAIL", // Sent via email
  SMS = "SMS", // Sent via SMS
  PUSH = "PUSH", // Sent as a push notification
  IN_APP = "IN_APP", // Displayed in the app without notification
  NONE = "NONE", // No notification sent, only logged
}

export interface Alert {
  id: number;
  gardenId: number;

  // Alert details
  type: AlertType;
  message: string;
  suggestion?: string;
  timestamp: string;

  // Status information
  status: AlertStatus;
  notificationMethod?: NotificationMethod;

  // Severity level
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  // Metadata
  source?: string;
  sourceId?: string | number;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAlertDto {
  gardenId: number;
  type: AlertType;
  message: string;
  suggestion?: string;
  notificationMethod?: NotificationMethod;
}

export interface UpdateAlertDto {
  status?: AlertStatus;
  message?: string;
  suggestion?: string;
  notificationMethod?: NotificationMethod;
}
