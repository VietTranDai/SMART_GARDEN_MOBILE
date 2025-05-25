// This file is a fallback for using MaterialIcons on Android and web.

import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";

interface IconSymbolProps {
  name: string;
  type?: "ionicons" | "font-awesome" | "material-community";
  size?: number;
  color?: string;
  backgroundColor?: string;
  withBackground?: boolean;
  style?: any;
}

export default function IconSymbol({
  name,
  type = "ionicons",
  size = 24,
  color,
  backgroundColor,
  withBackground = false,
  style,
}: IconSymbolProps) {
  const theme = useAppTheme();
  const iconColor = color || theme.primary;
  const bgColor = backgroundColor || theme.primaryLight;

  const renderIcon = () => {
    switch (type) {
      case "font-awesome":
        return <FontAwesome5 name={name} size={size} color={iconColor} />;
      case "material-community":
        return (
          <MaterialCommunityIcons name={name} size={size} color={iconColor} />
        );
      case "ionicons":
      default:
        // Handle platform-specific icon names for Ionicons
        let iconName = name;
        if (
          Platform.OS === "ios" &&
          !name.endsWith("-outline") &&
          !name.endsWith("-sharp")
        ) {
          // iOS-specific handling, convert to -outline form if necessary
          if (name.includes("-outline")) {
            iconName = name;
          } else if (name.includes("-sharp")) {
            iconName = name.replace("-sharp", "");
          } else {
            iconName = `${name}-outline`;
          }
        }
        return <Ionicons name={iconName} size={size} color={iconColor} />;
    }
  };

  if (withBackground) {
    return (
      <View style={[styles.iconContainer, { backgroundColor: bgColor }, style]}>
        {renderIcon()}
      </View>
    );
  }

  return renderIcon();
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
