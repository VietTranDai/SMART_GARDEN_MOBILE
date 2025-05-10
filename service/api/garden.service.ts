import { CreateGardenDto, UpdateGardenDto, GardenDisplayDto } from "@/types";
import apiClient from "../apiClient";
import { GARDEN_ENDPOINTS, PLANT_ENDPOINTS } from "../endpoints";
import {
  Garden,
  GardenType,
  GardenStatus,
  GardenAdvice,
} from "@/types/gardens/garden.types";

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

      const gardens = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      return gardens;
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
      const garden = response.data.data || null;

      if (garden) {
        console.debug(`Fetched garden ${garden.id}: ${garden.name}`);

        // Check if we need to fetch additional plant data
        if (
          garden.plantName &&
          (!garden.plantStartDate || !garden.plantDuration)
        ) {
          console.debug(
            `Garden has plant name but missing growing data. Enriching garden data...`
          );
          const enrichedGarden = await this.enrichGardenWithPlantData(garden);
          return enrichedGarden;
        }
      }

      return garden;
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
      case "COMMUNITY" as GardenType:
        return "people";
      case "HYDROPONIC" as GardenType:
        return "water";
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
      case "COMMUNITY" as GardenType:
        return {
          uri: "https://images.unsplash.com/photo-1621955584212-66e5976feab3",
        };
      case "HYDROPONIC" as GardenType:
        return {
          uri: "https://images.unsplash.com/photo-1553025484-cee7712bc812",
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
      const response = await apiClient.get(GARDEN_ENDPOINTS.ADVICE(gardenId));
      if (!response || !response.data) {
        console.warn(`No advice data returned for garden ${gardenId}`);
        return [];
      }

      const adviceData = Array.isArray(response.data.data)
        ? response.data.data
        : [];

      console.log("adviceData", adviceData);
      return adviceData;
    } catch (error) {
      console.error(
        `Error fetching garden advice for garden ${gardenId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Format date for display
   * @param dateString ISO date string
   * @returns Formatted date string
   */
  formatDate(dateString?: string): string {
    if (!dateString) return "--/--/----";

    try {
      const date = new Date(dateString);

      // Format: DD/MM/YYYYs
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "--/--/----";
    }
  }

  /**
   * Calculate garden statistics
   * @param garden Garden object
   * @returns Object containing days until harvest and growth progress
   */
  calculateGardenStatistics(garden: Garden): {
    daysUntilHarvest: number;
    growthProgress: number;
  } {
    let daysUntilHarvest = 0;
    let growthProgress = 0;

    try {
      if (garden.plantStartDate && garden.plantDuration) {
        const startDate = new Date(garden.plantStartDate).getTime();
        const currentDate = new Date().getTime();
        const endDate = startDate + garden.plantDuration * 24 * 60 * 60 * 1000;

        daysUntilHarvest = Math.max(
          0,
          Math.ceil((endDate - currentDate) / (24 * 60 * 60 * 1000))
        );

        const totalGrowthDays = garden.plantDuration;
        const daysGrown = totalGrowthDays - daysUntilHarvest;
        growthProgress = Math.min(
          100,
          Math.max(0, Math.round((daysGrown / totalGrowthDays) * 100))
        );
      } else {
        console.debug(
          `Cannot calculate growth progress for garden ${garden.id}: missing required data`
        );
        console.debug(
          `Plant name: ${garden.plantName || "Missing"}, Start date: ${
            garden.plantStartDate || "Missing"
          }, Duration: ${garden.plantDuration || "Missing"}`
        );
      }
    } catch (error) {
      console.error(
        `Error calculating garden statistics for garden ${garden.id}:`,
        error
      );
    }

    return {
      daysUntilHarvest,
      growthProgress,
    };
  }

  /**
   * Get garden summary for quick display
   * @param garden Garden object
   * @returns Object with summary information
   */
  getGardenSummary(garden: Garden): {
    name: string;
    type: string;
    location: string;
    plantInfo: string | null;
    createdAt: string;
    growthProgress: number;
    daysUntilHarvest: number;
  } {
    const { growthProgress, daysUntilHarvest } =
      this.calculateGardenStatistics(garden);

    return {
      name: garden.name,
      type: this.getGardenTypeText(garden.type),
      location: this.getLocationString(garden),
      plantInfo: garden.plantName
        ? `${garden.plantName}${
            garden.plantGrowStage ? ` (${garden.plantGrowStage})` : ""
          }`
        : null,
      createdAt: this.formatDate(garden.createdAt),
      growthProgress,
      daysUntilHarvest,
    };
  }

  /**
   * Get garden plants information
   * @param gardenId Garden ID
   * @returns List of plants in the garden
   */
  async getGardenPlants(gardenId: number | string): Promise<any[]> {
    try {
      const response = await apiClient.get(PLANT_ENDPOINTS.BY_GARDEN(gardenId));
      const plants = response?.data?.data || [];
      console.debug(`Fetched ${plants.length} plants for garden ${gardenId}`);
      return plants;
    } catch (error) {
      console.error(`Error fetching plants for garden ${gardenId}:`, error);
      return [];
    }
  }

  /**
   * Enrich garden with plant growth data
   * Used when garden object is missing plantStartDate or plantDuration
   * @param garden Garden object to enrich
   * @returns Enriched garden object with plant data
   */
  async enrichGardenWithPlantData(garden: Garden): Promise<Garden> {
    // If we have all the data already, just return the garden
    if (garden.plantName && garden.plantStartDate && garden.plantDuration) {
      return garden;
    }

    try {
      const plants = await this.getGardenPlants(garden.id);

      // If no plants found, return original garden
      if (!plants || plants.length === 0) {
        console.debug(`No plants found for garden ${garden.id}`);
        return garden;
      }

      // Use the first plant for now (could be enhanced to handle multiple plants)
      const mainPlant = plants[0];
      console.debug(`Found main plant: ${mainPlant.name}`);

      // Create enriched copy of the garden
      const enrichedGarden = { ...garden };

      // Fill in missing data
      if (!enrichedGarden.plantName && mainPlant.name) {
        enrichedGarden.plantName = mainPlant.name;
      }

      if (!enrichedGarden.plantStartDate && mainPlant.plantedAt) {
        enrichedGarden.plantStartDate = mainPlant.plantedAt;
        console.debug(`Added plantStartDate: ${mainPlant.plantedAt}`);
      }

      if (!enrichedGarden.plantDuration && mainPlant.growthDuration) {
        enrichedGarden.plantDuration = mainPlant.growthDuration;
        console.debug(`Added plantDuration: ${mainPlant.growthDuration}`);
      }

      if (!enrichedGarden.plantGrowStage && mainPlant.currentGrowthStage) {
        enrichedGarden.plantGrowStage = mainPlant.currentGrowthStage;
      }

      console.debug(`Garden data enriched with plant information`);
      return enrichedGarden;
    } catch (error) {
      console.error(`Error enriching garden with plant data:`, error);
      return garden; // Return original garden if enrichment fails
    }
  }
}

export default new GardenService();
