import React, { useEffect } from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Keep splash screen visible
SplashScreen.preventAutoHideAsync();

/**
 * App Landing Screen
 * This is the first screen shown when the app loads
 * It will redirect to the appropriate screen based on auth state
 */
export default function Index() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <StatusBar style="light" />

      <LinearGradient
        colors={["#2E7D32", "#4CAF50", "#8BC34A"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.contentContainer, { paddingTop: insets.top + 20 }]}>
        <Image
          source={{ uri: "https://picsum.photos/300/200" }}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Smart Garden</Text>
        <Text style={styles.subtitle}>Grow smarter, not harder</Text>
      </View>

      {/* Redirect to the first screen in the auth flow */}
      <Redirect href="/auth" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Inter-Bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    fontFamily: "Inter-Medium",
  },
});
