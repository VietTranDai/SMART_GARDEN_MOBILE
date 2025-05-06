import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import useSectionAnimation from "@/hooks/useSectionAnimation";

interface HeaderBarProps {
  userName: string;
  hasNotifications: boolean;
}

const HeaderBar: React.FC<HeaderBarProps> = React.memo(
  ({ userName, hasNotifications }) => {
    const theme = useAppTheme();
    const { getAnimatedStyle } = useSectionAnimation("header");
    const notificationPulse = useRef(new Animated.Value(1)).current;
    const logoScale = useRef(new Animated.Value(1)).current;

    // Get greeting based on time of day
    const getGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) return "Chào buổi sáng";
      if (currentHour < 18) return "Chào buổi chiều";
      return "Chào buổi tối";
    };

    // Logo animation on mount
    useEffect(() => {
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    // Notification badge animation
    useEffect(() => {
      if (hasNotifications) {
        // Start pulsing animation
        const animation = Animated.loop(
          Animated.sequence([
            Animated.timing(notificationPulse, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(notificationPulse, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );

        animation.start();

        return () => {
          animation.stop();
        };
      } else {
        // Reset animation if no notifications
        notificationPulse.setValue(1);
      }
    }, [hasNotifications, notificationPulse]);

    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
          },
          getAnimatedStyle(),
        ]}
      >
        <View style={styles.titleContainer}>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.appTitle, { color: theme.primary }]}>
              Smart Farm
            </Text>
          </Animated.View>
        </View>

        <View style={styles.userSection}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text
              style={[styles.userName, { color: theme.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userName || "Người dùng"}
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.avatarContainer, { borderColor: theme.border }]}
              onPress={() => router.push("/(modules)/profile")}
              accessibilityLabel="Hồ sơ người dùng"
              accessibilityRole="button"
            >
              <Image
                source={require("@/assets/images/default-avatar.png")}
                style={styles.avatar}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.notificationButton,
                { backgroundColor: "rgba(0,0,0,0.03)" },
              ]}
              onPress={() => router.push("/(modules)/alerts")}
              accessibilityLabel={
                hasNotifications ? "Bạn có thông báo mới" : "Thông báo"
              }
              accessibilityHint="Nhấn để xem thông báo"
              accessibilityRole="button"
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={theme.textSecondary}
              />
              {hasNotifications && (
                <Animated.View
                  style={[
                    styles.notificationBadge,
                    {
                      backgroundColor: theme.error,
                      opacity: notificationPulse,
                      transform: [{ scale: notificationPulse }],
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  titleContainer: {
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  appTitle: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
  },
  userSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingContainer: {
    flex: 1,
    marginRight: 16,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    marginRight: 16,
    borderWidth: 2,
    borderRadius: 22,
    padding: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0,0.2)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});

export default HeaderBar;
