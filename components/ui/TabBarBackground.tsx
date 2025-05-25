import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useAppTheme } from "@/hooks/ui/useAppTheme";

interface TabBarBackgroundProps {
  tint?: "light" | "dark" | "default";
  intensity?: number;
}

export default function TabBarBackground({
  tint = "default",
  intensity = 80,
}: TabBarBackgroundProps) {
  const theme = useAppTheme();

  const determineTint = () => {
    if (tint !== "default") return tint;
    return theme.dark ? "dark" : "light";
  };

  // iOS uses BlurView for glass effect
  if (Platform.OS === "ios") {
    return (
      <BlurView
        tint={determineTint()}
        intensity={intensity}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  // Android and other platforms use a semi-transparent view
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: theme.dark
            ? "rgba(0, 0, 0, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.dark
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.2)",
        },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
