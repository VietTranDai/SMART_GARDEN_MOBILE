// src/api/client.ts

// ─── Module augmentation để thêm method refreshToken ─────────────────────
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { router } from "expo-router";

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
}

// Flag to prevent multiple redirects to login page
let isRedirectingToLogin = false;

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

// ─── Hàm refresh token nội bộ ─────────────────────────────────────────────
const refreshTokenInternal = async (): Promise<string | null> => {
  try {
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
    const original = error.config as RefreshableRequest;
    const status = error.response?.status;

    // Ensure headers exist on the original request config
    if (!original.headers) {
      original.headers = {};
    }

    // 1) Trường hợp 401 lần đầu: trigger refresh
    if (status === 401 && !original._retry && !isRefreshing) {
      original._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshTokenInternal();
        isRefreshing = false;

        if (newToken) {
          // notify các request chờ
          onTokenRefreshed(newToken);
          // retry request gốc
          original.headers.Authorization = `Bearer ${newToken}`;
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
          if (!original.headers) {
            original.headers = {};
          }
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
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
