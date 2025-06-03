import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getEnhancedTheme } from "../utils";

interface ErrorCardProps {
  error: string;
  onRetry?: () => void;
  theme: ReturnType<typeof getEnhancedTheme>;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  error,
  onRetry,
  theme,
}) => {
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  return (
    <View style={styles.cardContentPlaceholder}>
      <Ionicons name="alert-circle-outline" size={32} color={theme.error} />
      <Text style={[styles.infoText, { color: theme.error, marginVertical: 10, fontSize: 14 }]}>
        {error}
      </Text>
      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { paddingVertical: 8, paddingHorizontal: 20, marginTop: 10 }]}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { fontSize: 14 }]}>Thử lại</Text>
        </TouchableOpacity>
      )}
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