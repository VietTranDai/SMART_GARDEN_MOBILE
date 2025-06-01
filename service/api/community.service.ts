import { Post } from "@/types";
import apiClient from "../apiClient";
import { COMMUNITY_ENDPOINTS } from "../endpoints";
import {
  CreatePostDto,
  CreateCommentDto,
  VoteRequestDto,
  Tag,
  FollowInfo,
  Comment,
} from "@/types";

// Define the missing interface locally
interface DeletePostResponseDto {
  success: boolean;
  message: string;
  deletedId?: number | string;
}

/**
 * Community Service
 *
 */
class CommunityService {
  /**
   * Get all posts with optional pagination
   */
  async getPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await apiClient.get(COMMUNITY_ENDPOINTS.POSTS, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  }

  /**
   * Get posts with filtering and pagination
   */
  async getFilteredPosts(
    tagIds?: number[],
    searchQuery?: string,
    gardenId?: number,
    userId?: number,
    page: number = 1,
    limit: number = 10
  ): Promise<Post[]> {
    try {
      const response = await apiClient.get(COMMUNITY_ENDPOINTS.POSTS_FILTER, {
        params: {
          page,
          limit,
          tagIds: tagIds?.join(","),
          searchQuery,
          gardenId,
          userId,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch filtered posts:", error);
      throw error;
    }
  }

  /**
   * Get a post by ID
   */
  async getPostById(postId: string): Promise<Post> {
    try {
      const response = await apiClient.get(
        COMMUNITY_ENDPOINTS.POST_DETAIL(postId)
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch post:", error);
      throw error;
    }
  }

  /**
   * Create a new post
   */
  async createPost(postData: CreatePostDto | FormData): Promise<Post> {
    try {
      const response = await apiClient.post(
        COMMUNITY_ENDPOINTS.POSTS,
        postData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  }

  /**
   * Update a post
   */
  async updatePost(
    postId: string,
    postData: Partial<CreatePostDto>
  ): Promise<Post> {
    try {
      const response = await apiClient.patch(
        COMMUNITY_ENDPOINTS.POST_DETAIL(postId),
        postData
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to update post:", error);
      throw error;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<DeletePostResponseDto> {
    try {
      const response = await apiClient.delete(
        COMMUNITY_ENDPOINTS.POST_DETAIL(postId)
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to delete post:", error);
      throw error;
    }
  }

  /**
   * Vote on a post (upvote/downvote)
   */
  async votePost(postId: string, voteData: VoteRequestDto): Promise<any> {
    try {
      const response = await apiClient.post(
        COMMUNITY_ENDPOINTS.POST_VOTE(postId),
        voteData
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to vote on post:", error);
      throw error;
    }
  }

  /**
   * Get comments for a post
   */
  async getPostComments(postId: string): Promise<Comment[]> {
    try {
      const response = await apiClient.get(
        COMMUNITY_ENDPOINTS.POST_COMMENTS(postId)
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      throw error;
    }
  }

  /**
   * Create a new comment
   */
  async createComment(commentData: CreateCommentDto): Promise<Comment> {
    try {
      const response = await apiClient.post(
        COMMUNITY_ENDPOINTS.COMMENTS,
        commentData
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create comment:", error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, content: string): Promise<Comment> {
    try {
      const response = await apiClient.patch(
        COMMUNITY_ENDPOINTS.COMMENT_DETAIL(commentId),
        {
          content,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to update comment:", error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<any> {
    try {
      const response = await apiClient.delete(
        COMMUNITY_ENDPOINTS.COMMENT_DETAIL(commentId)
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  }

  /**
   * Vote on a comment (upvote/downvote)
   */
  async voteComment(commentId: string, voteData: VoteRequestDto): Promise<any> {
    try {
      const response = await apiClient.post(
        COMMUNITY_ENDPOINTS.COMMENT_VOTE(commentId),
        voteData
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to vote on comment:", error);
      throw error;
    }
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<Tag[]> {
    try {
      const response = await apiClient.get(COMMUNITY_ENDPOINTS.TAGS);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      throw error;
    }
  }

  /**
   * Get popular tags based on post count
   */
  async getPopularTags(limit: number = 20): Promise<Tag[]> {
    try {
      const response = await apiClient.get(COMMUNITY_ENDPOINTS.TAGS_POPULAR, {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch popular tags:", error);
      throw error;
    }
  }

  /**
   * Create new tag
   */
  async createTag(name: string): Promise<Tag> {
    try {
      const response = await apiClient.post(COMMUNITY_ENDPOINTS.TAGS, { name });
      return response.data.data;
    } catch (error) {
      console.error("Failed to create tag:", error);
      throw error;
    }
  }

  /**
   * Search tags by name
   */
  async searchTags(query: string, limit: number = 10): Promise<Tag[]> {
    try {
      const response = await apiClient.get(COMMUNITY_ENDPOINTS.TAGS_SEARCH, {
        params: { query, limit },
      });
      return response.data.data;
    } catch (error) {
      console.error("Failed to search tags:", error);
      throw error;
    }
  }

  /**
   * Search posts by query
   */
  async searchPosts(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<Post[]> {
    try {
      const response = await apiClient.get(COMMUNITY_ENDPOINTS.POSTS_SEARCH, {
        params: { query, page, limit },
      });
      return response.data.data;
    } catch (error) {
      console.error("Failed to search posts:", error);
      throw error;
    }
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
    return response.data.data?.data || [];
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
    return response.data.data?.data || [];
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
    return response.data.data?.data || null;
  }

  /**
   * Unfollow a user
   * @param gardenerId Gardener ID to unfollow
   */
  async unfollowUser(gardenerId: number | string): Promise<void> {
    await apiClient.delete(COMMUNITY_ENDPOINTS.UNFOLLOW_USER(gardenerId));
  }
}

const communityService = new CommunityService();
export default communityService;
