export interface Role {
  id: number;
  name: string;
  description?: string;
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

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  lastLogin?: string;
  profilePicture?: string;
  address?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  role: Role;
}

export interface Admin extends User {
  role: Role & { name: "ADMIN" };
}

export interface Gardener extends User {
  role: Role & { name: "GARDENER" };
  experiencePoints: number;
  experienceLevel: ExperienceLevel;
}

export type AppUser = Admin | Gardener;

export function isGardener(user: AppUser): user is Gardener {
  return user.role.name === "GARDENER";
}
export function isAdmin(user: AppUser): user is Admin {
  return user.role.name === "ADMIN";
}

export interface GardenerStats {
  // Basic counts
  gardens: number;
  posts: number;
  followers: number;
  following: number;

  // Garden stats
  activeGardens: number;
  inactiveGardens: number;
  indoorGardens: number;
  outdoorGardens: number;

  // Activity stats
  totalActivities: number;
  activitiesByType: {
    [key: string]: number; // PLANTING, WATERING, FERTILIZING, etc.
  };

  // Task stats
  completedTasks: number;
  pendingTasks: number;
  skippedTasks: number;
  taskCompletionRate: number; // Percentage

  // Community stats
  totalVotesReceived: number;
  totalCommentsReceived: number;
  averagePostRating: number;
  totalPhotoEvaluations: number;

  // Plants stats
  plantTypes: {
    count: number;
    mostGrown: string[];
  };

  // Experience stats
  experiencePointsToNextLevel: number;
  experienceLevelProgress: number; // Percentage to next level
  joinedSince: string; // Date

  // Follow status
  isFollowing: boolean;
}

export interface GardenerProfile extends Gardener, GardenerStats {}
