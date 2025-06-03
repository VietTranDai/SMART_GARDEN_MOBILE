import React, { useMemo } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { getEnhancedTheme } from "../utils";

interface LoadingCardProps {
  theme: ReturnType<typeof getEnhancedTheme>;
  message?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  theme,
  message = "Đang tải dữ liệu...",
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <View style={[styles.cardContentPlaceholder, styles.loadingCard]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof getEnhancedTheme>) =>
  StyleSheet.create({
    cardContentPlaceholder: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 30,
      minHeight: 150,
    },
    loadingCard: {},
    loadingText: {
      marginTop: 15,
      fontSize: 15,
      color: theme.textSecondary,
      fontFamily: "Inter-Medium",
    },
  }); 