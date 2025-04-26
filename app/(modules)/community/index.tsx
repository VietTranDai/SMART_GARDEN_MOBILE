import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

// Mock data for posts aligned with Prisma schema
const POSTS_DATA = [
  {
    id: "1",
    gardenerId: "1",
    gardener: {
      userId: "1",
      user: {
        firstName: "John",
        lastName: "Garden",
        profilePicture: "https://i.pravatar.cc/150?img=11",
      },
    },
    gardenId: "1",
    garden: {
      id: "1",
      name: "Backyard Garden",
    },
    plantName: "Tomatoes",
    plantGrowStage: "Fruiting",
    title: "My tomatoes are thriving!",
    content:
      "I've been using a new organic fertilizer and my tomatoes have never looked better. Has anyone else tried it?",
    total_vote: 15,
    tags: [
      { tagId: "1", tag: { name: "Tomatoes" } },
      { tagId: "2", tag: { name: "Organic" } },
      { tagId: "3", tag: { name: "Success" } },
    ],
    images: [{ url: "https://picsum.photos/500/300?random=1" }],
    createdAt: "2025-04-20T10:00:00Z",
    comments: [
      { id: "101", content: "Great job!" },
      { id: "102", content: "Could you share the name of the fertilizer?" },
      { id: "103", content: "My tomatoes never look that good!" },
      { id: "104", content: "What variety are those?" },
      { id: "105", content: "I'll have to try that!" },
    ],
  },
  {
    id: "2",
    gardenerId: "2",
    gardener: {
      userId: "2",
      user: {
        firstName: "Sarah",
        lastName: "Green",
        profilePicture: "https://i.pravatar.cc/150?img=5",
      },
    },
    gardenId: "2",
    garden: {
      id: "2",
      name: "Rooftop Garden",
    },
    plantName: "Peppers",
    plantGrowStage: "Vegetative",
    title: "Help with pest control?",
    content:
      "I'm seeing some strange spots on my pepper leaves. Could this be a sign of pests? What organic solutions have worked for you?",
    total_vote: 8,
    tags: [
      { tagId: "4", tag: { name: "Pests" } },
      { tagId: "5", tag: { name: "Peppers" } },
      { tagId: "6", tag: { name: "Help" } },
    ],
    images: [{ url: "https://picsum.photos/500/300?random=2" }],
    createdAt: "2025-04-19T15:30:00Z",
    comments: [
      { id: "201", content: "Looks like aphids to me." },
      { id: "202", content: "Try neem oil, works great!" },
      {
        id: "203",
        content: "Could be a fungal issue. How often do you water?",
      },
      { id: "204", content: "I had the same problem last year." },
      {
        id: "205",
        content: "Have you tried ladybugs? They're natural predators.",
      },
      { id: "206", content: "Check the underside of the leaves." },
      { id: "207", content: "Might be spider mites." },
      { id: "208", content: "A mixture of dish soap and water can help." },
      { id: "209", content: "Is it only affecting certain plants?" },
      { id: "210", content: "Try companion planting with marigolds." },
      { id: "211", content: "Diatomaceous earth works well too." },
      { id: "212", content: "Could be related to your soil pH." },
    ],
  },
  {
    id: "3",
    gardenerId: "3",
    gardener: {
      userId: "3",
      user: {
        firstName: "Mike",
        lastName: "Soil",
        profilePicture: "https://i.pravatar.cc/150?img=8",
      },
    },
    gardenId: "3",
    garden: {
      id: "3",
      name: "Community Garden",
    },
    plantName: "Mixed Vegetables",
    plantGrowStage: "Harvesting",
    title: "Beautiful harvest today!",
    content:
      "Just wanted to share my beautiful harvest from today. Carrots, radishes, and lettuce all came in wonderfully!",
    total_vote: 23,
    tags: [
      { tagId: "7", tag: { name: "Harvest" } },
      { tagId: "8", tag: { name: "Vegetables" } },
      { tagId: "3", tag: { name: "Success" } },
    ],
    images: [
      { url: "https://picsum.photos/500/300?random=3" },
      { url: "https://picsum.photos/500/300?random=4" },
    ],
    createdAt: "2025-04-18T09:15:00Z",
    comments: [
      { id: "301", content: "Looks amazing!" },
      { id: "302", content: "What variety of carrots are those?" },
      { id: "303", content: "Your garden is thriving!" },
      { id: "304", content: "I'm jealous, my lettuce bolted early this year." },
      { id: "305", content: "Great job on the garden!" },
      { id: "306", content: "Those radishes look perfect." },
      { id: "307", content: "Do you start from seed or transplants?" },
    ],
  },
];

// Interface definitions based on Prisma schema
interface User {
  firstName: string;
  lastName: string;
  profilePicture: string | null;
}

interface Gardener {
  userId: string;
  user: User;
}

