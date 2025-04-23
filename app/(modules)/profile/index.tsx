import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useUser } from "@/contexts/UserContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, signOut } = useUser();
  const theme = useAppTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const progressToNextLevel = () => {
    if (!user?.gardener) return 0;

    // Calculate progress percentage
    // This would ideally come from comparing current XP to next level's min XP
    // For now, we'll use a placeholder value
    return 75;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View
          style={[styles.profileHeader, { backgroundColor: theme.primary }]}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: user?.profilePicture || "https://i.pravatar.cc/150?img=11",
              }}
              style={styles.profileImage}
            />
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Text style={[styles.levelText, { color: theme.primary }]}>
                {user?.gardener?.experienceLevel?.icon || "🌱"}{" "}
                {user?.gardener?.experienceLevel?.level || 1}
              </Text>
            </View>
          </View>

          <Text style={styles.profileName}>
            {user ? `${user.firstName} ${user.lastName}` : "Garden Enthusiast"}
          </Text>
          <Text style={styles.profileRole}>{user?.roleName || "GARDENER"}</Text>

          {user?.gardener && (
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
                {user.gardener.experienceLevel?.title || "Novice Gardener"} •{" "}
                {user.gardener.experiencePoints} XP
              </Text>
            </View>
          )}
        </View>

        {/* Profile Details */}
        <View
          style={[styles.detailsContainer, { backgroundColor: theme.card }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Personal Information
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Email
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {user?.email || "gardener@example.com"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Phone
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {user?.phoneNumber || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Date of Birth
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
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
                color={theme.primary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Address
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {user?.address || "Not provided"}
              </Text>
            </View>
          </View>
        </View>

        {/* Gardener Stats */}
        <View style={[styles.statsContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Gardener Statistics
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="flower"
                  size={24}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>3</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Gardens
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="sprout"
                  size={24}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Plants
              </Text>
            </View>

            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={24}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>24</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Tasks Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => router.push("/(modules)/profile/edit")}
          >
            <Ionicons name="create-outline" size={20} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.text }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => router.push("/(modules)/settings")}
          >
            <Ionicons name="settings-outline" size={20} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.text }]}>
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
            <Text style={[styles.actionText, { color: theme.error }]}>
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
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    padding: 24,
    paddingBottom: 30,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "white",
  },
  levelBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
  },
  levelText: {
    fontSize: 12,
    fontFamily: "Inter-Bold",
  },
  profileName: {
    fontSize: 22,
    fontFamily: "Inter-Bold",
    color: "white",
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  experienceContainer: {
    width: "100%",
    alignItems: "center",
  },
  experienceBar: {
    width: "80%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  experienceFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 3,
  },
  experienceText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "rgba(255, 255, 255, 0.9)",
  },
  detailsContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  statsContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
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
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
  },
  actionsContainer: {
    margin: 16,
    marginTop: 0,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
});
