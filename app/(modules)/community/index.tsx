import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import communityService from "@/service/api/community.service";
import { Post, Tag } from "@/types";
import env from "@/config/environment";
import ContentLoader, { Rect } from "@/components/ui/ContentLoader";

const ITEMS_PER_PAGE = 10;
const SCREEN_WIDTH = Dimensions.get("window").width;

// Skeleton loader component for posts
const PostSkeleton = ({ theme }: { theme: any }) => {
  const styles = createStyles(theme);

  return (
    <View style={[styles.postCard, { backgroundColor: theme.card }]}>
      <ContentLoader
        speed={2}
        width={SCREEN_WIDTH - 32}
        height={300}
        backgroundColor={theme.backgroundSecondary}
        foregroundColor={theme.cardAlt}
      >
        {/* Avatar and username */}
        <Rect x={0} y={0} rx={20} ry={20} width={40} height={40} />
        <Rect x={50} y={5} rx={4} ry={4} width={140} height={15} />
        <Rect x={50} y={25} rx={3} ry={3} width={100} height={10} />

        {/* Title and content */}
        <Rect
          x={0}
          y={60}
          rx={4}
          ry={4}
          width={SCREEN_WIDTH - 80}
          height={20}
        />
        <Rect
          x={0}
          y={90}
          rx={3}
          ry={3}
          width={SCREEN_WIDTH - 60}
          height={10}
        />
        <Rect
          x={0}
          y={105}
          rx={3}
          ry={3}
          width={SCREEN_WIDTH - 100}
          height={10}
        />
        <Rect
          x={0}
          y={120}
          rx={3}
          ry={3}
          width={SCREEN_WIDTH - 150}
          height={10}
        />

        {/* Image placeholder */}
        <Rect
          x={0}
          y={145}
          rx={5}
          ry={5}
          width={SCREEN_WIDTH - 32}
          height={120}
        />

        {/* Tags */}
        <Rect x={0} y={275} rx={10} ry={10} width={50} height={20} />
        <Rect x={60} y={275} rx={10} ry={10} width={70} height={20} />
      </ContentLoader>
    </View>
  );
};

