import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useAppTheme } from "@/hooks/ui/useAppTheme";
import communityService from "@/service/api/community.service";
import { Post, Comment, CreateCommentDto } from "@/types";
import { VoteRequestDto, VoteTargetType } from "@/types/social/post.types";
import env from "@/config/environment";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_HEIGHT = 300;

interface ThemeProps {
  theme: any;
}

interface PostImageItem {
  url: string;
  id?: number;
  postId?: number;
}

const PostDetailSkeleton = ({ theme }: ThemeProps) => (
  <View style={{ flex: 1, padding: 16 }}>
    <ContentLoader
      speed={2}
      width={SCREEN_WIDTH - 32}
      height={600}
      backgroundColor={theme.backgroundSecondary}
      foregroundColor={theme.cardAlt}
    >
      {/* Header with avatar and username */}
      <Circle cx={25} cy={25} r={25} />
      <Rect x={60} y={10} rx={4} ry={4} width={100} height={15} />
      <Rect x={60} y={30} rx={3} ry={3} width={80} height={10} />

      {/* Post title */}
      <Rect x={0} y={70} rx={4} ry={4} width={SCREEN_WIDTH - 80} height={24} />

      {/* Post content */}
      <Rect x={0} y={110} rx={3} ry={3} width={SCREEN_WIDTH - 50} height={10} />
      <Rect x={0} y={125} rx={3} ry={3} width={SCREEN_WIDTH - 80} height={10} />
      <Rect x={0} y={140} rx={3} ry={3} width={SCREEN_WIDTH - 60} height={10} />
      <Rect x={0} y={155} rx={3} ry={3} width={SCREEN_WIDTH - 70} height={10} />

      {/* Image placeholder */}
      <Rect
        x={0}
        y={185}
        rx={8}
        ry={8}
        width={SCREEN_WIDTH - 32}
        height={200}
      />

      {/* Tags */}
      <Rect x={0} y={400} rx={15} ry={15} width={60} height={24} />
      <Rect x={70} y={400} rx={15} ry={15} width={80} height={24} />

      {/* Comments header */}
      <Rect x={0} y={440} rx={4} ry={4} width={120} height={20} />

      {/* Comment 1 */}
      <Circle cx={20} cy={480} r={15} />
      <Rect x={45} y={470} rx={3} ry={3} width={100} height={10} />
      <Rect x={45} y={485} rx={2} ry={2} width={SCREEN_WIDTH - 80} height={8} />
      <Rect
        x={45}
        y={498}
        rx={2}
        ry={2}
        width={SCREEN_WIDTH - 100}
        height={8}
      />

      {/* Comment 2 */}
      <Circle cx={20} cy={530} r={15} />
      <Rect x={45} y={520} rx={3} ry={3} width={100} height={10} />
      <Rect
        x={45}
        y={535}
        rx={2}
        ry={2}
        width={SCREEN_WIDTH - 120}
        height={8}
      />
      <Rect
        x={45}
        y={548}
        rx={2}
        ry={2}
        width={SCREEN_WIDTH - 140}
        height={8}
      />
    </ContentLoader>
  </View>
);

