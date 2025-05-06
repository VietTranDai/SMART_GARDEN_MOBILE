import React, { useState, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import communityService from "@/service/api/community.service";
import { Post, Comment, CreateCommentDto } from "@/types";
import { VoteDto, VoteTargetType } from "@/types/social/post.types";
import env from "@/config/environment";

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

  const fetchData = async () => {
    if (!id) return;

    try {
      setError(null);
      setLoading(true);

      const postId = typeof id === "string" ? id : id.toString();

      // Fetch post details and comments in parallel
      const [postData, commentsData] = await Promise.all([
        communityService.getPostById(postId),
        communityService.getPostComments(postId),
      ]);

      // Type assertion to resolve type conflicts
      setPost(postData as any);
      setComments(commentsData as any);
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
      if (comment.parentId === null) {
        parentComments.push(commentMap[comment.id.toString()] as Comment);
      } else if (comment.parentId && commentMap[comment.parentId.toString()]) {
        const parentComment = commentMap[comment.parentId.toString()];
        if (parentComment) {
          parentComment.replies = [
            ...(parentComment.replies || []),
            commentMap[comment.id.toString()] as Comment,
          ];
        }
      }
    });

    // Sort parent comments by score
    return parentComments.sort((a, b) => b.score - a.score);
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleVote = async (
    targetType: VoteTargetType,
    targetId: string,
    voteValue: number
  ) => {
    try {
      if (targetType === VoteTargetType.POST && post) {
        // Call API to vote on post
        const voteData: VoteDto = { voteValue: voteValue };
        const result = await communityService.votePost(targetId, voteData);

        // Update local state with the result from API
        setPost({
          ...post,
          total_vote: result.total_vote,
          userVote: result.userVote,
        } as any);
      } else if (targetType === VoteTargetType.COMMENT) {
        // Call API to vote on comment
        const voteData: VoteDto = { voteValue: voteValue };
        const result = await communityService.voteComment(targetId, voteData);

        // Update the comment in our local state
        setComments(
          (prev) =>
            prev.map((comment) => {
              if (comment.id.toString() === targetId) {
                return {
                  ...comment,
                  score: result.score,
                  userVote: result.userVote,
                };
              } else if (comment.replies) {
                return {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply.id.toString() === targetId
                      ? {
                          ...reply,
                          score: result.score,
                          userVote: result.userVote,
                        }
                      : reply
                  ),
                };
              }
              return comment;
            }) as any
        );
      }
    } catch (err) {
      console.error("Failed to register vote:", err);
      Alert.alert("Error", "Failed to register your vote. Please try again.");
    }
  };

  const handleSubmitComment = async () => {
    if (!id || !newComment.trim()) return;

    setSubmitting(true);
    try {
      // Convert string ID to number if needed by the API
      const postId = typeof id === "string" ? parseInt(id, 10) : id;

      const commentData: CreateCommentDto = {
        postId: Number(postId),
        content: newComment.trim(),
        parentId: replyTo?.id ? Number(replyTo.id) : undefined,
      };

      // Call API to create comment
      const createdComment = await communityService.createComment(commentData);

      // Update local state with the new comment
      setComments((prevComments) => [...prevComments, createdComment as any]);

      // Reset form
      setNewComment("");
      setReplyTo(null);
    } catch (err) {
      console.error("Failed to submit comment:", err);
      Alert.alert("Error", "Failed to submit your comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    // Helper to safely get user display name
    const getDisplayName = (comment: Comment) => {
      if (comment.userData) {
        const { firstName, lastName } = comment.userData;
        if (firstName || lastName) {
          return `${firstName || ""} ${lastName || ""}`.trim();
        }
      }
      return "Anonymous User";
    };

    // Helper to safely get profile image
    const getProfileImage = (comment: Comment) => {
      return (
        `${env.apiUrl}${comment.userData?.profilePicture}` ||
        "https://via.placeholder.com/40"
      );
    };

    return (
      <View
        style={[styles.commentContainer, { backgroundColor: theme.cardAlt }]}
      >
        <View style={styles.commentHeader}>
          <Image
            source={{ uri: getProfileImage(item) }}
            style={styles.userImage}
          />
          <View>
            <Text style={[styles.userName, { color: theme.text }]}>
              {getDisplayName(item)}
            </Text>
            <Text style={[styles.commentDate, { color: theme.textSecondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
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
                name="arrow-up"
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
                name="arrow-down"
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
              Reply
            </Text>
          </TouchableOpacity>
        </View>

        {item.replies && item.replies.length > 0 && (
          <View style={styles.repliesContainer}>
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
                  <View>
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
                        name="arrow-up"
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
                        name="arrow-down"
                        size={14}
                        color={
                          reply.userVote === -1
                            ? theme.error
                            : theme.textSecondary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
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
    if (post.userData) {
      const { firstName, lastName } = post.userData;
      if (firstName || lastName) {
        return `${firstName || ""} ${lastName || ""}`.trim();
      }
    }
    return "Anonymous User";
  };

  // Helper to safely get post garden name
  const getPostGardenName = () => {
    return post.garden?.name || "Unknown Garden";
  };

  // Helper to safely get post profile image
  const getPostProfileImage = () => {
    return post.userData?.profilePicture || "https://via.placeholder.com/40";
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Post</Text>
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
                {post.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{
                      uri:
                        typeof image === "string"
                          ? image
                          : (image as any).url ||
                            "https://via.placeholder.com/300",
                    }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}

            <View style={styles.tagContainer}>
              {(post.tags || []).map((tag: any, index) => (
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
                    name="arrow-up"
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
                    name="arrow-down"
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
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={[styles.commentsSectionTitle, { color: theme.text }]}>
              Comments ({comments.length})
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
                Replying to{" "}
                {replyTo.userData
                  ? `${replyTo.userData.firstName || ""} ${
                      replyTo.userData.lastName || ""
                    }`.trim()
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
              placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
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
    </SafeAreaView>
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
    lineHeight: 22,
  },
  imagesContainer: {
    width: "100%",
  },
  postImage: {
    width: "100%",
    height: 300,
    marginBottom: 12,
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
});