export default function CommunityScreen() {
  const theme = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [scrollToTopVisible, setScrollToTopVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Memoize styles
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch posts and tags
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMorePosts(true);

    try {
      // Fetch posts with optional tag filter
      const params: any = {
        page: 1,
        limit: ITEMS_PER_PAGE,
      };
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
      setHasMorePosts(postsData.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error("Failed to load community data:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [selectedTag, searchQuery]);

  const fetchMorePosts = useCallback(async () => {
    if (!hasMorePosts || loadingMore || loading) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;

      const params: any = {
        page: nextPage,
        limit: ITEMS_PER_PAGE,
      };
      if (selectedTag) {
        params.tag = selectedTag;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const morePosts = await communityService.getPosts(params);

      if (morePosts.length > 0) {
        setPosts((prev) => [...prev, ...morePosts]);
        setPage(nextPage);
        setHasMorePosts(morePosts.length === ITEMS_PER_PAGE);
      } else {
        setHasMorePosts(false);
      }
    } catch (err) {
      console.error("Failed to load more posts:", err);
      Alert.alert("Lỗi", "Không thể tải thêm bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMorePosts, loadingMore, loading, page, selectedTag, searchQuery]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  }, [fetchInitialData]);

  const handleSearch = useCallback(() => {
    Keyboard.dismiss();
    fetchInitialData();
  }, [fetchInitialData]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    // Only re-fetch if we had a previous search query
    if (searchQuery) {
      setTimeout(fetchInitialData, 100);
    }
  }, [searchQuery, fetchInitialData]);

  const handleTagPress = useCallback(
    (tagName: string) => {
      // Toggle tag selection
      setSelectedTag(selectedTag === tagName ? null : tagName);
    },
    [selectedTag]
  );

  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const hasImage = item.images && item.images.length > 0;
    const hasMultipleImages = item.images && item.images.length > 1;

    return (
      <TouchableOpacity
        style={[styles.postCard, { backgroundColor: theme.card }]}
        onPress={() => router.push(`/(modules)/community/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: item.userdata?.profilePicture
                  ? `${env.apiUrl}${item.userdata.profilePicture}`
                  : "https://i.pravatar.cc/150?img=1",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>
                {item.userdata?.fullName ||
                  item.userdata?.username ||
                  "Anonymous User"}
              </Text>
              <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.postStats}>
            <Text style={styles.voteCount}>{item.total_vote}</Text>
            <Ionicons
              name={item.userVote === 1 ? "arrow-up" : "arrow-up-outline"}
              size={16}
              color={item.userVote === 1 ? theme.success : theme.textSecondary}
            />
          </View>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent} numberOfLines={3}>
          {item.content}
        </Text>

        {hasImage && (
          <View style={styles.postImageContainer}>
            <Image
              source={{ uri: item.images && item.images[0]?.url }}
              style={styles.postImage}
              resizeMode="cover"
            />
            {hasMultipleImages && (
              <View style={styles.imageCountBadge}>
                <Ionicons name="images" size={14} color="#fff" />
                <Text style={styles.imageCountText}>
                  +{item.images ? item.images.length - 1 : 0}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.postFooter}>
          <View style={styles.postMeta}>
            {item.garden && (
              <View style={styles.metaItem}>
                <Feather name="map-pin" size={14} color={theme.textSecondary} />
                <Text style={styles.metaText}>{item.garden.name}</Text>
              </View>
            )}

            {item.plantName && (
              <View style={styles.metaItem}>
                <FontAwesome5
                  name="leaf"
                  size={14}
                  color={theme.textSecondary}
                />
                <Text style={styles.metaText}>{item.plantName}</Text>
              </View>
            )}

            <View style={styles.metaItem}>
              <Ionicons
                name="chatbubble-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text style={styles.metaText}>
                {item.comments?.length || 0} bình luận
              </Text>
            </View>
          </View>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={`${item.id}-tag-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag.name}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <Text
                    style={[styles.tagText, { color: theme.textSecondary }]}
                  >
                    +{item.tags.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { y: number } };
  }) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollToTopVisible(offsetY > 300);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderFooter = () => {
    if (!hasMorePosts) {
      return (
        <View style={styles.endOfListContainer}>
          <Text style={[styles.endOfListText, { color: theme.textSecondary }]}>
            Không còn bài viết nào khác
          </Text>
        </View>
      );
    }

    if (loadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text
            style={[
              styles.loadingText,
              { marginLeft: 10, color: theme.textSecondary },
            ]}
          >
            Đang tải thêm bài viết...
          </Text>
        </View>
      );
    }

    return null;
  };

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
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item) => `skeleton-${item}`}
          renderItem={() => <PostSkeleton theme={theme} />}
          contentContainerStyle={styles.postList}
        />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchInitialData}
          >
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
        <>
          <FlatList
            ref={flatListRef}
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
            onEndReached={fetchMorePosts}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            onScroll={handleScroll}
            scrollEventThrottle={400}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
          />

          {scrollToTopVisible && (
            <TouchableOpacity
              style={[
                styles.scrollToTopButton,
                { backgroundColor: theme.primary },
              ]}
              onPress={scrollToTop}
            >
              <Ionicons name="arrow-up" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </>
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
    loadingMore: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    postCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: 16,
      padding: 16,
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: theme.borderLight,
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
      backgroundColor: theme.backgroundSecondary,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
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
    postImageContainer: {
      position: "relative",
      marginBottom: 12,
    },
    postImage: {
      width: "100%",
      height: 200,
      borderRadius: 8,
      backgroundColor: theme.border,
    },
    imageCountBadge: {
      position: "absolute",
      right: 8,
      top: 8,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    imageCountText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },
    postFooter: {
      marginTop: 8,
    },
    postMeta: {
      flexDirection: "row",
      alignItems: "center",
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
    tagsScrollContainer: {
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderLight,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
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
    endOfListContainer: {
      padding: 20,
      alignItems: "center",
    },
    endOfListText: {
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
    scrollToTopButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
  });
