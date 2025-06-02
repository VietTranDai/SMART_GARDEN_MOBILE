import { AxiosRequestConfig } from "axios";

export interface RefreshableRequest extends AxiosRequestConfig {
  _retry?: boolean;
  _offlineRetry?: boolean;
  _timestamp?: number;
}

export interface OfflineQueueConfig {
  maxQueueSize: number;
  maxAge: number; // ms
  retryAttempts: number;
  batchSize: number;
}

const DEFAULT_CONFIG: OfflineQueueConfig = {
  maxQueueSize: 50,
  maxAge: 5 * 60 * 1000, // 5 minutes
  retryAttempts: 3,
  batchSize: 10,
};

export class OfflineQueueManager {
  private queue: RefreshableRequest[] = [];
  private config: OfflineQueueConfig;
  private isProcessing = false;

  constructor(config: Partial<OfflineQueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  addToQueue(request: RefreshableRequest): boolean {
    // Clean expired requests
    this.cleanExpiredRequests();

    // Check queue size limit
    if (this.queue.length >= this.config.maxQueueSize) {
      console.warn("Offline queue is full, dropping oldest request");
      this.queue.shift();
    }

    // Add timestamp and queue
    request._timestamp = Date.now();
    this.queue.push(request);
    
    return true;
  }

  async processQueue(
    requestExecutor: (request: RefreshableRequest) => Promise<any>
  ): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const requests = [...this.queue];
      this.queue = [];

      // Process in batches
      for (let i = 0; i < requests.length; i += this.config.batchSize) {
        const batch = requests.slice(i, i + this.config.batchSize);
        await this.processBatch(batch, requestExecutor);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processBatch(
    batch: RefreshableRequest[],
    requestExecutor: (request: RefreshableRequest) => Promise<any>
  ): Promise<void> {
    const promises = batch.map(async (request) => {
      try {
        await requestExecutor(request);
      } catch (error) {
        console.warn("Failed to process offline request:", error);
        // Could implement retry logic here
      }
    });

    await Promise.allSettled(promises);
  }

  private cleanExpiredRequests(): void {
    const now = Date.now();
    this.queue = this.queue.filter(
      request => !request._timestamp || (now - request._timestamp) < this.config.maxAge
    );
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue = [];
  }

  // Testing utilities
  __testing__ = {
    getQueue: () => [...this.queue],
    getIsProcessing: () => this.isProcessing,
    clearQueue: () => this.clearQueue(),
  };
}