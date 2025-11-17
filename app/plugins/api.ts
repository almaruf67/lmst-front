import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { defineNuxtPlugin, navigateTo, useRuntimeConfig } from '#imports';
import { unref } from 'vue';

import { resolveApiErrorMessage } from '~/utils/http';
import { useAuthStore } from '~/stores/auth';
import { useNotificationStore } from '~/stores/notifications';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, '');

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = normalizeBaseUrl(runtimeConfig.public.apiBase);

  const api: AxiosInstance = axios.create({
    baseURL,
    timeout: 20000,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    authStore.hydrateFromCookies();
    const token = unref(authStore.accessToken);

    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (!isFormData) {
      config.headers['Content-Type'] =
        config.headers['Content-Type'] ?? 'application/json';
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const authStore = useAuthStore();
      const notificationStore = useNotificationStore();
      const status = error.response?.status;
      const originalRequest = error.config as
        | RetriableRequestConfig
        | undefined;

      if (status === 401 && originalRequest && !originalRequest._retry) {
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

      if (status === 401) {
        authStore.clearSession();
        notificationStore.push({
          variant: 'warning',
          title: 'Session expired',
          message: 'Please sign in again to continue.',
        });

        if (import.meta.client) {
          await navigateTo('/login');
        }

        return Promise.reject(error);
      }

      const shouldSurfaceError = !status || status >= 500;
      if (shouldSurfaceError) {
        const message = resolveApiErrorMessage(
          error,
          'Unexpected error while contacting the server'
        );
        notificationStore.push({
          variant: 'error',
          title: 'Request failed',
          message,
        });
      }

      return Promise.reject(error);
    }
  );

  return {
    provide: {
      api,
    },
  };
});
