import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Interfaces for types based on Prisma schema
interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  email: string;
  username: string;
  bio: string | null;
  createdAt: string;
}

interface ExperienceLevel {
  id: string;
  level: number;
  title: string;
  icon: string;
}

interface Gardener {
  userId: string;
  user: User;
  experiencePoints: number;
  experienceLevel: ExperienceLevel;
  _count: {
    gardens: number;
    posts: number;
    follow: number; // followers
    following: number; // following
  };
  isFollowing?: boolean; // Whether the current user follows this gardener
}

interface Garden {
  id: string;
  name: string;
  plantName?: string;
  plantGrowStage?: string;
  type: string;
}

interface Tag {
  name: string;
}

interface PostTag {
  tagId: string;
  tag: Tag;
}

interface PostImage {
  url: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  total_vote: number;
  tags: PostTag[];
  images: PostImage[];
  garden?: Garden | null;
  _count: {
    comments: number;
  };
}

// Mock data for gardener profile
const MOCK_GARDENER: Gardener = {
  userId: "1",
  user: {
    id: "1",
    firstName: "John",
    lastName: "Garden",
    profilePicture: "https://i.pravatar.cc/150?img=11",
    email: "john.garden@example.com",
    username: "garden_master",
    bio: "Passionate gardener with 5 years of experience. I specialize in organic vegetables and herbs. Love sharing tips and learning from the community!",
    createdAt: "2024-01-15T00:00:00Z",
  },
  experiencePoints: 1250,
  experienceLevel: {
    id: "3",
    level: 3,
    title: "Experienced Gardener",
    icon: "🌱",
  },
  _count: {
    gardens: 3,
    posts: 12,
    follow: 48, // followers
    following: 32, // following
  },
  isFollowing: false,
};

// Mock data for gardens
const MOCK_GARDENS: Garden[] = [
  {
    id: "1",
    name: "Backyard Garden",
    plantName: "Tomatoes",
    plantGrowStage: "Fruiting",
    type: "OUTDOOR",
  },
  {
    id: "2",
    name: "Kitchen Herbs",
    plantName: "Basil, Mint, Parsley",
    plantGrowStage: "Vegetative",
    type: "INDOOR",
  },
  {
    id: "3",
    name: "Flower Bed",
    plantName: "Roses, Tulips",
    plantGrowStage: "Flowering",
    type: "OUTDOOR",
  },
];

// Mock data for posts
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "My tomatoes are thriving!",
    content:
      "I've been using a new organic fertilizer and my tomatoes have never looked better. Has anyone else tried it?",
    createdAt: "2025-04-20T10:00:00Z",
    total_vote: 15,
    tags: [
      { tagId: "1", tag: { name: "Tomatoes" } },
      { tagId: "2", tag: { name: "Organic" } },
      { tagId: "3", tag: { name: "Success" } },
    ],
    images: [{ url: "https://picsum.photos/500/300?random=1" }],
    garden: MOCK_GARDENS[0],
    _count: {
      comments: 5,
    },
  },
  {
    id: "4",
    title: "New herb garden setup",
    content:
      "Just set up my indoor herb garden. Using LED grow lights and a hydroponic system. Looking forward to fresh herbs year-round!",
    createdAt: "2025-04-15T14:25:00Z",
    total_vote: 28,
    tags: [
      { tagId: "9", tag: { name: "Herbs" } },
      { tagId: "10", tag: { name: "Indoor" } },
      { tagId: "11", tag: { name: "Hydroponics" } },
    ],
    images: [
      { url: "https://picsum.photos/500/300?random=5" },
      { url: "https://picsum.photos/500/300?random=6" },
    ],
    garden: MOCK_GARDENS[1],
    _count: {
      comments: 7,
    },
  },
  {
    id: "5",
    title: "Rose pruning tips",
    content:
      "Here's how I prune my roses for maximum blooms. The key is making clean cuts at a 45-degree angle just above an outward-facing bud.",
    createdAt: "2025-04-10T09:12:00Z",
    total_vote: 32,
    tags: [
      { tagId: "12", tag: { name: "Roses" } },
      { tagId: "13", tag: { name: "Pruning" } },
      { tagId: "14", tag: { name: "Tips" } },
    ],
    images: [{ url: "https://picsum.photos/500/300?random=7" }],
    garden: MOCK_GARDENS[2],
    _count: {
      comments: 9,
    },
  },
];

