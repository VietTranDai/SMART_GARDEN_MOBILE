/**
 * Plant DTOs
 *
 * Data Transfer Objects for plant-related API requests and responses
 */

/**
 * Query parameters for fetching plants
 */
export interface PlantQueryParams {
  type?: number;
  search?: string;
}
