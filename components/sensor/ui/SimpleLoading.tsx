import React, { useMemo } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { getEnhancedTheme } from "../utils";

interface SimpleLoadingProps {
  message?: string;
  theme: ReturnType<typeof getEnhancedTheme>;
}

export const SimpleLoading: React.FC<SimpleLoadingProps> = ({
  message = "Đang tải...",
  theme,
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.infoText}>{message}</Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof getEnhancedTheme>) =>
  StyleSheet.create({
    centeredContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.background,
    },
    infoText: {
      marginTop: 15,
      fontSize: 16,
      color: theme.textSecondary,
      fontFamily: "Inter-Regular",
      textAlign: "center",
    },
  }); 