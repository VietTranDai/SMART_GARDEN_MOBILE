import { getItem, removeItem, setItem } from "@/utils/asyncStorage";
import { AUTH_KEY, type LoginData } from "@/types/users/auth.types";
import { AUTH_ENDPOINTS } from "../endpoints";
import env from "@/config/environment";
import axios from "axios";

export interface TokenRefreshConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  timeoutMs: number;
}

const DEFAULT_CONFIG: TokenRefreshConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  timeoutMs: 10000,
};

export class TokenManager {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | Error) => void> = [];
  private retryCount = 0;
  private config: TokenRefreshConfig;

  constructor(config: Partial<TokenRefreshConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async refreshToken(isConnected: boolean): Promise<string | null> {
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    if (this.isRefreshing) {
      return this.waitForRefresh();
    }

    this.isRefreshing = true;
    
    try {
      const token = await this.performRefreshWithRetry();
      this.onTokenRefreshed(token);
      this.resetState();
      return token;
    } catch (error: any) {
      this.onRefreshError(error);
      this.resetState();
      throw error;
    }
  }

  private async performRefreshWithRetry(): Promise<string> {
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.performRefresh();
      } catch (error) {
        if (attempt === this.config.maxRetries) {
          throw error;
        }
        
        const delay = Math.min(
          this.config.baseDelay * Math.pow(2, attempt),
          this.config.maxDelay
        );
        
        await this.sleep(delay);
      }
    }
    
    throw new Error("Max refresh attempts exceeded");
  }

  private async performRefresh(): Promise<string> {
    const authData = await getItem<LoginData>(AUTH_KEY);
    if (!authData?.refresh_token) {
      throw new Error("No refresh token stored");
    }

    const response = await axios.post(
      `${env.apiUrl}/${env.apiVersion}${AUTH_ENDPOINTS.REFRESH}`,
      {},
      {
        timeout: this.config.timeoutMs,
        headers: {
          Authorization: `Bearer ${authData.refresh_token}`,
        },
      }
    );

    const { access_token, refresh_token } = response.data.data;
    
    await setItem(AUTH_KEY, {
      ...authData,
      access_token,
      refresh_token,
    });

    return access_token;
  }

  private async waitForRefresh(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.refreshSubscribers.push((result) => {
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve(result);
        }
      });
    });
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
  }

  private onRefreshError(error: Error) {
    this.refreshSubscribers.forEach(callback => callback(error));
  }

  private resetState() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
    this.retryCount = 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async clearAuthData(): Promise<void> {
    await removeItem(AUTH_KEY);
    this.resetState();
  }

  // Testing utilities
  __testing__ = {
    getIsRefreshing: () => this.isRefreshing,
    getSubscribersCount: () => this.refreshSubscribers.length,
    resetState: () => this.resetState(),
  };
}