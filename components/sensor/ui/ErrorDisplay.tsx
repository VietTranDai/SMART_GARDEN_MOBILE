import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getEnhancedTheme } from "../utils";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  theme: ReturnType<typeof getEnhancedTheme>;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  theme,
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <View style={styles.centeredContainer}>
      <Ionicons name="cloud-offline-outline" size={48} color={theme.error} />
      <Text style={[styles.infoText, { color: theme.error, marginVertical: 15 }]}>
        {error}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
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
    retryButton: {
      backgroundColor: theme.primary,
      paddingVertical: 10,
      paddingHorizontal: 25,
      borderRadius: 8,
      marginTop: 10,
    },
    retryText: {
      color: theme.buttonText,
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
    },
  }); 