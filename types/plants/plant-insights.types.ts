export interface PlantLocation {
  street: string;
  ward: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
}

export interface GardenInfoStats {
  id: number;
  name: string;
  plantName: string;
  plantGrowStage: string;
  plantStartDate: string;
  plantDuration: number;
  daysFromPlanting: number;
  remainingDays: number;
  progressPercentage: number;
  type: string; // e.g., OUTDOOR
  status: string; // e.g., ACTIVE
  location: PlantLocation;
}

export interface SensorConditionStats {
  id: string;
  name: string;
  currentValue: number | string;
  unit: string;
  status: string; // e.g., "Optimal", "Needs Attention"
  optimalRange?: string; // e.g., "5000-12000 lux"
}

export interface WeatherConditionStats {
  current: {
    temp: number;
    humidity: number;
    pressure: number;
    weatherMain: string;
    weatherDesc: string;
    windSpeed: number;
    observedAt: string;
  };
}

export interface CurrentConditionsStats {
  sensors: SensorConditionStats[];
  weather: {
    current: {
      temp: number;
      humidity: number;
      weatherDesc: string;
      // icon: string; // Weather icon code
    };
    // forecast: any[]; // Optional: if you want to include forecast
  };
}

export interface OptimalRange {
  min: number;
  max: number;
}

export interface ConditionDetail {
  current: number | string; // Can be number (e.g., temp) or string (e.g., "Cloudy")
  optimal?: string; // e.g., "20-25°C" or "Sunny"
  status: string; // e.g., "Optimal", "Too High", "Poor"
  unit?: string; // e.g., "°C", "%"
}

export interface ConditionDetailStats {
  current: number | string;
  status: string;
  unit?: string;
  score: number; // 0-100
  optimal: {
    // More specific for stats
    min: number;
    max: number;
  };
}

export interface PlantHealthConditions {
  temperature: ConditionDetailStats;
  soilMoisture: ConditionDetailStats;
  humidity: ConditionDetailStats;
  soilPH: ConditionDetailStats;
  lightIntensity: ConditionDetailStats;
}

export interface PlantHealthStats {
  overallScore: number;
  healthStatus: string;
  conditions: {
    temperature: ConditionDetailStats;
    humidity: ConditionDetailStats;
    soil_moisture: ConditionDetailStats;
    light_exposure: ConditionDetailStats;
    // [key: string]: ConditionDetailStats; // Allow other dynamic conditions
  };
}

export interface DataRange {
  from: string;
  to: string;
  totalDays: number;
}

export interface IndividualSensorStats {
  average: number;
  min: number;
  max: number;
  trend: string;
  optimalDaysCount: number;
  optimalPercentage: number;
}

export interface SensorDataStats {
  temperature: IndividualSensorStats;
  soilMoisture: IndividualSensorStats;
  humidity: IndividualSensorStats;
  soilPH: IndividualSensorStats;
  lightIntensity: IndividualSensorStats;
}

export interface ActivityByType {
  [key: string]: number;
}

export interface RecentActivityStat {
  // Define if structure is known, else use 'any' or a more generic type
  id: string; // Example, adjust if different
  description: string;
  completedAt: string;
}

export interface ActivityStats {
  totalActivities: number;
  activitiesByType: ActivityByType;
  recentActivities: RecentActivityStat[];
  successRate: number;
}

export interface AverageWeatherConditions {
  temperature: number;
  humidity: number;
  rainfall: number;
}

export interface WeatherSummaryStats {
  favorableDays: number;
  favorablePercentage: number;
  averageConditions: AverageWeatherConditions;
}

export interface StatisticsOverall {
  dataRange: DataRange;
  sensorData: SensorDataStats;
  activities: ActivityStats;
  weather: WeatherSummaryStats;
}

export interface TaskStats {
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  upcomingTasks: any[]; // Define if structure is known
  skipped: number;
}

export interface AlertSummaryStats {
  active: number;
  resolved: number;
  ignored: number;
  currentAlerts: any[]; // Define if structure is known
  criticalCount: number;
  highCount: number;
  mediumCount: number;
}

