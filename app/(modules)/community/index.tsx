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
import communityService from "@/service/api/community.service";
import { Post, Tag } from "@/types";
import env from "@/config/environment";

export default function CommunityScreen() {
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize styles
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch posts and tags
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch posts with optional tag filter
      const params: any = {};
      if (selectedTag) {
        params.tag = selectedTag;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const [postsData, tagsData] = await Promise.all([
        communityService.getPosts(params),
        communityService.getTags(),
      ]);

      setPosts(postsData);
      setTags(tagsData);
    } catch (err) {
      console.error("Failed to load community data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [selectedTag, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleSearch = useCallback(() => {
    Keyboard.dismiss();
    fetchData();
  }, [fetchData]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    // Only re-fetch if we had a previous search query
    if (searchQuery) {
      setTimeout(fetchData, 100);
    }
  }, [searchQuery, fetchData]);

  const handleTagPress = useCallback(
    (tagName: string) => {
      // Toggle tag selection
      setSelectedTag(selectedTag === tagName ? null : tagName);
    },
    [selectedTag]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => router.push(`/(modules)/community/${item.id}`)}
    >
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                `${env.apiUrl}${item.userData?.profilePicture}` ||
                "https://i.pravatar.cc/150?img=1",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>
              {`${item.userData?.firstName || ""} ${
                item.userData?.lastName || ""
              }`}
            </Text>
            <Text style={styles.postDate}>
              {formatDate(item.createdAt || new Date().toISOString())}
            </Text>
          </View>
        </View>
        <View style={styles.postStats}>
          <Text style={styles.voteCount}>{item.total_vote}</Text>
          <Ionicons name="arrow-up" size={16} color={theme.success} />
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      {item.images && item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.postMeta}>
        {item.garden && (
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={14} color={theme.textSecondary} />
            <Text style={styles.metaText}>{item.garden.name}</Text>
          </View>
        )}

        {item.plantName && (
          <View style={styles.metaItem}>
            <FontAwesome5 name="leaf" size={14} color={theme.textSecondary} />
            <Text style={styles.metaText}>{item.plantName}</Text>
          </View>
        )}

        {item.comments && (
          <View style={styles.metaItem}>
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color={theme.textSecondary}
            />
            <Text style={styles.metaText}>
              {item.comments.length} bình luận
            </Text>
          </View>
        )}
      </View>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tagObj) => (
            <View key={tagObj.tagId} style={styles.tag}>
              <Text style={styles.tagText}>{tagObj.tag.name}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            isSearchFocused && styles.searchInputFocused,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/(modules)/community/new")}
        >
          <Ionicons name="add-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {tags.length > 0 && (
        <View style={styles.tagsScrollContainer}>
          <FlatList
            data={tags}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tagChip,
                  selectedTag === item.name && styles.tagChipSelected,
                ]}
                onPress={() => handleTagPress(item.name)}
              >
                <Text
                  style={[
                    styles.tagChipText,
                    selectedTag === item.name && styles.tagChipTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="chatbubbles-outline"
            size={64}
            color={theme.textTertiary}
          />
          <Text style={styles.emptyTitle}>Chưa có bài viết nào</Text>
          <Text style={styles.emptyText}>
            Hãy là người đầu tiên chia sẻ kinh nghiệm làm vườn của bạn!
          </Text>
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => router.push("/(modules)/community/new")}
          >
            <Text style={styles.createPostButtonText}>Tạo bài viết</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
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
      backgroundColor: theme.cardAlt,
      borderRadius: 20,
      paddingHorizontal: 12,
      height: 40,
    },
    searchInputFocused: {
      borderColor: theme.primary,
      borderWidth: 1,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
      fontFamily: "Inter-Regular",
      height: "100%",
      marginLeft: 8,
    },
    createButton: {
      marginLeft: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
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
      justifyContent: "space-between",
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      backgroundColor: theme.border,
    },
    userName: {
      fontSize: 15,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
    },
    postDate: {
      fontSize: 13,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginTop: 2,
    },
    postStats: {
      flexDirection: "row",
      alignItems: "center",
    },
    voteCount: {
      fontSize: 14,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginRight: 6,
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
      backgroundColor: theme.border,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12,
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
    postMeta: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      flexWrap: "wrap",
      gap: 12,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    metaText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      marginLeft: 6,
    },
    tagsScrollContainer: {
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
    },
    tagsList: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    tagChip: {
      backgroundColor: theme.cardAlt,
      padding: 8,
      paddingHorizontal: 16,
      borderRadius: 16,
      marginRight: 8,
    },
    tagChipSelected: {
      backgroundColor: theme.primary,
    },
    tagChipText: {
      fontSize: 14,
      fontFamily: "Inter-Medium",
      color: theme.text,
    },
    tagChipTextSelected: {
      color: theme.card,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 30,
    },
    errorText: {
      fontSize: 16,
      fontFamily: "Inter-Regular",
      color: theme.error,
      marginBottom: 16,
      textAlign: "center",
    },
    retryButton: {
      padding: 12,
      borderRadius: 16,
      backgroundColor: theme.primary,
    },
    retryButtonText: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: "white",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 30,
      marginTop: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontFamily: "Inter-SemiBold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 24,
    },
    createPostButton: {
      padding: 12,
      paddingHorizontal: 24,
      borderRadius: 16,
      backgroundColor: theme.primary,
    },
    createPostButtonText: {
      fontSize: 16,
      fontFamily: "Inter-SemiBold",
      color: "white",
    },
    postList: {
      padding: 16,
    },
  });
