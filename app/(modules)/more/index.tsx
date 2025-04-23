import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { removeItem } from "@/utils/asyncStorage";
import { useUser } from "@/contexts/UserContext";
import { useTheme } from "@/contexts/ThemeContext";
import { debounce } from "@/utils/themeUtils";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function MoreScreen() {
  const theme = useAppTheme();
  const { signOut } = useUser();
  const {
    setTheme,
    toggleTheme,
    isDarkMode,
    theme: themeMode,
    effectiveColorScheme,
  } = useTheme();

  // Refs to track switch interactions and prevent double toggles
  const darkModeInteractingRef = useRef(false);
  const systemThemeInteractingRef = useRef(false);
  const lastSwitchTimeRef = useRef(0);

  // Reset interaction flags after some time
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      darkModeInteractingRef.current = false;
      systemThemeInteractingRef.current = false;
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isDarkMode, themeMode]);

  const resetOnboarding = async () => {
    try {
      Alert.alert(
        "Reset Onboarding",
        "This will reset the onboarding screens and sign you out. Continue?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              await removeItem("@onboarding_completed");
              handleSignOut();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reset onboarding status");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by the root layout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleThemeChange = useCallback(
    (value: boolean) => {
      try {
        // Prevent duplicate calls
        if (darkModeInteractingRef.current) return;
        darkModeInteractingRef.current = true;

        // Check if we need to throttle
        const now = Date.now();
        if (now - lastSwitchTimeRef.current < 500) return;
        lastSwitchTimeRef.current = now;

        // Only proceed if all required values are valid
        if (
          typeof setTheme !== "function" ||
          typeof isDarkMode === "undefined"
        ) {
          console.warn("Theme context not fully initialized");
          return;
        }

        // True = dark mode, False = light mode
        if ((value && !isDarkMode) || (!value && isDarkMode)) {
          setTheme(value ? "dark" : "light");
        }
      } catch (error) {
        console.error("Error in theme change handler:", error);
      }
    },
    [isDarkMode, setTheme]
  );

  const handleSystemThemeToggle = useCallback(
    (useSystemTheme: boolean) => {
      try {
        if (useSystemTheme && themeMode !== "system") {
          setTheme("system");
        } else if (!useSystemTheme && themeMode === "system") {
          setTheme(effectiveColorScheme);
        }
      } catch (error) {
        console.error("Error toggling system theme:", error);
      }
    },
    [themeMode, effectiveColorScheme, setTheme]
  );

  // Create custom switch component to improve reliability
  const CustomSwitch = ({
    value,
    onValueChange,
    disabled,
    tint,
  }: {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled: boolean;
    tint: string;
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card }]}
            onPress={() => router.push("/(modules)/profile" as any)}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={theme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Profile
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card }]}
            onPress={() => {
              /* Navigate to account settings */
            }}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={theme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Settings
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Appearance
          </Text>

          <View style={[styles.menuItem, { backgroundColor: theme.card }]}>
            <Feather
              name="moon"
              size={24}
              color={theme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Dark Mode
            </Text>
            <CustomSwitch
              value={isDarkMode}
              onValueChange={handleThemeChange}
              disabled={themeMode === "system"}
              tint={`${theme.primary}80`}
            />
          </View>

          <View style={[styles.menuItem, { backgroundColor: theme.card }]}>
            <Feather
              name="smartphone"
              size={24}
              color={theme.primary}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Use System Settings
            </Text>
            <CustomSwitch
              value={themeMode === "system"}
              onValueChange={handleSystemThemeToggle}
              disabled={false}
              tint={`${theme.primary}80`}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Help & Support
          </Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card }]}
            onPress={() => {
              /* Navigate to help center */
            }}
          >
            <Ionicons
              name="help-circle-outline"
              size={24}
              color={theme.info}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Help Center
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card }]}
            onPress={() => {
              /* Navigate to contact support */
            }}
          >
            <Ionicons
              name="mail-outline"
              size={24}
              color={theme.info}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Contact Support
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>App</Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card }]}
            onPress={resetOnboarding}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={theme.warning}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Reset Onboarding
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card }]}
            onPress={handleSignOut}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={theme.error}
              style={styles.menuIcon}
            />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Sign Out
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>
            Version 1.0.0
          </Text>
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});
