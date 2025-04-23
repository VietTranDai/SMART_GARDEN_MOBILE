import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";

// Mock data for posts
const POSTS_DATA = [
  {
    id: "1",
    gardenerId: "1",
    gardenerName: "John Garden",
    gardenerImage: "https://i.pravatar.cc/150?img=11",
    gardenName: "Backyard Garden",
    title: "My tomatoes are thriving!",
    content:
      "I've been using a new organic fertilizer and my tomatoes have never looked better. Has anyone else tried it?",
    images: ["https://picsum.photos/500/300?random=1"],
    tags: ["Tomatoes", "Organic", "Success"],
    createdAt: "2025-04-20T10:00:00Z",
    score: 15,
    commentCount: 5,
  },
  {
    id: "2",
    gardenerId: "2",
    gardenerName: "Sarah Green",
    gardenerImage: "https://i.pravatar.cc/150?img=5",
    gardenName: "Rooftop Garden",
    title: "Help with pest control?",
    content:
      "I'm seeing some strange spots on my pepper leaves. Could this be a sign of pests? What organic solutions have worked for you?",
    images: ["https://picsum.photos/500/300?random=2"],
    tags: ["Pests", "Peppers", "Help"],
    createdAt: "2025-04-19T15:30:00Z",
    score: 8,
    commentCount: 12,
  },
  {
    id: "3",
    gardenerId: "3",
    gardenerName: "Mike Soil",
    gardenerImage: "https://i.pravatar.cc/150?img=8",
    gardenName: "Community Garden",
    title: "Beautiful harvest today!",
    content:
      "Just wanted to share my beautiful harvest from today. Carrots, radishes, and lettuce all came in wonderfully!",
    images: [
      "https://picsum.photos/500/300?random=3",
      "https://picsum.photos/500/300?random=4",
    ],
    tags: ["Harvest", "Vegetables", "Success"],
    createdAt: "2025-04-18T09:15:00Z",
    score: 23,
    commentCount: 7,
  },
];

// Define Post interface
interface Post {
  id: string;
  gardenerId: string;
  gardenerName: string;
  gardenerImage: string;
  gardenName: string;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  createdAt: string;
  score: number;
  commentCount: number;
}

export default function CommunityScreen() {
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>(POSTS_DATA);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    return (
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setPosts(POSTS_DATA);
      setRefreshing(false);
    }, 1500);
  }, []);

  const formatDate = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={[styles.postCard, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/(modules)/community/${item.id}`)}
    >
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.gardenerImage }}
            style={styles.userImage}
          />
          <View>
            <Text style={[styles.userName, { color: theme.text }]}>
              {item.gardenerName}
            </Text>
            <Text style={[styles.gardenName, { color: theme.textSecondary }]}>
              {item.gardenName} · {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
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
          source={{ uri: item.images[0] }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.tagContainer}>
        {item.tags.map((tag, index) => (
          <View
            key={index}
            style={[styles.tagBadge, { backgroundColor: theme.primary + "20" }]}
          >
            <Text style={[styles.tagText, { color: theme.primary }]}>
              #{tag}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.postFooter}>
        <View style={styles.actionButton}>
          <Ionicons
            name="arrow-up-outline"
            size={20}
            color={theme.textSecondary}
          />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>
            {item.score}
          </Text>
        </View>
        <View style={styles.actionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={theme.textSecondary}
          />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>
            {item.commentCount}
          </Text>
        </View>
        <View style={styles.actionButton}>
          <Ionicons
            name="share-social-outline"
            size={18}
            color={theme.textSecondary}
          />
          <Text style={[styles.actionText, { color: theme.textSecondary }]}>
            Share
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}
      edges={["bottom"]}
    >
      <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search posts or tags..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={theme.textTertiary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No posts found
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              {searchQuery
                ? "Try a different search term"
                : "Be the first to share with the community!"}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push("/(modules)/community/new")}
      >
        <Ionicons name="create" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
    fontSize: 15,
    fontFamily: "Inter-Regular",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  postCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 15,
    fontFamily: "Inter-SemiBold",
  },
  gardenName: {
    fontSize: 13,
    fontFamily: "Inter-Regular",
  },
  postTitle: {
    fontSize: 17,
    fontFamily: "Inter-Bold",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 15,
    fontFamily: "Inter-Regular",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
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
    fontFamily: "Inter-Medium",
  },
  postFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: "Inter-Medium",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
