import { getEnv, getNumEnv, getBoolEnv } from "@/utils/env";

/**
 * Environment Configuration
 *
 * This file provides centralized access to environment variables from .env file
 * using react-native-dotenv and type-safe environment utilities.
 */
interface Environment {
  apiUrl: string;
  apiTimeout: number;
  apiVersion: string;
  apiDebug: boolean;
}

// Get environment variables from .env with type safety and fallbacks
const env: Environment = {
  apiUrl: getEnv("API_URL", "https://api.example.com"),
  apiTimeout: getNumEnv("API_TIMEOUT", 20000),
  apiVersion: getEnv("API_VERSION", "v1"),
  apiDebug: getBoolEnv("API_DEBUG", false),
};

export default env;
