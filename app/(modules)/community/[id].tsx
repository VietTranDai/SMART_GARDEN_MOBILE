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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";

// Enum to match Prisma schema
enum VoteTargetType {
  POST = "POST",
  COMMENT = "COMMENT",
}

// Interfaces based on Prisma schema
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
  total_vote: number;
  userVote?: number; // 1, -1, or undefined if user hasn't voted
}

interface Comment {
  id: string;
  postId: string;
  gardenerId: string;
  gardenerName: string;
  gardenerImage: string;
  parentId: string | null;
  content: string;
  score: number;
  createdAt: string;
  userVote?: number; // 1, -1, or undefined if user hasn't voted
  replies?: Comment[];
}

// Mock data for a single post with full details
const MOCK_POST: Post = {
  id: "1",
  gardenerId: "1",
  gardenerName: "John Garden",
  gardenerImage: "https://i.pravatar.cc/150?img=11",
  gardenName: "Backyard Garden",
  title: "My tomatoes are thriving!",
  content:
    "I've been using a new organic fertilizer and my tomatoes have never looked better. Has anyone else tried it?\n\nI planted them about 2 months ago and they've already doubled in size. The soil in my garden is quite clay-heavy, so I've been mixing in some compost and this new organic fertilizer I found at the local garden center.\n\nThe temperature has been pretty consistent around 75-85°F during the day, and I water them every other day.\n\nHas anyone else had success with organic fertilizers? Any recommendations for other varieties I should try next season?",
  images: ["https://picsum.photos/800/500?random=1"],
  tags: ["Tomatoes", "Organic", "Success"],
  createdAt: "2025-04-20T10:00:00Z",
  total_vote: 15,
};

// Mock data for comments
const MOCK_COMMENTS: Comment[] = [
  {
    id: "101",
    postId: "1",
    gardenerId: "2",
    gardenerName: "Sarah Green",
    gardenerImage: "https://i.pravatar.cc/150?img=5",
    parentId: null,
    content:
      "I've had great results with organic fertilizers too! What brand are you using?",
    score: 8,
    createdAt: "2025-04-20T11:30:00Z",
  },
  {
    id: "102",
    postId: "1",
    gardenerId: "3",
    gardenerName: "Mike Soil",
    gardenerImage: "https://i.pravatar.cc/150?img=8",
    parentId: null,
    content:
      "Those look fantastic! I've found that adding worm castings to my soil has also made a huge difference in my tomato plants.",
    score: 5,
    createdAt: "2025-04-20T12:15:00Z",
  },
  {
    id: "103",
    postId: "1",
    gardenerId: "1",
    gardenerName: "John Garden",
    gardenerImage: "https://i.pravatar.cc/150?img=11",
    parentId: "101",
    content:
      "Thanks! I'm using 'Garden Boost Organic'. It's pricey but worth it!",
    score: 3,
    createdAt: "2025-04-20T13:45:00Z",
  },
  {
    id: "104",
    postId: "1",
    gardenerId: "4",
    gardenerName: "Alice Petunia",
    gardenerImage: "https://i.pravatar.cc/150?img=9",
    parentId: null,
    content:
      "Have you had any issues with pests? My tomatoes always seem to attract aphids no matter what I do.",
    score: 2,
    createdAt: "2025-04-21T09:20:00Z",
  },
];

