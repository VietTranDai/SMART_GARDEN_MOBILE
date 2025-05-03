import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
  Entypo,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useUser } from "@/contexts/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";
import apiClient from "@/service/apiClient";

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
        try {
          // Replace simulated API call with real notification count API
          const response = await apiClient.get("/user/notification-count");
          setNotificationCount(response.data.count);
        } catch (error) {
          console.error("Failed to fetch notification count:", error);
          setNotificationCount(0);
        }
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
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textTertiary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: "Inter-Medium",
            marginBottom: Platform.OS === "ios" ? 0 : 4,
          },
          tabBarStyle: {
            height: 60 + (Platform.OS === "ios" ? 0 : insets.bottom),
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
            paddingTop: 5,
            backgroundColor: theme.tabBackground,
            borderTopColor: theme.borderLight,
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
            borderBottomColor: theme.borderLight,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            fontFamily: "Inter-Bold",
            color: theme.text,
            fontSize: 18,
          },
          headerTintColor: theme.primary, // For back buttons and other header elements
          headerShown: true,
        }}
      >
        {/* 1. Home Tab - Dashboard for quick access */}
        <Tabs.Screen
          name="home/index"
          options={{
            title: "Trang chủ",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            headerTitle: "Nông trại thông minh",
          }}
        />

        {/* 2. Gardens Tab - All garden management */}
        <Tabs.Screen
          name="gardens/index"
          options={{
            title: "Vườn",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="flower" size={size} color={color} />
            ),
            headerTitle: "Vườn của tôi",
          }}
        />

        {/* Dynamic garden route - not a tab */}
        <Tabs.Screen
          name="gardens/[id]"
          options={{
            href: null,
            title: "Chi tiết vườn",
            headerTitle: "Chi tiết vườn",
          }}
        />
        {/* Add configurations to hide newly created garden screens */}
        <Tabs.Screen
          name="gardens/create"
          options={{
            href: null,
            headerTitle: "Tạo vườn mới",
          }}
        />
        <Tabs.Screen
          name="gardens/activity/[id]"
          options={{
            href: null,
            headerTitle: "Lịch sử hoạt động",
          }}
        />
        <Tabs.Screen
          name="gardens/activity/new"
          options={{
            href: null,
            headerTitle: "Thêm hoạt động",
          }}
        />
        <Tabs.Screen
          name="gardens/schedule/[id]"
          options={{
            href: null,
            headerTitle: "Lịch tưới nước",
          }}
        />

        {/* 3. Community Tab */}
        <Tabs.Screen
          name="community/index"
          options={{
            title: "Cộng đồng",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
            headerTitle: "Cộng đồng vườn",
          }}
        />

        {/* 4. Tasks Tab - Schedule and monitor tasks */}
        <Tabs.Screen
          name="tasks/index"
          options={{
            title: "Công việc",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="task-alt" size={size} color={color} />
            ),
            headerTitle: "Công việc vườn",
          }}
        />

        {/* 5. Profile Tab - User profile and settings */}
        <Tabs.Screen
          name="profile/index"
          options={{
            title: "Cá nhân",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="user" size={size - 2} color={color} />
            ),
            headerTitle: "Hồ sơ của tôi",
          }}
        />

        {/* Hidden screens that will be accessed from main tabs */}
        <Tabs.Screen
          name="notifications/index"
          options={{
            href: null,
            headerTitle: "Thông báo",
          }}
        />

        {/* Plants screens */}
        <Tabs.Screen
          name="plants/index"
          options={{
            href: null,
            headerTitle: "Cây trồng",
          }}
        />

        <Tabs.Screen
          name="plants/[id]"
          options={{
            href: null,
            headerTitle: "Chi tiết cây trồng",
          }}
        />

        <Tabs.Screen
          name="plants/create"
          options={{
            href: null,
            headerTitle: "Thêm cây trồng",
          }}
        />

        {/* Other screens */}
        <Tabs.Screen
          name="profile/[id]"
          options={{
            href: null,
            headerTitle: "Hồ sơ người dùng",
          }}
        />

        <Tabs.Screen
          name="community/[id]"
          options={{
            href: null,
            headerTitle: "Chi tiết bài viết",
          }}
        />

        <Tabs.Screen
          name="community/new"
          options={{
            href: null,
            headerTitle: "Bài viết mới",
          }}
        />

        <Tabs.Screen
          name="gardens/schedule"
          options={{
            href: null,
            headerTitle: "Lịch tưới nước",
          }}
        />

        <Tabs.Screen
          name="gardens/edit/[id]"
          options={{
            href: null,
            headerTitle: "Chỉnh sửa vườn",
          }}
        />
      </Tabs>
    </>
  );
}
