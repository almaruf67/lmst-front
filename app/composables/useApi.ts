import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { useRuntimeConfig } from '#imports';

import { useAuthStore } from '~/stores/auth';

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, '');

export const useApi = (): AxiosInstance => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = normalizeBaseUrl(runtimeConfig.public.apiBase);
  const api = axios.create({
    baseURL,
    timeout: 20000,
  });

  api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    authStore.hydrateFromCookies();

    const token = authStore.accessToken ?? null;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (!isFormData) {
      config.headers = config.headers ?? {};
      config.headers['Content-Type'] =
        config.headers['Content-Type'] ?? 'application/json';
    }

    config.headers = config.headers ?? {};
    config.headers.Accept = config.headers.Accept ?? 'application/json';

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const authStore = useAuthStore();
      const originalRequest = error.config as
        | RetriableRequestConfig
        | undefined;

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          const refreshed = await authStore.refreshTokens();
          if (refreshed?.access_token) {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${refreshed.access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed', refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};