export default function PostDetailScreen() {
  const theme = useAppTheme();
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setPost(MOCK_POST);
      setComments(MOCK_COMMENTS);
      setLoading(false);
    }, 500);
  }, [id]);

  // Group comments into threads
  const formatComments = (): Comment[] => {
    const parentComments: Comment[] = [];
    const commentMap: Record<string, Comment> = {};

    // First pass: create a map of all comments
    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Second pass: organize into parent-child relationships
    comments.forEach((comment) => {
      if (comment.parentId === null) {
        parentComments.push(commentMap[comment.id]);
      } else if (commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies = [
          ...(commentMap[comment.parentId].replies || []),
          commentMap[comment.id],
        ];
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

  const handleVote = (type: VoteTargetType, id: string, value: number) => {
    // In a real app, this would be an API call
    if (type === VoteTargetType.POST && post) {
      const currentVote = post.userVote;
      let newTotal = post.total_vote;

      if (currentVote === value) {
        // User is un-voting
        newTotal -= value;
        setPost({ ...post, total_vote: newTotal, userVote: undefined });
      } else if (currentVote === undefined) {
        // User is voting for the first time
        newTotal += value;
        setPost({ ...post, total_vote: newTotal, userVote: value });
      } else {
        // User is changing their vote
        newTotal = newTotal - currentVote + value;
        setPost({ ...post, total_vote: newTotal, userVote: value });
      }
    } else if (type === VoteTargetType.COMMENT) {
      const updatedComments = comments.map((comment) => {
        if (comment.id === id) {
          const currentVote = comment.userVote;
          let newScore = comment.score;

          if (currentVote === value) {
            // User is un-voting
            newScore -= value;
            return { ...comment, score: newScore, userVote: undefined };
          } else if (currentVote === undefined) {
            // User is voting for the first time
            newScore += value;
            return { ...comment, score: newScore, userVote: value };
          } else {
            // User is changing their vote
            newScore = newScore - currentVote + value;
            return { ...comment, score: newScore, userVote: value };
          }
        }
        return comment;
      });

      setComments(updatedComments);
    }
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    setSubmitting(true);

    // In a real app, this would be an API call
    setTimeout(() => {
      const newCommentObj: Comment = {
        id: `new-${Date.now()}`,
        postId: post?.id || "",
        gardenerId: "current-user", // In a real app, this would be the current user's ID
        gardenerName: "Current User", // In a real app, this would be the current user's name
        gardenerImage: "https://i.pravatar.cc/150?img=1", // In a real app, this would be the current user's image
        parentId: replyTo?.id || null,
        content: newComment,
        score: 0,
        createdAt: new Date().toISOString(),
      };

      setComments([...comments, newCommentObj]);
      setNewComment("");
      setReplyTo(null);
      setSubmitting(false);
    }, 500);
  };

  const renderComment = ({ item }: { item: Comment }) => {
    return (
      <View
        style={[styles.commentContainer, { backgroundColor: theme.cardAlt }]}
      >
        <View style={styles.commentHeader}>
          <Image
            source={{ uri: item.gardenerImage }}
            style={styles.userImage}
          />
          <View>
            <Text style={[styles.userName, { color: theme.text }]}>
              {item.gardenerName}
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
              onPress={() => handleVote(VoteTargetType.COMMENT, item.id, 1)}
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
              onPress={() => handleVote(VoteTargetType.COMMENT, item.id, -1)}
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
                    source={{ uri: reply.gardenerImage }}
                    style={styles.userImageSmall}
                  />
                  <View>
                    <Text style={[styles.userNameSmall, { color: theme.text }]}>
                      {reply.gardenerName}
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
                        handleVote(VoteTargetType.COMMENT, reply.id, 1)
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
                        handleVote(VoteTargetType.COMMENT, reply.id, -1)
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
                  source={{ uri: post.gardenerImage }}
                  style={styles.userImage}
                />
                <View>
                  <Text style={[styles.userName, { color: theme.text }]}>
                    {post.gardenerName}
                  </Text>
                  <Text
                    style={[styles.gardenName, { color: theme.textSecondary }]}
                  >
                    {post.gardenName} · {formatDate(post.createdAt)}
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

            {post.images.length > 0 && (
              <View style={styles.imagesContainer}>
                {post.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}

            <View style={styles.tagContainer}>
              {post.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tagBadge,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.primary }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.postActions}>
              <View style={styles.voteContainer}>
                <TouchableOpacity
                  onPress={() => handleVote(VoteTargetType.POST, post.id, 1)}
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
                  onPress={() => handleVote(VoteTargetType.POST, post.id, -1)}
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
                Replying to {replyTo.gardenerName}
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
