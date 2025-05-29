import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface EmptyStateViewProps {
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  icon,
  title,
  message,
  actionText,
  onAction,
}) => {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon as any}
        size={64}
        color={theme.textSecondary}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 20,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    message: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 24,
    },
    actionButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    actionText: {
      fontSize: 16,
      fontFamily: "Inter-Medium",
      color: theme.white,
    },
  });

export default EmptyStateView;
