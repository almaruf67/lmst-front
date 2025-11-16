import { useCookie, useRuntimeConfig } from '#imports';
import axios, { type AxiosResponse } from 'axios';
import { defineStore } from 'pinia';

const STORAGE_PREFIX = 'lmst_';
const ACCESS_COOKIE = `${STORAGE_PREFIX}access_token`;
const REFRESH_COOKIE = `${STORAGE_PREFIX}refresh_token`;
const USER_CACHE_KEY = `${STORAGE_PREFIX}user`;
const isSecureCookie = import.meta.env.PROD;

const cookieOptions = {
  sameSite: 'lax' as const,
  secure: isSecureCookie,
  path: '/',
};

type Nullable<T> = T | null;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  user_type?: string;
  phone?: string | null;
  class_name?: string | null;
  section?: string | null;
  photo_url?: string | null;
  profile_photo_url?: string | null;
  avatar_url?: string | null;
  image_path?: string | null;
  [key: string]: unknown;
}

export interface AuthSessionPayload {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
  user: AuthUser;
}

export const useAuthStore = defineStore('auth', () => {
  const runtimeConfig = useRuntimeConfig();
  const baseURL = runtimeConfig.public.apiBase.replace(/\/$/, '');

  const accessCookie = useCookie<Nullable<string>>(ACCESS_COOKIE, {
    ...cookieOptions,
    maxAge: 60 * 60, // 1 hour access token window
  });

  const refreshCookie = useCookie<Nullable<string>>(REFRESH_COOKIE, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30, // 30 days refresh window
  });

  const accessToken = ref<Nullable<string>>(null);
  const refreshToken = ref<Nullable<string>>(null);
  const profile = ref<Nullable<AuthUser>>(null);
  const sessionExpiresAt = ref<Nullable<number>>(null);
  const loadingProfile = ref(false);
  const hydrated = ref(false);

  const hydrateFromCookies = () => {
    if (hydrated.value) {
      return;
    }

    accessToken.value = accessCookie.value ?? null;
    refreshToken.value = refreshCookie.value ?? null;

    if (process.client) {
      try {
        const cached = localStorage.getItem(USER_CACHE_KEY);
        if (cached) {
          profile.value = JSON.parse(cached);
        }
      } catch (error) {
        console.warn('Failed to parse cached user data', error);
      }
    }

    hydrated.value = true;
  };

  hydrateFromCookies();

  const persistUser = (payload: Nullable<AuthUser>) => {
    if (!process.client) {
      return;
    }

    if (payload) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  };

  const setUser = (payload: Nullable<AuthUser>) => {
    profile.value = payload;
    persistUser(payload);
  };

  const setSession = (payload: AuthSessionPayload) => {
    accessToken.value = payload.access_token;
    refreshToken.value = payload.refresh_token;

    accessCookie.value = payload.access_token;
    refreshCookie.value = payload.refresh_token;

    sessionExpiresAt.value = payload.expires_in
      ? Date.now() + payload.expires_in * 1000
      : null;

    setUser(payload.user);
  };

  const clearSession = () => {
    accessToken.value = null;
    refreshToken.value = null;
    sessionExpiresAt.value = null;

    accessCookie.value = null;
    refreshCookie.value = null;

    setUser(null);
  };

  const fetchCurrentUser = async (): Promise<AuthUser | null> => {
    hydrateFromCookies();

    if (!accessToken.value || loadingProfile.value) {
      return profile.value;
    }

    try {
      loadingProfile.value = true;
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };

      if (accessToken.value) {
        headers.Authorization = `Bearer ${accessToken.value}`;
      }

      const response = await axios.get(`${baseURL}/me`, { headers });
      const data = (response.data?.data ?? response.data) as AuthUser;
      setUser(data);
      return data;
    } catch (error) {
      clearSession();
      throw error;
    } finally {
      loadingProfile.value = false;
    }
  };

  const refreshTokens = async (): Promise<AuthSessionPayload | null> => {
    hydrateFromCookies();

    if (!refreshToken.value) {
      clearSession();
      return null;
    }

    try {
      const response: AxiosResponse = await axios.post(`${baseURL}/refresh`, {
        refresh_token: refreshToken.value,
      });

      const payload = (response.data?.data ??
        response.data) as AuthSessionPayload;
      setSession(payload);

      return payload;
    } catch (error) {
      clearSession();
      throw error;
    }
  };

  const ensureSession = async () => {
    hydrateFromCookies();

    if (!accessToken.value) {
      return false;
    }

    if (!profile.value && !loadingProfile.value) {
      try {
        await fetchCurrentUser();
      } catch (error) {
        console.error('Failed to hydrate user profile', error);
        clearSession();
        return false;
      }
    }

    return true;
  };

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  const avatarUrl = computed(() => {
    const imageCandidate =
      profile.value?.avatar_url ??
      profile.value?.profile_photo_url ??
      profile.value?.photo_url ??
      profile.value?.image_path;

    if (!imageCandidate) {
      return null;
    }

    if (/^https?:\/\//i.test(imageCandidate)) {
      return imageCandidate;
    }

    // Attempt to build absolute URL relative to API host
    try {
      const apiUrl = new URL(baseURL);
      const normalizedPath = imageCandidate.startsWith('/')
        ? imageCandidate.slice(1)
        : imageCandidate;
      return `${apiUrl.origin}/${normalizedPath}`;
    } catch {
      return imageCandidate;
    }
  });

  const initials = computed(() => {
    if (!profile.value?.name) {
      return 'LM';
    }

    return profile.value.name
      .split(' ')
      .filter(Boolean)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  });

  return {
    accessToken,
    refreshToken,
    profile,
    avatarUrl,
    initials,
    isAuthenticated,
    loadingProfile,
    sessionExpiresAt,
    hydrateFromCookies,
    setSession,
    setUser,
    clearSession,
    refreshTokens,
    ensureSession,
    fetchCurrentUser,
  };
});