export default function GardenerProfileScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams();
  const [gardener, setGardener] = useState<Gardener | null>(null);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts"); // "posts", "gardens", "about"
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // In a real app, these would be API calls
    fetchProfile();
  }, [id]);

  const fetchProfile = () => {
    // Simulate API calls
    setTimeout(() => {
      setGardener(MOCK_GARDENER);
      setGardens(MOCK_GARDENS);
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    fetchProfile();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleFollow = () => {
    if (!gardener) return;

    // In a real app, this would be an API call to toggle follow status
    setGardener({
      ...gardener,
      isFollowing: !gardener.isFollowing,
      _count: {
        ...gardener._count,
        follow: gardener.isFollowing
          ? gardener._count.follow - 1
          : gardener._count.follow + 1,
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (number: number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K";
    }
    return number.toString();
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={[styles.postCard, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/(modules)/community/${item.id}`)}
    >
      <View style={styles.postHeader}>
        {item.garden && (
          <View style={styles.gardenTag}>
            <Ionicons name="leaf" size={14} color={theme.primary} />
            <Text style={[styles.gardenName, { color: theme.textSecondary }]}>
              {item.garden.name}
            </Text>
          </View>
        )}
        <Text style={[styles.postDate, { color: theme.textTertiary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      <Text style={[styles.postTitle, { color: theme.text }]}>
        {item.title}
      </Text>
      <Text
        style={[styles.postContent, { color: theme.textSecondary }]}
        numberOfLines={3}
      >
        {item.content}
      </Text>

      {item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.tagContainer}>
        {item.tags.map((tagObj, index) => (
          <View
            key={index}
            style={[styles.tagBadge, { backgroundColor: theme.primary + "20" }]}
          >
            <Text style={[styles.tagText, { color: theme.primary }]}>
              #{tagObj.tag.name}
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
            {item.total_vote}
          </Text>
        </View>
        <View style={styles.footerAction}>
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>
            {item._count.comments}
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
        {item.name}
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
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: gardener.user.profilePicture || "https://i.pravatar.cc/150",
            }}
            style={styles.profileImage}
          />
          <Text style={[styles.profileName, { color: theme.text }]}>
            {`${gardener.user.firstName} ${gardener.user.lastName}`}
          </Text>
          <Text style={[styles.username, { color: theme.textSecondary }]}>
            @{gardener.user.username}
          </Text>

          <View style={styles.levelBadge}>
            <Text style={styles.levelIcon}>
              {gardener.experienceLevel.icon}
            </Text>
            <Text style={[styles.levelText, { color: theme.primary }]}>
              {gardener.experienceLevel.title} · Level{" "}
              {gardener.experienceLevel.level}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatNumber(gardener._count.gardens)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Gardens
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatNumber(gardener._count.posts)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Posts
              </Text>
            </View>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push(`/(modules)/profile/${id}/followers`)}
            >
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatNumber(gardener._count.follow)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => router.push(`/(modules)/profile/${id}/following`)}
            >
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatNumber(gardener._count.following)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Following
              </Text>
            </TouchableOpacity>
          </View>

          {gardener.user.bio && (
            <Text style={[styles.bioText, { color: theme.text }]}>
              {gardener.user.bio}
            </Text>
          )}

          <View style={styles.actionButtons}>
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

            <TouchableOpacity
              style={[
                styles.messageButton,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Ionicons name="mail-outline" size={18} color={theme.text} />
              <Text style={[styles.messageButtonText, { color: theme.text }]}>
                Message
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
              activeTab === "about" && [
                styles.activeTab,
                { borderBottomColor: theme.primary },
              ],
            ]}
            onPress={() => setActiveTab("about")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "about"
                  ? { color: theme.primary }
                  : { color: theme.textSecondary },
              ]}
            >
              About
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

          {activeTab === "about" && (
            <View
              style={[styles.aboutContainer, { backgroundColor: theme.card }]}
            >
              <View style={styles.aboutRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.textSecondary}
                  style={styles.aboutIcon}
                />
                <View>
                  <Text
                    style={[styles.aboutLabel, { color: theme.textSecondary }]}
                  >
                    Joined
                  </Text>
                  <Text style={[styles.aboutValue, { color: theme.text }]}>
                    {formatDate(gardener.user.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.aboutRow}>
                <Ionicons
                  name="trophy-outline"
                  size={18}
                  color={theme.textSecondary}
                  style={styles.aboutIcon}
                />
                <View>
                  <Text
                    style={[styles.aboutLabel, { color: theme.textSecondary }]}
                  >
                    Experience Points
                  </Text>
                  <Text style={[styles.aboutValue, { color: theme.text }]}>
                    {gardener.experiencePoints} XP
                  </Text>
                </View>
              </View>

              <View style={styles.aboutRow}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={theme.textSecondary}
                  style={styles.aboutIcon}
                />
                <View>
                  <Text
                    style={[styles.aboutLabel, { color: theme.textSecondary }]}
                  >
                    Email
                  </Text>
                  <Text style={[styles.aboutValue, { color: theme.text }]}>
                    {gardener.user.email}
                  </Text>
                </View>
              </View>
            </View>
          )}
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
  aboutContainer: {
    borderRadius: 12,
    padding: 16,
  },
  aboutRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  aboutIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  aboutLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  aboutValue: {
    fontSize: 16,
  },
});
