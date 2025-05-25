import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { StatusBar } from "expo-status-bar";

// Mock NetInfo for environments where the native module isn't available
const NetInfoMock = {
  configure: () => {},
  addEventListener: (callback: any) => {
    // Always return connected in mock mode
    setTimeout(() => {
      callback({
        isConnected: true,
        isInternetReachable: true,
      });
    }, 0);
    return () => {}; // Unsubscribe function
  },
  fetch: () =>
    Promise.resolve({ isConnected: true, isInternetReachable: true }),
};

// Use real NetInfo when available, otherwise use mock
let NetInfo: any;
try {
  NetInfo = require("@react-native-community/netinfo").default;
} catch (error) {
  console.warn(
    "NetInfo not available in unmatched route, using mock implementation"
  );
  NetInfo = NetInfoMock;
}

export default function FeatureNotImplementedScreen() {
  const theme = useAppTheme();
  const { isDarkMode } = useTheme();
  const [isOffline, setIsOffline] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const iconAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Check network status
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const isConnected =
        state?.isConnected !== false && state?.isInternetReachable !== false;
      setIsOffline(!isConnected);
    });

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

    // Clean up the subscription
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
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

  const checkNetworkAndRetry = () => {
    NetInfo.fetch().then((state: any) => {
      const isConnected =
        state?.isConnected !== false && state?.isInternetReachable !== false;
      setIsOffline(!isConnected);
      if (isConnected) {
        // If connected now, go back
        handleGoHome();
      }
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
              name={isOffline ? "cloud-offline-outline" : "construct-outline"}
              size={120}
              color={theme.primary}
              style={styles.icon}
            />
          </Animated.View>

          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {isOffline
              ? "Không có kết nối mạng. Vui lòng kiểm tra lại kết nối internet của bạn và thử lại."
              : "Tính năng này chưa được hiện thực trong phiên bản hiện tại. Chúng tôi đang nỗ lực phát triển và sẽ ra mắt trong phiên bản tiếp theo."}
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={isOffline ? checkNetworkAndRetry : handleGoHome}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isOffline ? "refresh-outline" : "home-outline"}
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {isOffline ? "Thử lại" : "Quay lại trang chủ"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </>
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
