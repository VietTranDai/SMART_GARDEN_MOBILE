// This file contains enums and constants that match the database schema

// Garden type enum
export enum GardenType {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  BALCONY = "BALCONY",
  ROOFTOP = "ROOFTOP",
  WINDOW_SILL = "WINDOW_SILL",
}

// Garden status enum
export enum GardenStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  ARCHIVED = "ARCHIVED",
}

// Activity type enum
export enum ActivityType {
  WATERING = "WATERING",
  FERTILIZING = "FERTILIZING",
  PRUNING = "PRUNING",
  HARVESTING = "HARVESTING",
  PLANTING = "PLANTING",
  PEST_CONTROL = "PEST_CONTROL",
  SOIL_PREPARATION = "SOIL_PREPARATION",
  WEEDING = "WEEDING",
  OTHER = "OTHER",
}

// Task status enum
export enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
}

// Sensor type enum
export enum SensorType {
  TEMPERATURE = "TEMPERATURE",
  HUMIDITY = "HUMIDITY",
  SOIL_MOISTURE = "SOIL_MOISTURE",
  LIGHT = "LIGHT",
  WATER_LEVEL = "WATER_LEVEL",
  RAINFALL = "RAINFALL",
  SOIL_PH = "SOIL_PH",
}

// Alert type enum
export enum AlertType {
  MOISTURE = "MOISTURE",
  TEMPERATURE = "TEMPERATURE",
  PEST = "PEST",
  WATERING = "WATERING",
  LIGHT = "LIGHT",
  HUMIDITY = "HUMIDITY",
  NUTRIENT = "NUTRIENT",
  WEATHER = "WEATHER",
  SENSOR_ERROR = "SENSOR_ERROR",
  SYSTEM = "SYSTEM",
  PLANT_CONDITION = "PLANT_CONDITION",
  ACTIVITY = "ACTIVITY",
  MAINTENANCE = "MAINTENANCE",
  SECURITY = "SECURITY",
  OTHER = "OTHER",
}

// Alert status enum
export enum AlertStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
  IGNORED = "IGNORED",
  IN_PROGRESS = "IN_PROGRESS",
  ESCALATED = "ESCALATED",
}

// Notification method enum
export enum NotificationMethod {
  PUSH = "PUSH",
  EMAIL = "EMAIL",
  SMS = "SMS",
  IN_APP = "IN_APP",
}
