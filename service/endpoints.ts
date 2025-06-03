/**
 * API Endpoints
 *
 * Centralized location for all API endpoints used in the application.
 * This makes it easier to maintain URLs and version them.
 */

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
};

// User endpoints
export const USER_ENDPOINTS = {
  ME: "/user/me",
  UPDATE_PROFILE: "/user/profile",
  CHANGE_PASSWORD: "/user/change-password",
  GARDENER_PROFILE: (gardenerId: string | number) => `/gardeners/${gardenerId}`,
  EXPERIENCE_PROGRESS: "/user/me/experience-progress",
};

// Garden endpoints
export const GARDEN_ENDPOINTS = {
  LIST: "/gardens/me",
  DETAIL: (gardenId: string | number) => `/gardens/me/${gardenId}`,
  CREATE: "/gardens/me",
  UPDATE: (gardenId: string | number) => `/gardens/me/${gardenId}`,
  DELETE: (gardenId: string | number) => `/gardens/me/${gardenId}`,
  ADVICE: (gardenId: string | number) => `/advice/garden/${gardenId}`,
  PLANT_DETAILS: (gardenId: string | number) =>
    `/gardens/me/${gardenId}/plant-details`,
  PHOTOS: (gardenId: string | number) => `/gardens/me/${gardenId}/photos`,
  SENSOR_HISTORY: (gardenId: string | number, days: number = 7) =>
    `/gardens/me/${gardenId}/sensor-history?days=${days}`,
  PLANT_STATISTICS: (gardenId: string | number) =>
    `/gardens/${gardenId}/plant-statistics`,
  PLANT_ADVICE: (gardenId: string | number) =>
    `/gardens/${gardenId}/plant-advice`,
  CALENDAR: (gardenId: string | number) => `/gardener-calendar/${gardenId}`,
};

// Plant endpoints
export const PLANT_ENDPOINTS = {
  LIST: "/plants",
  TYPES: "/plants/types",
  ADD: "/plants",
  DETAIL: (id: string | number) => `/plants/${id}`,
  GROWTH_STAGES: (plantId: string | number) =>
    `/plants/${plantId}/growth-stages`,
  GROWTH_STAGE_DETAIL: (plantId: string | number, stageId: string | number) =>
    `/plants/${plantId}/growth-stages/${stageId}`,
  BY_GARDEN: (gardenId: string | number) => `/gardens/${gardenId}/plants`,
  GARDEN_PLANT_DETAIL: (gardenId: string | number, plantId: string | number) =>
    `/gardens/${gardenId}/plants/${plantId}`,
  CREATE_FOR_GARDEN: (gardenId: string | number) =>
    `/gardens/${gardenId}/plants`,
  UPDATE_GARDEN_PLANT: (gardenId: string | number, plantId: string | number) =>
    `/gardens/${gardenId}/plants/${plantId}`,
  DELETE_GARDEN_PLANT: (gardenId: string | number, plantId: string | number) =>
    `/gardens/${gardenId}/plants/${plantId}`,
};

// Sensor endpoints
export const SENSOR_ENDPOINTS = {
  LIST_BY_GARDEN: (gardenId: string | number) => `/sensors/gardens/${gardenId}`,
  DETAIL: (sensorId: string | number) => `/sensors/${sensorId}`,
  CREATE: (gardenId: string | number) => `/sensors/gardens/${gardenId}`,
  DELETE: (sensorId: string | number) => `/sensors/${sensorId}`,
  SENSOR_DATA: (sensorId: string | number) => `/sensors/${sensorId}/data`,
  GARDEN_SENSOR_DATA: (gardenId: string | number) =>
    `/sensors/gardens/${gardenId}/data`,
  LATEST_READINGS_BY_GARDEN: (gardenId: string | number) =>
    `/sensors/gardens/${gardenId}/latest`,
  STATISTICS: (sensorId: string | number) =>
    `/sensor-statistics/${sensorId}/statistics`,
  ANALYTICS: (sensorId: string | number) =>
    `/sensor-statistics/${sensorId}/analytics`,
  list: "/api/sensors",
  gardenData: (gardenId: number) => `/api/gardens/${gardenId}/sensors/data`,
  readings: (sensorId: number) => `/api/sensors/${sensorId}/readings`,
  addReading: (sensorId: number) => `/api/sensors/${sensorId}/readings`,
};

// Task endpoints
export const TASK_ENDPOINTS = {
  TASKS_BASE: "/tasks", // GET all tasks (with query params for filtering)
  TASK_BY_ID: (taskId: string | number) => `/tasks/${taskId}`, // GET, PUT, DELETE specific task
  CREATE: "/tasks", // POST new task
};

// Activity endpoints
export const ACTIVITY_ENDPOINTS = {
  LIST_CREATE: "/activities", // GET for list (with query params), POST for create
  DETAIL: (activityId: string | number) => `/activities/${activityId}`, // GET for details
  ANALYSIS: (activityId: string | number) => `/activities/${activityId}/analysis`, // GET for analysis
  STATS: "/activities/stats", // GET for statistics
  // Removed old endpoints like LIST, LIST_BY_GARDEN, CREATE (as it's combined), EVALUATE
};

