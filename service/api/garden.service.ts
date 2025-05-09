import { CreateGardenDto, UpdateGardenDto } from "@/types";
import apiClient from "../apiClient";
import { GARDEN_ENDPOINTS } from "../endpoints";
import { Garden, GardenType, GardenStatus } from "@/types/gardens/garden.types";
import { GardenAdvice } from "@/types/weather/weather.types";

/**
 * Garden Service
 *
 * Handles all garden-related API calls and utility functions
 */

class GardenService {
  /**
   * Get all gardens for current user
   * @returns List of gardens
   */
  async getGardens(): Promise<Garden[]> {
    try {
      const response = await apiClient.get(GARDEN_ENDPOINTS.LIST);
      if (!response || !response.data) {
        console.warn("Unexpected API response format in getGardens");
        return [];
      }
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching gardens:", error);
      return [];
    }
  }

  /**
   * Get garden by id
   * @param id Garden id
   * @returns Garden data
   */
  async getGardenById(id: number | string): Promise<Garden | null> {
    try {
      const response = await apiClient.get(GARDEN_ENDPOINTS.DETAIL(id));
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching garden ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new garden
   * @param gardenData Garden creation data
   * @returns Created garden
   */
  async createGarden(gardenData: CreateGardenDto): Promise<Garden | null> {
    try {
      const response = await apiClient.post(
        GARDEN_ENDPOINTS.CREATE,
        gardenData
      );
      return response.data.data || null;
    } catch (error) {
      console.error("Error creating garden:", error);
      throw error;
    }
  }

  /**
   * Update garden
   * @param id Garden id
   * @param gardenData Garden update data
   * @returns Updated garden
   */
  async updateGarden(
    id: number | string,
    gardenData: UpdateGardenDto
  ): Promise<Garden | null> {
    try {
      const response = await apiClient.put(
        GARDEN_ENDPOINTS.UPDATE(id),
        gardenData
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Error updating garden ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete garden
   * @param id Garden id
   * @returns Success status
   */
  async deleteGarden(id: number | string): Promise<boolean> {
    try {
      await apiClient.delete(GARDEN_ENDPOINTS.DELETE(id));
      return true;
    } catch (error) {
      console.error(`Error deleting garden ${id}:`, error);
      return false;
    }
  }

  /**
   * Get location string for garden display
   */
  getLocationString(garden: Garden): string {
    const parts = [];
    if (garden.district) parts.push(garden.district);
    if (garden.city) parts.push(garden.city);
    return parts.length > 0 ? parts.join(", ") : "Chưa có địa chỉ";
  }

  /**
   * Get garden type text for display
   */
  getGardenTypeText(type: GardenType): string {
    switch (type) {
      case "OUTDOOR":
        return "Vườn ngoài trời";
      case "INDOOR":
        return "Vườn trong nhà";
      case "BALCONY":
        return "Vườn ban công";
      case "ROOFTOP":
        return "Vườn sân thượng";
      case "WINDOW_SILL":
        return "Vườn cửa sổ";
      default:
        return "Vườn";
    }
  }

  /**
   * Get garden status text for display
   */
  getGardenStatusText(status: GardenStatus): string {
    switch (status) {
      case "ACTIVE":
        return "Đang hoạt động";
      case "INACTIVE":
        return "Tạm dừng";
      default:
        return "Không xác định";
    }
  }

  /**
   * Get garden icon name for display
   */
  getGardenIconName(type: GardenType): string {
    switch (type) {
      case "OUTDOOR":
        return "flower";
      case "INDOOR":
        return "home";
      case "BALCONY":
        return "grid";
      case "ROOFTOP":
        return "sunny";
      case "WINDOW_SILL":
        return "apps";
      default:
        return "leaf";
    }
  }

  /**
   * Get default garden image based on garden type
   */
  getDefaultGardenImage(type: GardenType): { uri: string } {
    switch (type) {
      case "OUTDOOR":
        return {
          uri: "https://images.unsplash.com/photo-1624438246237-8b8c2e213a5b",
        };
      case "INDOOR":
        return {
          uri: "https://images.unsplash.com/photo-1627910080621-031a7ab8e769",
        };
      case "BALCONY":
        return {
          uri: "https://images.unsplash.com/photo-1545319261-f3760f9dd54c",
        };
      case "ROOFTOP":
        return {
          uri: "https://images.unsplash.com/photo-1599076482136-e8c25bfa85e7",
        };
      case "WINDOW_SILL":
        return {
          uri: "https://images.unsplash.com/photo-1622383563672-fc05f9d99dd7",
        };
      default:
        return {
          uri: "https://images.unsplash.com/photo-1622383563672-fc05f9d99dd7",
        };
    }
  }

  /**
   * Get garden advice based on current conditions
   * @param gardenId Garden ID to get advice for
   * @returns List of advice items for the garden
   */
  async getGardenAdvice(gardenId: number | string): Promise<GardenAdvice[]> {
    try {
      // This would be replaced with a real API endpoint in production
      // For now, we'll simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate mock advice
      return this.generateMockAdvice(gardenId);
    } catch (error) {
      console.error(`Error fetching garden advice ${gardenId}:`, error);
      return [];
    }
  }

  /**
   * Generate mock garden advice (temporary until API is ready)
   * @param gardenId Garden ID to generate advice for
   * @private
   */
  private generateMockAdvice(gardenId: number | string): GardenAdvice[] {
    const gardenIdNum =
      typeof gardenId === "string" ? parseInt(gardenId, 10) : gardenId;

    const adviceList: GardenAdvice[] = [
      {
        id: 1000 + gardenIdNum,
        gardenId: gardenIdNum,
        action: "Tưới nước buổi sáng",
        description:
          "Tưới cây vào buổi sáng sớm giúp giảm sự bốc hơi nước và cung cấp đủ nước cho cây suốt ngày nóng.",
        reason: "Độ ẩm đất hiện đang ở mức thấp.",
        priority: 5,
        suggestedTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
        category: "WATERING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2000 + gardenIdNum,
        gardenId: gardenIdNum,
        action: "Bón phân hữu cơ",
        description:
          "Thêm phân hữu cơ giúp cải thiện cấu trúc đất và cung cấp dinh dưỡng cho cây.",
        reason:
          "Cây đang trong giai đoạn phát triển nhanh và cần bổ sung dinh dưỡng.",
        priority: 4,
        suggestedTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        category: "FERTILIZING",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3000 + gardenIdNum,
        gardenId: gardenIdNum,
        action: "Kiểm tra và loại bỏ sâu bệnh",
        description: "Kiểm tra lá cây để phát hiện và xử lý sâu bệnh kịp thời.",
        reason:
          "Thời tiết ẩm ướt hiện tại thuận lợi cho sự phát triển của nấm và sâu bệnh.",
        priority: 3,
        suggestedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        category: "PEST_CONTROL",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return adviceList;
  }

  /**
   * Format date for display
   */
  formatDate(dateString?: string): string {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  }

  /**
   * Calculate garden statistics
   */
  calculateGardenStatistics(garden: Garden): {
    daysUntilHarvest: number;
    growthProgress: number;
  } {
    const plantedDate = garden.createdAt
      ? new Date(garden.createdAt)
      : new Date();
    const currentDate = new Date();

    // Calculate days since planting
    const daysSincePlanting = Math.floor(
      (currentDate.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Assume average harvest time is 40-60 days (based on common vegetables)
    const estimatedHarvestDays = 50;
    const daysUntilHarvest = Math.max(
      0,
      estimatedHarvestDays - daysSincePlanting
    );

    // Calculate growth progress as a percentage
    const growthProgress = Math.min(
      100,
      Math.floor((daysSincePlanting / estimatedHarvestDays) * 100)
    );

    return {
      daysUntilHarvest,
      growthProgress,
    };
  }
}

export default new GardenService();
