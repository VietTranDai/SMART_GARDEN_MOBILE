/**
 * User Types
 *
 * Type definitions for user-related data based on the backend model
 */


export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  roleId: number;
  role?: Role;
  lastLogin?: string;
  profilePicture?: string;
  address?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  isAdmin?: boolean;
  isGardener?: boolean;
  experiencePoints?: number;
  experienceLevel?: ExperienceLevel;
}

export interface ExperienceLevel {
  id: number;
  level: number;
  minXP: number;
  maxXP: number;
  title: string;
  description: string;
  icon: string;
}

export interface AdminData {
  userId: number;
  user?: UserData;
}

export interface GardenerData {
  userId: number;
  user?: UserData;
  experiencePoints: number;
  experienceLevelId: number;
  experienceLevel?: ExperienceLevel;
}

