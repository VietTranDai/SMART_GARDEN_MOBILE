export class ApiError extends Error {
    constructor(
      message: string,
      public statusCode?: number,
      public isNetworkError = false,
      public isRetryable = false,
      public originalError?: Error
    ) {
      super(message);
      this.name = 'ApiError';
    }
  
    static fromAxiosError(error: any): ApiError {
      const isNetworkError = error.message === "Network Error" || 
                            error.code === "ECONNABORTED" ||
                            error.message.includes("timeout");
  
      return new ApiError(
        error.message,
        error.response?.status,
        isNetworkError,
        isNetworkError || [408, 429, 502, 503, 504].includes(error.response?.status),
        error
      );
    }
  }
  
  export class AuthenticationError extends ApiError {
    constructor(message = "Authentication failed") {
      super(message, 401, false, false);
      this.name = 'AuthenticationError';
    }
  }
  
  export class NetworkError extends ApiError {
    constructor(message = "Network connection error") {
      super(message, undefined, true, true);
      this.name = 'NetworkError';
    }
  }