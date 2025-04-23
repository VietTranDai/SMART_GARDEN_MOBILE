import * as envVariables from "@env";

/**
 * Environment Utilities
 *
 * Safe utilities for accessing and validating environment variables
 */

/**
 * Get an environment variable with type checking
 *
 * @param name - The name of the environment variable
 * @param defaultValue - A default value to return if the variable is not set
 * @returns The environment variable value or the default
 */
export function getEnv<T extends keyof typeof envVariables>(
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

/**
 * Get a boolean environment variable
 *
 * @param name - The name of the environment variable
 * @param defaultValue - A default boolean value
 * @returns The environment variable as a boolean
 */
export function getBoolEnv<T extends keyof typeof envVariables>(
  name: T,
  defaultValue = false
): boolean {
  const value = getEnv(name, defaultValue ? "true" : "false");
  return value.toLowerCase() === "true";
}

/**
 * Get a numeric environment variable
 *
 * @param name - The name of the environment variable
 * @param defaultValue - A default number value
 * @returns The environment variable as a number
 */
export function getNumEnv<T extends keyof typeof envVariables>(
  name: T,
  defaultValue?: number
): number {
  const value = getEnv(name, defaultValue?.toString());
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

/**
 * Check if debug mode is enabled based on API_DEBUG
 */
export function isDebugMode(): boolean {
  return getBoolEnv("API_DEBUG", false);
}

export default {
  getEnv,
  getBoolEnv,
  getNumEnv,
  isDebugMode,
};
