import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { StatusBar } from "expo-status-bar";

export default function NotFoundScreen() {
  const theme = useAppTheme();
  const { isDarkMode } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const iconAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Run animations sequentially
    Animated.sequence([
      // First fade in and slide up the content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Then animate the icon
      Animated.spring(iconAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    // Animate out before navigation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace("/(modules)/home" as any);
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: iconAnim }] }}>
          <Ionicons
            name="alert-circle-outline"
            size={120}
            color={theme.primary}
            style={styles.icon}
          />
        </Animated.View>

        <Text style={[styles.title, { color: theme.text }]}>
          Page Not Found
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          The page you're looking for doesn't exist or has been moved.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <Ionicons
            name="home-outline"
            size={20}
            color="#FFFFFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  icon: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "Inter-Bold",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    fontFamily: "Inter-Regular",
    lineHeight: 24,
    maxWidth: "80%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
});
