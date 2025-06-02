import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { router } from "expo-router";

import { getItem } from "@/utils/asyncStorage";
import { AUTH_KEY, type LoginData } from "@/types/users/auth.types";
import env from "@/config/environment";
import { TokenManager, type TokenRefreshConfig } from "./util/TokenManager";
import { OfflineQueueManager, type OfflineQueueConfig, type RefreshableRequest } from "./util/OfflineQueueManager";
import { NetworkMonitor } from "./util/NetworkMonitor";
import { ApiError, AuthenticationError, NetworkError } from "./util/ApiError";

declare module "axios" {
  interface AxiosInstance {
    refreshToken: () => Promise<string | null>;
  }
}
  
export interface ApiClientConfig {
  tokenManager?: Partial<TokenRefreshConfig>;
  offlineQueue?: Partial<OfflineQueueConfig>;
  enableDebugLogging?: boolean;
}

class ApiClientManager {
  private client: AxiosInstance;
  private tokenManager: TokenManager;
  private offlineQueue: OfflineQueueManager;
  private networkMonitor: NetworkMonitor;
  private isRedirectingToLogin = false;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig = {}) {
    this.config = config;
    
    // Initialize managers
    this.tokenManager = new TokenManager(config.tokenManager);
    this.offlineQueue = new OfflineQueueManager(config.offlineQueue);
    this.networkMonitor = new NetworkMonitor();
    
    // Create axios instance
    this.client = this.createAxiosInstance();
    
    // Setup network listener
    this.setupNetworkListener();
    
    // Expose refresh token method
    this.client.refreshToken = this.refreshToken.bind(this);
  }

  private createAxiosInstance(): AxiosInstance {
    const apiConfig: AxiosRequestConfig = {
      baseURL: `${env.apiUrl}/${env.apiVersion}`,
      timeout: env.apiTimeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const instance = axios.create(apiConfig);
    
    // Setup interceptors
    this.setupRequestInterceptor(instance);
    this.setupResponseInterceptor(instance);
    
    return instance;
  }

  private setupNetworkListener() {
    this.networkMonitor.addListener((isConnected) => {
      if (isConnected) {
        this.processOfflineQueue();
      }
    });
  }

  private async processOfflineQueue() {
    await this.offlineQueue.processQueue(async (request) => {
      return this.client(request);
    });
  }

  private setupRequestInterceptor(instance: AxiosInstance) {
    instance.interceptors.request.use(
      async (config) => {
        const isConnected = this.networkMonitor.getConnectionStatus();

        // Handle offline scenarios
        if (!isConnected) {
          return this.handleOfflineRequest(config);
        }

        // Add auth token
        await this.addAuthToken(config);

        // Debug logging
        if (this.config.enableDebugLogging) {
          console.log(`→ ${config.method?.toUpperCase()} ${config.url}`, config.data || "");
        }

        return config;
      },
      (error) => Promise.reject(ApiError.fromAxiosError(error))
    );
  }

  private handleOfflineRequest(config: AxiosRequestConfig): never {
    const method = config.method?.toLowerCase();

    if (method === "get") {
      throw new NetworkError("No internet connection");
    }

    if (["post", "put", "delete", "patch"].includes(method || "")) {
      const offlineRequest: RefreshableRequest = { 
        ...config, 
        _offlineRetry: true 
      };
      
      this.offlineQueue.addToQueue(offlineRequest);
      throw new NetworkError("Request queued for offline mode");
    }

    throw new NetworkError("No internet connection");
  }

  private async addAuthToken(config: AxiosRequestConfig) {
    const data = await getItem<LoginData>(AUTH_KEY);
    if (data?.access_token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${data.access_token}`;
    }
  }

  private setupResponseInterceptor(instance: AxiosInstance) {
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (this.config.enableDebugLogging) {
          // console.log(`← ${response.status} ${response.config.url}`, response.data);
          console.log(`← ${response.status} ${response.config.url}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const apiError = ApiError.fromAxiosError(error);

    // Handle network errors
    if (apiError.isNetworkError) {
      return this.handleNetworkError(error);
    }

    const original = error.config as RefreshableRequest;
    const status = error.response?.status;

    // Handle authentication errors
    if (status === 401) {
      return this.handleAuthenticationError(original, error);
    }

    // Handle authorization errors
    if (status === 403) {
      await this.tokenManager.clearAuthData();
      this.redirectToLogin();
      throw new AuthenticationError("You don't have permission to access this resource");
    }

    // Debug logging for other errors
    if (this.config.enableDebugLogging) {
      console.error("×", error.config?.url, error.response?.data || error.message);
    }

    throw apiError;
  }

  private async handleNetworkError(error: AxiosError): Promise<never> {
    const originalRequest = error.config as RefreshableRequest;

    if (
      originalRequest &&
      !originalRequest._offlineRetry &&
      ["post", "put", "delete", "patch"].includes(
        originalRequest.method?.toLowerCase() || ""
      )
    ) {
      originalRequest._offlineRetry = true;
      this.offlineQueue.addToQueue(originalRequest);
      throw new NetworkError("Request queued for offline mode");
    }

    throw new NetworkError("Network connection error");
  }

  private async handleAuthenticationError(
    original: RefreshableRequest | undefined,
    error: AxiosError
  ): Promise<never> {
    if (!original || original._retry) {
      await this.tokenManager.clearAuthData();
      this.redirectToLogin();
      throw new AuthenticationError("Session expired");
    }

    try {
      original._retry = true;
      const newToken = await this.tokenManager.refreshToken(
        this.networkMonitor.getConnectionStatus()
      );

      if (newToken) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return this.client(original);
      }
    } catch (refreshError) {
      await this.tokenManager.clearAuthData();
      this.redirectToLogin();
      throw new AuthenticationError("Session expired");
    }

    await this.tokenManager.clearAuthData();
    this.redirectToLogin();
    throw new AuthenticationError("Session expired");
  }

  private redirectToLogin() {
    if (!this.isRedirectingToLogin) {
      this.isRedirectingToLogin = true;

      setTimeout(() => {
        router.replace("/auth");
        this.isRedirectingToLogin = false;
      }, 100);
    }
  }

  private async refreshToken(): Promise<string | null> {
    try {
      return await this.tokenManager.refreshToken(
        this.networkMonitor.getConnectionStatus()
      );
    } catch {
      return null;
    }
  }

  // Public methods
  getInstance(): AxiosInstance {
    return this.client;
  }

  cleanup() {
    this.networkMonitor.cleanup();
    this.offlineQueue.clearQueue();
  }

  // Testing utilities
  __testing__ = {
    getTokenManager: () => this.tokenManager,
    getOfflineQueue: () => this.offlineQueue,
    getNetworkMonitor: () => this.networkMonitor,
    resetState: () => {
      this.isRedirectingToLogin = false;
      this.tokenManager.__testing__.resetState();
      this.offlineQueue.__testing__.clearQueue();
    },
  };
}

// Create and export singleton instance
const apiClientManager = new ApiClientManager({
  enableDebugLogging: env.apiDebug,
});

export const apiClient = apiClientManager.getInstance();
export const cleanupApiClient = () => apiClientManager.cleanup();

// Export for testing
export const __testing__ = apiClientManager.__testing__;

export default apiClient;