// Define theme colors for the application
const tintColorLight = "#2E7D32";
const tintColorDark = "#4CAF50";

export default {
  light: {
    // Primary palette
    primary: "#2E7D32",
    primaryLight: "#4CAF50",
    primaryDark: "#1B5E20",
    primaryVariant: "#388E3C",
    secondary: "#1976D2",
    secondaryLight: "#42A5F5",
    secondaryDark: "#0D47A1",
    tertiary: "#00796B",
    tertiaryLight: "#26A69A",
    tertiaryDark: "#004D40",
    accent: "#FF8F00", // Amber for accent elements

    // Backgrounds
    background: "#FFFFFF",
    backgroundSecondary: "#F7F9FC",
    backgroundTertiary: "#EEFBF1", // Light green tint for gardening context
    backgroundElevated: "#F5F8FF",

    // Card variations
    card: "#FFFFFF",
    cardAlt: "#F5F8FF",
    cardHighlight: "#E8F5E9", // Light green for highlighted cards
    cardWarning: "#FFF8E1", // Light amber for warning cards
    cardDanger: "#FFEBEE", // Light red for dangerous actions

    // Text
    text: "#333333",
    textSecondary: "#666666",
    textTertiary: "#999999",
    textInverted: "#FFFFFF", // For text on dark backgrounds
    textLink: "#2E7D32", // Links use primary color
    textDisabled: "#CCCCCC",

    // Borders & dividers
    border: "#E1E4E8",
    borderLight: "#F0F0F0",
    borderDark: "#D0D0D0",
    divider: "#EEEEEE",

    // Button colors
    buttonBackground: "#2E7D32",
    buttonText: "#FFFFFF",
    buttonBackgroundSecondary: "#E8F5E9",
    buttonTextSecondary: "#2E7D32",
    buttonBackgroundDisabled: "#F5F5F5",
    buttonTextDisabled: "#BBBBBB",

    // Input fields
    inputBackground: "#F7F9FC",
    inputBackgroundFocused: "#FFFFFF",
    inputBorder: "#E1E4E8",
    inputBorderFocused: "#2E7D32",
    inputText: "#333333",
    inputPlaceholder: "#999999",
    inputIcon: "#666666",

    // Plant status indicators
    plantHealthy: "#4CAF50", // Vibrant green for healthy plants
    plantWarning: "#FFC107", // Amber for plants needing attention
    plantDanger: "#F44336", // Red for plants in critical condition
    waterLevel: "#2196F3", // Blue for water indicators
    soilQuality: "#8D6E63", // Brown for soil indicators
    sunlight: "#FFD54F", // Yellow for sun indicators

    // Garden types
    gardenIndoor: "#673AB7", // Purple for indoor gardens
    gardenOutdoor: "#43A047", // Green for outdoor gardens
    gardenHydroponic: "#00ACC1", // Cyan for hydroponic setups

    // Status colors
    success: "#4CAF50",
    warning: "#FFC107",
    error: "#D32F2F",
    info: "#2196F3",

    // Charts & data visualization
    chartPrimary: "#2E7D32",
    chartSecondary: "#1976D2",
    chartTertiary: "#FFC107",
    chartNeutral: "#9E9E9E",

    // Badge colors
    badgeBackground: "#E8F5E9",
    badgeText: "#2E7D32",
    badgeBackgroundNeutral: "#EEEEEE",
    badgeTextNeutral: "#666666",

    // Selection & focus states
    selection: "rgba(46, 125, 50, 0.2)", // Primary with opacity
    focus: "rgba(46, 125, 50, 0.3)", // Slightly darker for focus

    // Notifications
    notificationBackground: "#E8F5E9",
    notificationText: "#2E7D32",
    notificationWarningBackground: "#FFF8E1",
    notificationWarningText: "#F57C00",
    notificationErrorBackground: "#FFEBEE",
    notificationErrorText: "#D32F2F",

    // Tab navigation
    tint: tintColorLight,
    tabIconDefault: "#CCCCCC",
    tabIconSelected: tintColorLight,
    tabBackground: "#FFFFFF",
    tabBackgroundActive: "#E8F5E9",

    // Additional colors
    overlay: "rgba(0, 0, 0, 0.5)",
    shadow: "rgba(0, 0, 0, 0.1)",
    shimmer: "#F5F5F5",
    shimmerHighlight: "#FFFFFF",

    // NEW: Gradient colors for cards and backgrounds
    gradientPrimary: ["#E8F5E9", "#C8E6C9", "#A5D6A7"],
    gradientSecondary: ["#E3F2FD", "#BBDEFB", "#90CAF9"],
    gradientSuccess: ["#E8F5E9", "#C8E6C9", "#A5D6A7"],
    gradientWarning: ["#FFF8E1", "#FFECB3", "#FFE082"],
    gradientDanger: ["#FFEBEE", "#FFCDD2", "#EF9A9A"],

    // NEW: Status colors with alpha transparency
    statusHealthyBg: "rgba(76, 175, 80, 0.1)",
    statusHealthyBorder: "rgba(76, 175, 80, 0.3)",
    statusWarningBg: "rgba(255, 193, 7, 0.1)",
    statusWarningBorder: "rgba(255, 193, 7, 0.3)",
    statusDangerBg: "rgba(244, 67, 54, 0.1)",
    statusDangerBorder: "rgba(244, 67, 54, 0.3)",
    statusInfoBg: "rgba(33, 150, 243, 0.1)",
    statusInfoBorder: "rgba(33, 150, 243, 0.3)",

    // NEW: Elevation styles for shadows
    elevation1: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    elevation2: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    elevation3: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },

    // NEW: Animation timing constants
    animationTiming: {
      fast: 200,
      medium: 400,
      slow: 800,
    },
  },
  dark: {
    // Primary palette
    primary: "#4CAF50",
    primaryLight: "#81C784",
    primaryDark: "#2E7D32",
    primaryVariant: "#388E3C",
    secondary: "#448AFF",
    secondaryLight: "#82B1FF",
    secondaryDark: "#2962FF",
    tertiary: "#26A69A",
    tertiaryLight: "#4DB6AC",
    tertiaryDark: "#00897B",
    accent: "#FFB300", // Amber for accent elements

    // Backgrounds
    background: "#121212",
    backgroundSecondary: "#1E1E1E",
    backgroundTertiary: "#1C271D", // Dark green tint for gardening context
    backgroundElevated: "#252525",

    // Card variations
    card: "#1E1E1E",
    cardAlt: "#252525",
    cardHighlight: "#1F2E1F", // Dark green for highlighted cards
    cardWarning: "#332A15", // Dark amber for warning cards
    cardDanger: "#2D1A1A", // Dark red for dangerous actions

    // Text
    text: "#FFFFFF",
    textSecondary: "#A0A0A0",
    textTertiary: "#666666",
    textInverted: "#121212", // For text on light backgrounds
    textLink: "#81C784", // Links use primary light color
    textDisabled: "#555555",

    // Borders & dividers
    border: "#333333",
    borderLight: "#3A3A3A",
    borderDark: "#222222",
    divider: "#2A2A2A",

    // Button colors
    buttonBackground: "#4CAF50",
    buttonText: "#FFFFFF",
    buttonBackgroundSecondary: "#1F2E1F",
    buttonTextSecondary: "#81C784",
    buttonBackgroundDisabled: "#2A2A2A",
    buttonTextDisabled: "#555555",

    // Input fields
    inputBackground: "#1E1E1E",
    inputBackgroundFocused: "#252525",
    inputBorder: "#333333",
    inputBorderFocused: "#4CAF50",
    inputText: "#FFFFFF",
    inputPlaceholder: "#666666",
    inputIcon: "#888888",

    // Plant status indicators
    plantHealthy: "#4CAF50", // Vibrant green for healthy plants
    plantWarning: "#FFC107", // Amber for plants needing attention
    plantDanger: "#F44336", // Red for plants in critical condition
    waterLevel: "#2196F3", // Blue for water indicators
    soilQuality: "#A1887F", // Brown for soil indicators
    sunlight: "#FFD54F", // Yellow for sun indicators

    // Garden types
    gardenIndoor: "#9575CD", // Purple for indoor gardens
    gardenOutdoor: "#66BB6A", // Green for outdoor gardens
    gardenHydroponic: "#26C6DA", // Cyan for hydroponic setups

    // Status colors
    success: "#4CAF50",
    warning: "#FFC107",
    error: "#EF5350",
    info: "#42A5F5",

    // Charts & data visualization
    chartPrimary: "#4CAF50",
    chartSecondary: "#448AFF",
    chartTertiary: "#FFC107",
    chartNeutral: "#9E9E9E",

    // Badge colors
    badgeBackground: "#1F2E1F",
    badgeText: "#81C784",
    badgeBackgroundNeutral: "#333333",
    badgeTextNeutral: "#A0A0A0",

    // Selection & focus states
    selection: "rgba(76, 175, 80, 0.3)", // Primary with opacity
    focus: "rgba(76, 175, 80, 0.4)", // Slightly darker for focus

    // Notifications
    notificationBackground: "#1F2E1F",
    notificationText: "#81C784",
    notificationWarningBackground: "#332A15",
    notificationWarningText: "#FFC107",
    notificationErrorBackground: "#2D1A1A",
    notificationErrorText: "#EF5350",

    // Tab navigation
    tint: tintColorDark,
    tabIconDefault: "#666666",
    tabIconSelected: tintColorDark,
    tabBackground: "#121212",
    tabBackgroundActive: "#1F2E1F",

    // Additional colors
    overlay: "rgba(0, 0, 0, 0.7)",
    shadow: "rgba(0, 0, 0, 0.3)",
    shimmer: "#2A2A2A",
    shimmerHighlight: "#333333",

    // NEW: Gradient colors for cards and backgrounds
    gradientPrimary: ["#1F2E1F", "#2E3B2E", "#3C493C"],
    gradientSecondary: ["#1A237E", "#283593", "#3949AB"],
    gradientSuccess: ["#1F2E1F", "#2E3B2E", "#3C493C"],
    gradientWarning: ["#332A15", "#4D3F1F", "#665429"],
    gradientDanger: ["#2D1A1A", "#471F1F", "#5E2A2A"],

    // NEW: Status colors with alpha transparency
    statusHealthyBg: "rgba(76, 175, 80, 0.15)",
    statusHealthyBorder: "rgba(76, 175, 80, 0.4)",
    statusWarningBg: "rgba(255, 193, 7, 0.15)",
    statusWarningBorder: "rgba(255, 193, 7, 0.4)",
    statusDangerBg: "rgba(244, 67, 54, 0.15)",
    statusDangerBorder: "rgba(244, 67, 54, 0.4)",
    statusInfoBg: "rgba(33, 150, 243, 0.15)",
    statusInfoBorder: "rgba(33, 150, 243, 0.4)",

    // NEW: Elevation styles for shadows
    elevation1: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 1,
    },
    elevation2: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
    elevation3: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 3,
    },

    // NEW: Animation timing constants
    animationTiming: {
      fast: 200,
      medium: 400,
      slow: 800,
    },
  },
};
