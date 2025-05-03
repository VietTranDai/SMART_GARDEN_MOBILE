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
  VERIFY_EMAIL: "/auth/verify-email",
};

// User endpoints
export const USER_ENDPOINTS = {
  ME: "/user/me",
  EMAIL: "/user/email",
  PROFILE: "/user/profile",
  UPDATE_PROFILE: "/user/profile",
  CHANGE_PASSWORD: "/user/change-password",
  EXPERIENCE_LEVELS: "/experience-levels",
  GARDENER_PROFILE: (gardenerId: string | number) => `/gardeners/${gardenerId}`,
  EXPERIENCE_PROGRESS: "/user/experience-progress",
  NOTIFICATION_COUNT: "/user/notification-count",
};

// Garden endpoints
export const GARDEN_ENDPOINTS = {
  LIST: "/gardens",
  DETAIL: (id: string | number) => `/gardens/${id}`,
  CREATE: "/gardens",
  UPDATE: (id: string | number) => `/gardens/${id}`,
  DELETE: (id: string | number) => `/gardens/${id}`,
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
  LIST_BY_GARDEN: (gardenId: string | number) => `/gardens/${gardenId}/sensors`,
  DETAIL: (sensorId: string | number) => `/sensors/${sensorId}`,
  CREATE: (gardenId: string | number) => `/gardens/${gardenId}/sensors`,
  UPDATE: (sensorId: string | number) => `/sensors/${sensorId}`,
  DELETE: (sensorId: string | number) => `/sensors/${sensorId}`,
  SENSOR_DATA: (sensorId: string | number) => `/sensors/${sensorId}/data`,
  GARDEN_SENSOR_DATA: (gardenId: string | number) =>
    `/gardens/${gardenId}/sensor-data`,
};

// Task endpoints
export const TASK_ENDPOINTS = {
  LIST: "/tasks",
  TASKS: "/tasks",
  LIST_BY_GARDEN: (gardenId: string | number) => `/gardens/${gardenId}/tasks`,
  TASKS_BY_GARDEN: (gardenId: string | number) => `/gardens/${gardenId}/tasks`,
  DETAIL: (taskId: string | number) => `/tasks/${taskId}`,
  TASK_DETAIL: (taskId: string | number) => `/tasks/${taskId}`,
  CREATE: "/tasks",
  CREATE_FOR_GARDEN: (gardenId: string | number) =>
    `/gardens/${gardenId}/tasks`,
  UPDATE: (taskId: string | number) => `/tasks/${taskId}`,
  DELETE: (taskId: string | number) => `/tasks/${taskId}`,
  COMPLETE: (taskId: string | number) => `/tasks/${taskId}/complete`,
  COMPLETE_TASK: (taskId: string | number) => `/tasks/${taskId}/complete`,
  SKIP_TASK: (taskId: string | number) => `/tasks/${taskId}/skip`,
  UPLOAD_PHOTO: (taskId: string | number) => `/tasks/${taskId}/photo`,

  // Activity endpoints
  ACTIVITIES: "/activities",
  ACTIVITIES_BY_GARDEN: (gardenId: string | number) =>
    `/gardens/${gardenId}/activities`,
  ACTIVITY_DETAIL: (activityId: string | number) => `/activities/${activityId}`,
  EVALUATE_ACTIVITY: (activityId: string | number) =>
    `/activities/${activityId}/evaluate`,

  // Watering schedule endpoints
  WATERING_SCHEDULES: "/watering-schedules",
  GARDEN_WATERING_SCHEDULES: (gardenId: string | number) =>
    `/gardens/${gardenId}/watering-schedules`,
  WATERING_SCHEDULE_DETAIL: (scheduleId: string | number) =>
    `/watering-schedules/${scheduleId}`,
  COMPLETE_WATERING: (scheduleId: string | number) =>
    `/watering-schedules/${scheduleId}/complete`,
  SKIP_WATERING: (scheduleId: string | number) =>
    `/watering-schedules/${scheduleId}/skip`,
  AUTO_GENERATE_SCHEDULE: (gardenId: string | number) =>
    `/gardens/${gardenId}/watering-schedules/auto`,
};

// Define the base API endpoints for community features
export const COMMUNITY_ENDPOINTS = {
  POSTS: "/posts",
  POST_DETAIL: (postId: string | number) => `/posts/${postId}`,
  POST_COMMENTS: (postId: string | number) => `/posts/${postId}/comments`,
  COMMENT_DETAIL: (commentId: string | number) => `/comments/${commentId}`,
  COMMENT_REPLIES: (commentId: string | number) =>
    `/comments/${commentId}/replies`,
  POST_VOTE: (postId: string | number) => `/posts/${postId}/vote`,
  COMMENT_VOTE: (commentId: string | number) => `/comments/${commentId}/vote`,
  TAGS: "/tags",
  FOLLOW: "/follow",
  FOLLOWERS: (gardenerId: string | number) =>
    `/gardeners/${gardenerId}/followers`,
  FOLLOWING: (gardenerId: string | number) =>
    `/gardeners/${gardenerId}/following`,
  FOLLOW_USER: (gardenerId: string | number) => `/follow/${gardenerId}`,
  UNFOLLOW_USER: (gardenerId: string | number) => `/follow/${gardenerId}`,
};

// Weather endpoints
export const WEATHER_ENDPOINTS = {
  CURRENT: (gardenId: string | number) =>
    `/gardens/${gardenId}/weather/current`,
  HOURLY_FORECAST: (gardenId: string | number) =>
    `/gardens/${gardenId}/weather/hourly`,
  DAILY_FORECAST: (gardenId: string | number) =>
    `/gardens/${gardenId}/weather/daily`,
  HISTORICAL: (gardenId: string | number) =>
    `/gardens/${gardenId}/weather/historical`,
  ALERTS: "/alerts",
  ALERTS_BY_GARDEN: (gardenId: string | number) =>
    `/gardens/${gardenId}/alerts`,
  ALERT_DETAIL: (alertId: string | number) => `/alerts/${alertId}`,
  RESOLVE_ALERT: (alertId: string | number) => `/alerts/${alertId}/resolve`,
};

// Course endpoints
export const COURSE_ENDPOINTS = {
  LIST: "/courses",
  DETAIL: (id: string | number) => `/courses/${id}`,
  ENROLL: (id: string | number) => `/courses/${id}/enroll`,
};

// Lesson endpoints
export const LESSON_ENDPOINTS = {
  LIST: (courseId: string | number) => `/courses/${courseId}/lessons`,
  DETAIL: (courseId: string | number, lessonId: string | number) =>
    `/courses/${courseId}/lessons/${lessonId}`,
  COMPLETE: (courseId: string | number, lessonId: string | number) =>
    `/courses/${courseId}/lessons/${lessonId}/complete`,
};

// Combine all endpoints for easier imports
export default {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  GARDEN: GARDEN_ENDPOINTS,
  PLANT: PLANT_ENDPOINTS,
  SENSOR: SENSOR_ENDPOINTS,
  TASK: TASK_ENDPOINTS,
  COMMUNITY: COMMUNITY_ENDPOINTS,
  WEATHER: WEATHER_ENDPOINTS,
  COURSE: COURSE_ENDPOINTS,
  LESSON: LESSON_ENDPOINTS,
};
