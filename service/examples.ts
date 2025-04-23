import apiClient from "./apiClient";
import env from "@/config/environment";
import { API_DEBUG } from "@env"; // Direct import example

/**
 * Example Service
 *
 * This file demonstrates different ways to use environment variables in services.
 * Preferred approach is to use the central environment configuration.
 */

/**
 * Example 1: Using environment through the environment module (RECOMMENDED)
 * This is the preferred approach for most cases
 */
const fetchDataWithEnvModule = async () => {
  try {
    // Use the environment configuration
    const endpoint = `${env.apiUrl}/data`;

    // Conditionally enable debug logging
    if (env.apiDebug) {
      console.log("Fetching data from:", endpoint);
    }

    const response = await apiClient.get("/data");
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

/**
 * Example 2: Using environment variables directly (NOT RECOMMENDED)
 * Only use this approach when you need the raw value
 */
const logEnvironmentInfo = () => {
  // Direct access to a specific environment variable
  // This approach should be limited to special cases
  if (API_DEBUG === "true") {
    console.log("Environment Information:");
    console.log("- Debug mode enabled by API_DEBUG env variable");
  }
};

export { fetchDataWithEnvModule, logEnvironmentInfo };
