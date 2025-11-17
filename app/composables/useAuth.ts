import { ref } from 'vue';

import { useRouter } from '#imports';
import { isAxiosError } from 'axios';

import type { AuthSessionPayload, AuthUser } from '~/stores/auth';
import { useAuthStore } from '~/stores/auth';

import { useApi } from './useApi';

export interface LoginCredentials {
  email: string;
  password: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

interface LogoutOptions {
  redirectTo?: string | null;
}

export const useAuth = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const api = useApi();

  const loading = ref(false);
  const errorMessage = ref<string | null>(null);

  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthSessionPayload> => {
    loading.value = true;
    errorMessage.value = null;

    try {
      const response = await api.post('/login', credentials);
      const payload = (response.data?.data ??
        response.data) as AuthSessionPayload;
      authStore.setSession(payload);
      return payload;
    } catch (error) {
      errorMessage.value = resolveErrorMessage(error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const logout = async (options: LogoutOptions = {}) => {
    try {
      if (authStore.accessToken) {
        await api.post('/logout');
      }
    } catch (error) {
      console.warn('Failed to revoke tokens on logout', error);
    } finally {
      authStore.clearSession();
      const redirectTarget = options.redirectTo ?? '/login';
      if (redirectTarget !== null) {
        await router.push(redirectTarget);
      }
    }
  };

  const loadProfile = async (): Promise<AuthUser | null> => {
    try {
      return await authStore.fetchCurrentUser();
    } catch (error) {
      errorMessage.value = resolveErrorMessage(error);
      throw error;
    }
  };

  const ensureSession = async () => authStore.ensureSession();
  const refresh = async () => authStore.refreshTokens();

  return {
    loading,
    errorMessage,
    login,
    logout,
    loadProfile,
    ensureSession,
    refresh,
  };
};

const resolveErrorMessage = (error: unknown): string => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const responseMessage = error.response?.data?.message;
    if (responseMessage) {
      return responseMessage;
    }

    const validationErrors = error.response?.data?.errors;
    if (validationErrors) {
      const firstEntry = Object.values(validationErrors)[0];
      if (firstEntry?.length) {
        return firstEntry[0] ?? 'Validation error';
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to complete the request';
};
