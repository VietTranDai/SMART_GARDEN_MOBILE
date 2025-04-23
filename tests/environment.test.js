/**
 * Environment Configuration Test
 *
 * To run this test:
 * - Create a .env.test file with test values
 * - Run: NODE_ENV=test jest tests/environment.test.js
 */

import env from "../config/environment";
import { getEnv, getBoolEnv, getNumEnv } from "../utils/env";

describe("Environment Configuration", () => {
  it("should load environment variables with correct types", () => {
    // Ensure env object contains expected properties
    expect(env).toHaveProperty("apiUrl");
    expect(env).toHaveProperty("apiTimeout");
    expect(env).toHaveProperty("apiVersion");
    expect(env).toHaveProperty("apiDebug");

    // Check types
    expect(typeof env.apiUrl).toBe("string");
    expect(typeof env.apiTimeout).toBe("number");
    expect(typeof env.apiVersion).toBe("string");
    expect(typeof env.apiDebug).toBe("boolean");
  });

  it("should handle default values correctly", () => {
    // Test getEnv utility
    const testApiUrl = getEnv("API_URL", "https://default-api.com");
    expect(testApiUrl).toBeTruthy();

    // Test getNumEnv utility
    const testTimeout = getNumEnv("API_TIMEOUT", 10000);
    expect(testTimeout).toBeGreaterThan(0);

    // Test getBoolEnv utility
    const testDebug = getBoolEnv("API_DEBUG", false);
    expect(typeof testDebug).toBe("boolean");
  });
});
