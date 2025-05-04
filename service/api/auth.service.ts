import apiClient from "../apiClient";
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from "../endpoints";
import { setItem, removeItem, getItem } from "@/utils/asyncStorage";
import { AUTH_KEY, LoginData, AppUser, RegisterUserDto } from "@/types/users";

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
      const { data } = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        username,
        password,
      });
      const { access_token, refresh_token } = data.data;
      const authData = { access_token, refresh_token };
      await setItem(AUTH_KEY, authData);

      // Get user info
      let userData: AppUser | undefined;
      try {
        const userResponse = await apiClient.get(USER_ENDPOINTS.ME);
        userData = userResponse.data;
      } catch (error) {
        console.error("Failed to get user data after login:", error);
      }

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
  async register(userData: RegisterUserDto) {
    const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data.data;
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
  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const response = await apiClient.get(USER_ENDPOINTS.ME);
      return response.data.data;
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
    return response.data.data;
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
    return response.data.data;
  }

  /**
   * Refresh access token
   * @returns New tokens
   */
  async refreshToken(): Promise<LoginData | null> {
    try {
      const authData = await this.getAuthData();
      if (!authData?.refresh_token) return null;

      // Use the apiClient directly to refresh token
      // apiClient.refreshToken will handle the auth header internally
      const newToken = await apiClient.refreshToken();

      if (!newToken) return null;

      // Get latest auth data that was updated by apiClient
      return await this.getAuthData();
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }
}

export default new AuthService();
