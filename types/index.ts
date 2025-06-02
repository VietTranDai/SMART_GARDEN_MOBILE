/**
 * Types Index
 *
 * Export all types from the types directory
 */

// Export user and auth-related types
export * from "./users";
export * from "./users/user.types";

// Export garden-related types
export * from "./gardens";
export * from "./gardens/sensor.types";
export * from "./gardens/sensor-dtos";
export * from "./gardens/sensor-statistics.types";

// Export weather-related types
export * from "./weather";
export * from "./weather/weather.types";

// Export-plant-related types
export * from "./plants";

// Export essential activity and task-related types
export * from "./activities/activity.types";
export * from "./activities/task.types";
export * from "./activities/dtos";
// Note: Import watering schedules and photo evaluations types directly from their files

// Export social-related types
export * from "./social";

// Export-location-related types
export * from "./locations";
