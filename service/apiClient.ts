// src/api/client.ts

// ─── Module augmentation để thêm method refreshToken ─────────────────────
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { router } from "expo-router";

// Mock NetInfo for environments where the native module isn't available
const NetInfoMock = {
  configure: () => {},
  addEventListener: (callback: any) => {
    // Always return connected in mock mode
    setTimeout(() => {
      callback({
        isConnected: true,
        isInternetReachable: true,
      });
    }, 0);
    return () => {}; // Unsubscribe function
  },
  fetch: () =>
    Promise.resolve({ isConnected: true, isInternetReachable: true }),
};

// Use real NetInfo when available, otherwise use mock
let NetInfo: any;
try {
  NetInfo = require("@react-native-community/netinfo").default;
} catch (error) {
  console.warn("NetInfo not available in apiClient, using mock implementation");
  NetInfo = NetInfoMock;
}

declare module "axios" {
  interface AxiosInstance {
    refreshToken: () => Promise<string | null>;
  }
}

// ─── Imports và Types ──────────────────────────────────────────────────────
import { getItem, removeItem, setItem } from "@/utils/asyncStorage";
import { AUTH_KEY, type LoginData } from "@/types/users/auth.types";
import { AUTH_ENDPOINTS } from "./endpoints";
import env from "@/config/environment";

interface RefreshableRequest extends AxiosRequestConfig {
  _retry?: boolean;
  _offlineRetry?: boolean;
}

// Flag to prevent multiple redirects to login page
let isRedirectingToLogin = false;

// Flag to track network status
let isConnected = true;

// Queue for offline requests to retry when back online
let offlineQueue: RefreshableRequest[] = [];

// ─── Config cơ bản cho Axios ──────────────────────────────────────────────
const apiConfig: AxiosRequestConfig = {
  baseURL: `${env.apiUrl}/${env.apiVersion}`,
  timeout: env.apiTimeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

const apiClient: AxiosInstance = axios.create(apiConfig);

// ─── Queue & trạng thái refresh ───────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const onRefreshedError = (err: any) => {
  refreshSubscribers.forEach((cb) =>
    cb(Promise.reject(err) as unknown as string)
  );
  refreshSubscribers = [];
};

// Helper function to redirect to login page
const redirectToLogin = () => {
  if (!isRedirectingToLogin) {
    isRedirectingToLogin = true;

    // Use setTimeout to avoid calling router during render
    setTimeout(() => {
      router.replace("/auth");
      isRedirectingToLogin = false;
    }, 100);
  }
};

// ─── Network connectivity monitoring ───────────────────────────────────────
// Initialize network monitoring
try {
  NetInfo.configure({
    reachabilityUrl: env.apiUrl,
    reachabilityTest: async (response: any) => response.status === 200,
    reachabilityLongTimeout: 30 * 1000, // 30s
    reachabilityShortTimeout: 5 * 1000, // 5s
    reachabilityRequestTimeout: 15 * 1000, // 15s
  });
} catch (err) {
  console.warn("Failed to configure NetInfo, continuing with defaults");
}

// Set up network state listener
const unsubscribe = NetInfo.addEventListener((state: any) => {
  const wasConnected = isConnected;
  isConnected =
    state?.isConnected !== false && state?.isInternetReachable !== false;

  // Process offline queue when coming back online
  if (!wasConnected && isConnected && offlineQueue.length > 0) {
    processOfflineQueue();
  }
});

// Process queued requests when back online
const processOfflineQueue = async () => {
  if (!isConnected || offlineQueue.length === 0) return;

  const queue = [...offlineQueue];
  offlineQueue = [];

  for (const request of queue) {
    try {
      await apiClient(request);
    } catch (error) {
      // If still failing, ignore - the error handler will handle it
    }
  }
};