// Watering schedule endpoints
export const WATERING_ENDPOINTS = {
  LIST: "/watering-schedules",
  LIST_BY_GARDEN: (gardenId: string | number) =>
    `/watering-schedules/gardens/${gardenId}`,
  DETAIL: (scheduleId: string | number) => `/watering-schedules/${scheduleId}`,
  COMPLETE: (scheduleId: string | number) =>
    `/watering-schedules/${scheduleId}/complete`,
  SKIP: (scheduleId: string | number) =>
    `/watering-schedules/${scheduleId}/skip`,
  AUTO_GENERATE: (gardenId: string | number) =>
    `/watering-schedules/gardens/${gardenId}/auto`,
};

// Watering decision model endpoints
export const WATERING_DECISION_ENDPOINTS = {
  POST_DECISION: (gardenId: string | number) =>
    `/watering-decision/garden/${gardenId}`,
  STATS: (gardenId: string | number) =>
    `/watering-decision/garden/${gardenId}/stats`,
  TEST_AI: "/watering-decision/test-ai",
};

// Define the base API endpoints for community features
export const COMMUNITY_ENDPOINTS = {
  // Posts endpoints
  POSTS: "/community/posts",
  POSTS_FILTER: "/community/posts/filter",
  POST_DETAIL: (postId: string | number) => `/community/posts/${postId}`,
  POST_COMMENTS: (postId: string | number) =>
    `/community/posts/${postId}/comments`,
  POST_VOTE: (postId: string | number) => `/community/posts/${postId}/vote`,
  POSTS_SEARCH: "/community/posts/search",

  // Comments endpoints
  COMMENTS: "/community/comments",
  COMMENT_DETAIL: (commentId: string | number) =>
    `/community/comments/${commentId}`,
  COMMENT_VOTE: (commentId: string | number) =>
    `/community/comments/${commentId}/vote`,

  // Tags endpoints
  TAGS: "/community/tags",
  TAGS_POPULAR: "/community/tags/popular",
  TAGS_SEARCH: "/community/tags/search",

  // Follow system endpoints
  FOLLOWERS: (gardenerId: string | number) => `/follow/followers/${gardenerId}`,
  FOLLOWING: (gardenerId: string | number) => `/follow/following/${gardenerId}`,
  FOLLOW_USER: (gardenerId: string | number) => `/follow/${gardenerId}`,
  UNFOLLOW_USER: (gardenerId: string | number) => `/follow/${gardenerId}`,
};

// Weather endpoints
export const WEATHER_ENDPOINTS = {
  CURRENT: (gardenId: string | number) => `/weather/garden/${gardenId}/current`,
  HOURLY_FORECAST: (gardenId: string | number) =>
    `/weather/garden/${gardenId}/hourly`,
  DAILY_FORECAST: (gardenId: string | number) =>
    `/weather/garden/${gardenId}/daily`,
  HISTORICAL: (gardenId: string | number) =>
    `/weather/garden/${gardenId}/historical`,
  GARDEN_WEATHER: (gardenId: string | number) => `/weather/garden/${gardenId}`,
};

// Alert endpoints
export const ALERT_ENDPOINTS = {
  ALERTS: "/alerts",
  ALERTS_BY_GARDEN: (gardenId: string | number) => `/alerts/garden/${gardenId}`,
  ALERT_DETAIL: (alertId: string | number) => `/alerts/${alertId}`,
  RESOLVE_ALERT: (alertId: string | number) => `/alerts/${alertId}/resolve`,
};

// Photo evaluation endpoints
export const PHOTO_EVALUATION_ENDPOINTS = {
  LIST: "/photo-evaluations", // GET với query params (page, limit)
  LIST_BY_GARDEN: (gardenId: string | number) =>
    `/photo-evaluations/garden/${gardenId}`, // GET với query params (page, limit)
  DETAIL: (photoId: string | number) => `/photo-evaluations/${photoId}`, // GET
  CREATE: "/photo-evaluations", // POST với FormData
  UPDATE: (photoId: string | number) => `/photo-evaluations/${photoId}`, // PUT
  DELETE: (photoId: string | number) => `/photo-evaluations/${photoId}`, // DELETE
  STATS: "/photo-evaluations/stats", // GET thống kê
};

// Photo endpoints (garden photos)
export const PHOTO_ENDPOINTS = {
  LIST_BY_GARDEN: (gardenId: string | number) =>
    `/photo-evaluations/garden/${gardenId}`,
  DETAIL: (photoId: string | number) => `/photo-evaluations/${photoId}`,
  UPLOAD: (gardenId: string | number) =>
    `/photo-evaluations/garden/${gardenId}/upload`,
};

// Combine all endpoints for easier imports
export default {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  GARDEN: GARDEN_ENDPOINTS,
  PLANT: PLANT_ENDPOINTS,
  SENSOR: SENSOR_ENDPOINTS,
  TASK: TASK_ENDPOINTS,
  ACTIVITY: ACTIVITY_ENDPOINTS,
  WATERING: WATERING_ENDPOINTS,
  WATERING_DECISION: WATERING_DECISION_ENDPOINTS,
  COMMUNITY: COMMUNITY_ENDPOINTS,
  WEATHER: WEATHER_ENDPOINTS,
  ALERT: ALERT_ENDPOINTS,
  PHOTO: PHOTO_ENDPOINTS,
  PHOTO_EVALUATION: PHOTO_EVALUATION_ENDPOINTS,
};
