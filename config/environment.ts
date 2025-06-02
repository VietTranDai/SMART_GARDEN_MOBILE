// Import environment variables directly
import { API_URL, API_TIMEOUT, API_VERSION, API_DEBUG } from "@env";

/**
 * Environment Configuration
 *
 * This file provides centralized access to environment variables from .env file
 * using react-native-dotenv and type-safe environment utilities.
 */

// --- Helper functions (moved from utils/env.ts and made internal) ---

// Define a type for the environment variables for better type safety
type EnvVariables = {
  API_URL?: string;
  API_TIMEOUT?: string;
  API_VERSION?: string;
  API_DEBUG?: string;
};

// Use the imported variables directly
const envVariables: EnvVariables = {
  API_URL,
  API_TIMEOUT,
  API_VERSION,
  API_DEBUG,
};

function getEnvInternal<T extends keyof EnvVariables>(
  name: T,
  defaultValue?: string
): string {
  const value = envVariables[name];
  if (value === undefined || value === null || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${String(name)} is not set`);
  }
  return value as string;
}

function getBoolEnvInternal<T extends keyof EnvVariables>(
  name: T,
  defaultValue = false
): boolean {
  const value = getEnvInternal(name, defaultValue ? "true" : "false");
  return value.toLowerCase() === "true";
}

function getNumEnvInternal<T extends keyof EnvVariables>(
  name: T,
  defaultValue?: number
): number {
  const value = getEnvInternal(name, defaultValue?.toString());
  const num = Number(value);
  if (isNaN(num)) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(
      `Environment variable ${String(name)} is not a valid number`
    );
  }
  return num;
}

// --- Environment Interface and Object ---

interface Environment {
  apiUrl: string;
  apiTimeout: number;
  apiVersion: string;
  apiDebug: boolean;
}

// Get environment variables using internal helpers
const env: Environment = {
  apiUrl: getEnvInternal("API_URL", "https://api.example.com"),
  apiTimeout: getNumEnvInternal("API_TIMEOUT", 60000),
  apiVersion: getEnvInternal("API_VERSION", "v1"),
  apiDebug: getBoolEnvInternal("API_DEBUG", false),
};

export default env;
