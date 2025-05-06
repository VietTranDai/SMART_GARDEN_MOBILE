import apiClient from "../apiClient";
import { USER_ENDPOINTS } from "../endpoints";

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  lastLogin?: Date;
}

/**
 * User Service
 *
 * Handles all user-related API calls
 */
class UserService {
  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get(USER_ENDPOINTS.ME);
      return response.data.data || {};
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.patch(
        USER_ENDPOINTS.UPDATE_PROFILE,
        profileData
      );
      return response.data.data || {};
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      await apiClient.post(USER_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  }

  /**
   * Get gardener profile by ID
   */
  async getGardenerProfile(gardenerId: number | string): Promise<any> {
    try {
      const response = await apiClient.get(
        USER_ENDPOINTS.GARDENER_PROFILE(gardenerId)
      );
      return response.data.data || {};
    } catch (error) {
      console.error(`Error fetching gardener profile ${gardenerId}:`, error);
      throw error;
    }
  }

  /**
   * Get current user's experience progress
   */
  async getExperienceProgress(): Promise<any> {
    try {
      const response = await apiClient.get(USER_ENDPOINTS.EXPERIENCE_PROGRESS);
      return response.data.data || {};
    } catch (error) {
      console.error("Error fetching experience progress:", error);
      throw error;
    }
  }
}

export default new UserService();
