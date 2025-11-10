import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ROUTES } from '@/config/api';
import { useAuthStore } from '@/stores/auth-store';

type FailedRequest = {
  resolve: (value: AxiosRequestConfig) => void;
  reject: (error: unknown) => void;
  config: AxiosRequestConfig;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
      return;
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    resolve(config);
  });

  failedQueue = [];
};

const createHttpClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000,
  });

  instance.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (!originalRequest) {
        throw error;
      }

      const status = error.response?.status;
      if (status !== 401 || originalRequest._retry) {
        throw error;
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            config: originalRequest,
          });
        }).then((config) => instance(config));
      }

      isRefreshing = true;

      try {
        const response = await instance.post<{ data: { accessToken: string } }>(API_ROUTES.auth.refreshToken);
        const newToken = response.data.data.accessToken;

        useAuthStore.getState().setAccessToken(newToken);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearSession();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    },
  );

  return instance;
};

export const http = createHttpClient();

