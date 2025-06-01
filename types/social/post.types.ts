/**
 * Post Types – cleaned & deduplicated
 */

import { Garden } from "../gardens";

// Mục tiêu bình chọn (up/down) áp dụng cho cả bài viết và bình luận
export enum VoteTargetType {
  POST = "POST",
  COMMENT = "COMMENT",
}

// Thông tin người dùng trong cộng đồng
export interface CommunityUser {
  id: number;
  fullName: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  levelTitle?: string;
  levelIcon?: string;
}

// Thẻ Tag gắn vào bài viết
export interface Tag {
  id: number;
  name: string;
}

// Tag với số lượng bài viết
export interface TagWithPostCount extends Tag {
  postCount: number;
}

// Ảnh kèm theo bài viết
export interface PostImage {
  id: number;
  postId: number;
  url: string;
}

// Bài viết chính
export interface Post {
  id: number;

  // Tác giả
  gardenerId: number;
  userdata: CommunityUser;

  // Vườn (tuỳ chọn)
  gardenId?: number;
  garden?: Garden;

  // Thông tin cây trồng (tuỳ chọn)
  plantName?: string;
  plantGrowStage?: string;

  // Nội dung
  title: string;
  content: string;

  // Tổng số vote (up − down)
  total_vote: number;

  // Quan hệ
  tags?: Tag[];
  images?: PostImage[];
  comments?: Comment[];

  // Vote của user hiện tại (–1, 0, +1)
  userVote?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Bình luận
export interface Comment {
  id: number;

  // Quan hệ
  postId: number;
  parentId?: number; // trả lời bình luận khác
  gardenerId: number;
  userdata: CommunityUser;

  // Nội dung & điểm số
  content: string;
  score: number;

  // Các reply con (đệ quy)
  replies?: Comment[];

  // Vote của user hiện tại (–1, 0, +1)
  userVote?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Vote record
export interface Vote {
  id: number;
  userData: CommunityUser;
  targetType: VoteTargetType;
  postId?: number;
  commentId?: number;
  voteValue: number; // 1 = upvote, -1 = downvote
  createdAt: Date;
}

// Follow relation
export interface Follow {
  followerId: number;
  followedId: number;
  createdAt?: string;
}

/**
 * DTOs cho API
 */
export interface CreatePostDto {
  title: string;
  content: string;
  gardenId?: number;
  plantName?: string;
  plantGrowStage?: string;
  tagIds: number[];
  images?: File[]; // nếu bạn upload ảnh lên API
}

export interface CreateCommentDto {
  postId: number;
  parentId?: number;
  content: string;
}

export interface CreateVoteDto {
  voteValue: number;
  targetType: VoteTargetType;
  postId?: number;
  commentId?: number;
}

export interface VoteRequestDto {
  voteValue: number; // 1 | -1 | 0 (gỡ vote)
}

export interface VoteDto {
  id: number;
  userData: CommunityUser;
  targetType: VoteTargetType;
  postId?: number;
  commentId?: number;
  voteValue: number;
  createdAt: Date;
}

export interface FollowInfo {
  followerId: number;
  followedId: number;
  follower: CommunityUser;
  followed: CommunityUser;
  createdAt: string;
}
