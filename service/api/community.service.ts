import { Post } from "@/types";
import apiClient from "../apiClient";
import { COMMUNITY_ENDPOINTS } from "../endpoints";
import {
  CreatePostDto,
  CreateCommentDto,
  VoteDto,
  Tag,
  FollowInfo,
} from "@/types";

/**
 * Community Service
 *
 * Handles all community-related API calls (posts, comments, votes, follows)
 */
class CommunityService {
  /**
   * Get all posts with optional filtering
   * @param params Query parameters
   * @returns List of posts
   */
  async getPosts(params?: {
    tag?: string;
    search?: string;
    gardenerId?: number;
    plantName?: string;
    page?: number;
    limit?: number;
  }): Promise<Post[]> {
    const response = await apiClient.get(COMMUNITY_ENDPOINTS.POSTS, { params });
    return response.data;
  }

  /**
   * Get post details by ID
   * @param postId Post ID
   * @returns Post details
   */
  async getPostById(postId: number | string): Promise<Post> {
    const response = await apiClient.get(
      COMMUNITY_ENDPOINTS.POST_DETAIL(postId)
    );
    return response.data;
  }

  /**
   * Create a new post
   * @param postData Post creation data
   * @returns Created post
   */
  async createPost(postData: CreatePostDto): Promise<Post> {
    // If we have actual file objects, we need to use FormData
    let formData: FormData | null = null;

    if (
      postData.images &&
      Array.isArray(postData.images) &&
      postData.images.length > 0
    ) {
      formData = new FormData();
      formData.append("title", postData.title);
      formData.append("content", postData.content);

      if (postData.gardenId) {
        formData.append("gardenId", postData.gardenId.toString());
      }

      if (postData.plantName) {
        formData.append("plantName", postData.plantName);
      }

      if (postData.plantGrowStage) {
        formData.append("plantGrowStage", postData.plantGrowStage);
      }

      // Append tag IDs
      postData.tagIds.forEach((tagId) => {
        formData?.append("tagIds", tagId.toString());
      });

      // Append images
      postData.images.forEach((image, index) => {
        if (image instanceof File) {
          formData?.append(`images`, image);
        }
      });

      const response = await apiClient.post(
        COMMUNITY_ENDPOINTS.POSTS,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } else {
      // Regular JSON request if no images
      const response = await apiClient.post(
        COMMUNITY_ENDPOINTS.POSTS,
        postData
      );
      return response.data;
    }
  }

  /**
   * Update a post
   * @param postId Post ID
   * @param postData Post update data
   * @returns Updated post
   */
  async updatePost(
    postId: number | string,
    postData: Partial<CreatePostDto>
  ): Promise<Post> {
    // Similar handling for FormData as in createPost if needed
    const response = await apiClient.patch(
      COMMUNITY_ENDPOINTS.POST_DETAIL(postId),
      postData
    );
    return response.data;
  }

  /**
   * Delete a post
   * @param postId Post ID
   */
  async deletePost(postId: number | string): Promise<void> {
    await apiClient.delete(COMMUNITY_ENDPOINTS.POST_DETAIL(postId));
  }

  /**
   * Get comments for a post
   * @param postId Post ID
   * @returns List of comments
   */
  async getPostComments(postId: number | string): Promise<Comment[]> {
    const response = await apiClient.get(
      COMMUNITY_ENDPOINTS.POST_COMMENTS(postId)
    );
    return response.data;
  }

  /**
   * Get replies to a comment
   * @param commentId Comment ID
   * @returns List of reply comments
   */
  async getCommentReplies(commentId: number | string): Promise<Comment[]> {
    const response = await apiClient.get(
      COMMUNITY_ENDPOINTS.COMMENT_REPLIES(commentId)
    );
    return response.data;
  }

  /**
   * Create a new comment
   * @param commentData Comment creation data
   * @returns Created comment
   */
  async createComment(commentData: CreateCommentDto): Promise<Comment> {
    const response = await apiClient.post(
      COMMUNITY_ENDPOINTS.POST_COMMENTS(commentData.postId),
      commentData
    );
    return response.data;
  }

  /**
   * Update a comment
   * @param commentId Comment ID
   * @param content New comment content
   * @returns Updated comment
   */
  async updateComment(
    commentId: number | string,
    content: string
  ): Promise<Comment> {
    const response = await apiClient.patch(
      COMMUNITY_ENDPOINTS.COMMENT_DETAIL(commentId),
      { content }
    );
    return response.data;
  }

  /**
   * Delete a comment
   * @param commentId Comment ID
   */
  async deleteComment(commentId: number | string): Promise<void> {
    await apiClient.delete(COMMUNITY_ENDPOINTS.COMMENT_DETAIL(commentId));
  }

  /**
   * Vote on a post
   * @param postId Post ID
   * @param voteData Vote data
   * @returns Updated post with new vote count
   */
  async votePost(
    postId: number | string,
    voteData: VoteDto
  ): Promise<{ total_vote: number; userVote: number }> {
    const response = await apiClient.post(
      COMMUNITY_ENDPOINTS.POST_VOTE(postId),
      voteData
    );
    return response.data;
  }

  /**
   * Vote on a comment
   * @param commentId Comment ID
   * @param voteData Vote data
   * @returns Updated comment with new score
   */
  async voteComment(
    commentId: number | string,
    voteData: VoteDto
  ): Promise<{ score: number; userVote: number }> {
    const response = await apiClient.post(
      COMMUNITY_ENDPOINTS.COMMENT_VOTE(commentId),
      voteData
    );
    return response.data;
  }

  /**
   * Get all tags
   * @returns List of tags
   */
  async getTags(): Promise<Tag[]> {
    const response = await apiClient.get(COMMUNITY_ENDPOINTS.TAGS);
    return response.data;
  }

  /**
   * Get followers of a gardener
   * @param gardenerId Gardener ID
   * @returns List of followers
   */
  async getFollowers(gardenerId: number | string): Promise<FollowInfo[]> {
    const response = await apiClient.get(
      COMMUNITY_ENDPOINTS.FOLLOWERS(gardenerId)
    );
    return response.data;
  }

  /**
   * Get users that a gardener is following
   * @param gardenerId Gardener ID
   * @returns List of followed users
   */
  async getFollowing(gardenerId: number | string): Promise<FollowInfo[]> {
    const response = await apiClient.get(
      COMMUNITY_ENDPOINTS.FOLLOWING(gardenerId)
    );
    return response.data;
  }

  /**
   * Follow a user
   * @param gardenerId Gardener ID to follow
   * @returns Follow info
   */
  async followUser(gardenerId: number | string): Promise<FollowInfo> {
    const response = await apiClient.post(
      COMMUNITY_ENDPOINTS.FOLLOW_USER(gardenerId)
    );
    return response.data;
  }

  /**
   * Unfollow a user
   * @param gardenerId Gardener ID to unfollow
   */
  async unfollowUser(gardenerId: number | string): Promise<void> {
    await apiClient.delete(COMMUNITY_ENDPOINTS.UNFOLLOW_USER(gardenerId));
  }
}

export default new CommunityService();
