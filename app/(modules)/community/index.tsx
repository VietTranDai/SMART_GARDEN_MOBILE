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
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import communityService from "@/service/api/community.service";
import { Post, Tag, SearchPostDto, PaginatedPostResponse } from "@/types";
import env from "@/config/environment";
import ContentLoader, { Rect } from "@/components/ui/ContentLoader";

const ITEMS_PER_PAGE = 10;
const SCREEN_WIDTH = Dimensions.get("window").width;

// Utility function to format comment count
const formatCommentCount = (count: number): string => {
  if (count === 0) return "0 bình luận";
  if (count === 1) return "1 bình luận";
  if (count < 1000) return `${count} bình luận`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k bình luận`;
  return `${(count / 1000000).toFixed(1)}M bình luận`;
};

// Utility function to format vote count
const formatVoteCount = (count: number): string => {
  if (count === 0) return "0";
  if (Math.abs(count) < 1000) return count.toString();
  if (Math.abs(count) < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
};

// Get comment count from post data
const getCommentCount = (post: Post): number => {
  // Prioritize commentCount if available
  if (typeof post.commentCount === 'number' && post.commentCount >= 0) {
    return post.commentCount;
  }
  
  // Fallback to comments array length
  if (post.comments && Array.isArray(post.comments)) {
    return post.comments.length;
  }
  
  // Default to 0
  return 0;
};

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
  const [totalPosts, setTotalPosts] = useState(0);
  const [scrollToTopVisible, setScrollToTopVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Memoize styles
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch posts and tags with new search API
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMorePosts(true);

    try {
      // Prepare search parameters
      const searchParams: SearchPostDto = {
        page: 1,
        limit: ITEMS_PER_PAGE,
      };
      
      if (selectedTag) {
        searchParams.tagName = selectedTag;
      }
      if (searchQuery.trim()) {
        searchParams.search = searchQuery.trim();
      }

      const [postsResponse, tagsData] = await Promise.all([
        communityService.searchPosts(searchParams),
        communityService.getTags(),
      ]);

      console.log("Community data loaded:", {
        postsCount: postsResponse.data.length,
        samplePost: postsResponse.data[0] ? {
          id: postsResponse.data[0].id,
          title: postsResponse.data[0].title,
          commentCount: postsResponse.data[0].commentCount,
          commentsLength: postsResponse.data[0].comments?.length,
          actualCommentCount: getCommentCount(postsResponse.data[0])
        } : null
      });

      setPosts(postsResponse.data);
      setTotalPosts(postsResponse.total);
      setTags(tagsData);
      setHasMorePosts(postsResponse.data.length === ITEMS_PER_PAGE && postsResponse.page < postsResponse.totalPages);
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

      // Prepare search parameters for next page
      const searchParams: SearchPostDto = {
        page: nextPage,
        limit: ITEMS_PER_PAGE,
      };
      
      if (selectedTag) {
        searchParams.tagName = selectedTag;
      }
      if (searchQuery.trim()) {
        searchParams.search = searchQuery.trim();
      }

      const morePostsResponse: PaginatedPostResponse = await communityService.searchPosts(searchParams);

      if (morePostsResponse.data.length > 0) {
        setPosts((prev) => [...prev, ...morePostsResponse.data]);
        setPage(nextPage);
        setHasMorePosts(nextPage < morePostsResponse.totalPages);
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

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      // Debounce search - will trigger fetchInitialData via useEffect
    },
    []
  );

  const handleTagSelect = useCallback(
    (tagName: string | null) => {
      setSelectedTag(tagName);
      // Will trigger fetchInitialData via useEffect
    },
    []
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
            <Text style={styles.voteCount}>{formatVoteCount(item.total_vote)}</Text>
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
                {formatCommentCount(getCommentCount(item))}
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
    <View style={styles.container}>
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
            onChangeText={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onSubmitEditing={() => {}}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
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
            data={[{ id: 0, name: "Tất cả" }, ...tags]}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.tagChip,
                  (item.name === "Tất cả" && !selectedTag) || selectedTag === item.name 
                    ? styles.tagChipSelected 
                    : null,
                ]}
                onPress={() => handleTagSelect(item.name === "Tất cả" ? null : item.name)}
              >
                <Text
                  style={[
                    styles.tagChipText,
                    (item.name === "Tất cả" && !selectedTag) || selectedTag === item.name 
                      ? styles.tagChipTextSelected 
                      : null,
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
          <Text style={styles.emptyTitle}>
            {searchQuery || selectedTag 
              ? "Không tìm thấy bài viết nào" 
              : "Chưa có bài viết nào"}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery || selectedTag 
              ? "Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
              : "Hãy là người đầu tiên chia sẻ kinh nghiệm làm vườn của bạn!"}
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
    </View>
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
