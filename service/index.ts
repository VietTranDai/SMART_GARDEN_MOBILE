import apiClient from "./apiClient";
import authService from "./auth.service";
import endpoints from "./endpoints";

/**
 * Service module exports
 *
 * This file exports all API services as a single module.
 * Add additional services here as they are created.
 */

export { apiClient, authService, endpoints };

// Export default object with all services for easier imports
export default {
  api: apiClient,
  auth: authService,
  endpoints,
};
