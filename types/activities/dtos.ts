import { ActivityType, GardenActivity, EvaluatorType, ActivityEvaluation, PhotoEvaluation } from "./activity.types";
import { TaskStatus, Task } from "./task.types";

/**
 * DTO for creating a new task
 * Corresponds to CreateTaskDto in the backend
 */
export interface CreateTaskDto {
  /** ID của Gardener được giao nhiệm vụ */
  gardenerId: number;
  
  /** ID của Garden nơi công việc được thực hiện */
  gardenId: number;
  
  /** Tên loại cây (tùy chọn) */
  plantTypeName?: string;
  
  /** Tên giai đoạn cây (tùy chọn) */
  plantStageName?: string;
  
  /** Loại công việc */
  type: string;
  
  /** Mô tả công việc */
  description: string;
  
  /** Ngày đến hạn (ISO 8601 string) */
  dueDate: string;
}

/**
 * DTO for updating an existing task
 * Corresponds to UpdateTaskDto in the backend
 */
export interface UpdateTaskDto {
  /** Tên loại cây (tùy chọn) */
  plantTypeName?: string;
  
  /** Tên giai đoạn cây (tùy chọn) */
  plantStageName?: string;
  
  /** Loại công việc (tùy chọn) */
  type?: string;
  
  /** Mô tả công việc (tùy chọn) */
  description?: string;
  
  /** Ngày đến hạn (ISO 8601 string) (tùy chọn) */
  dueDate?: string;
  
  /** Trạng thái công việc (tùy chọn) */
  status?: TaskStatus;
  
  /** Thời gian hoàn thành nếu đã xong (ISO 8601 string) (tùy chọn) */
  completedAt?: string;
}

/**
 * DTO for querying tasks with filters and pagination
 * Corresponds to GetTasksQueryDto in the backend
 */
export interface GetTasksQueryDto {
  /** Lọc theo ID người làm vườn */
  gardenerId?: number;
  
  /** Lọc theo ID khu vườn */
  gardenId?: number;
  
  /** Lọc theo trạng thái công việc */
  status?: TaskStatus;
  
  /** Lọc công việc đến hạn từ ngày (ISO 8601 string) */
  dueDateFrom?: string;
  
  /** Lọc công việc đến hạn đến ngày (ISO 8601 string) */
  dueDateTo?: string;
  
  /** Số trang hiện tại (mặc định là 1) */
  page?: number;
  
  /** Số lượng mục trên mỗi trang (mặc định là 10, tối đa 100) */
  limit?: number;
}

/**
 * Represents a Task object for responses.
 * Corresponds to TaskDto in the backend.
 */
export interface TaskDto {
  /** ID của công việc */
  id: number;

  /** ID của gardener */
  gardenerId: number;

  /** ID của garden */
  gardenId: number;

  /** Tên loại cây */
  plantTypeName?: string;

  /** Tên giai đoạn cây */
  plantStageName?: string;

  /** Loại công việc */
  type: string;

  /** Mô tả công việc */
  description: string;

  /** Ngày đến hạn (ISO 8601 string) */
  dueDate: string;

  /** Trạng thái công việc */
  status: TaskStatus;

  /** Thời gian tạo (ISO 8601 string) */
  createdAt: string;

  /** Thời gian cập nhật (ISO 8601 string) */
  updatedAt: string;

  /** Thời gian hoàn thành nếu đã hoàn thành (ISO 8601 string) */
  completedAt?: string;
}

/**
 * Interface for pagination metadata in responses
 * Corresponds to PaginationMeta in the backend
 */
export interface PaginationMeta {
  /** Tổng số mục tìm thấy */
  totalItems: number;
  
  /** Số lượng mục trên trang hiện tại */
  itemsPerPage: number;
  
  /** Số trang hiện tại */
  currentPage: number;
  
  /** Tổng số trang */
  totalPages: number;
}

/**
 * Interface for paginated task results
 * Corresponds to PaginatedTaskResult in the backend
 */
export interface PaginatedTaskResult {
  /** Danh sách công việc cho trang hiện tại */
  items: TaskDto[]; // Changed from Task[] to TaskDto[]
  
  /** Thông tin phân trang */
  meta: PaginationMeta;
}

// --- Garden Activity DTOs ---

/**
 * DTO for Garden Activity details.
 * This is the structure returned for individual activities and in lists.
 */
export interface GardenActivityDto extends GardenActivity {
  // Inherits all fields from GardenActivity
  // No additional fields specified in the doc for GardenActivityDto beyond GardenActivity
}

/**
 * DTO for paginated garden activity results.
 */
export interface PaginatedGardenActivitiesResultDto {
  items: GardenActivityDto[];
  meta: PaginationMeta;
}

/**
 * DTO for creating a new activity.
 * Based on the API documentation.
 */
export interface CreateActivityDto {
  gardenId: number;
  name: string;
  activityType: ActivityType;
  timestamp: string; // ISO 8601
  plantName?: string;
  plantGrowStage?: string;
  humidity?: number;
  temperature?: number;
  lightIntensity?: number;
  waterLevel?: number;
  rainfall?: number;
  soilMoisture?: number;
  soilPH?: number;
  details?: string;
  reason?: string;
  notes?: string;
  // gardenerId is not part of CreateActivityDto as per docs, it's assigned based on authenticated user
}

