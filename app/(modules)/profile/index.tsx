import React, { useCallback, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  Pressable,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { removeItem } from "@/utils/asyncStorage";
import { userService } from "@/service/api";
import { isGardener } from "@/types/users/user.types";
import env from "@/config/environment";
import { LinearGradient } from "expo-linear-gradient";
import { ONBOARDING_COMPLETED_KEY } from "@/constants/strings";

const CustomSwitch = ({
  value,
  onValueChange,
  disabled,
  tint,
  theme,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled: boolean;
  tint: string;
  theme: any;
}) => (
  <Pressable
    onPress={() => {
      if (!disabled) {
        onValueChange(!value);
      }
    }}
    style={{ padding: 5 }}
    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
  >
    <Switch
      trackColor={{ false: "#767577", true: tint }}
      thumbColor={value ? theme.primary : "#f4f3f4"}
      ios_backgroundColor="#3e3e3e"
      onValueChange={onValueChange}
      value={value}
      disabled={disabled}
    />
  </Pressable>
);

export default function ProfileScreen() {
  const { user, signOut } = useUser();
  const appTheme = useAppTheme();
  const {
    setTheme,
    isDarkMode,
    theme: themeMode,
    effectiveColorScheme,
  } = useTheme();

  const [loading, setLoading] = useState(false);
  const [experienceProgress, setExperienceProgress] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const profileScale = useRef(new Animated.Value(0.95)).current;
  const expBarWidth = useRef(new Animated.Value(0)).current;

  const darkModeInteractingRef = useRef(false);
  const systemThemeInteractingRef = useRef(false);
  const lastSwitchTimeRef = useRef(0);

  // Fetch user's experience progress
  useEffect(() => {
    const fetchExperienceProgress = async () => {
      if (!user || !isGardener(user)) return;

      try {
        setLoading(true);
        const progress = await userService.getExperienceProgress();
        setExperienceProgress(progress);

        // Animate experience bar
        Animated.timing(expBarWidth, {
          toValue: progress?.percentToNextLevel || 0,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      } catch (err) {
        console.error("Không thể tải dữ liệu kinh nghiệm:", err);
        setError("Không thể tải dữ liệu kinh nghiệm");
      } finally {
        setLoading(false);
      }
    };

    fetchExperienceProgress();

    // Animate profile card entrance
    Animated.spring(profileScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      darkModeInteractingRef.current = false;
      systemThemeInteractingRef.current = false;
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [isDarkMode, themeMode]);

  const handleThemeChange = useCallback(
    (value: boolean) => {
      if (darkModeInteractingRef.current) return;
      darkModeInteractingRef.current = true;
      const now = Date.now();
      if (now - lastSwitchTimeRef.current < 500) return;
      lastSwitchTimeRef.current = now;

      if (typeof setTheme !== "function" || typeof isDarkMode === "undefined")
        return;

      if ((value && !isDarkMode) || (!value && isDarkMode)) {
        setTheme(value ? "dark" : "light");
      }
    },
    [isDarkMode, setTheme]
  );

  const handleSystemThemeToggle = useCallback(
    (useSystemTheme: boolean) => {
      if (systemThemeInteractingRef.current) return;
      systemThemeInteractingRef.current = true;
      const now = Date.now();
      if (now - lastSwitchTimeRef.current < 500) return;
      lastSwitchTimeRef.current = now;

      if (useSystemTheme && themeMode !== "system") {
        setTheme("system");
      } else if (!useSystemTheme && themeMode === "system") {
        setTheme(effectiveColorScheme);
      }
    },
    [themeMode, effectiveColorScheme, setTheme]
  );

  const handleUpdateProfile = useCallback(async () => {
    router.push("/(modules)/profile/edit");
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
      Alert.alert("Lỗi", "Đăng xuất thất bại. Vui lòng thử lại.");
    }
  };

  const resetOnboarding = async () => {
    try {
      Alert.alert(
        "Đặt lại hướng dẫn",
        "Thao tác này sẽ đặt lại màn hình hướng dẫn và đăng xuất tài khoản của bạn. Bạn có chắc chắn không?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xác nhận",
            onPress: async () => {
              await removeItem(ONBOARDING_COMPLETED_KEY);
              handleSignOut();
            },
            style: "destructive",
          },
        ]
      );
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đặt lại trạng thái hướng dẫn");
    }
  };

  const progressToNextLevel = () => {
    if (experienceProgress) {
      return experienceProgress.percentToNextLevel;
    } else if (user && isGardener(user)) {
      // Fallback to a default value if we don't have experience progress
      return 75;
    }
    return 0;
  };

  // Chuyển đổi cấp độ thành văn bản tiếng Việt
  const getVietnameseLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      "Novice Gardener": "Người Làm Vườn Tập Sự",
      "Amateur Gardener": "Người Làm Vườn Nghiệp Dư",
      "Gardening Enthusiast": "Người Đam Mê Làm Vườn",
      "Green Thumb": "Người Có Bàn Tay Xanh",
      "Garden Master": "Bậc Thầy Làm Vườn",
      "Plant Expert": "Chuyên Gia Cây Trồng",
      "Master Gardener": "Bậc Thầy Làm Vườn",
      "Garden Guru": "Đại Sư Làm Vườn",
    };

    return levelMap[level] || level;
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: appTheme.backgroundSecondary },
      ]}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[appTheme.primary, appTheme.primary + "CC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <Animated.View
            style={[
              styles.profileImageContainer,
              { transform: [{ scale: profileScale }] },
            ]}
          >
            <Image
              source={{
                uri:
                  `${env.apiUrl}${user?.profilePicture}` ||
                  "https://i.pravatar.cc/150?img=11",
              }}
              style={styles.profileImage}
            />
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: appTheme.backgroundSecondary },
              ]}
            >
              <Text style={[styles.levelText, { color: appTheme.primary }]}>
                {user && isGardener(user) ? user?.experienceLevel?.icon : "🌱"}{" "}
                {user && isGardener(user) ? user?.experienceLevel?.level : 1}
              </Text>
            </View>
          </Animated.View>

          <Text style={styles.profileName}>
            {user ? `${user.firstName} ${user.lastName}` : "Người Yêu Cây"}
          </Text>
          <Text style={styles.profileRole}>
            {user?.role?.name === "GARDENER"
              ? "NGƯỜI LÀM VƯỜN"
              : user?.role?.name || "NGƯỜI LÀM VƯỜN"}
          </Text>

          {user && isGardener(user) && (
            <View style={styles.experienceContainer}>
              <View style={styles.experienceBar}>
                <Animated.View
                  style={[
                    styles.experienceFill,
                    {
                      width: expBarWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#FFFFFF", "#F0F0F0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.experienceGradient}
                  />
                </Animated.View>
              </View>
              <Text style={styles.experienceText}>
                {getVietnameseLevel(
                  user.experienceLevel?.title || "Người Làm Vườn Tập Sự"
                )}{" "}
                • {user.experiencePoints} XP
              </Text>
            </View>
          )}
        </LinearGradient>

        <Animated.View
          style={[
            styles.detailsContainer,
            {
              backgroundColor: appTheme.card,
              transform: [{ scale: profileScale }],
              opacity: profileScale,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>
            Thông Tin Cá Nhân
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={appTheme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[styles.infoLabel, { color: appTheme.textSecondary }]}
              >
                Email
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.email || "gardener@example.com"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="call-outline"
                size={20}
                color={appTheme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[styles.infoLabel, { color: appTheme.textSecondary }]}
              >
                Điện Thoại
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.phoneNumber || "Chưa cung cấp"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={appTheme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[styles.infoLabel, { color: appTheme.textSecondary }]}
              >
                Ngày Sinh
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                  : "Chưa cung cấp"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="location-outline"
                size={20}
                color={appTheme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text
                style={[styles.infoLabel, { color: appTheme.textSecondary }]}
              >
                Địa Chỉ
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.address || "Chưa cung cấp"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editDetailsButton}
            onPress={() => router.push("/(modules)/profile/edit")}
          >
            <Feather name="edit-2" size={16} color={appTheme.primary} />
            <Text style={[styles.editDetailsText, { color: appTheme.primary }]}>
              Chỉnh Sửa Thông Tin
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.statsContainer,
            {
              backgroundColor: appTheme.card,
              transform: [{ scale: profileScale }],
              opacity: profileScale,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>
            Thống Kê Vườn
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: appTheme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="flower"
                  size={24}
                  color={appTheme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: appTheme.text }]}>
                {(user as any)?.gardens?.length ?? 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: appTheme.textSecondary }]}
              >
                Khu Vườn
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: appTheme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="sprout"
                  size={24}
                  color={appTheme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: appTheme.text }]}>
                {(user as any)?.gardener?.plants?.length ?? 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: appTheme.textSecondary }]}
              >
                Cây Trồng
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: appTheme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={24}
                  color={appTheme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: appTheme.text }]}>
                {experienceProgress?.daysActive ?? 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: appTheme.textSecondary }]}
              >
                Ngày Hoạt Động
              </Text>
            </View>
          </View>
        </Animated.View>

        <View
          style={[styles.settingsSection, { backgroundColor: appTheme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>
            Cài Đặt
          </Text>
          <View style={styles.menuItem}>
            <Ionicons
              name="moon-outline"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Chế Độ Tối
            </Text>
            <CustomSwitch
              value={isDarkMode}
              onValueChange={handleThemeChange}
              disabled={themeMode === "system"}
              tint={`${appTheme.primary}80`}
              theme={appTheme}
            />
          </View>
          <View style={styles.menuItem}>
            <Ionicons
              name="color-palette-outline"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Theo Giao Diện Hệ Thống
            </Text>
            <CustomSwitch
              value={themeMode === "system"}
              onValueChange={handleSystemThemeToggle}
              disabled={false}
              tint={`${appTheme.primary}80`}
              theme={appTheme}
            />
          </View>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/notification-settings")}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Thông Báo
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={appTheme.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/privacy")}
          >
            <MaterialCommunityIcons
              name="shield-account-outline"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Quyền Riêng Tư
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={appTheme.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/help")}
          >
            <Ionicons
              name="help-buoy-outline"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Trợ Giúp & Hỗ Trợ
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={appTheme.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/profile/about")}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Về Ứng Dụng
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={appTheme.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.dangerZone, { backgroundColor: appTheme.card }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.error }]}>
            Vùng Nguy Hiểm
          </Text>
          <TouchableOpacity style={styles.menuItem} onPress={resetOnboarding}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color={appTheme.error}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.error }]}>
              Đặt Lại Hướng Dẫn
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={appTheme.error}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.error }]}>
              Đăng Xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  levelBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Inter-Bold",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    fontFamily: "Inter-Bold",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileRole: {
    fontSize: 14,
    color: "#FFFFFFB3",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Inter-SemiBold",
  },
  experienceContainer: {
    width: "80%",
    alignItems: "center",
  },
  experienceBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#FFFFFF40",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#FFFFFF30",
  },
  experienceFill: {
    height: "100%",
    borderRadius: 6,
  },
  experienceGradient: {
    width: "100%",
    height: "100%",
  },
  experienceText: {
    fontSize: 12,
    color: "#FFFFFFB3",
    fontFamily: "Inter-Medium",
  },
  detailsContainer: {
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 15,
    fontFamily: "Inter-Bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  infoIcon: {
    width: 30,
    alignItems: "center",
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: "Inter-Regular",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter-Medium",
  },
  editDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  editDetailsText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  statsContainer: {
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
    fontFamily: "Inter-Bold",
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter-Regular",
  },
  settingsSection: {
    marginHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dangerZone: {
    marginHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
});
