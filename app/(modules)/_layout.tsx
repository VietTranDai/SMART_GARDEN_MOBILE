import React, { useEffect, useMemo } from "react";
import { Tabs, usePathname } from "expo-router";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
  Entypo,
  AntDesign,
  FontAwesome,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import {
  Platform,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as Notifications from "expo-notifications";
import { useUser } from "@/contexts/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";
import apiClient from "@/service/apiClient";
import alertService from "@/service/api/alert.service";
import { router } from "expo-router";
import env from "@/config/environment";

// Header component for Gardens tab
const GardensHeaderTitle = () => {
  const theme = useAppTheme();

  return (
    <View style={styles.headerTitleContainer}>
      <MaterialCommunityIcons
        name="flower-tulip"
        size={24}
        color={theme.primary}
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitleText, { color: theme.text }]}>
        Vườn của tôi
      </Text>
    </View>
  );
};

// Header component for Community tab
const CommunityHeaderTitle = () => {
  const theme = useAppTheme();

  return (
    <View style={styles.headerTitleContainer}>
      <Ionicons
        name="people-circle-outline"
        size={24}
        color={theme.primary}
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitleText, { color: theme.text }]}>
        Cộng đồng vườn
      </Text>
    </View>
  );
};

// Header component for Tasks tab
const TasksHeaderTitle = () => {
  const theme = useAppTheme();

  return (
    <View style={styles.headerTitleContainer}>
      <FontAwesome
        name="tasks"
        size={22}
        color={theme.primary}
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitleText, { color: theme.text }]}>
        Công việc vườn
      </Text>
    </View>
  );
};

// Header component for Profile tab
const ProfileHeaderTitle = () => {
  const theme = useAppTheme();
  const { user } = useUser();

  return (
    <View style={styles.headerTitleContainer}>
      <FontAwesome5
        name="user-circle"
        size={22}
        color={theme.primary}
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitleText, { color: theme.text }]}>
        Hồ sơ của {user?.firstName || "tôi"}
      </Text>
    </View>
  );
};

// Header component for Journal tab
const JournalHeaderTitle = () => {
  const theme = useAppTheme();

  return (
    <View style={styles.headerTitleContainer}>
      <MaterialCommunityIcons
        name="notebook-outline"
        size={24}
        color={theme.primary}
        style={styles.headerIcon}
      />
      <Text style={[styles.headerTitleText, { color: theme.text }]}>
        Nhật ký vườn
      </Text>
    </View>
  );
};

