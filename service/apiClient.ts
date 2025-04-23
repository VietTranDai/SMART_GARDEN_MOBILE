import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { getItem, removeItem, setItem } from "@/utils/asyncStorage";
import { AUTH_KEY, type LoginData } from "@/modules/auth/types/auth";
import { AUTH_ENDPOINTS } from "./endpoints";
import env from "@/config/environment";

/**
 * API Client Configuration
 *
 * Configured Axios instance with:
 * - Base URL from .env using react-native-dotenv
 * - Authentication token handling with auto refresh
 * - Error handling with automatic logout
 * - Request/response debugging
 */

// Create API request configuration
const apiConfig: AxiosRequestConfig = {
  baseURL: `${env.apiUrl}/${env.apiVersion}`,
  timeout: env.apiTimeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enable cookies for refresh token
};

// Create API instance
const apiClient: AxiosInstance = axios.create(apiConfig);

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of requests to retry after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to add request to retry queue
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to retry requests with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Function to refresh token
const refreshToken = async (): Promise<string | null> => {
  try {
    // Refresh token is handled by httpOnly cookie, so no need to send it
    const response = await axios.post(
      `${env.apiUrl}/${env.apiVersion}${AUTH_ENDPOINTS.REFRESH}`,
      {},
      { withCredentials: true }
    );

    // Get the new access token
    const { access_token } = response.data;

    // Update stored token
    const authData = await getItem<LoginData>(AUTH_KEY);
    if (authData) {
      await setItem(AUTH_KEY, { ...authData, access_token });
    }

    return access_token;
  } catch (error) {
    // Failed to refresh token, logout user
    await removeItem(AUTH_KEY);
    return null;
  }
};

// Request interceptor - adds auth token to requests
apiClient.interceptors.request.use(async (config) => {
  // Add logging in debug mode
  if (env.apiDebug) {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.data || {}
    );
  }

  // Add authentication token if available
  const data = await getItem<LoginData>(AUTH_KEY);
  if (data?.access_token) {
    config.headers.Authorization = `Bearer ${data.access_token}`;
  }
  return config;
});

// Response interceptor - handles errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in debug mode
    if (env.apiDebug) {
      console.log(`API Response: ${response.status}`, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    const status = error.response?.status;

    // Token expired, try to refresh if not already refreshing
    if (status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const newToken = await refreshToken();

        if (newToken) {
          // Update Authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Notify subscribers that token has been refreshed
          onTokenRefreshed(newToken);
          isRefreshing = false;
          // Retry original request
          return apiClient(originalRequest);
        } else {
          // Token refresh failed, redirect to login
          isRefreshing = false;
          return Promise.reject("Phiên đăng nhập hết hạn");
        }
      } catch (refreshError) {
        isRefreshing = false;
        return Promise.reject("Phiên đăng nhập hết hạn");
      }
    }

    // Handle case where a request failed during token refresh
    else if (status === 401 && isRefreshing) {
      // Queue request to be retried later
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    // Handle other auth errors
    else if (status === 401 || status === 403) {
      // Remove token and reject
      await removeItem(AUTH_KEY);
      return Promise.reject(
        status === 401
          ? "Phiên đăng nhập hết hạn"
          : "Bạn không có quyền truy cập"
      );
    }

    // Log errors in debug mode
    if (env.apiDebug) {
      console.error("API Error:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
