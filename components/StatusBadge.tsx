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
        return theme.success;
      case "needs-attention":
        return theme.warning;
      case "critical":
        return theme.error;
      default:
        return theme.success;
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
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});
