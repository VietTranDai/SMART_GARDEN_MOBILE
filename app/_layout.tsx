import React, { useEffect, ErrorInfo } from "react";
import {
  Stack,
  router,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen"; // Fixed import
import { getItem, setItem } from "@/utils/asyncStorage"; // Import setItem
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { ONBOARDING_COMPLETED_KEY } from "@/constants/strings"; // Import the constant

// Configure notifications with a simple try-catch pattern
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch (error) {
  console.error("Error setting notification handler:", error);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Error handler function for expo-router routes
function errorHandler(error: Error) {
  console.error("Navigation error:", error);
  // You could do more here like logging to a service
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>
        {error.message || "An unexpected error occurred"}
      </Text>
      <TouchableOpacity
        style={styles.errorButton}
        onPress={() => router.replace("/(modules)/home")}
      >
        <Text style={styles.errorButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

// Global Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            The application encountered an unexpected error
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => {
              this.setState({ hasError: false });
              try {
                router.replace("/(modules)/home");
              } catch (err) {
                router.navigate("/");
              }
            }}
          >
            <Text style={styles.errorButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Internal component to handle protected routes
function RootLayoutNavigator() {
  const segments = useSegments();
  const { user, isLoading } = useUser();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === "auth";
    const inOnboardingGroup = segments[0] === "onboarding";

    if (isLoading) return;

    async function checkOnboarding() {
      try {
        // Use the constant key here
        const onboardingCompleted = await getItem<string>(
          ONBOARDING_COMPLETED_KEY
        );

        if (user && onboardingCompleted === "true") {
          // User is signed in and has completed onboarding
          if (inAuthGroup || inOnboardingGroup) {
            router.replace("/(modules)/home");
          }
        } else if (user && onboardingCompleted !== "true") {
          // User is signed in but hasn't completed onboarding
          if (!inOnboardingGroup) {
            router.replace("/onboarding");
          }
        } else {
          // User is not signed in
          if (!inAuthGroup) {
            router.replace("/auth");
          }
        }

        SplashScreen.hideAsync();
      } catch (error) {
        console.error("Failed to check app state", error);
        SplashScreen.hideAsync();
        router.replace("/auth");
      }
    }

    checkOnboarding();
  }, [user, segments, navigationState?.key, isLoading]);

  // Xử lý lỗi cho react-navigation
  React.useEffect(() => {
    // Đơn giản hóa cách xử lý lỗi navigation
    const handleError = (error: any) => {
      console.error("Navigation error:", error);
    };

    // Đăng ký error fallback handler
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Gọi hàm gốc trước
      originalConsoleError.apply(console, args);

      // Kiểm tra nếu lỗi liên quan đến navigation
      const errorMessage = args.join(" ");
      if (
        errorMessage.includes("navigation") ||
        errorMessage.includes("route") ||
        errorMessage.includes("match") ||
        errorMessage.includes("undefined")
      ) {
        // Thực hiện xử lý lỗi navigation an toàn
        setTimeout(() => {
          try {
            // Thử quay về trang chính
            if (
              router &&
              typeof router.canGoBack === "function" &&
              router.canGoBack()
            ) {
              router.back();
            } else {
              // Fallback an toàn
              try {
                router.replace("/(modules)/home");
              } catch (e) {
                try {
                  router.navigate("/");
                } catch (fallbackError) {
                  // Chỉ ghi log, không làm gì thêm để tránh vòng lặp vô hạn
                  console.warn("All navigation fallbacks failed");
                }
              }
            }
          } catch (navigateError) {
            // Chỉ ghi log, không làm gì thêm
            console.warn("Navigation error handler failed", navigateError);
          }
        }, 100);
      }
    };

    // Cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Không khai báo route 'tutorial' để tránh lỗi
  return (
    <Stack>
      {/* Changed from (tabs) to (modules) to match the actual directory */}
      <Stack.Screen name="(modules)" options={{ headerShown: false }} />
      <Stack.Screen name="gardens/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="gardens/create" options={{ headerShown: false }} />
      <Stack.Screen name="gardens/edit/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="plants/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="plants/create" options={{ headerShown: false }} />
      {/* Added auth and onboarding screens which were missing */}
      <Stack.Screen name="auth/index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
  });

  if (fontError) {
    console.error("Error loading fonts:", fontError);
  }

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <UserProvider>
            <SafeAreaProvider>
              <RootLayoutNavigator />
            </SafeAreaProvider>
          </UserProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333333",
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
    color: "#666666",
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#FF6B00",
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
  },
});