// Custom header component for Home tab
const CustomHeaderTitle = () => {
  const theme = useAppTheme();

  // Get greeting based on time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Chào buổi sáng";
    if (currentHour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const { user } = useUser();

  return (
    <View style={styles.titleContainer}>
      <View style={styles.logoWithText}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={[styles.appTitle, { color: theme.primary }]}>
            Nông trại thông minh
          </Text>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {getGreeting()}, {user?.firstName} {user?.lastName || "Người dùng"}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Custom right header component with notification badge
const CustomHeaderRight = () => {
  const theme = useAppTheme();
  const [notificationCount, setNotificationCount] = React.useState(0);
  const { user } = useUser();
  const [imageError, setImageError] = React.useState(false);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const count = await alertService.countPendingAlerts();
        setNotificationCount(count);
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };

    fetchNotificationCount();

    const subscription = Notifications.addNotificationReceivedListener(() => {
      setNotificationCount((prev) => prev + 1);
    });

    return () => subscription.remove();
  }, []);

  const avatarSource = useMemo(() => {
    if (user?.profilePicture && !imageError) {
      const imageUrl = `${env.apiUrl}${user.profilePicture}`;
      return { uri: imageUrl };
    }
    return require("@/assets/images/default-avatar.png");
  }, [user?.profilePicture, imageError]);

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.avatarContainer, { borderColor: theme.border }]}
        onPress={() => router.push("/(modules)/profile")}
      >
        <Image
          source={avatarSource}
          style={styles.avatar}
          onError={() => {
            console.log("Error loading profile image");
            setImageError(true);
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.notificationButton,
          { backgroundColor: "rgba(0,0,0,0.03)" },
        ]}
        onPress={() => router.push("/(modules)/alerts")}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color={theme.textSecondary}
        />
        {notificationCount > 0 && (
          <View
            style={[
              styles.notificationBadge,
              {
                backgroundColor: theme.error,
              },
            ]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

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
          // Use alertService to count pending alerts
          const count = await alertService.countPendingAlerts();
          setNotificationCount(count);
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
            headerTitle: (props) => <CustomHeaderTitle />,
            headerRight: () => <CustomHeaderRight />,
            headerTitleAlign: "left",
            headerLeft: () => null,
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.background,
              height: 120,
              shadowOpacity: 0.1,
              elevation: 1,
            },
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
            headerTitle: (props) => <GardensHeaderTitle />,
            headerRight: () => <CustomHeaderRight />,
            headerLeft: () => null,
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.background,
              elevation: 1,
            },
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

        {/* 3. Community Tab */}
        <Tabs.Screen
          name="community/index"
          options={{
            title: "Cộng đồng",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
            headerTitle: (props) => <CommunityHeaderTitle />,
            headerRight: () => <CustomHeaderRight />,
            headerTitleAlign: "left",
            headerStyle: {
              backgroundColor: theme.background,
              elevation: 1,
            },
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
            headerTitle: (props) => <TasksHeaderTitle />,
            headerRight: () => <CustomHeaderRight />,
            headerTitleAlign: "left",
            headerStyle: {
              backgroundColor: theme.background,
              elevation: 1,
            },
          }}
        />

        {/* Hidden screen for creating tasks */}
        <Tabs.Screen 
          name="tasks/create" 
          options={{
            href: null, 
            headerTitle: "Tạo công việc mới",
            // You might want to use a custom header like in create.tsx or rely on Stack options
            // For now, using a simple title. It will use the default header style.
          }}
        />

        {/* Hidden screen for task details */}
        <Tabs.Screen 
          name="tasks/[id]" 
          options={{
            href: null, 
            headerShown: false,
          }}
        />

        {/* 5. Journal Tab - Garden activity journal */}
        <Tabs.Screen
          name="journal/index"
          options={{
            title: "Nhật ký",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="notebook" size={size} color={color} />
            ),
            headerTitle: (props) => <JournalHeaderTitle />,
            headerRight: () => <CustomHeaderRight />,
            headerTitleAlign: "left",
            headerStyle: {
              backgroundColor: theme.background,
              elevation: 1,
            },
          }}
        />

        {/* 6. Profile Tab - User profile and settings */}
        <Tabs.Screen
          name="profile/index"
          options={{
            title: "Cá nhân",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="user" size={size - 2} color={color} />
            ),
            headerTitle: (props) => <ProfileHeaderTitle />,
            headerRight: () => null,
            headerTitleAlign: "left",
            headerStyle: {
              backgroundColor: theme.background,
              elevation: 1,
            },
          }}
        />

        {/* Hidden screens that will be accessed from main tabs */}
        <Tabs.Screen
          name="alerts"
          options={{
            href: null,
            headerShown: false,
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
            headerShown: false,
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

// Styles for custom header components
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    marginLeft: 0,
  },
  logoWithText: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 0,
  },
  logo: {
    width: 40,
    height: 40,
    marginLeft: 0,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  textContainer: {
    marginLeft: 6, // khoảng cách giữa logo và text
    flexDirection: "column", // mặc định là cột, có thể không cần khai báo
  },
  appTitle: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  greetingContainer: {
    flexDirection: "column",
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  userName: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  avatarContainer: {
    marginRight: 6,
    borderWidth: 2,
    borderRadius: 22,
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  // Styles for other tab headers
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitleText: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
  },
  sharedActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  iconButton: {
    padding: 8,
  },
});
