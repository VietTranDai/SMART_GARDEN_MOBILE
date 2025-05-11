import React, { useEffect, ErrorInfo, useState } from "react";
import { Stack, router, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen"; // Fixed import
import { getItem } from "@/utils/asyncStorage"; // Import setItem
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { ONBOARDING_COMPLETED_KEY } from "@/constants/strings"; // Import the constant
import Toast from "react-native-toast-message";
import { NetworkProvider } from "@/contexts/NetworkContext";
import OfflineBanner from "@/components/OfflineBanner";
import NetworkErrorBoundary from "@/components/NetworkErrorBoundary";

// Configure notifications with a simple try-catch pattern
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.error("Error setting notification handler:", error);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(console.error);

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
          <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
          <Text style={styles.errorMessage}>
            Ứng dụng gặp phải lỗi không mong muốn
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
            <Text style={styles.errorButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Simple component to handle navigation functionality later
function AppNavigator() {
  const segments = useSegments();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const inOnboardingGroup = segments[0] === "onboarding";

    async function checkOnboarding() {
      try {
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
      } catch (error) {
        console.error("Failed to check app state", error);
        router.replace("/auth");
      }
    }

    checkOnboarding();
  }, [user, segments, isLoading]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Fonts are loaded (or failed), we can proceed
      setAppReady(true);
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [fontsLoaded, fontError]);

  if (!appReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <NetworkProvider>
            <UserProvider>
              <PreferencesProvider>
                <SafeAreaProvider>
                  <NetworkErrorBoundary>
                    <Stack>
                      <Stack.Screen
                        name="(modules)"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen name="+not-found" />
                      <Stack.Screen
                        name="auth/index"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="onboarding/index"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="sensors/[id]"
                        options={{ headerShown: false }}
                      />
                    </Stack>
                    <AppNavigator />
                  </NetworkErrorBoundary>
                  <OfflineBanner />
                </SafeAreaProvider>
              </PreferencesProvider>
            </UserProvider>
          </NetworkProvider>
        </ThemeProvider>
        <Toast />
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
