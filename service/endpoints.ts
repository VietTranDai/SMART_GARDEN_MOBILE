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
  ADVICE: (gardenId: string | number) => `/gardens/me/${gardenId}/advice`,
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
  list: "/api/sensors",
  gardenData: (gardenId: number) => `/api/gardens/${gardenId}/sensors/data`,
  readings: (sensorId: number) => `/api/sensors/${sensorId}/readings`,
  addReading: (sensorId: number) => `/api/sensors/${sensorId}/readings`,
};

// Task endpoints
export const TASK_ENDPOINTS = {
  LIST: "/tasks/me",
  LIST_BY_GARDEN: (gardenId: string | number) =>
    `/tasks/me/gardens/${gardenId}`,
  DETAIL: (taskId: string | number) => `/tasks/me/${taskId}`,
  CREATE: "/tasks/me",
  CREATE_FOR_GARDEN: (gardenId: string | number) =>
    `/tasks/me/gardens/${gardenId}`,
  UPDATE: (taskId: string | number) => `/tasks/me/${taskId}`,
  DELETE: (taskId: string | number) => `/tasks/me/${taskId}`,
  COMPLETE: (taskId: string | number) => `/tasks/me/${taskId}/complete`,
  SKIP: (taskId: string | number) => `/tasks/me/${taskId}/skip`,
  UPLOAD_PHOTO: (taskId: string | number) => `/tasks/me/${taskId}/photo`,
};

// Activity endpoints
export const ACTIVITY_ENDPOINTS = {
  LIST: "/activities/me",
  LIST_BY_GARDEN: (gardenId: string | number) =>
    `/activities/me/gardens/${gardenId}`,
  DETAIL: (activityId: string | number) => `/activities/me/${activityId}`,
  CREATE: "/activities/me",
  EVALUATE: (activityId: string | number) =>
    `/activities/me/${activityId}/evaluate`,
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

// Define the base API endpoints for community features
export const COMMUNITY_ENDPOINTS = {
  POSTS: "/posts",
  POST_DETAIL: (postId: string | number) => `/posts/${postId}`,
  POST_COMMENTS: (postId: string | number) => `/posts/${postId}/comments`,

  POST_VOTE: (postId: string | number) => `/vote/posts/${postId}`,
  COMMENT_VOTE: (commentId: string | number) => `/vote/comments/${commentId}`,

  COMMENT_DETAIL: (commentId: string | number) => `/comments/${commentId}`,
  COMMENT_REPLIES: (commentId: string | number) =>
    `/comments/${commentId}/replies`,

  TAGS: "/tags",

  FOLLOW: "/follow",
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
  COMMUNITY: COMMUNITY_ENDPOINTS,
  WEATHER: WEATHER_ENDPOINTS,
  ALERT: ALERT_ENDPOINTS,
};
