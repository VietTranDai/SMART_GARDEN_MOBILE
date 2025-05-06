import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

interface LoadingViewProps {
  message?: string;
}

const LoadingView: React.FC<LoadingViewProps> = ({
  message = "Đang tải...",
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    marginTop: 12,
    textAlign: "center",
  },
});

export default LoadingView;
