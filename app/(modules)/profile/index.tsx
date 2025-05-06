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
} from "react-native";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { removeItem } from "@/utils/asyncStorage";
import { userService } from "@/service/api";
import { isGardener } from "@/types/users/user.types";
import env from "@/config/environment";

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
      } catch (err) {
        console.error("Failed to fetch experience progress:", err);
        setError("Could not load experience data");
      } finally {
        setLoading(false);
      }
    };

    fetchExperienceProgress();
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
      console.error("Failed to sign out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const resetOnboarding = async () => {
    try {
      Alert.alert(
        "Reset Onboarding",
        "This will reset the onboarding screens and sign you out. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "OK",
            onPress: async () => {
              await removeItem("@onboarding_completed");
              handleSignOut();
            },
            style: "destructive",
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reset onboarding status");
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

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: appTheme.backgroundSecondary },
      ]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[styles.profileHeader, { backgroundColor: appTheme.primary }]}
        >
          <View style={styles.profileImageContainer}>
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
          </View>

          <Text style={styles.profileName}>
            {user ? `${user.firstName} ${user.lastName}` : "Garden Enthusiast"}
          </Text>
          <Text style={styles.profileRole}>
            {user?.role?.name || "GARDENER"}
          </Text>

          {user && isGardener(user) && (
            <View style={styles.experienceContainer}>
              <View style={styles.experienceBar}>
                <View
                  style={[
                    styles.experienceFill,
                    { width: `${progressToNextLevel()}%` },
                  ]}
                />
              </View>
              <Text style={styles.experienceText}>
                {user.experienceLevel?.title || "Novice Gardener"} •{" "}
                {user.experiencePoints} XP
              </Text>
            </View>
          )}
        </View>

        <View
          style={[styles.detailsContainer, { backgroundColor: appTheme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>
            Personal Information
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
                Phone
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.phoneNumber || "Not provided"}
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
                Date of Birth
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString()
                  : "Not provided"}
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
                Address
              </Text>
              <Text style={[styles.infoValue, { color: appTheme.text }]}>
                {user?.address || "Not provided"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editDetailsButton}
            onPress={() => router.push("/(modules)/profile/edit")}
          >
            <Feather name="edit-2" size={16} color={appTheme.primary} />
            <Text style={[styles.editDetailsText, { color: appTheme.primary }]}>
              Edit Details
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.statsContainer, { backgroundColor: appTheme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>
            Gardener Statistics
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
                Gardens
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
                Plants
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
                  name="calendar-check"
                  size={24}
                  color={appTheme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: appTheme.text }]}>
                {(user as any)?.gardener?.completedTasks ?? 0}
              </Text>
              <Text
                style={[styles.statLabel, { color: appTheme.textSecondary }]}
              >
                Tasks Completed
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[styles.settingsSection, { backgroundColor: appTheme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>
            Settings & More
          </Text>

          <View style={[styles.menuItem]}>
            <Feather
              name="moon"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Dark Mode
            </Text>
            <CustomSwitch
              value={isDarkMode}
              onValueChange={handleThemeChange}
              disabled={themeMode === "system"}
              tint={`${appTheme.primary}80`}
              theme={appTheme}
            />
          </View>
          <View style={[styles.menuItem]}>
            <Feather
              name="smartphone"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Use System Settings
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
            onPress={() => router.push("/profile/help")}
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={appTheme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.text }]}>
              Help & Support
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
              About
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
            Danger Zone
          </Text>
          <TouchableOpacity style={styles.menuItem} onPress={resetOnboarding}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color={appTheme.error}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: appTheme.error }]}>
              Reset Onboarding
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
              Sign Out
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
  },
  levelText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: "#FFFFFFB3",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  experienceContainer: {
    width: "80%",
    alignItems: "center",
  },
  experienceBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#FFFFFF40",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  experienceFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  experienceText: {
    fontSize: 12,
    color: "#FFFFFFB3",
  },
  detailsContainer: {
    marginHorizontal: 15,
    marginTop: -20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  editDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 8,
  },
  editDetailsText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  settingsSection: {
    marginHorizontal: 15,
    borderRadius: 12,
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
    borderRadius: 12,
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
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  menuIcon: {
    width: 30,
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
  },
});
