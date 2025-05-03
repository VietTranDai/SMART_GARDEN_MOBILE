import apiClient from "../apiClient";
import { PlantType, Plant, GrowthStage } from "@/types/plants";
import { PlantQueryParams } from "@/types/plants/dtos";
import { PLANT_ENDPOINTS } from "../endpoints";

/**
 * Plant Service
 *
 * Handles all plant-related API calls
 */
class PlantService {
  /**
   * Create a new plant
   * @param plantData Plant data
   * @returns Created plant
   */
  async createPlant(plantData: { name: string; scientificName: string; gardenId: number; plantTypeId: number; description: string; family: string; growthDuration: number | undefined; }) {
    const response = await apiClient.post(PLANT_ENDPOINTS.ADD, plantData);
    return response.data;
  }
  /**
   * Get all plant types
   * @returns List of plant types
   */
  async getPlantTypes(): Promise<PlantType[]> {
    const response = await apiClient.get(PLANT_ENDPOINTS.TYPES);
    return response.data;
  }

  /**
   * Get all plants
   * @param params Optional query parameters
   * @returns List of plants
   */
  async getPlants(params?: PlantQueryParams): Promise<Plant[]> {
    const response = await apiClient.get(PLANT_ENDPOINTS.LIST, { params });
    return response.data;
  }

  /**
   * Get plant by id
   * @param id Plant id
   * @returns Plant details
   */
  async getPlantById(id: number | string): Promise<Plant> {
    const response = await apiClient.get(PLANT_ENDPOINTS.DETAIL(id));
    return response.data;
  }

  /**
   * Get all growth stages for a plant
   * @param plantId Plant ID
   * @returns List of growth stages
   */
  async getGrowthStages(plantId: number | string): Promise<GrowthStage[]> {
    const response = await apiClient.get(
      PLANT_ENDPOINTS.GROWTH_STAGES(plantId)
    );
    return response.data;
  }

  /**
   * Get growth stage details
   * @param plantId Plant ID
   * @param stageId Stage ID
   * @returns Growth stage details
   */
  async getGrowthStageById(
    plantId: number | string,
    stageId: number | string
  ): Promise<GrowthStage> {
    const response = await apiClient.get(
      PLANT_ENDPOINTS.GROWTH_STAGE_DETAIL(plantId, stageId)
    );
    return response.data;
  }
}

export default new PlantService();
