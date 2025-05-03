import apiClient from "../apiClient";
import { GARDEN_ENDPOINTS } from "../endpoints";
import { Garden } from "@/types/gardens/garden.types";
import { CreateGardenDto, UpdateGardenDto } from "@/types/gardens/dtos";

/**
 * Garden Service
 *
 * Handles all garden-related API calls
 */

class GardenService {
  /**
   * Get all gardens for current user
   * @returns List of gardens
   */
  async getGardens(): Promise<Garden[]> {
    const response = await apiClient.get(GARDEN_ENDPOINTS.LIST);
    return response.data;
  }

  /**
   * Get garden by id
   * @param id Garden id
   * @returns Garden data
   */
  async getGardenById(id: number | string): Promise<Garden> {
    const response = await apiClient.get(GARDEN_ENDPOINTS.DETAIL(id));
    return response.data;
  }

  /**
   * Create a new garden
   * @param gardenData Garden creation data
   * @returns Created garden
   */
  async createGarden(gardenData: CreateGardenDto): Promise<Garden> {
    const response = await apiClient.post(GARDEN_ENDPOINTS.CREATE, gardenData);
    return response.data;
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
  ): Promise<Garden> {
    const response = await apiClient.patch(
      GARDEN_ENDPOINTS.UPDATE(id),
      gardenData
    );
    return response.data;
  }

  /**
   * Delete garden
   * @param id Garden id
   * @returns Success status
   */
  async deleteGarden(id: number | string): Promise<void> {
    await apiClient.delete(GARDEN_ENDPOINTS.DELETE(id));
  }
}

export default new GardenService();
