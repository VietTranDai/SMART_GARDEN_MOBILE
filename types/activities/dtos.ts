import { TaskStatus } from './task.types';
import { ActivityType, GardenActivity, ActivityEvaluation, PhotoEvaluation } from './activity.types';
import { Gardener } from '../users/user.types';
import { Garden } from '../gardens/garden.types';
import { WeatherObservation } from '../weather/weather.types';

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
  items: TaskDto[];
  
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
}

// --- Comprehensive Activity Analytics DTOs ---

/**
 * Execution Details DTO - Updated with comprehensive structure
 */
export interface ExecutionDetailsDto {
  actualDuration?: number;
  durationEfficiency?: number;
  method?: string;
  toolsUsed?: string[];
  materialsUsed?: string[];
  workload?: {
    area?: number;
    quantity?: number;
    unit?: string;
    intensity?: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  immediateResults?: {
    completed?: boolean;
    completionRate?: number;
    qualityRating?: number;
    satisfactionLevel?: number;
    issuesEncountered?: string[];
    solutionsApplied?: string[];
  };
  executionConditions?: {
    weatherSuitability?: 'GOOD' | 'FAIR' | 'POOR';
    userEnergyLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
    availableTime?: number;
    urgencyLevel?: 'PLANNED' | 'URGENT' | 'EMERGENCY';
    difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD';
  };
}

/**
 * User Performance DTO - Updated with detailed performance metrics
 */
export interface UserPerformanceDto {
  skillAssessment?: {
    currentSkillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    activityExpertise?: number;
    improvementRate?: number;
    learningProgress?: {
      mistakesMade?: string[];
      lessonsLearned?: string[];
      skillsImproved?: string[];
      nextSkillToLearn?: string;
    };
  };
  workEfficiency?: {
    speedRating?: number;
    accuracyRating?: number;
    consistencyRating?: number;
    innovationRating?: number;
    speedImprovement?: number;
    accuracyImprovement?: number;
    overallImprovement?: number;
  };
  workingHabits?: {
    preferredTimeOfDay?: string;
    preferredWeather?: string[];
    workingStyle?: 'SYSTEMATIC' | 'FLEXIBLE' | 'ADAPTIVE';
    planningTendency?: 'PLANNED' | 'SPONTANEOUS' | 'REACTIVE';
    commonMistakes?: string[];
    strengthAreas?: string[];
    improvementAreas?: string[];
    personalBestPractices?: string[];
  };
  motivation?: {
    motivationLevel?: number;
    enjoymentLevel?: number;
    confidenceLevel?: number;
    stressLevel?: number;
    motivationFactors?: string[];
    demotivationFactors?: string[];
    rewardPreferences?: string[];
  };
}

/**
 * Activity Patterns DTO - Updated with comprehensive temporal analysis
 */
export interface ActivityPatternsDto {
  frequency?: {
    dailyFrequency?: number;
    weeklyFrequency?: number;
    monthlyFrequency?: number;
    yearlyFrequency?: number;
    daysSinceLastSameActivity?: number;
    averageIntervalDays?: number;
    shortestInterval?: number;
    longestInterval?: number;
    frequencyRating?: 'OPTIMAL' | 'TOO_FREQUENT' | 'TOO_RARE';
    recommendedFrequency?: number;
    nextRecommendedDate?: string;
  };
  temporalPatterns?: {
    dailyPattern?: {
      preferredHours?: number[];
      peakPerformanceHours?: number[];
      avoidedHours?: number[];
      timeDistribution?: { [key: string]: number };
    };
    weeklyPattern?: {
      preferredDays?: number[];
      peakPerformanceDays?: number[];
      avoidedDays?: number[];
      weekendVsWeekday?: 'WEEKDAY_PREFER' | 'WEEKEND_PREFER' | 'NO_PREFERENCE';
      dayDistribution?: { [key: string]: number };
    };
    seasonalPattern?: {
      springFrequency?: number;
      summerFrequency?: number;
      autumnFrequency?: number;
      winterFrequency?: number;
      mostActiveSeasons?: string[];
      seasonalEffectiveness?: { [key: string]: number };
    };
    weatherPattern?: {
      preferredWeatherConditions?: string[];
      avoidedWeatherConditions?: string[];
      weatherImpactOnPerformance?: { [key: string]: number };
      rainImpact?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
      temperatureOptimalRange?: { min: number; max: number };
    };
  };
  sequencePatterns?: {
    commonPreceedingActivities?: string[];
    commonFollowingActivities?: string[];
    activityChains?: {
      sequence?: string[];
      frequency?: number;
      effectiveness?: number;
    }[];
    effectiveCombinations?: {
      activities?: string[];
      synergy?: number;
      timeGap?: number;
      successRate?: number;
    }[];
  };
}

/**
 * Effectiveness Analysis DTO - Updated with comprehensive outcome tracking
 */
export interface EffectivenessAnalysisDto {
  immediateEffectiveness?: {
    taskCompletionRate?: number;
    qualityScore?: number;
    timeEfficiency?: number;
    resourceEfficiency?: number;
    overallEffectiveness?: 'EFFECTIVE' | 'OPTIMAL' | 'SUBOPTIMAL' | 'INEFFECTIVE';
  };
  longTermEffectiveness?: {
    plantHealthImpact?: number;
    growthImpact?: number;
    yieldImpact?: number;
    sustainabilityImpact?: number;
    cumulativeEffect?: number;
  };
  evaluationSummary?: {
    totalEvaluations?: number;
    userEvaluations?: number;
    systemEvaluations?: number;
    communityEvaluations?: number;
    expertEvaluations?: number;
    averageUserRating?: number;
    averageSystemRating?: number;
    averageCommunityRating?: number;
    averageExpertRating?: number;
    weightedAverageRating?: number;
    ratingConsensus?: 'HIGH' | 'MEDIUM' | 'LOW';
    controversialAspects?: string[];
  };
  outcomes?: {
    plannedOutcomes?: string[];
    actualOutcomes?: string[];
    unexpectedOutcomes?: string[];
    missedOpportunities?: string[];
    successRate?: number;
    failureReasons?: string[];
    partialSuccessAreas?: string[];
    economicValue?: number;
    timeValueSaved?: number;
    learningValue?: string[];
    satisfactionValue?: number;
  };
}

/**
 * Learning Analysis DTO - Updated with comprehensive experience tracking
 */
export interface LearningAnalysisDto {
  experienceGained?: {
    xpEarned?: number;
    xpSourceBreakdown?: { [key: string]: number };
    bonusXpReasons?: string[];
    xpMultiplier?: number;
    levelBefore?: number;
    levelAfter?: number;
    isLevelUp?: boolean;
    progressInCurrentLevel?: number;
    pointsToNextLevel?: number;
    estimatedTimeToNextLevel?: number;
  };
  experiencePoints?: {
    totalExperienceGained?: number;
    baseExperience?: number;
    bonusExperience?: number;
    experienceBreakdown?: {
      taskCompletion?: number;
      qualityBonus?: number;
      innovationBonus?: number;
      consistencyBonus?: number;
      learningBonus?: number;
    };
    currentLevelProgress?: number;
    pointsToNextLevel?: number;
  };
  skillDevelopment?: {
    skillsImproved?: {
      skillName?: string;
      previousLevel?: number;
      newLevel?: number;
      improvement?: number;
      evidenceOfImprovement?: string[];
    }[];
    newSkillsAcquired?: string[];
    primarySkillsImproved?: string[];
    secondarySkillsImproved?: string[];
    newSkillsLearned?: string[];
    skillProficiencyGains?: { [key: string]: number };
    overallSkillImprovement?: number;
    expertiseLevelChange?: number;
    skillGapsIdentified?: string[];
    recommendedLearningPath?: string[];
    difficultyAreasToWork?: string[];
    preferredLearningMethods?: string[];
    learningEffectiveness?: number;
  };
  mistakesAndLessons?: {
    mistakesMade?: string[];
    lessonsLearned?: {
      lesson?: string;
      source?: 'EXPERIENCE' | 'MENTORSHIP' | 'COMMUNITY' | 'RESEARCH';
      applicability?: string[];
      importance?: number;
    }[];
    bestPracticesDiscovered?: string[];
    innovativeApproaches?: string[];
  };
  improvementRecommendations?: {
    immediateTips?: string[];
    immediateImprovements?: string[];
    shortTermGoals?: string[];
    longTermGoals?: string[];
    trainingNeeds?: string[];
    resourceNeeds?: string[];
    mentorshipNeeds?: string[];
    prioritizedImprovements?: {
      improvement?: string;
      priority?: 'HIGH' | 'MEDIUM' | 'LOW';
      effort?: 'HIGH' | 'MEDIUM' | 'LOW';
      impact?: 'HIGH' | 'MEDIUM' | 'LOW';
      timeframe?: string;
    }[];
    skillGaps?: string[];
    learningResources?: any[];
    practiceSchedule?: any;
  };
}

/**
 * Comparison Analysis DTO - Updated with comprehensive benchmarking
 */
export interface ComparisonAnalysisDto {
  selfComparison?: {
    vsLastTime?: {
      performanceChange?: number;
      timeChange?: number;
      qualityChange?: number;
      efficiencyChange?: number;
      overallTrend?: 'IMPROVING' | 'STABLE' | 'DECLINING';
    };
    vsPersonalAverage?: {
      performanceVsAverage?: number;
      aboveAverageAspects?: string[];
      belowAverageAspects?: string[];
      personalBest?: boolean;
      personalRecord?: string;
    };
    progressOverTime?: {
      last7Days?: 'IMPROVING' | 'STABLE' | 'DECLINING';
      last30Days?: 'IMPROVING' | 'STABLE' | 'DECLINING';
      last90Days?: 'IMPROVING' | 'STABLE' | 'DECLINING';
      last365Days?: 'IMPROVING' | 'STABLE' | 'DECLINING';
      overallCareerTrend?: 'IMPROVING' | 'STABLE' | 'DECLINING';
    };
    personalAverage?: {
      lastMonth?: number;
      last3Months?: number;
      last6Months?: number;
      lastYear?: number;
    };
    personalTrend?: 'IMPROVING' | 'STABLE' | 'DECLINING';
    improvementAspects?: string[];
    comparisonPeriods?: any[];
  };
  communityComparison?: {
    ranking?: {
      globalRank?: number;
      totalUsers?: number;
      percentile?: number;
      categoryRank?: number;
      levelRank?: number;
      regionRank?: number;
    };
    communityBenchmarks?: {
      averageRating?: number;
      averageTime?: number;
      averageFrequency?: number;
      averageEffectiveness?: number;
      top10Percent?: {
        averageRating?: number;
        averageTime?: number;
        commonTechniques?: string[];
        successFactors?: string[];
      };
      performanceGap?: {
        ratingGap?: number;
        timeGap?: number;
        efficiencyGap?: number;
        skillGap?: string[];
      };
    };
    learningOpportunities?: {
      topPerformers?: {
        username?: string;
        performance?: number;
        specialties?: string[];
        publicTips?: string[];
      }[];
      similarUsers?: {
        username?: string;
        similarity?: number;
        strengths?: string[];
        collaborationOpportunities?: string[];
      }[];
      mentorshipOpportunities?: {
        potentialMentors?: string[];
        expertiseAreas?: string[];
        availabilityStatus?: string;
      };
    };
    communityAverage?: number;
    performanceVsCommunity?: string;
    rankingHistory?: any[];
    similarUserComparison?: any[];
  };
  industryBenchmarks?: {
    professionalStandards?: {
      timeStandard?: number;
      qualityStandard?: number;
      frequencyStandard?: number;
      vsStandardPerformance?: number;
    };
    bestPractices?: {
      industryBestPractices?: string[];
      adoptedPractices?: string[];
      gapAnalysis?: string[];
      implementationPlan?: string[];
    };
    industryAverage?: number;
    expertBenchmark?: number;
    professionalStandard?: number;
    certificationLevel?: string;
    complianceRating?: number;
    gapAnalysis?: string[];
  };
}

/**
 * Predictions and Recommendations DTO - Updated with comprehensive forecasting
 */
export interface PredictionsAndRecommendationsDto {
  nextActivityPredictions?: {
    predictedNextActivities?: {
      activityType?: string;
      probability?: number;
      recommendedDate?: string;
      reasoning?: string[];
      confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    }[];
    optimalTimingPrediction?: {
      nextOptimalDate?: string;
      optimalTimeOfDay?: number;
      optimalWeatherConditions?: string[];
      confidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
      factors?: string[];
    };
    outcomesPrediction?: {
      expectedSuccessRate?: number;
      predictedQuality?: number;
      predictedEfficiency?: number;
      riskFactors?: string[];
      successFactors?: string[];
    };
  };
  improvementRecommendations?: {
    immediateActions?: {
      action?: string;
      priority?: 'HIGH' | 'MEDIUM' | 'LOW';
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      expectedImpact?: 'HIGH' | 'MEDIUM' | 'LOW';
      timeToImplement?: number;
    }[];
    strategicRecommendations?: {
      goal?: string;
      timeframe?: string;
      steps?: string[];
      resources?: string[];
      successMetrics?: string[];
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    }[];
    learningRecommendations?: {
      skillToLearn?: string;
      learningMethod?: string[];
      timeCommitment?: string;
      expectedBenefit?: string;
      priority?: number;
    }[];
  };
  warningsAndRisks?: {
    currentWarnings?: string[];
    potentialRisks?: {
      risk?: string;
      probability?: number;
      impact?: 'HIGH' | 'MEDIUM' | 'LOW';
      prevention?: string[];
      mitigation?: string[];
    }[];
    missedOpportunities?: string[];
  };
  suggestedGoals?: {
    shortTermGoals?: {
      goal?: string;
      deadline?: string;
      measurableOutcome?: string;
      actionPlan?: string[];
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      motivation?: string;
    }[];
    longTermGoals?: {
      goal?: string;
      timeframe?: string;
      milestones?: string[];
      resourceRequirements?: string[];
      successCriteria?: string[];
      strategicImportance?: number;
    }[];
    personalChallenges?: {
      challenge?: string;
      difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
      reward?: string;
      timeLimit?: string;
      rules?: string[];
    }[];
  };
  nextSuggestedActivities?: {
    primary?: any[];
    secondary?: any[];
    urgent?: any[];
    seasonal?: any[];
    maintenanceActivities?: any[];
    improvementActivities?: any[];
  };
  goals?: {
    personal?: any[];
    garden?: any[];
    skill?: any[];
    productivity?: any[];
    maintenance?: any[];
  };
  challenges?: {
    current?: any[];
    upcoming?: any[];
    seasonal?: any[];
    skillBased?: any[];
    timeManagement?: any[];
  };
  riskWarnings?: {
    immediate?: any[];
    shortTerm?: any[];
    seasonal?: any[];
    skillRelated?: any[];
    plantHealth?: any[];
    weather?: any[];
  };
  improvementTips?: string[];
  potentialWarnings?: string[];
  goalSuggestions?: string[];
}

/**
 * Comprehensive Garden Activity Analytics DTO - Main analytics response
 */
export interface GardenActivityAnalyticsDto {
  // Basic activity info
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

