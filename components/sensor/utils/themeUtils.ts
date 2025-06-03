import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Dimensions } from "react-native";

// Helper function to convert hex color to RGB string
export const hexToRgb = (hex: string): string => {
  let r = "0",
    g = "0",
    b = "0";
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return `${+r},${+g},${+b}`;
};

// Simplified status color function
export const getSimpleStatusColor = (
  status: "normal" | "warning" | "critical",
  theme: ReturnType<typeof getEnhancedTheme>
) => {
  const colors = {
    normal: theme.semantic.success,
    warning: theme.semantic.warning,
    critical: theme.semantic.error,
  };
  return colors[status] || colors.normal;
};

// Responsive Utils
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
export const isTablet = screenWidth > 768;
export const isSmallScreen = screenWidth < 375;

export const getResponsiveSize = (base: number, tablet?: number, small?: number) => {
  if (isTablet && tablet !== undefined) return tablet;
  if (isSmallScreen && small !== undefined) return small;
  return base;
};

// Color System Enhancement
export const getEnhancedTheme = (baseTheme: ReturnType<typeof useAppTheme>) => ({
  ...baseTheme,
  semantic: {
    success: baseTheme.success || "#10B981",
    warning: baseTheme.warning || "#F59E0B",
    error: baseTheme.error || "#EF4444",
    info: baseTheme.info || "#3B82F6",
  },
  surface: {
    primary: baseTheme.card,
    secondary: `${baseTheme.primary}0A`,
    tertiary: `${baseTheme.textSecondary}05`,
  },
  shadows: {
    light: "#00000008",
    medium: "#00000015",
    heavy: "#00000025",
  },
}); 