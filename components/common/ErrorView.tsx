import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  const theme = useAppTheme();
  const errorIconScale = useRef(new Animated.Value(1)).current;

  // Animate error icon
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(errorIconScale, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(errorIconScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [errorIconScale]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={{
          transform: [{ scale: errorIconScale }],
        }}
      >
        <MaterialIcons name="error-outline" size={60} color={theme.error} />
      </Animated.View>

      <Text style={[styles.message, { color: theme.error }]}>{message}</Text>

      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.primary }]}
        onPress={onRetry}
        accessibilityLabel="Thử lại tải dữ liệu"
        accessibilityRole="button"
        accessibilityHint="Sẽ tải lại dữ liệu từ máy chủ"
      >
        <Text style={[styles.retryButtonText, { color: theme.card }]}>
          Thử lại
        </Text>
      </TouchableOpacity>
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
    fontFamily: "Inter-Medium",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
});

export default ErrorView;
