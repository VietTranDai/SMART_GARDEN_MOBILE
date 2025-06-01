/**
 * Photo Evaluation Types
 * 
 * Types for photo evaluation functionality
 */

// Base interfaces
export interface PhotoEvaluation {
  id: number;
  taskId: number;
  gardenId: number;
  gardenerId: number;
  gardenActivityId?: number;
  plantName?: string;
  plantGrowStage?: string;
  photoUrl: string;
  aiFeedback?: string;
  confidence?: number;
  notes?: string;
  evaluatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoEvaluationWithRelations extends PhotoEvaluation {
  garden: {
    id: number;
    name: string;
    description?: string;
  };
  gardener: {
    user: {
      id: number;
      username: string;
      fullName: string;
      email: string;
    };
  };
  gardenActivity?: {
    id: number;
    activityType: string;
    description: string;
  };
}

// DTOs
export interface CreatePhotoEvaluationDto {
  taskId: number;
  gardenId: number;
  gardenActivityId?: number;
  plantName?: string;
  plantGrowStage?: string;
  notes?: string;
}

export interface UpdatePhotoEvaluationDto {
  aiFeedback?: string;
  confidence?: number;
  notes?: string;
}

export interface PhotoEvaluationFormData extends CreatePhotoEvaluationDto {
  image: File;
}

// API Response types
export interface PhotoEvaluationListResponse {
  data: PhotoEvaluationWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface PhotoEvaluationStatsResponse {
  total: number;
  evaluated: number;
  healthy: number;
  unhealthy: number;
  avgConfidence: number;
}

// AI Evaluation types
export interface AIEvaluationResult {
  prediction: string;
  confidence: number;
  disease_name: string;
  plant_type: string;
  description: string;
  treatment_suggestion: string;
  severity_level: number;
  is_healthy: boolean;
}

// Plant growth stages enum
export enum PlantGrowthStage {
  SEEDLING = "Seedling",
  VEGETATIVE = "Vegetative", 
  FLOWERING = "Flowering",
  FRUITING = "Fruiting",
  BERRIES = "Berries",
  MATURE = "Mature",
  HARVESTING = "Harvesting"
}

// Helper types for display
export interface PhotoEvaluationDisplayDto {
  id: number;
  gardenName: string;
  plantName?: string;
  plantGrowStage?: string;
  photoUrl: string;
  aiFeedback?: string;
  confidence?: number;
  isHealthy?: boolean;
  severityLevel?: number;
  notes?: string;
  evaluatedAt?: Date;
  createdAt: Date;
  gardenerName: string;
  activityType?: string;
}

// Filter and search types
export interface PhotoEvaluationFilters {
  gardenId?: number;
  plantName?: string;
  plantGrowStage?: PlantGrowthStage;
  isEvaluated?: boolean;
  isHealthy?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface PhotoEvaluationSearchParams {
  query?: string;
  gardenId?: number;
  filters?: PhotoEvaluationFilters;
}

// Upload progress types
export interface PhotoUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface PhotoUploadResult {
  success: boolean;
  data?: PhotoEvaluationWithRelations;
  error?: string;
  progress?: PhotoUploadProgress;
}
