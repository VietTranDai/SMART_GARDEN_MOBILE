import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useUser } from "@/contexts/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";

export default function ModuleLayout() {
  const theme = useAppTheme();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [notificationCount, setNotificationCount] = React.useState(0);
  const { isDarkMode } = useTheme();

  // Setup notification count
  useEffect(() => {
    // Fetch notification count from backend
    const fetchNotificationCount = async () => {
      if (user) {
        // Simulated API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setNotificationCount(3); // Example: 3 unread notifications
      }
    };

    fetchNotificationCount();

    // Set up notification listener
    const subscription = Notifications.addNotificationReceivedListener(() => {
      setNotificationCount((prev) => prev + 1);
    });

    return () => subscription.remove();
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter-Medium",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarStyle: {
          height: 60 + (Platform.OS === "ios" ? 0 : insets.bottom),
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 5,
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          elevation: 8,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerStyle: {
          backgroundColor: theme.background,
          elevation: 2,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerTitleStyle: {
          fontFamily: "Inter-Bold",
          color: theme.text,
          fontSize: 18,
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Gardens",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="flower" size={size} color={color} />
          ),
          headerTitle: "My Gardens",
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="task-alt" size={size} color={color} />
          ),
          headerTitle: "Garden Tasks",
        }}
      />
      <Tabs.Screen
        name="community/index"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          headerTitle: "Garden Community",
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size - 2} color={color} />
          ),
          headerTitle: "My Profile",
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          tabBarBadge: notificationCount > 0 ? notificationCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.primary,
            fontSize: 10,
          },
          headerTitle: "Garden Alerts",
        }}
      />
      <Tabs.Screen
        name="plants/index"
        options={{
          title: "Plants",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flower" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
