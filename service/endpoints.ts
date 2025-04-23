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
  LIST: (gardenId: string | number) => `/gardens/${gardenId}/plants`,
  DETAIL: (gardenId: string | number, plantId: string | number) =>
    `/gardens/${gardenId}/plants/${plantId}`,
  CREATE: (gardenId: string | number) => `/gardens/${gardenId}/plants`,
  UPDATE: (gardenId: string | number, plantId: string | number) =>
    `/gardens/${gardenId}/plants/${plantId}`,
  DELETE: (gardenId: string | number, plantId: string | number) =>
    `/gardens/${gardenId}/plants/${plantId}`,
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

// Other endpoints can be added here

// Combine all endpoints for easier imports
export default {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  GARDEN: GARDEN_ENDPOINTS,
  PLANT: PLANT_ENDPOINTS,
  COURSE: COURSE_ENDPOINTS,
  LESSON: LESSON_ENDPOINTS,
};
