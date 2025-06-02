import apiClient from "../apiClient";
import { PHOTO_EVALUATION_ENDPOINTS } from "../endpoints";
import {
  PhotoEvaluationWithRelations,
  UpdatePhotoEvaluationDto,
  PhotoEvaluationFormData,
  PhotoEvaluationListResponse,
  PhotoEvaluationStatsResponse,
  PhotoEvaluationDisplayDto,
  PhotoEvaluationFilters,
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

      return response.data.data;
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

      return response.data.data;
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
      if (photoData.image && (photoData.image as any).fileSize) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if ((photoData.image as any).fileSize > maxSize) {
          return {
            success: false,
            error: "File ảnh không được vượt quá 10MB"
          };
        }
      }

      const formData = new FormData();
      
      const imageFile = photoData.image;
      
      if ('uri' in imageFile) {
        formData.append('image', {
          uri: imageFile.uri,
          type: imageFile.type || "image/jpeg",
          name: imageFile.name || `photo_${Date.now()}.jpg`,
        } as any);
        
        console.log("📸 React Native image added to FormData:", {
          uri: imageFile.uri,
          type: imageFile.type,
          name: imageFile.name
        });
      } else {
        formData.append('image', imageFile);
        console.log("🌐 Web file added to FormData");
      }
      
      formData.append('gardenId', photoData.gardenId.toString());
      
      if (photoData.notes) {
        formData.append('notes', photoData.notes);
      }

      console.log("🚀 Sending simplified multipart/form-data request...");
      
      const response = await apiClient.post(
        PHOTO_EVALUATION_ENDPOINTS.CREATE,
        formData,
        {
          timeout: 60000, // 1 minute
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

      console.log("✅ Upload successful!");

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error("❌ Error creating photo evaluation:", error);
      
      // Enhanced error handling
      let errorMessage = "Có lỗi xảy ra khi tải ảnh lên";
      
      if (error instanceof Error) {
        // Network errors
        if (error.message.includes("timeout") || error.message.includes("ECONNABORTED")) {
          errorMessage = "Hết thời gian chờ. File ảnh có thể quá lớn hoặc kết nối mạng chậm. Vui lòng thử lại.";
        } else if (error.message.includes("Network Error") || error.message.includes("kết nối mạng")) {
          errorMessage = "Không có kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.";
        } else if (error.message.includes("Request queued for offline mode")) {
          errorMessage = "Kết nối mạng không ổn định. Vui lòng thử lại sau.";
        } else if (error.message.includes("413") || error.message.includes("Payload Too Large")) {
          errorMessage = "File ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.";
        } else if (error.message.includes("400")) {
          errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
        } else if (error.message.includes("500")) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau.";
        }
      }
      
      // Handle axios response errors
      if ((error as any).response) {
        const status = (error as any).response.status;
        const responseData = (error as any).response.data;
        
        console.log("🔍 Response error details:", {
          status,
          data: responseData,
          headers: (error as any).response.headers
        });
        
        switch (status) {
          case 400:
            errorMessage = responseData?.message || "Dữ liệu không hợp lệ";
            break;
          case 401:
            errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            break;
          case 403:
            errorMessage = "Không có quyền thực hiện thao tác này";
            break;
          case 404:
            errorMessage = "Vườn không tồn tại hoặc không có quyền truy cập";
            break;
          case 413:
            errorMessage = "File ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.";
            break;
          case 422:
            errorMessage = responseData?.message || "Dữ liệu không hợp lệ";
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = "Lỗi server. Vui lòng thử lại sau.";
            break;
          default:
            errorMessage = responseData?.message || `Lỗi ${status}: ${responseData?.error || "Không xác định"}`;
        }
      }
      
      return {
        success: false,
        error: errorMessage
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
      return response.data.data || null;
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
