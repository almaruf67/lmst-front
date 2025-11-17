import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useApi } from '~/composables/useApi';
import { useAuthStore, type AuthUser } from '~/stores/auth';

export type ProfileUpdatePayload = {
  name: string;
  email: string;
  phone?: string | null;
  class_name?: string | null;
  section?: string | null;
};

export type PasswordUpdatePayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export const useProfile = () => {
  const api = useApi();
  const authStore = useAuthStore();
  const { profile } = storeToRefs(authStore);
  const loading = ref(false);

  const syncProfile = (user: AuthUser): AuthUser => {
    authStore.setUser(user);
    return user;
  };

  const fetchProfile = async (): Promise<AuthUser> => {
    loading.value = true;
    try {
      const response = await api.get('/profile');
      const data = (response.data?.data ?? response.data) as AuthUser;
      return syncProfile(data);
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (
    payload: ProfileUpdatePayload
  ): Promise<AuthUser> => {
    const response = await api.put('/profile', payload);
    const data = (response.data?.data ?? response.data) as AuthUser;
    return syncProfile(data);
  };

  const updateAvatar = async (avatar: File): Promise<AuthUser> => {
    const formData = new FormData();
    formData.append('avatar', avatar);

    const response = await api.post('/profile/avatar', formData);
    const data = (response.data?.data ?? response.data) as AuthUser;
    return syncProfile(data);
  };

  const updatePassword = async (
    payload: PasswordUpdatePayload
  ): Promise<void> => {
    await api.put('/profile/password', payload);
  };

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile,
    updateAvatar,
    updatePassword,
  };
};
