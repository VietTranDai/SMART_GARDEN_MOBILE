/**
 * Garden Calendar Types
 * 
 * TypeScript interfaces for garden calendar functionality
 * Based on the backend GardenActivityCalendarDto structure
 */

// Define activity and task types locally to avoid Prisma dependency
export type ActivityType = 
  | 'WATERING'
  | 'FERTILIZING' 
  | 'PRUNING'
  | 'HARVESTING'
  | 'PLANTING'
  | 'PEST_CONTROL'
  | 'MONITORING'
  | 'OTHER';

export type TaskStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';

export interface GardenActivityCalendarDto {
  gardenId: number;
  gardenName: string;
  gardenProfilePicture?: string;
  plantName?: string;
  plantGrowStage?: string;
  summary: GardenCalendarSummary;
  recentActivities: RecentActivityDto[];
  upcomingTasks: UpcomingTaskDto[];
  upcomingWateringSchedules: WateringScheduleDto[];
}

export interface GardenCalendarSummary {
  totalActivitiesThisWeek: number;
  upcomingTasksCount: number;
  completedTasksToday: number;
  pendingTasksToday: number;
}

export interface RecentActivityDto {
  id: number;
  name: string;
  activityType: ActivityType;
  timestamp: Date | string;
  plantName?: string;
  plantGrowStage?: string;
  details?: string;
  notes?: string;
  environmentalConditions?: EnvironmentalConditions;
  evaluation?: ActivityEvaluation;
  photos?: ActivityPhoto[];
}

export interface EnvironmentalConditions {
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  weather?: WeatherCondition;
}

export interface WeatherCondition {
  main: string; // WeatherMain from backend
  description: string;
  iconCode: string;
}

export interface ActivityEvaluation {
  rating?: number;
  outcome?: string;
  comments?: string;
}

export interface ActivityPhoto {
  url: string;
  aiFeedback?: string;
  confidence?: number;
}

export interface UpcomingTaskDto {
  id: number;
  type: string;
  description: string;
  dueDate: Date | string;
  status: TaskStatus;
  plantTypeName?: string;
  plantStageName?: string;
  priority: TaskPriority;
  timeRemaining: TaskTimeRemaining;
  recommendations?: TaskRecommendations;
}

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TaskTimeRemaining {
  days: number;
  hours: number;
  isOverdue: boolean;
}

export interface TaskRecommendations {
  optimalTime?: string;
  weatherConsiderations?: string;
  tips?: string;
}

export interface WateringScheduleDto {
  id: number;
  gardenId: number;
  plantId?: number;
  scheduledTime: Date | string;
  amount: number;
  frequency: string;
  isCompleted: boolean;
  isSkipped: boolean;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Display helper types for UI components
 */
export interface ActivityTypeDisplayInfo {
  label: string;
  icon: string;
  color: string;
}

export interface TaskPriorityDisplayInfo {
  label: string;
  color: string;
  urgencyLevel: number;
}

/**
 * Activity type mapping for display
 */
export const ACTIVITY_TYPE_DISPLAY_MAP: Record<string, ActivityTypeDisplayInfo> = {
  WATERING: {
    label: 'Tưới nước',
    icon: 'water',
    color: '#2196F3'
  },
  FERTILIZING: {
    label: 'Bón phân',
    icon: 'nutrition',
    color: '#4CAF50'
  },
  PRUNING: {
    label: 'Cắt tỉa',
    icon: 'cut',
    color: '#FF9800'
  },
  HARVESTING: {
    label: 'Thu hoạch',
    icon: 'basket',
    color: '#8BC34A'
  },
  PLANTING: {
    label: 'Trồng cây',
    icon: 'flower',
    color: '#4CAF50'
  },
  PEST_CONTROL: {
    label: 'Diệt sâu bệnh',
    icon: 'bug',
    color: '#F44336'
  },
  MONITORING: {
    label: 'Quan sát',
    icon: 'eye',
    color: '#9C27B0'
  },
  OTHER: {
    label: 'Khác',
    icon: 'ellipsis-horizontal',
    color: '#607D8B'
  }
};

/**
 * Task priority mapping for display
 */
export const TASK_PRIORITY_DISPLAY_MAP: Record<TaskPriority, TaskPriorityDisplayInfo> = {
  HIGH: {
    label: 'Cao',
    color: '#F44336',
    urgencyLevel: 3
  },
  MEDIUM: {
    label: 'Trung bình',
    color: '#FF9800',
    urgencyLevel: 2
  },
  LOW: {
    label: 'Thấp',
    color: '#4CAF50',
    urgencyLevel: 1
  }
};
