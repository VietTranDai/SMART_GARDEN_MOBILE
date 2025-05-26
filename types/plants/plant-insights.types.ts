export interface PlantLocation {
  street: string;
  ward: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
}

export interface GardenInfoStats {
  plantName: string;
  plantGrowStage: string;
  plantStartDate: string;
  plantDuration: number;
  daysFromPlanting: number;
  remainingDays: number;
  progressPercentage: number;
}

export interface SensorConditionStats {
  id: string;
  name: string;
  currentValue: number | string;
  unit: string;
  status: string;
  optimalRange?: string;
}

export interface CurrentConditionsStats {
  sensors: SensorConditionStats[];
  weather: {
    current: {
      temp: number;
      humidity: number;
      weatherDesc: string;
    };
  };
}

export interface OptimalRange {
  min: number;
  max: number;
}

export interface ConditionDetail {
  current: number | string;
  optimal?: string;
  status: string;
  unit?: string;
}

export interface ConditionDetailStats {
  current: number | string;
  status: string;
  unit?: string;
  score: number;
  optimal: {
    min: number;
    max: number;
  };
}

export interface PlantHealthStats {
  overallScore: number;
  healthStatus: string;
  conditions: {
    temperature: ConditionDetailStats;
    humidity: ConditionDetailStats;
    soil_moisture: ConditionDetailStats;
    light_exposure: ConditionDetailStats;
  };
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
  predictions: PredictionStats;
  lastUpdated?: string;
}

export interface OverallAssessment {
  healthScore: number;
  status: string;
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
  tips: string[];
}

export interface FertilizingAdvice {
  nextSchedule: string;
  type: string;
  amount?: string;
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
  soilPH?: EnvironmentalAdviceItem;
}

export interface PlantAdviceData {
  overallAssessment: OverallAssessment;
  immediateActions: ImmediateAction[];
  careRecommendations: CareRecommendations;
  environmentalAdvice: EnvironmentalAdvice;
}
