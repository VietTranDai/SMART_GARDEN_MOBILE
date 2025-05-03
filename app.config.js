// Import app.json config
const appJson = require("./app.json");

// Create a config that extends app.json
const config = {
  ...appJson.expo,
  // cấu hình package name cho Android
  android: {
    // nếu trong app.json.expo đã có android khác, giữ lại
    ...(appJson.expo.android || {}),
    package: "com.trandaiviet.smartgarden",
  },
  extra: {
    ...appJson.expo.extra,
    EXPO_OS: process.platform,
  },
  // Ensure these critical settings are explicitly set
  newArchEnabled: true,
  scheme: "smartfarmmobile",
};

export default config;