  // Analytics sections
  executionDetails?: ExecutionDetailsDto;
  userPerformance?: UserPerformanceDto;
  activityPatterns?: ActivityPatternsDto;
  effectivenessAnalysis?: EffectivenessAnalysisDto;
  learningAnalysis?: LearningAnalysisDto;
  comparisonAnalysis?: ComparisonAnalysisDto;
  predictionsAndRecommendations?: PredictionsAndRecommendationsDto;

  // Related entities
  gardener?: {
    userId: number;
    experiencePoints: number;
    experienceLevelId: number;
    user: {
      firstName: string;
      lastName: string;
      username: string;
      email: string;
    };
    experienceLevel: {
      level: number;
      title: string;
      description: string;
      icon: string;
    };
  };
  garden?: {
    name: string;
    type: 'INDOOR' | 'OUTDOOR';
    status: 'ACTIVE' | 'INACTIVE';
    plantName?: string;
    plantGrowStage?: string;
    city?: string;
    district?: string;
    ward?: string;
  };
  evaluations?: ActivityEvaluation[];
  photoEvaluations?: PhotoEvaluation[];
  wateringSchedules?: any[];
}

/**
 * API Response wrapper for activity analytics
 */
export interface GardenActivityAnalyticsResponseDto {
  statusCode: number;
  data: GardenActivityAnalyticsDto;
  message: string;
  timestamp: string;
}

// --- Activity Statistics DTOs ---

export interface ActivityOverviewStatsDto {
  totalActivities: number;
  averagePerDay: number;
  activeDays: number;
  totalDays: number;
  activityRate: number;
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
  date: string;
  activityCount: number;
  activityBreakdown: ActivityTypeStatsDto[];
}

export interface MonthlyActivityStatsDto {
  month: string;
  activityCount: number;
  activeDays: number;
  averagePerDay: number;
}

export interface GardenActivityStatsDto {
  gardenId: number;
  gardenName: string;
  gardenType?: string;
  totalActivities: number;
  lastActivity?: string;
  activityBreakdown: ActivityTypeStatsDto[];
}

export interface ActivityTrendDto {
  period: 'day' | 'week' | 'month';
  label: string;
  count: number;
  changePercent?: number;
}

export interface ActivityStatsResponseDto {
  overview: ActivityOverviewStatsDto;
  byActivityType: ActivityTypeStatsDto[];
  dailyStats: DailyActivityStatsDto[];
  monthlyStats: MonthlyActivityStatsDto[];
  byGarden?: GardenActivityStatsDto[];
  trends: ActivityTrendDto[];
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
}