interface Garden {
  id: string;
  name: string;
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

interface Comment {
  id: string;
  content: string;
}

interface Post {
  id: string;
  gardenerId: string;
  gardener: Gardener;
  gardenId: string | null;
  garden: Garden | null;
  plantName: string | null;
  plantGrowStage: string | null;
  title: string;
  content: string;
  total_vote: number;
  tags: PostTag[];
  images: PostImage[];
  createdAt: string;
  comments: Comment[];
}

export default function CommunityScreen() {
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Memoize styles
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setPosts(POSTS_DATA);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer); // Clear timeout on unmount
  }, []);

  // Memoize filtered posts
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const searchLower = searchQuery.toLowerCase();
    return posts.filter((post) => {
      const contentMatch =
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower);
      const tagMatch = post.tags.some((tagObj) =>
        tagObj.tag.name.toLowerCase().includes(searchLower)
      );
      const plantMatch =
        post.plantName?.toLowerCase().includes(searchLower) || false;
      const authorMatch =
        `${post.gardener.user.firstName} ${post.gardener.user.lastName}`
          .toLowerCase()
          .includes(searchLower);

      return contentMatch || tagMatch || plantMatch || authorMatch;
    });
  }, [posts, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true); // Show loading indicator during refresh
    // Simulate data refresh
    setTimeout(() => {
      setPosts(POSTS_DATA.sort(() => 0.5 - Math.random())); // Simulate new data
      setLoading(false);
      setRefreshing(false);
    }, 1500);
  }, []);

  // Memoize date formatting function
  const formatDate = useCallback((dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 1) return `${diffDays}d ago`;
    if (diffDays === 1) return `Yesterday`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return `Just now`;
  }, []);

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => router.push(`/(modules)/community/${item.id}`)}
    >
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          onPress={() =>
            router.push(`/(modules)/profile/${item.gardener.userId}`)
          }
        >
          <Image
            source={{
              uri:
                item.gardener.user.profilePicture ||
                `https://i.pravatar.cc/150?u=${item.gardenerId}`,
            }}
            style={styles.authorImage}
          />
        </TouchableOpacity>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>
            {`${item.gardener.user.firstName} ${item.gardener.user.lastName}`}
          </Text>
          <Text style={styles.postTimestamp}>{formatDate(item.createdAt)}</Text>
        </View>
        {/* More Options Button (optional) */}
        {/* <TouchableOpacity style={styles.moreOptionsButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.textSecondary} />
        </TouchableOpacity> */}
      </View>

      {/* Post Content */}
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      {/* Post Image (show first image if exists) */}
      {item.images && item.images.length > 0 && (
        <Image source={{ uri: item.images[0].url }} style={styles.postImage} />
      )}

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {item.tags.map((tagObj) => (
          <View key={tagObj.tagId} style={styles.tag}>
            <Text style={styles.tagText}>{tagObj.tag.name}</Text>
          </View>
        ))}
      </View>

      {/* Post Footer */}
      <View style={styles.postFooter}>
        <View style={styles.footerAction}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="heart-outline"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.footerText}>{item.total_vote} Likes</Text>
        </View>
        <View style={styles.footerAction}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome5
              name="comment-alt"
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.footerText}>{item.comments.length} Comments</Text>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="share-social-outline"
            size={20}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color={isSearchFocused ? theme.primary : theme.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search community..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearSearchButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.newPostButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push("/(modules)/community/new")} // Ensure this route exists
        >
          <Ionicons name="add" size={24} color={theme.background} />
        </TouchableOpacity>
      </View>

      {/* Post List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]} // Android
              tintColor={theme.primary} // iOS
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather
                name="message-square"
                size={48}
                color={theme.textTertiary}
              />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No posts match your search" : "No posts yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try searching for something else."
                  : "Be the first to share something with the community!"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundSecondary,
    },
    searchContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      backgroundColor: theme.background,
      alignItems: "center",
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.cardAlt, // Use a slightly different card color
      borderRadius: 20, // More rounded
      paddingHorizontal: 12,
      height: 40,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
      fontFamily: "Inter-Regular",
      height: "100%",
    },
    clearSearchButton: {
      marginLeft: 8,
      padding: 4,
    },
    newPostButton: {
      marginLeft: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    listContainer: {
      padding: 16, // Add padding around the list
    },
    postCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: 16,
      padding: 16,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    },
    postHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    authorImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      backgroundColor: theme.border, // Placeholder color
    },
    authorInfo: {
      flex: 1,
    },
    authorName: {
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    postTimestamp: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginTop: 2,
    },
    moreOptionsButton: {
      padding: 5,
    },
    postTitle: {
      fontSize: 17,
      fontFamily: "Inter-Bold",
      color: theme.text,
      marginBottom: 8,
    },
    postContent: {
      fontSize: 15,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      lineHeight: 22,
      marginBottom: 12,
    },
    postImage: {
      width: "100%",
      height: 200,
      borderRadius: 8,
      marginBottom: 12,
      backgroundColor: theme.border, // Placeholder color
      resizeMode: "cover",
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 12,
    },
    tag: {
      backgroundColor: theme.primaryLight,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      marginRight: 6,
      marginBottom: 6,
    },
    tagText: {
      fontSize: 12,
      fontFamily: "Inter-Medium",
      color: theme.primary,
    },
    postFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
      paddingTop: 12,
      marginTop: 4, // Reduced margin
    },
    footerAction: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionButton: {
      flexDirection: "row", // Make sure icon and text are horizontal if needed
      alignItems: "center",
      padding: 5, // Add touch area
    },
    footerText: {
      marginLeft: 6,
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 30,
      marginTop: 50, // Add some top margin
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
    },
  });
