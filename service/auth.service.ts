import apiClient from "./apiClient";
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from "./endpoints";
import { setItem, removeItem, getItem } from "@/utils/asyncStorage";
import {
  AUTH_KEY,
  type LoginData,
  type LoginCredentials,
  type TokenResponse,
  type UserData,
} from "@/modules/auth/types/auth";

/**
 * Authentication Service
 *
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Login user
   * @param username User username
   * @param password User password
   * @returns Login response data
   */
  async login(username: string, password: string): Promise<LoginData> {
    try {
      const credentials: LoginCredentials = { username, password };
      const response = await apiClient.post<TokenResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials
      );

      // Get user info
      let userData: UserData | undefined;
      try {
        const userResponse = await apiClient.get(USER_ENDPOINTS.ME, {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`,
          },
        });
        userData = userResponse.data;
      } catch (error) {
        console.error("Failed to get user data after login:", error);
      }

      // Save auth data to storage
      const authData: LoginData = {
        access_token: response.data.access_token,
        user: userData,
      };

      await setItem(AUTH_KEY, authData);
      return authData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user
   * @param userData User registration data
   * @returns Registration response
   */
  async register(userData: any) {
    const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
  }

  /**
   * Logout user
   * Calls logout endpoint and clears local storage
   */
  async logout() {
    try {
      // Call logout endpoint with token
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Ignore errors on logout
      console.error("Logout error:", error);
    } finally {
      // Always remove auth data from storage
      await removeItem(AUTH_KEY);
    }
  }

  /**
   * Get current user info
   * @returns User data
   */
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const response = await apiClient.get(USER_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns Boolean indicating authentication status
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const authData = await this.getAuthData();
      if (!authData?.access_token) return false;

      // Verify token by making a request to get user info
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current authentication data from storage
   * @returns Authentication data
   */
  async getAuthData(): Promise<LoginData | null> {
    try {
      return await getItem<LoginData>(AUTH_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Request password reset
   * @param email User email
   * @returns Response data
   */
  async forgotPassword(email: string) {
    const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      email,
    });
    return response.data;
  }

  /**
   * Reset password with token
   * @param token Reset token
   * @param password New password
   * @returns Response data
   */
  async resetPassword(token: string, password: string) {
    const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      token,
      password,
    });
    return response.data;
  }
}

export default new AuthService();
