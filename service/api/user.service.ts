import apiClient from "../apiClient";
import {
  User,
  ExperienceLevel,
  Gardener,
  GardenerProfile,
} from "@/types/users";
import {
  UpdateProfileDto,
  ChangePasswordDto,
  ExperienceProgress,
} from "@/types/users/dtos";
import { USER_ENDPOINTS } from "../endpoints";
import { Garden } from "@/types/gardens/garden.types";

/**
 * User Service
 *
 * Handles all user profile-related API calls
 */
class UserService {
  /**
   * Update user profile
   * @param profileData Profile update data
   * @returns Updated user profile
   */
  async updateProfile(profileData: UpdateProfileDto): Promise<User> {
    // If we have a profile picture, use FormData
    if (profileData.profilePicture instanceof File) {
      const formData = new FormData();

      // Append all other profile data
      Object.entries(profileData).forEach(([key, value]) => {
        if (key !== "profilePicture" && value !== undefined) {
          formData.append(key, value as string);
        }
      });

      // Append profile picture
      formData.append("profilePicture", profileData.profilePicture);

      const response = await apiClient.patch(
        USER_ENDPOINTS.UPDATE_PROFILE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } else {
      // Regular JSON request if no profile picture
      const response = await apiClient.patch(
        USER_ENDPOINTS.UPDATE_PROFILE,
        profileData
      );
      return response.data;
    }
  }

  /**
   * Change user password
   * @param passwordData Password change data
   * @returns Success status
   */
  async changePassword(
    passwordData: ChangePasswordDto
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(
      USER_ENDPOINTS.CHANGE_PASSWORD,
      passwordData
    );
    return response.data;
  }

  /**
   * Get gardener profile by ID
   * @param gardenerId Gardener ID
   * @returns Gardener profile with extended statistics
   */
  async getGardenerProfile(
    gardenerId: number | string
  ): Promise<GardenerProfile> {
    const response = await apiClient.get(
      USER_ENDPOINTS.GARDENER_PROFILE(gardenerId)
    );
    return response.data;
  }

  /**
   * Get current user's experience progress
   * @returns Experience progress data
   */
  async getExperienceProgress(): Promise<ExperienceProgress> {
    const response = await apiClient.get(USER_ENDPOINTS.EXPERIENCE_PROGRESS);
    return response.data;
  }
}

export default new UserService();