// Component for image gallery with swipe
const ImageGallery = ({ images }: { images: PostImageItem[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const flatListRef = useRef<FlatList>(null);
  const theme = useAppTheme();

  const handlePageChange = (e: any) => {
    const viewSize = e.nativeEvent.layoutMeasurement.width;
    const contentOffset = e.nativeEvent.contentOffset.x;
    const selectedIndex = Math.floor(contentOffset / viewSize);
    setActiveIndex(selectedIndex);
  };

  const scrollToImage = (index: number) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const handleImageLoad = (index: number) => {
    setLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index: number) => {
    setLoading((prev) => ({ ...prev, [index]: true }));
  };

  const getImageUrl = (url: string) => {
    return `${env.apiUrl}/${url}`;
  };


  return (
    <View style={{ width: "100%" }}>
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(_, index) => `image-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handlePageChange}
        decelerationRate="fast"
        snapToAlignment="center"
        renderItem={({ item, index }) => (
          <View style={{ width: SCREEN_WIDTH - 32, height: IMAGE_HEIGHT }}>
            {loading[index] && (
              <View
                style={[
                  styles.imageLoadingContainer,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            )}
            <Image
              source={{ uri: getImageUrl(item.url) }}
              style={[styles.galleryImage, loading[index] && { opacity: 0.3 }]}
              resizeMode="cover"
              onLoadStart={() => handleImageLoadStart(index)}
              onLoad={() => handleImageLoad(index)}
            />
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {index + 1}/{images.length}
              </Text>
            </View>
          </View>
        )}
      />

      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                activeIndex === index && styles.paginationDotActive,
              ]}
              onPress={() => scrollToImage(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function PostDetailScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedComments, setCollapsedComments] = useState<
    Record<number, boolean>
  >({});
  const fadeAnims = useRef<Record<number, Animated.Value>>({});

  const fetchData = async () => {
    if (!id) return;

    try {
      setError(null);
      setLoading(true);

      // Convert ID to string for API calls (service now handles both string and number)
      const postId = Array.isArray(id) ? id[0] : id.toString();

      // Fetch post details and comments in parallel
      const [postData, commentsData] = await Promise.all([
        communityService.getPostById(postId),
        communityService.getPostComments(postId),
      ]);

      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      console.error("Failed to fetch post details:", err);
      setError("Không thể tải bài viết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const toggleCommentCollapse = (commentId: number) => {
    if (!fadeAnims.current[commentId]) {
      fadeAnims.current[commentId] = new Animated.Value(
        collapsedComments[commentId] ? 0 : 1
      );
    }

    const newState = !collapsedComments[commentId];
    setCollapsedComments((prev) => ({
      ...prev,
      [commentId]: newState,
    }));

    // Animate the collapse/expand
    Animated.timing(fadeAnims.current[commentId], {
      toValue: newState ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Group comments into threads
  const formatComments = (): Comment[] => {
    const parentComments: Comment[] = [];
    const commentMap: Record<string, Comment & { replies?: Comment[] }> = {};

    // First pass: create a map of all comments
    comments.forEach((comment) => {
      commentMap[comment.id.toString()] = { ...comment, replies: [] };
    });

    // Second pass: organize into parent-child relationships
    comments.forEach((comment) => {
      if (comment.parentId === null || comment.parentId === undefined) {
        parentComments.push(commentMap[comment.id.toString()]);
      } else if (comment.parentId && commentMap[comment.parentId.toString()]) {
        const parentComment = commentMap[comment.parentId.toString()];
        if (parentComment) {
          parentComment.replies = [
            ...(parentComment.replies || []),
            commentMap[comment.id.toString()],
          ];
        }
      }
    });

    // Sort parent comments by score
    return parentComments.sort((a, b) => b.score - a.score);
  };

  const formatDate = (dateInput: string | Date) => {
    const now = new Date();
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} phút trước`;
      }
      return `${diffHours} giờ trước`;
    } else if (diffDays === 1) {
      return "Hôm qua";
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const handleVote = async (
    targetType: VoteTargetType,
    targetId: string | number,
    voteValue: number
  ) => {
    try {
      if (targetType === VoteTargetType.POST && post) {
        // Call API to vote on post
        const voteData: VoteRequestDto = { voteValue: voteValue };
        const result = await communityService.votePost(targetId, voteData);

        // Update local state with the result from API
        setPost({
          ...post,
          total_vote: result.total_vote || (post.total_vote + voteValue),
          userVote: voteValue,
        });
      } else if (targetType === VoteTargetType.COMMENT) {
        // Call API to vote on comment
        const voteData: VoteRequestDto = { voteValue: voteValue };
        const result = await communityService.voteComment(targetId, voteData);

        // Update the comment in our local state
        setComments(
          comments.map((comment) => {
            if (comment.id.toString() === targetId.toString()) {
              return {
                ...comment,
                score: result.score || (comment.score + voteValue),
                userVote: voteValue,
              };
            } else if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply) =>
                  reply.id.toString() === targetId.toString()
                    ? {
                        ...reply,
                        score: result.score || (reply.score + voteValue),
                        userVote: voteValue,
                      }
                    : reply
                ),
              };
            }
            return comment;
          })
        );
      }
    } catch (err) {
      console.error("Failed to register vote:", err);
      Alert.alert("Lỗi", "Không thể ghi nhận bình chọn. Vui lòng thử lại.");
    }
  };

  const handleSubmitComment = async () => {
    if (!id || !newComment.trim()) return;

    setSubmitting(true);
    try {
      // Convert ID to number for CreateCommentDto
      const postId = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id.toString(), 10);

      const commentData: CreateCommentDto = {
        postId: postId,
        content: newComment.trim(),
        parentId: replyTo?.id,
      };

      // Call API to create comment
      const createdComment = await communityService.createComment(commentData);

      // Update local state with the new comment
      setComments((prevComments) => [...prevComments, createdComment]);

      // Reset form
      setNewComment("");
      setReplyTo(null);

      Alert.alert("Thành công", "Bình luận của bạn đã được đăng.");
    } catch (err) {
      console.error("Failed to submit comment:", err);
      Alert.alert("Lỗi", "Không thể đăng bình luận. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to safely get user display name
  const getDisplayName = (comment: Comment): string => {
    if (comment.userdata) {
      return (
        comment.userdata.fullName ||
        comment.userdata.username ||
        "Anonymous User"
      );
    }
    return "Anonymous User";
  };

  // Helper to safely get profile image
  const getProfileImage = (comment: Comment): string => {
    return comment.userdata?.profilePicture
      ? `${env.apiUrl}${comment.userdata.profilePicture}`
      : "https://via.placeholder.com/40";
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isCollapsed = collapsedComments[item.id] || false;
    const hasReplies = item.replies && item.replies.length > 0;
    // Initialize animation value if it doesn't exist
    if (hasReplies && !fadeAnims.current[item.id]) {
      fadeAnims.current[item.id] = new Animated.Value(isCollapsed ? 0 : 1);
    }

    return (
      <View
        style={[styles.commentContainer, { backgroundColor: theme.cardAlt }]}
      >
        <View style={styles.commentHeader}>
          <Image
            source={{ uri: getProfileImage(item) }}
            style={styles.userImage}
          />
          <View style={styles.commentHeaderInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {getDisplayName(item)}
            </Text>
            <Text style={[styles.commentDate, { color: theme.textSecondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          {hasReplies && (
            <TouchableOpacity
              style={[
                styles.collapseButton,
                isCollapsed
                  ? { backgroundColor: theme.backgroundSecondary }
                  : null,
              ]}
              onPress={() => toggleCommentCollapse(item.id)}
            >
              <Ionicons
                name={isCollapsed ? "chevron-down" : "chevron-up"}
                size={16}
                color={isCollapsed ? theme.primary : theme.textSecondary}
              />
              {isCollapsed && (
                <Text
                  style={[
                    styles.collapsedRepliesCount,
                    { color: theme.primary },
                  ]}
                >
                  {item.replies?.length || 0}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.commentContent, { color: theme.text }]}>
          {item.content}
        </Text>

        <View style={styles.commentActions}>
          <View style={styles.voteContainer}>
            <TouchableOpacity
              onPress={() =>
                handleVote(VoteTargetType.COMMENT, item.id.toString(), 1)
              }
              style={[
                styles.voteButton,
                item.userVote === 1 && {
                  backgroundColor: theme.primary + "20",
                },
              ]}
            >
              <Ionicons
                name={item.userVote === 1 ? "arrow-up" : "arrow-up-outline"}
                size={16}
                color={
                  item.userVote === 1 ? theme.primary : theme.textSecondary
                }
              />
            </TouchableOpacity>

            <Text style={[styles.voteCount, { color: theme.text }]}>
              {item.score}
            </Text>

            <TouchableOpacity
              onPress={() =>
                handleVote(VoteTargetType.COMMENT, item.id.toString(), -1)
              }
              style={[
                styles.voteButton,
                item.userVote === -1 && { backgroundColor: theme.error + "20" },
              ]}
            >
              <Ionicons
                name={
                  item.userVote === -1 ? "arrow-down" : "arrow-down-outline"
                }
                size={16}
                color={item.userVote === -1 ? theme.error : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => setReplyTo(item)}
          >
            <Ionicons
              name="return-down-forward"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.replyText, { color: theme.primary }]}>
              Trả lời
            </Text>
          </TouchableOpacity>
        </View>

        {item.replies && item.replies.length > 0 && !isCollapsed && (
          <Animated.View
            style={[
              styles.repliesContainer,
              { opacity: fadeAnims.current[item.id] },
            ]}
          >
            {item.replies.map((reply) => (
              <View
                key={reply.id}
                style={[
                  styles.replyContainer,
                  { borderLeftColor: theme.borderLight },
                ]}
              >
                <View style={styles.commentHeader}>
                  <Image
                    source={{ uri: getProfileImage(reply) }}
                    style={styles.userImageSmall}
                  />
                  <View style={styles.commentHeaderInfo}>
                    <Text style={[styles.userNameSmall, { color: theme.text }]}>
                      {getDisplayName(reply)}
                    </Text>
                    <Text
                      style={[
                        styles.commentDateSmall,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {formatDate(reply.createdAt)}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.commentContent, { color: theme.text }]}>
                  {reply.content}
                </Text>

                <View style={styles.commentActions}>
                  <View style={styles.voteContainer}>
                    <TouchableOpacity
                      onPress={() =>
                        handleVote(
                          VoteTargetType.COMMENT,
                          reply.id.toString(),
                          1
                        )
                      }
                      style={[
                        styles.voteButton,
                        reply.userVote === 1 && {
                          backgroundColor: theme.primary + "20",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          reply.userVote === 1 ? "arrow-up" : "arrow-up-outline"
                        }
                        size={14}
                        color={
                          reply.userVote === 1
                            ? theme.primary
                            : theme.textSecondary
                        }
                      />
                    </TouchableOpacity>

                    <Text
                      style={[styles.voteCountSmall, { color: theme.text }]}
                    >
                      {reply.score}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        handleVote(
                          VoteTargetType.COMMENT,
                          reply.id.toString(),
                          -1
                        )
                      }
                      style={[
                        styles.voteButton,
                        reply.userVote === -1 && {
                          backgroundColor: theme.error + "20",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          reply.userVote === -1
                            ? "arrow-down"
                            : "arrow-down-outline"
                        }
                        size={14}
                        color={
                          reply.userVote === -1
                            ? theme.error
                            : theme.textSecondary
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => setReplyTo(reply)}
                  >
                    <Ionicons
                      name="return-down-forward"
                      size={14}
                      color={theme.primary}
                    />
                    <Text
                      style={[styles.replyTextSmall, { color: theme.primary }]}
                    >
                      Trả lời
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {hasReplies && isCollapsed && (
          <TouchableOpacity
            style={[
              styles.showRepliesButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            onPress={() => toggleCommentCollapse(item.id)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color={theme.primary}
            />
            <Text style={[styles.showRepliesText, { color: theme.primary }]}>
              Hiển thị {item.replies?.length} trả lời
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <PostDetailSkeleton theme={theme} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Post not found</Text>
      </View>
    );
  }

  // Helper to safely get post user display name
  const getPostDisplayName = () => {
    if (post.userdata) {
      return (
        post.userdata.fullName || post.userdata.username || "Anonymous User"
      );
    }
    return "Anonymous User";
  };

  // Helper to safely get post garden name
  const getPostGardenName = () => {
    return post.garden?.name || "Unknown Garden";
  };

  // Helper to safely get post profile image
  const getPostProfileImage = () => {
    return post.userdata?.profilePicture
      ? `${env.apiUrl}${post.userdata.profilePicture}`
      : "https://via.placeholder.com/40";
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              router.replace("/(modules)/community/");
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Chi tiết bài viết
          </Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={[styles.postCard, { backgroundColor: theme.card }]}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <Image
                  source={{ uri: getPostProfileImage() }}
                  style={styles.userImage}
                />
                <View>
                  <Text style={[styles.userName, { color: theme.text }]}>
                    {getPostDisplayName()}
                  </Text>
                  <Text
                    style={[styles.gardenName, { color: theme.textSecondary }]}
                  >
                    {getPostGardenName()} · {formatDate(post.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.postTitle, { color: theme.text }]}>
              {post.title}
            </Text>
            <Text style={[styles.postContent, { color: theme.text }]}>
              {post.content}
            </Text>

            {post.images && post.images.length > 0 && (
              <View style={styles.imagesContainer}>
                <ImageGallery images={post.images} />
              </View>
            )}

            <View style={styles.tagContainer}>
              {(post.tags || []).map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tagBadge,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.primary }]}>
                    #{typeof tag === "string" ? tag : tag.name || ""}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.postActions}>
              <View style={styles.voteContainer}>
                <TouchableOpacity
                  onPress={() =>
                    handleVote(VoteTargetType.POST, post.id.toString(), 1)
                  }
                  style={[
                    styles.voteButton,
                    post.userVote === 1 && {
                      backgroundColor: theme.primary + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={post.userVote === 1 ? "arrow-up" : "arrow-up-outline"}
                    size={20}
                    color={
                      post.userVote === 1 ? theme.primary : theme.textSecondary
                    }
                  />
                </TouchableOpacity>
                <Text style={[styles.voteCount, { color: theme.text }]}>
                  {post.total_vote}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleVote(VoteTargetType.POST, post.id.toString(), -1)
                  }
                  style={[
                    styles.voteButton,
                    post.userVote === -1 && {
                      backgroundColor: theme.error + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      post.userVote === -1 ? "arrow-down" : "arrow-down-outline"
                    }
                    size={20}
                    color={
                      post.userVote === -1 ? theme.error : theme.textSecondary
                    }
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.actionText, { color: theme.textSecondary }]}
                >
                  Chia sẻ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={[styles.commentsSectionTitle, { color: theme.text }]}>
              Bình luận ({comments.length})
            </Text>

            {formatComments().map((comment) => (
              <React.Fragment key={comment.id}>
                {renderComment({ item: comment })}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>

        <View
          style={[
            styles.commentInputContainer,
            { backgroundColor: theme.card, borderTopColor: theme.borderLight },
          ]}
        >
          {replyTo && (
            <View
              style={[
                styles.replyingBar,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Text style={[styles.replyingText, { color: theme.text }]}>
                Đang trả lời{" "}
                {replyTo.userdata
                  ? replyTo.userdata.fullName ||
                    replyTo.userdata.username ||
                    "Anonymous User"
                  : "Anonymous User"}
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=1" }}
              style={styles.userImageSmall}
            />
            <TextInput
              style={[
                styles.commentInput,
                {
                  color: theme.text,
                  backgroundColor: theme.backgroundSecondary,
                },
              ]}
              placeholder={replyTo ? "Viết trả lời..." : "Viết bình luận..."}
              placeholderTextColor={theme.textTertiary}
              multiline
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    newComment.trim() && !submitting
                      ? theme.primary
                      : theme.backgroundSecondary,
                },
              ]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={newComment.trim() ? "#fff" : theme.textSecondary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  moreButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  postCard: {
    borderRadius: 12,
    margin: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
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
  userImageSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userNameSmall: {
    fontSize: 14,
    fontWeight: "600",
  },
  gardenName: {
    fontSize: 14,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  imagesContainer: {
    width: "100%",
    marginBottom: 12,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#bbb",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#4CAF50",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    paddingTop: 0,
  },
  tagBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  postActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    padding: 12,
  },
  voteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  voteButton: {
    padding: 6,
    borderRadius: 4,
  },
  voteCount: {
    marginHorizontal: 6,
    fontSize: 16,
    fontWeight: "600",
  },
  voteCountSmall: {
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  commentsSection: {
    marginHorizontal: 16,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  commentContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commentHeaderInfo: {
    flex: 1,
  },
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 12,
  },
  collapsedRepliesCount: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  commentDate: {
    fontSize: 12,
  },
  commentDateSmall: {
    fontSize: 10,
  },
  commentContent: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  replyText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  repliesContainer: {
    marginTop: 8,
  },
  replyContainer: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    marginLeft: 8,
    marginTop: 8,
  },
  showRepliesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  showRepliesText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  replyTextSmall: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  commentInputContainer: {
    borderTopWidth: 1,
    padding: 12,
  },
  replyingBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingText: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  imageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    opacity: 0.7,
  },
  imageCounter: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  imageCounterText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
