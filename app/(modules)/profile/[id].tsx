import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  AntDesign,
  Feather,
} from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { gardenService, userService } from "@/service/api";
import { communityService } from "@/service/api";
import { GardenerProfile } from "@/types/users/user.types";
import { Garden } from "@/types/gardens/garden.types";
import env from "@/config/environment";
import { useUser } from "@/contexts/UserContext";

const screenWidth = Dimensions.get("window").width;

export default function GardenerProfileScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useUser();
  const [gardener, setGardener] = useState<GardenerProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "gardens" | "stats">(
    "posts"
  );

  const isCurrentUser = currentUser && currentUser.id.toString() === id;

  // Fetch gardener profile data
  const fetchProfile = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // If viewing current user's profile, use data from context
      if (isCurrentUser && currentUser) {
        setGardener(currentUser as GardenerProfile);
        setFollowing(false); // Can't follow yourself
      } else {
        // Fetch gardener profile with statistics
        const gardenerData = await userService.getGardenerProfile(id);

        // Make sure the required data exists - if role is undefined, use default values
        const safeGardenerData = {
          ...gardenerData,
          role: gardenerData.role || { id: 0, name: "GARDENER" },
          experienceLevel: gardenerData.experienceLevel || {
            id: 1,
            level: 1,
            minXP: 0,
            maxXP: 100,
            title: "Beginner",
            description: "Starting gardener",
            icon: "🌱",
          },
        };

        setGardener(safeGardenerData);
        setFollowing(gardenerData.isFollowing || false);
      }

      // Fetch gardener's posts
      const postsData = await communityService.getPosts({
        gardenerId: Number(id),
      });
      setPosts(postsData || []);

      // Fetch gardener's gardens
      try {
        const gardensData = await gardenService.getGardens();
        setGardens(gardensData || []);
      } catch (gardensErr) {
        console.error("Could not fetch gardens:", gardensErr);
        setGardens([]);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, isCurrentUser, currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  const handleFollow = useCallback(async () => {
    if (!id || !gardener || isCurrentUser) return;

    try {
      if (following) {
        await communityService.unfollowUser(id);
        setFollowing(false);
        setGardener({
          ...gardener,
          isFollowing: false,
          followers: (gardener.followers || 0) - 1,
        });
      } else {
        await communityService.followUser(id);
        setFollowing(true);
        setGardener({
          ...gardener,
          isFollowing: true,
          followers: (gardener.followers || 0) + 1,
        });
      }
    } catch (err) {
      console.error("Failed to follow/unfollow:", err);
    }
  }, [following, id, gardener, isCurrentUser]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
    });
  };

  const formatNumber = (number: number) => {
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}k`;
    }
    return number.toString();
  };

  const renderPostItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.postCard, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/(modules)/community/${item.id}`)}
    >
      <View style={styles.postHeader}>
        {item.garden && (
          <View style={styles.gardenTag}>
            <Ionicons name="leaf" size={14} color={theme.primary} />
            <Text style={[styles.gardenName, { color: theme.textSecondary }]}>
              {item.garden.name || "Unnamed Garden"}
            </Text>
          </View>
        )}
        <Text style={[styles.postDate, { color: theme.textTertiary }]}>
          {item.createdAt ? formatDate(item.createdAt) : "No date"}
        </Text>
      </View>

      <Text style={[styles.postTitle, { color: theme.text }]}>
        {item.title || "Untitled Post"}
      </Text>
      <Text
        style={[styles.postContent, { color: theme.textSecondary }]}
        numberOfLines={3}
      >
        {item.content || "No content"}
      </Text>

      {item.images && item.images.length > 0 && item.images[0]?.url && (
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.tagContainer}>
        {item.tags &&
          item.tags.map((tagObj: any, index: number) => (
            <View
              key={index}
              style={[
                styles.tagBadge,
                { backgroundColor: theme.primary + "20" },
              ]}
            >
              <Text style={[styles.tagText, { color: theme.primary }]}>
                #{tagObj.tag?.name || "tag"}
              </Text>
            </View>
          ))}
      </View>

      <View style={[styles.postFooter, { borderTopColor: theme.borderLight }]}>
        <View style={styles.footerAction}>
          <Ionicons
            name="arrow-up-outline"
            size={18}
            color={theme.textSecondary}
          />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>
            {item.total_vote || 0}
          </Text>
        </View>
        <View style={styles.footerAction}>
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>
            {item._count?.comments || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGardenItem = ({ item }: { item: Garden }) => (
    <TouchableOpacity
      style={[styles.gardenCard, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/(modules)/gardens/${item.id}`)}
    >
      <View
        style={[
          styles.gardenTypeTag,
          {
            backgroundColor:
              item.type === "INDOOR" ? theme.info + "30" : theme.success + "30",
          },
        ]}
      >
        <Ionicons
          name={item.type === "INDOOR" ? "home-outline" : "sunny-outline"}
          size={14}
          color={item.type === "INDOOR" ? theme.info : theme.success}
        />
        <Text
          style={[
            styles.gardenTypeText,
            {
              color: item.type === "INDOOR" ? theme.info : theme.success,
            },
          ]}
        >
          {item.type === "INDOOR" ? "Indoor" : "Outdoor"}
        </Text>
      </View>

      <Text style={[styles.gardenCardTitle, { color: theme.text }]}>
        {item.name || "Unnamed Garden"}
      </Text>

      {item.plantName && (
        <View style={styles.plantRow}>
          <Ionicons name="leaf" size={14} color={theme.primary} />
          <Text style={[styles.plantText, { color: theme.textSecondary }]}>
            {item.plantName}
          </Text>
        </View>
      )}

      {item.plantGrowStage && (
        <View style={styles.plantRow}>
          <MaterialCommunityIcons
            name="sprout"
            size={14}
            color={theme.success}
          />
          <Text style={[styles.plantText, { color: theme.textSecondary }]}>
            {item.plantGrowStage}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderStatItem = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    color: string = theme.primary
  ) => (
    <View style={[styles.statItemDetailed, { backgroundColor: theme.card }]}>
      <View
        style={[styles.statIconContainer, { backgroundColor: color + "15" }]}
      >
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, { color: theme.textSecondary }]}>
          {title}
        </Text>
        <Text style={[styles.statValueLarge, { color: theme.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );

  const renderProgressBar = (
    label: string,
    progress: number,
    color: string = theme.primary
  ) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
        <Text
          style={[styles.progressValue, { color: theme.textSecondary }]}
        >{`${Math.round(progress)}%`}</Text>
      </View>
      <View
        style={[
          styles.progressTrack,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: color,
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
            },
          ]}
        />
      </View>
    </View>
  );

  const renderStatsContent = () => {
    if (!gardener) return null;

    // Safely access properties with null checks and default values
    const gardens = gardener.gardens || 0;
    const indoorGardens = gardener.indoorGardens || 0;
    const outdoorGardens = gardener.outdoorGardens || 0;
    const completedTasks = gardener.completedTasks || 0;
    const pendingTasks = gardener.pendingTasks || 0;
    const skippedTasks = gardener.skippedTasks || 0;
    const taskCompletionRate = gardener.taskCompletionRate || 0;
    const plantTypesCount = gardener.plantTypes?.count || 0;
    const experiencePointsToNextLevel =
      gardener.experiencePointsToNextLevel || 0;
    const experienceLevelProgress = gardener.experienceLevelProgress || 0;
    const totalVotesReceived = gardener.totalVotesReceived || 0;
    const totalCommentsReceived = gardener.totalCommentsReceived || 0;
    const totalPhotoEvaluations = gardener.totalPhotoEvaluations || 0;
    const totalActivities = gardener.totalActivities || 0;
    const joinedSince = gardener.joinedSince || gardener.createdAt || "N/A";
    const levelIcon = gardener.experienceLevel?.icon || "🌱";
    const levelTitle = gardener.experienceLevel?.title || "Gardener";
    const levelNumber = gardener.experienceLevel?.level || 1;

    return (
      <View style={styles.statsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Experience
        </Text>

        {/* Experience Progress */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.levelInfoRow}>
            <View style={styles.levelIconContainer}>
              <Text style={styles.levelIconLarge}>{levelIcon}</Text>
            </View>
            <View style={styles.levelDetails}>
              <Text style={[styles.levelTitle, { color: theme.text }]}>
                {levelTitle}
              </Text>
              <Text
                style={[styles.levelSubtitle, { color: theme.textSecondary }]}
              >
                Level {levelNumber}
              </Text>
              <View style={styles.xpInfoRow}>
                <Text style={[styles.xpText, { color: theme.primary }]}>
                  {gardener.experiencePoints || 0} XP
                </Text>
                <Text
                  style={[styles.xpNeedText, { color: theme.textTertiary }]}
                >
                  {experiencePointsToNextLevel} XP to next level
                </Text>
              </View>
            </View>
          </View>
          {renderProgressBar("Level Progress", experienceLevelProgress)}
        </View>

        <Text
          style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}
        >
          Garden Statistics
        </Text>

        {/* Garden Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatItem(
            <Ionicons name="leaf" size={22} color={theme.primary} />,
            "Total Gardens",
            formatNumber(gardens)
          )}
          {renderStatItem(
            <Ionicons name="home" size={22} color={theme.info} />,
            "Indoor Gardens",
            formatNumber(indoorGardens),
            theme.info
          )}
          {renderStatItem(
            <Ionicons name="sunny" size={22} color={theme.success} />,
            "Outdoor Gardens",
            formatNumber(outdoorGardens),
            theme.success
          )}
          {renderStatItem(
            <FontAwesome5 name="seedling" size={20} color={theme.warning} />,
            "Plant Types",
            formatNumber(plantTypesCount),
            theme.warning
          )}
        </View>

        <Text
          style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}
        >
          Task Completion
        </Text>

        {/* Task Stats */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.taskStatsRow}>
            <View style={styles.taskStatColumn}>
              <Text style={[styles.taskStatNumber, { color: theme.success }]}>
                {formatNumber(completedTasks)}
              </Text>
              <Text
                style={[styles.taskStatLabel, { color: theme.textSecondary }]}
              >
                Completed
              </Text>
            </View>
            <View style={styles.taskStatColumn}>
              <Text style={[styles.taskStatNumber, { color: theme.warning }]}>
                {formatNumber(pendingTasks)}
              </Text>
              <Text
                style={[styles.taskStatLabel, { color: theme.textSecondary }]}
              >
                Pending
              </Text>
            </View>
            <View style={styles.taskStatColumn}>
              <Text
                style={[styles.taskStatNumber, { color: theme.textTertiary }]}
              >
                {formatNumber(skippedTasks)}
              </Text>
              <Text
                style={[styles.taskStatLabel, { color: theme.textSecondary }]}
              >
                Skipped
              </Text>
            </View>
          </View>
          {renderProgressBar(
            "Task Completion Rate",
            taskCompletionRate,
            theme.success
          )}
        </View>

        <Text
          style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}
        >
          Community Activity
        </Text>

        {/* Community Stats */}
        <View style={styles.statsGrid}>
          {renderStatItem(
            <AntDesign name="arrowup" size={22} color={theme.primary} />,
            "Votes Received",
            formatNumber(totalVotesReceived)
          )}
          {renderStatItem(
            <Ionicons name="chatbubble-outline" size={22} color={theme.info} />,
            "Comments",
            formatNumber(totalCommentsReceived),
            theme.info
          )}
          {renderStatItem(
            <Ionicons name="image-outline" size={22} color={theme.success} />,
            "Photo Evaluations",
            formatNumber(totalPhotoEvaluations),
            theme.success
          )}
          {renderStatItem(
            <MaterialCommunityIcons
              name="watering-can"
              size={22}
              color={theme.warning}
            />,
            "Activities",
            formatNumber(totalActivities),
            theme.warning
          )}
        </View>

        {/* Joined Date */}
        <View
          style={[
            styles.joinedDateContainer,
            { borderTopColor: theme.borderLight },
          ]}
        >
          <Feather name="calendar" size={16} color={theme.textTertiary} />
          <Text style={[styles.joinedDateText, { color: theme.textTertiary }]}>
            Gardener since {joinedSince}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!gardener) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: theme.background }]}
      >
        <Ionicons name="alert-circle" size={48} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.text }]}>
          Gardener not found
        </Text>
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: theme.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
          />
        }
      >
        {gardener && (
          <View style={styles.profileSection}>
            <Image
              source={{
                uri:
                  `${env.apiUrl}${gardener.profilePicture}` ||
                  "https://i.pravatar.cc/150?img=11",
              }}
              style={styles.profileImage}
            />
            <Text style={[styles.profileName, { color: theme.text }]}>
              {`${gardener.firstName || ""} ${gardener.lastName || ""}`}
            </Text>
            <Text style={[styles.username, { color: theme.textSecondary }]}>
              @{gardener.username || ""}
            </Text>

            {gardener.experienceLevel && (
              <View style={styles.levelBadge}>
                <Text style={styles.levelIcon}>
                  {gardener.experienceLevel.icon}
                </Text>
                <Text style={[styles.levelText, { color: theme.primary }]}>
                  {gardener.experienceLevel.title} · Level{" "}
                  {gardener.experienceLevel.level}
                </Text>
              </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatNumber(gardener.gardens || 0)}
                </Text>
                <Text
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Gardens
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatNumber(gardener.posts || 0)}
                </Text>
                <Text
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Posts
                </Text>
              </View>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() =>
                  router.push(`/(modules)/profile/${id}/followers`)
                }
              >
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatNumber(gardener.followers || 0)}
                </Text>
                <Text
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Followers
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() =>
                  router.push(`/(modules)/profile/${id}/following`)
                }
              >
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatNumber(gardener.following || 0)}
                </Text>
                <Text
                  style={[styles.statLabel, { color: theme.textSecondary }]}
                >
                  Following
                </Text>
              </TouchableOpacity>
            </View>

            {gardener.bio && (
              <Text style={[styles.bioText, { color: theme.text }]}>
                {gardener.bio}
              </Text>
            )}

            <View style={styles.actionButtons}>
              {isCurrentUser ? (
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => router.push("/(modules)/profile/edit")}
                >
                  <Ionicons name="pencil" size={18} color="#fff" />
                  <Text style={[styles.followButtonText, { color: "#fff" }]}>
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    {
                      backgroundColor: gardener.isFollowing
                        ? theme.backgroundSecondary
                        : theme.primary,
                      borderColor: gardener.isFollowing
                        ? theme.primary
                        : "transparent",
                      borderWidth: gardener.isFollowing ? 1 : 0,
                    },
                  ]}
                  onPress={handleFollow}
                >
                  <Ionicons
                    name={gardener.isFollowing ? "person-remove" : "person-add"}
                    size={18}
                    color={gardener.isFollowing ? theme.primary : "#fff"}
                  />
                  <Text
                    style={[
                      styles.followButtonText,
                      { color: gardener.isFollowing ? theme.primary : "#fff" },
                    ]}
                  >
                    {gardener.isFollowing ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
              )}

              {!isCurrentUser && (
                <TouchableOpacity
                  style={[
                    styles.messageButton,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                  onPress={() => router.push(`/(modules)/messages/chat/${id}`)}
                >
                  <Ionicons name="mail-outline" size={18} color={theme.text} />
                  <Text
                    style={[styles.messageButtonText, { color: theme.text }]}
                  >
                    Message
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "posts" && [
                styles.activeTab,
                { borderBottomColor: theme.primary },
              ],
            ]}
            onPress={() => setActiveTab("posts")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "posts"
                  ? { color: theme.primary }
                  : { color: theme.textSecondary },
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "gardens" && [
                styles.activeTab,
                { borderBottomColor: theme.primary },
              ],
            ]}
            onPress={() => setActiveTab("gardens")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "gardens"
                  ? { color: theme.primary }
                  : { color: theme.textSecondary },
              ]}
            >
              Gardens
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "stats" && [
                styles.activeTab,
                { borderBottomColor: theme.primary },
              ],
            ]}
            onPress={() => setActiveTab("stats")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "stats"
                  ? { color: theme.primary }
                  : { color: theme.textSecondary },
              ]}
            >
              Stats
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === "posts" && (
            <>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <View key={post.id}>{renderPostItem({ item: post })}</View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={48}
                    color={theme.textTertiary}
                  />
                  <Text
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    No posts yet
                  </Text>
                </View>
              )}
            </>
          )}

          {activeTab === "gardens" && (
            <>
              {gardens.length > 0 ? (
                <View style={styles.gardensGrid}>
                  {gardens.map((garden) => (
                    <View key={garden.id} style={styles.gardenGridItem}>
                      {renderGardenItem({ item: garden })}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="leaf-outline"
                    size={48}
                    color={theme.textTertiary}
                  />
                  <Text
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    No gardens yet
                  </Text>
                </View>
              )}
            </>
          )}

          {activeTab === "stats" && renderStatsContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menuButton: {
    padding: 4,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    marginBottom: 12,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  levelIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
    minWidth: 120,
  },
  followButtonText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 8,
    minWidth: 120,
  },
  messageButtonText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  tabContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  postCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  gardenTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  gardenName: {
    fontSize: 12,
    marginLeft: 4,
  },
  postDate: {
    fontSize: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 180,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    paddingTop: 8,
  },
  tagBadge: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  postFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
  },
  gardensGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  gardenGridItem: {
    width: "50%",
    padding: 6,
  },
  gardenCard: {
    borderRadius: 12,
    padding: 12,
    height: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gardenTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  gardenTypeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  gardenCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  plantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  plantText: {
    fontSize: 12,
    marginLeft: 6,
  },
  // New styles for enhanced stats display
  statsContainer: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  levelInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  levelIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    marginRight: 16,
  },
  levelIconLarge: {
    fontSize: 32,
  },
  levelDetails: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  xpInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  xpText: {
    fontSize: 15,
    fontWeight: "600",
  },
  xpNeedText: {
    fontSize: 13,
  },
  progressContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    width: "100%",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -6,
  },
  statItemDetailed: {
    width: (screenWidth - 44) / 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  statValueLarge: {
    fontSize: 20,
    fontWeight: "bold",
  },
  taskStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  taskStatColumn: {
    alignItems: "center",
  },
  taskStatNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  taskStatLabel: {
    fontSize: 13,
  },
  joinedDateContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  joinedDateText: {
    fontSize: 14,
    marginLeft: 8,
  },
});
