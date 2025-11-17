import type { AxiosInstance } from 'axios';

import { useNuxtApp } from '#imports';

export const useApi = (): AxiosInstance => {
  const nuxtApp = useNuxtApp();
  const api = nuxtApp.$api;

  if (!api) {
    throw new Error('API client has not been initialized');
  }

  return api;
};
