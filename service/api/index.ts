/**
 * API Services Index
 *
 * Export all API services for easier imports
 */

import userService from "./user.service";
import gardenService from "./garden.service";
import sensorService from "./sensor.service";
import weatherService from "./weather.service";
import alertService from "./alert.service";
import communityService from "./community.service";
import activityService from "./activity.service";
import wateringService from "./watering.service";
import taskService from "./task.service";
import plantService from "./plant.service";
import authService from "./auth.service";

// Export services
export {
  userService,
  gardenService,
  sensorService,
  weatherService,
  alertService,
  activityService,
  wateringService,
  communityService,
  taskService,
  plantService,
  authService,
};

// Export types
export type { GardenWeatherData } from "./weather.service";
