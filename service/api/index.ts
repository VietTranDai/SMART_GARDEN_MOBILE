/**
 * API Services Index
 *
 * Export all API services for easier imports
 */

import gardenService from "./garden.service";
import sensorService from "./sensor.service";
import plantService from "./plant.service";
import taskService from "./task.service";
import communityService from "./community.service";
import weatherService from "./weather.service";
import userService from "./user.service";
import authService from "./auth.service";

export {
  gardenService,
  sensorService,
  plantService,
  taskService,
  communityService,
  weatherService,
  userService,
  authService,
};

// Also export types
export * from "./garden.service";
export * from "./sensor.service";
export * from "./plant.service";
export * from "./task.service";
export * from "./community.service";
export * from "./weather.service";
export * from "./user.service";
export * from "./auth.service";
