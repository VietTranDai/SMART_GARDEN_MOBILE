/**
 * User DTOs
 *
 * Data Transfer Objects for user-related API requests and responses
 */
import { ExperienceLevel } from "./user.types";

/**
 * DTO for updating user profile
 */
export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  profilePicture?: File | null;
}

/**
 * DTO for changing user password
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User's experience progress data
 */
export interface ExperienceProgress {
  currentPoints: number;
  currentLevel: ExperienceLevel;
  nextLevel?: ExperienceLevel;
  pointsToNextLevel?: number;
  percentToNextLevel: number;
  recentActivities: Array<{
    id: number;
    name: string;
    timestamp: string;
    points: number;
  }>;
}
