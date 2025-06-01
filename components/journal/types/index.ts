import { ActivityType } from "@/types/activities/activity.types";
import { GardenActivityDto, ActivityStatsResponseDto, GardenActivityAnalyticsDto } from "@/types/activities/dtos";
import { Garden } from "@/types";

export interface JournalState {
  selectedGardenId?: string;
  selectedActivityType?: string;
  searchQuery: string;
  isSearchActive: boolean;
  isStatsExpanded: boolean;
  selectedDateRange: '7days' | '30days' | '90days';
}

export interface JournalStats {
  total: number;
  thisMonth: number;
  thisWeek: number;
}

export interface JournalData {
  activities: GardenActivityDto[];
  gardens: Garden[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadingMore: boolean;
  gardenFetchError: string | null;
  loadingGardens: boolean;
}

export interface JournalDetailedStats {
  detailedStats: ActivityStatsResponseDto | null;
  statsLoading: boolean;
  statsError: string | null;
}

export interface ActivitySection {
  title: string;
  data: GardenActivityDto[];
  sortDate: Date;
}

export interface ActivityColorMap {
  [key: string]: string;
}

export interface ActivityTypeTranslations {
  [ActivityType.PLANTING]: string;
  [ActivityType.WATERING]: string;
  [ActivityType.FERTILIZING]: string;
  [ActivityType.PRUNING]: string;
  [ActivityType.HARVESTING]: string;
  [ActivityType.PEST_CONTROL]: string;
  [ActivityType.SOIL_TESTING]: string;
  [ActivityType.WEEDING]: string;
  [ActivityType.OTHER]: string;
}

// New interfaces for enhanced analytics
export interface ActivityAnalyticsState {
  selectedActivityId?: number;
  analytics: GardenActivityAnalyticsDto | null;
  loading: boolean;
  error: string | null;
}

export interface EnhancedStatsView {
  showDailyBreakdown: boolean;
  showMonthlyTrends: boolean;
  showGardenComparison: boolean;
  showPerformanceMetrics: boolean;
}

export const ACTIVITY_TYPE_TRANSLATIONS: ActivityTypeTranslations = {
  [ActivityType.PLANTING]: "Trồng cây",
  [ActivityType.WATERING]: "Tưới nước", 
  [ActivityType.FERTILIZING]: "Bón phân",
  [ActivityType.PRUNING]: "Cắt tỉa",
  [ActivityType.HARVESTING]: "Thu hoạch",
  [ActivityType.PEST_CONTROL]: "Kiểm soát sâu bệnh",
  [ActivityType.SOIL_TESTING]: "Kiểm tra đất",
  [ActivityType.WEEDING]: "Làm cỏ",
  [ActivityType.OTHER]: "Hoạt động khác",
};

export const ACTIVITY_COLOR_MAP: ActivityColorMap = {
  [ActivityType.PLANTING]: '#4CAF50',
  [ActivityType.WATERING]: '#2196F3',
  [ActivityType.FERTILIZING]: '#8BC34A',
  [ActivityType.PRUNING]: '#FF9800',
  [ActivityType.HARVESTING]: '#FFC107',
  [ActivityType.PEST_CONTROL]: '#F44336',
  [ActivityType.SOIL_TESTING]: '#795548',
  [ActivityType.WEEDING]: '#9C27B0',
  [ActivityType.OTHER]: '#607D8B',
}; 