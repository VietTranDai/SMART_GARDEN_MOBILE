/**
 * Service Index
 *
 * Export all service modules for easier imports
 */

// Auth and base API services
import apiClient from "./apiClient";

// API service modules
import * as apiServices from "./api";

// Export individual services
export { apiClient };

// Export all API services
export * from "./api";

// Default export for backwards compatibility
export default {
  apiClient,
  ...apiServices,
};