// ─── Hàm refresh token nội bộ ─────────────────────────────────────────────
const refreshTokenInternal = async (): Promise<string | null> => {
  try {
    // Check if device is offline
    if (!isConnected) {
      throw new Error("No internet connection");
    }

    const authData = await getItem<LoginData>(AUTH_KEY);
    if (!authData?.refresh_token) throw new Error("No refresh token stored");

    // Gọi thẳng không qua interceptor để tránh vòng lặp
    const response = await axios.post(
      `${env.apiUrl}/${env.apiVersion}${AUTH_ENDPOINTS.REFRESH}`,
      {},
      {
        timeout: 10000, // timeout riêng cho refresh: 10s
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
  } catch (err) {
    // If offline, don't clear auth data
    if (!isConnected) {
      return null;
    }

    // refresh thất bại → clear auth + queue error
    await removeItem(AUTH_KEY);
    onRefreshedError(err);

    // Redirect to login page when refresh token fails
    redirectToLogin();

    return null;
  }
};

apiClient.refreshToken = refreshTokenInternal;

// ─── Request interceptor ─────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    // Check if device is offline
    if (!isConnected) {
      // For GET requests, throw error immediately (we don't queue reads)
      if (config.method?.toLowerCase() === "get") {
        throw new axios.Cancel("No internet connection");
      }

      // For mutative requests (POST, PUT, DELETE), queue them to retry later
      if (
        ["post", "put", "delete", "patch"].includes(
          config.method?.toLowerCase() || ""
        )
      ) {
        const offlineRequest = { ...config, _offlineRetry: true };
        offlineQueue.push(offlineRequest);
        throw new axios.Cancel("Request queued for offline mode");
      }
    }

    // if (env.apiDebug) {
    //   console.log(
    //     `→ ${config.method?.toUpperCase()} ${config.url}`,
    //     config.data || ""
    //   );
    // }
    const data = await getItem<LoginData>(AUTH_KEY);
    if (data?.access_token) {
      config.headers.Authorization = `Bearer ${data.access_token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ─── Response interceptor ────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (res: AxiosResponse) => {
    // if (env.apiDebug) {
    //   console.log(`← ${res.status} ${res.config.url}`, res.data);
    // }
    return res;
  },
  async (error: AxiosError) => {
    // Check for network errors (different from HTTP errors)
    if (
      error.message === "Network Error" ||
      !isConnected ||
      (error as any)?.code === "ECONNABORTED" ||
      error.message.includes("timeout")
    ) {
      const originalRequest = error.config as RefreshableRequest;

      if (
        originalRequest &&
        !originalRequest._offlineRetry &&
        ["post", "put", "delete", "patch"].includes(
          originalRequest.method?.toLowerCase() || ""
        )
      ) {
        // Queue non-GET requests for retry
        originalRequest._offlineRetry = true;
        offlineQueue.push(originalRequest);

        return Promise.reject(
          new Error(
            "Không có kết nối mạng. Yêu cầu sẽ được thực hiện khi có kết nối."
          )
        );
      }

      // For GET requests or already queued requests, just report network error
      return Promise.reject(
        new Error(
          "Không có kết nối mạng. Vui lòng kiểm tra kết nối và thử lại."
        )
      );
    }

    const original = error.config as RefreshableRequest;
    const status = error.response?.status;

    // Ensure headers exist on the original request config
    if (original && !original.headers) {
      original.headers = {};
    }

    // 1) Trường hợp 401 lần đầu: trigger refresh
    if (status === 401 && original && !original._retry && !isRefreshing) {
      original._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshTokenInternal();
        isRefreshing = false;

        if (newToken) {
          // notify các request chờ
          onTokenRefreshed(newToken);
          // retry request gốc
          original.headers!.Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        } else {
          // newToken is null when refresh failed
          redirectToLogin();
        }
      } catch {
        isRefreshing = false;
        // Redirect to login on exception
        redirectToLogin();
      }

      // nếu tới đây tức refresh null hoặc có lỗi:
      return Promise.reject(new Error("Phiên đăng nhập đã hết hạn"));
    }

    // 2) Trường hợp 401 trong khi đang refresh: queue lại chờ
    if (status === 401 && isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          // nếu token là Promise.reject, chuyển thành reject
          if (typeof token !== "string") {
            redirectToLogin();
            return reject(token);
          }
          // Ensure headers exist before assigning
          if (original && !original.headers) {
            original.headers = {};
          }
          if (original) {
            original.headers!.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          } else {
            reject(new Error("Original request is null"));
          }
        });
      });
    }

    // 3) 401/403 khác → logout and redirect
    if (status === 401 || status === 403) {
      await removeItem(AUTH_KEY);
      const msg =
        status === 401
          ? "Phiên đăng nhập đã hết hạn"
          : "Bạn không có quyền truy cập";

      redirectToLogin();
      return Promise.reject(new Error(msg));
    }

    // 4) Các lỗi khác
    if (env.apiDebug) {
      console.error(
        "×",
        error.config?.url,
        error.response?.data || error.message
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
