import { ApiClientConfig } from "./apiClient";

export const createApiClientConfig = (options: {
  enableDebugLogging?: boolean;
  maxRetries?: number;
  maxQueueSize?: number;
}): ApiClientConfig => ({
  enableDebugLogging: options.enableDebugLogging ?? false,
  tokenManager: {
    maxRetries: options.maxRetries ?? 3,
    baseDelay: 1000,
    maxDelay: 10000,
    timeoutMs: 10000,
  },
  offlineQueue: {
    maxQueueSize: options.maxQueueSize ?? 50,
    maxAge: 5 * 60 * 1000, // 5 minutes
    retryAttempts: 3,
    batchSize: 10,
  },
});