export interface RiskFactor {
  type: string;
  impact: string;
  description: string;
  recommendation: string;
}

export interface PredictionStats {
  nextWateringSchedule: string;
  estimatedHarvestDate: string;
  expectedYield: string;
  riskFactors: RiskFactor[];
}

export interface PlantStatisticsData {
  gardenInfo: GardenInfoStats;
  currentConditions: CurrentConditionsStats;
  plantHealth: PlantHealthStats;
  statistics: StatisticsOverall;
  tasks: TaskStats;
  alerts: AlertSummaryStats;
  predictions: PredictionStats;
  lastUpdated: string;
}

export interface PlantStatisticsResponse {
  statusCode: number;
  data: PlantStatisticsData;
  message: string;
  timestamp: string;
}

// Types for Plant Advice API
export interface AdviceGardenInfo {
  id: number;
  name: string;
  plantName: string;
  plantGrowStage: string;
  daysFromPlanting: number;
}

export interface OverallAssessment {
  healthScore: number;
  status: string; // e.g., CRITICAL
  summary: string;
}

export interface ImmediateAction {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  timeFrame: string;
  reason: string;
}

export interface WateringAdvice {
  nextSchedule: string;
  frequency: string;
  amount: string;
  bestTime: string;
  tips: string[];
}

export interface FertilizingAdvice {
  nextSchedule: string;
  type: string;
  amount?: string;
  frequency: string;
  tips: string[];
}

export interface PestControlAdvice {
  riskLevel: string;
  detectedPests?: string[];
  prevention: string[];
  treatment?: string[];
}

export interface CareRecommendations {
  watering: WateringAdvice;
  fertilizing: FertilizingAdvice;
  pest_control: PestControlAdvice;
}

export interface GrowthStageAdvice {
  currentStage: string;
  stageDescription: string;
  keyFocus: string[];
  expectedDuration: string;
  nextStage: string;
  preparation: string[];
}

export interface EnvironmentalAdviceItem {
  status: string;
  current: string;
  optimalRange?: string;
  optimal?: string;
  advice: string;
}

export interface EnvironmentalAdvice {
  temperature: EnvironmentalAdviceItem;
  humidity: EnvironmentalAdviceItem;
  light: EnvironmentalAdviceItem;
  soilPH: EnvironmentalAdviceItem;
}

export interface TodayForecast {
  condition: string;
  temperature: string;
  humidity: string;
  rainfall: string;
  advice: string;
}

export interface WeeklyForecastItem {
  date: string;
  condition: string;
  temperature: string;
  rainChance: string;
  advice: string;
}

export interface WeeklyTrend {
  summary: string;
  recommendations: string[];
}

export interface WeatherConsiderations {
  todayForecast: TodayForecast;
  weekAhead: WeeklyForecastItem[];
  weeklyTrend: WeeklyTrend;
}

export interface SeasonalTip {
  season: string;
  generalAdvice: string[];
  monthlyFocus: string;
}

export interface CommonIssue {
  issue: string;
  cause: string;
  solution: string;
  prevention: string;
}

export interface LearningResource {
  title: string;
  type: string; // e.g., VIDEO, GUIDE
  duration: string;
  url: string;
}

export interface GamificationTask {
  task: string;
  xpReward: number;
  completed: boolean;
  description: string;
}

export interface UserLevel {
  level: number;
  title: string;
  icon: string;
  description?: string; // Optional as nextLevel doesn't have it
}

export interface GamificationData {
  todayTasks: GamificationTask[];
  currentXP: number;
  currentLevel: UserLevel;
  nextLevel: UserLevel;
  motivationalMessage: string;
}

export interface PlantAdviceData {
  plantId: string;
  plantName: string;
  generatedAt: string;
  overallAssessment: OverallAssessment;
  immediateActions: ImmediateAction[];
  careRecommendations: CareRecommendations;
  environmentalAdvice: EnvironmentalAdvice;
}

export interface PlantAdviceResponse {
  statusCode: number;
  data: PlantAdviceData;
  message: string;
  timestamp: string;
}
