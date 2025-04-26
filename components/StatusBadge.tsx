import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GardenStatus } from "./GardenCard";
import { useAppTheme } from "@/hooks/useAppTheme";

interface StatusBadgeProps {
  status: GardenStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const theme = useAppTheme();

  const getStatusColor = () => {
    switch (status) {
      case "healthy":
        return theme.plantHealthy;
      case "needs-attention":
        return theme.plantWarning;
      case "critical":
        return theme.plantDanger;
      default:
        return theme.plantHealthy;
    }
  };

  const getStatusBackgroundColor = () => {
    switch (status) {
      case "healthy":
        return `${theme.plantHealthy}20`; // 20% opacity
      case "needs-attention":
        return `${theme.plantWarning}20`;
      case "critical":
        return `${theme.plantDanger}20`;
      default:
        return `${theme.plantHealthy}20`;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "needs-attention":
        return "Needs Attention";
      case "critical":
        return "Critical";
      default:
        return "Healthy";
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getStatusBackgroundColor(),
          borderColor: getStatusColor(),
        },
      ]}
    >
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
