/**
 * Post Types – cleaned & deduplicated
 */

import { Garden } from "../gardens";
import { User } from "../users";

// Mục tiêu bình chọn (up/down) áp dụng cho cả bài viết và bình luận
export enum VoteTargetType {
  POST = "POST",
  COMMENT = "COMMENT",
}

// Thẻ Tag gắn vào bài viết
export interface Tag {
  id: number;
  name: string;
  postCount: number;
}

// Quan hệ nhiều–nhiều giữa Post và Tag
export interface PostTag {
  postId: number;
  tagId: number;
  tag: Tag;
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
  userDataId: number;
  userData: User;

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
  tags: PostTag[];
  images: PostImage[];
  comments?: Comment[];

  // Vote của user hiện tại (–1, 0, +1)
  userVote?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Bình luận
export interface Comment {
  id: number;

  // Quan hệ
  postId: number;
  parentId?: number; // trả lời bình luận khác
  userDataId: number;
  userData: User;

  // Nội dung & điểm số
  content: string;
  score: number;

  // Các reply con (đệ quy)
  replies?: Comment[];

  // Vote của user hiện tại (–1, 0, +1)
  userVote?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Vote record
export interface Vote {
  id: number;
  userDataId: number;
  targetType: VoteTargetType;
  targetId: number;
  voteValue: number; // 1 = upvote, -1 = downvote
  createdAt?: string;
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

export interface VoteDto {
  voteValue: number; // 1 | -1 | 0 (gỡ vote)
}

export interface FollowInfo {
  followerId: number;
  followedId: number;
  follower: User;
  followed: User;
  createdAt: string;
}
