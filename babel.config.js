module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo"], "nativewind/babel"],
    plugins: [
      // React Native dotenv
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          blacklist: null,
          whitelist: null,
          safe: true,
          allowUndefined: false,
        },
      ],
      // Module resolver cho alias
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./",
          },
        },
      ],
      // Reanimated plugin - phải để CUỐI CÙNG để hoạt động đúng
      "react-native-reanimated/plugin",
    ],
  };
};
