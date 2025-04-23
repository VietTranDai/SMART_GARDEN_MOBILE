const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

// Detect current environment (development, staging, production)
const currentEnv = process.env.APP_ENV || "development";
console.log(`Running in ${currentEnv} environment`);

// Try to load environment-specific .env file
const envPath = path.resolve(__dirname, `.env.${currentEnv}`);
const defaultEnvPath = path.resolve(__dirname, ".env");

// Log which .env file is being used
if (fs.existsSync(envPath)) {
  console.log(`Using environment file: .env.${currentEnv}`);
} else if (fs.existsSync(defaultEnvPath)) {
  console.log("Using default .env file");
} else {
  console.warn("No .env file found. Using default values.");
}

// Get default metro configuration with minimal customization
const config = getDefaultConfig(__dirname);

// Export the config with NativeWind support
module.exports = withNativeWind(config, { input: "./globals.css" });
