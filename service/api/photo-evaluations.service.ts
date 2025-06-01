import apiClient from "../apiClient";
import { PHOTO_EVALUATION_ENDPOINTS } from "../endpoints";
import {
  PhotoEvaluation,
  PhotoEvaluationWithRelations,
  CreatePhotoEvaluationDto,
  UpdatePhotoEvaluationDto,
  PhotoEvaluationFormData,
  PhotoEvaluationListResponse,
  PhotoEvaluationStatsResponse,
  PhotoEvaluationDisplayDto,
  PhotoEvaluationFilters,
  AIEvaluationResult,
  PlantGrowthStage,
  PhotoUploadResult,
  PhotoUploadProgress
} from "@/types/activities/photo-evaluations.type";

/**
 * Photo Evaluation Service
 *
 * Handles all photo evaluation-related API calls and utility functions
 */

class PhotoEvaluationService {
  /**
   * Get all photo evaluations for current user with pagination
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Paginated list of photo evaluations
   */
  async getPhotoEvaluations(
    page: number = 1, 
    limit: number = 10
  ): Promise<PhotoEvaluationListResponse> {
    try {
      const response = await apiClient.get(
        `${PHOTO_EVALUATION_ENDPOINTS.LIST}?page=${page}&limit=${limit}`
      );
      
      if (!response || !response.data) {
        console.warn("Unexpected API response format in getPhotoEvaluations");
        return { data: [], total: 0, page, limit };
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching photo evaluations:", error);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Get photo evaluations by garden ID
   * @param gardenId Garden ID
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @returns Paginated list of photo evaluations for the garden
   */
  async getPhotoEvaluationsByGarden(
    gardenId: number | string,
    page: number = 1, 
    limit: number = 10
  ): Promise<PhotoEvaluationListResponse> {
    try {
      const response = await apiClient.get(
        `${PHOTO_EVALUATION_ENDPOINTS.LIST_BY_GARDEN(gardenId)}?page=${page}&limit=${limit}`
      );
      
      if (!response || !response.data) {
        console.warn(`Unexpected API response format for garden ${gardenId} photo evaluations`);
        return { data: [], total: 0, page, limit };
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching photo evaluations for garden ${gardenId}:`, error);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Get photo evaluation by ID
   * @param id Photo evaluation ID
   * @returns Photo evaluation data
   */
  async getPhotoEvaluationById(id: number | string): Promise<PhotoEvaluationWithRelations | null> {
    try {
      const response = await apiClient.get(PHOTO_EVALUATION_ENDPOINTS.DETAIL(id));
      return response.data.data || response.data || null;
    } catch (error) {
      console.error(`Error fetching photo evaluation ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new photo evaluation with file upload
   * @param photoData Photo evaluation data with image file
   * @param onProgress Optional upload progress callback
   * @returns Created photo evaluation
   */
  async createPhotoEvaluation(
    photoData: PhotoEvaluationFormData,
    onProgress?: (progress: PhotoUploadProgress) => void
  ): Promise<PhotoUploadResult> {
    try {
      const formData = new FormData();
      
      // Add image file
      formData.append('image', photoData.image);
      
      // Add other fields
      formData.append('taskId', photoData.taskId.toString());
      formData.append('gardenId', photoData.gardenId.toString());
      
      if (photoData.gardenActivityId) {
        formData.append('gardenActivityId', photoData.gardenActivityId.toString());
      }
      if (photoData.plantName) {
        formData.append('plantName', photoData.plantName);
      }
      if (photoData.plantGrowStage) {
        formData.append('plantGrowStage', photoData.plantGrowStage);
      }
      if (photoData.notes) {
        formData.append('notes', photoData.notes);
      }

      const response = await apiClient.post(
        PHOTO_EVALUATION_ENDPOINTS.CREATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress: PhotoUploadProgress = {
                loaded: progressEvent.loaded,
                total: progressEvent.total,
                percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
              };
              onProgress(progress);
            }
          }
        }
      );

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error("Error creating photo evaluation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  /**
   * Update photo evaluation
   * @param id Photo evaluation ID
   * @param updateData Update data
   * @returns Updated photo evaluation
   */
  async updatePhotoEvaluation(
    id: number | string,
    updateData: UpdatePhotoEvaluationDto
  ): Promise<PhotoEvaluationWithRelations | null> {
    try {
      const response = await apiClient.put(
        PHOTO_EVALUATION_ENDPOINTS.UPDATE(id),
        updateData
      );
      return response.data.data || response.data || null;
    } catch (error) {
      console.error(`Error updating photo evaluation ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete photo evaluation
   * @param id Photo evaluation ID
   * @returns Success status
   */
  async deletePhotoEvaluation(id: number | string): Promise<boolean> {
    try {
      await apiClient.delete(PHOTO_EVALUATION_ENDPOINTS.DELETE(id));
      return true;
    } catch (error) {
      console.error(`Error deleting photo evaluation ${id}:`, error);
      return false;
    }
  }

  /**
   * Get photo evaluation statistics
   * @returns Statistics about photo evaluations
   */
  async getPhotoEvaluationStats(): Promise<PhotoEvaluationStatsResponse | null> {
    try {
      const response = await apiClient.get(PHOTO_EVALUATION_ENDPOINTS.STATS);
      return response.data || null;
    } catch (error) {
      console.error("Error fetching photo evaluation stats:", error);
      return null;
    }
  }

  // Helper methods for display and formatting

  /**
   * Get plant growth stage text for display
   */
  getPlantGrowthStageText(stage?: string): string {
    if (!stage) return "Chưa xác định";
    
    switch (stage.toUpperCase()) {
      case PlantGrowthStage.SEEDLING.toUpperCase():
        return "Giai đoạn mầm";
      case PlantGrowthStage.VEGETATIVE.toUpperCase():
        return "Giai đoạn sinh trưởng";
      case PlantGrowthStage.FLOWERING.toUpperCase():
        return "Giai đoạn ra hoa";
      case PlantGrowthStage.FRUITING.toUpperCase():
        return "Giai đoạn kết trái";
      case PlantGrowthStage.BERRIES.toUpperCase():
        return "Giai đoạn quả mọng";
      case PlantGrowthStage.MATURE.toUpperCase():
        return "Giai đoạn trưởng thành";
      case PlantGrowthStage.HARVESTING.toUpperCase():
        return "Giai đoạn thu hoạch";
      default:
        return stage;
    }
  }

  /**
   * Get confidence level text for display
   */
  getConfidenceLevelText(confidence?: number): string {
    if (!confidence) return "Chưa đánh giá";
    
    if (confidence >= 0.9) return "Rất cao";
    if (confidence >= 0.8) return "Cao";
    if (confidence >= 0.7) return "Trung bình";
    if (confidence >= 0.6) return "Thấp";
    return "Rất thấp";
  }

  /**
   * Get confidence level color for display
   */
  getConfidenceLevelColor(confidence?: number): string {
    if (!confidence) return "#gray";
    
    if (confidence >= 0.9) return "#22c55e"; // green
    if (confidence >= 0.8) return "#84cc16"; // lime
    if (confidence >= 0.7) return "#eab308"; // yellow
    if (confidence >= 0.6) return "#f97316"; // orange
    return "#ef4444"; // red
  }

  /**
   * Get health status text from AI feedback
   */
  getHealthStatusText(aiFeedback?: string, confidence?: number): string {
    if (!aiFeedback || !confidence) return "Chưa đánh giá";
    
    // Simple logic - can be enhanced based on AI response format
    const lowerFeedback = aiFeedback.toLowerCase();
    if (lowerFeedback.includes("healthy") || lowerFeedback.includes("khỏe")) {
      return "Khỏe mạnh";
    }
    if (lowerFeedback.includes("disease") || lowerFeedback.includes("bệnh")) {
      return "Có bệnh";
    }
    if (lowerFeedback.includes("pest") || lowerFeedback.includes("sâu bệnh")) {
      return "Sâu bệnh";
    }
    return "Cần kiểm tra";
  }

  /**
   * Format date for display
   */
  formatDate(dateString?: string | Date): string {
    if (!dateString) return "Chưa có";
    
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Không hợp lệ";
    }
  }

  /**
   * Format relative time for display (e.g., "2 hours ago")
   */
  formatRelativeTime(dateString?: string | Date): string {
    if (!dateString) return "Chưa có";
    
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return "Vừa xong";
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      
      return this.formatDate(date);
    } catch (error) {
      console.error("Error formatting relative time:", error);
      return "Không hợp lệ";
    }
  }

  /**
   * Transform API response to display format
   */
  transformToDisplayDto(photoEvaluation: PhotoEvaluationWithRelations): PhotoEvaluationDisplayDto {
    return {
      id: photoEvaluation.id,
      gardenName: photoEvaluation.garden.name,
      plantName: photoEvaluation.plantName,
      plantGrowStage: photoEvaluation.plantGrowStage,
      photoUrl: photoEvaluation.photoUrl,
      aiFeedback: photoEvaluation.aiFeedback,
      confidence: photoEvaluation.confidence,
      isHealthy: photoEvaluation.aiFeedback ? 
        photoEvaluation.aiFeedback.toLowerCase().includes("healthy") : undefined,
      severityLevel: this.extractSeverityLevel(photoEvaluation.aiFeedback),
      notes: photoEvaluation.notes,
      evaluatedAt: photoEvaluation.evaluatedAt,
      createdAt: photoEvaluation.createdAt,
      gardenerName: photoEvaluation.gardener.user.fullName,
      activityType: photoEvaluation.gardenActivity?.activityType
    };
  }

  /**
   * Extract severity level from AI feedback (helper method)
   */
  private extractSeverityLevel(aiFeedback?: string): number | undefined {
    if (!aiFeedback) return undefined;
    
    // Simple extraction logic - can be enhanced based on AI response format
    const lowerFeedback = aiFeedback.toLowerCase();
    if (lowerFeedback.includes("severe") || lowerFeedback.includes("nghiêm trọng")) return 5;
    if (lowerFeedback.includes("moderate") || lowerFeedback.includes("trung bình")) return 3;
    if (lowerFeedback.includes("mild") || lowerFeedback.includes("nhẹ")) return 2;
    if (lowerFeedback.includes("healthy") || lowerFeedback.includes("khỏe")) return 1;
    
    return undefined;
  }

  /**
   * Validate image file before upload
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
      return { isValid: false, error: "Vui lòng chọn file ảnh" };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: "File ảnh không được vượt quá 10MB" };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: "Chỉ hỗ trợ file ảnh định dạng JPEG, PNG, GIF, WebP" };
    }

    return { isValid: true };
  }

  /**
   * Build query string for filters
   */
  buildFilterQuery(filters: PhotoEvaluationFilters): string {
    const params = new URLSearchParams();
    
    if (filters.gardenId) params.append('gardenId', filters.gardenId.toString());
    if (filters.plantName) params.append('plantName', filters.plantName);
    if (filters.plantGrowStage) params.append('plantGrowStage', filters.plantGrowStage);
    if (filters.isEvaluated !== undefined) params.append('isEvaluated', filters.isEvaluated.toString());
    if (filters.isHealthy !== undefined) params.append('isHealthy', filters.isHealthy.toString());
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
    if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    return params.toString();
  }
}

// Export singleton instance
export default new PhotoEvaluationService();