// --- Garden Activity Analytics DTOs ---

interface ExecutionDetailsDto {
  executionTime?: string; // Duration or specific time
  method?: string;
  toolsUsed?: string[];
  workload?: string; // e.g., 'High', 'Medium', 'Low'
  immediateResults?: string;
  conditionsDuringExecution?: string; // Weather, soil, etc.
}

interface UserPerformanceDto {
  skillLevel?: string;
  efficiency?: string;
  workHabits?: string[];
  motivationLevel?: string;
}

interface ActivityPatternsDto {
  frequency?: string; // e.g., 'Daily', 'Weekly'
  timeOfDayPatterns?: string[]; // e.g., 'Morning', 'Afternoon'
  sequentialPatterns?: string[]; // Activities often done together
}

interface EffectivenessAnalysisDto {
  immediateEffectiveness?: string;
  longTermImpact?: string;
  userRating?: number; // If users can rate effectiveness
  observedOutcomes?: string[];
}

interface LearningAnalysisDto {
  experienceGained?: string;
  skillsImproved?: string[];
  mistakesMadeAndLessonsLearned?: string[];
  improvementRecommendations?: string[];
}

interface ComparisonAnalysisDto {
  selfComparison?: string; // e.g., 'Improved over last month'
  communityBenchmark?: string; // How it compares to others
  industryStandards?: string;
}

interface PredictionsAndRecommendationsDto {
  nextSuggestedActivities?: string[];
  improvementTips?: string[];
  potentialWarnings?: string[];
  goalSuggestions?: string[];
}

// TODO: Define these if not already available or if structure is different for analytics
interface GardenerDto { /* Placeholder for Gardener info */ id: number; name: string; }
interface GardenDto { /* Placeholder for Garden info */ id: number; name: string; }
interface WeatherObservationDto { /* Placeholder for WeatherObservation info */ id: number; temp: number; }
// ActivityEvaluation and PhotoEvaluation are already imported

export interface GardenActivityAnalyticsDto {
  // Basic activity info (can be spread from GardenActivityDto or defined explicitly)
  id: number;
  gardenId: number;
  gardenerId: number;
  name: string;
  activityType: ActivityType;
  timestamp: string;
  plantName?: string;
  plantGrowStage?: string;
  humidity?: number;
  temperature?: number;
  lightIntensity?: number;
  waterLevel?: number;
  rainfall?: number;
  soilMoisture?: number;
  soilPH?: number;
  details?: string;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  executionDetails?: ExecutionDetailsDto;
  userPerformance?: UserPerformanceDto;
  activityPatterns?: ActivityPatternsDto;
  effectivenessAnalysis?: EffectivenessAnalysisDto;
  learningAnalysis?: LearningAnalysisDto;
  comparisonAnalysis?: ComparisonAnalysisDto;
  predictionsAndRecommendations?: PredictionsAndRecommendationsDto;

  // Related entities
  gardener?: GardenerDto; // Assuming a DTO for gardener details
  garden?: GardenDto;     // Assuming a DTO for garden details
  weatherObservation?: WeatherObservationDto; // Assuming a DTO for weather
  evaluations?: ActivityEvaluation[]; // Reusing existing ActivityEvaluation
  photoEvaluations?: PhotoEvaluation[]; // Reusing existing PhotoEvaluation
  // wateringSchedules: any[]; // TODO: Define WateringScheduleDto if needed
}

// --- Activity Statistics DTOs ---

export interface ActivityOverviewStatsDto {
  totalActivities: number;
  averagePerDay: number;
  activeDays: number;
  totalDays: number;
  activityRate: number; // Percentage
  mostCommonActivity: ActivityType;
  mostCommonActivityName: string;
  mostActiveGarden?: { gardenId: number; gardenName: string; activityCount: number };
}

export interface ActivityTypeStatsDto {
  type: ActivityType;
  displayName: string;
  count: number;
  percentage: number;
}

export interface DailyActivityStatsDto {
  date: string; // ISO 8601 Date
  activityCount: number;
  activityBreakdown: ActivityTypeStatsDto[];
}

export interface MonthlyActivityStatsDto {
  month: string; // e.g., "YYYY-MM"
  activityCount: number;
  activeDays: number;
  averagePerDay: number;
}

export interface GardenActivityStatsDto {
  gardenId: number;
  gardenName: string;
  gardenType?: string; // Assuming garden type might be available
  totalActivities: number;
  lastActivity?: string; // ISO 8601 DateTime
  activityBreakdown: ActivityTypeStatsDto[];
}

export interface ActivityTrendDto {
  period: 'day' | 'week' | 'month';
  label: string; // e.g., "2023-10-26", "Week 42", "October"
  count: number;
  changePercent?: number; // Optional, as first period won't have change
}

export interface ActivityStatsResponseDto {
  overview: ActivityOverviewStatsDto;
  byActivityType: ActivityTypeStatsDto[];
  dailyStats: DailyActivityStatsDto[];
  monthlyStats: MonthlyActivityStatsDto[];
  byGarden?: GardenActivityStatsDto[]; // Optional based on query
  trends: ActivityTrendDto[];
  generatedAt: string; // ISO 8601 DateTime
  period: {
    startDate: string; // ISO 8601 Date
    endDate: string;   // ISO 8601 Date
  };
}
