import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  createdAt: number;
}

export interface ToastPayload {
  id?: string;
  title: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

const DEFAULT_DURATION = 5000;

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

export const useNotificationStore = defineStore('notifications', () => {
  const toasts = ref<ToastMessage[]>([]);
  const timeoutMap = new Map<string, ReturnType<typeof setTimeout>>();

  const scheduleRemoval = (id: string, duration: number) => {
    if (!import.meta.client || duration <= 0) {
      return;
    }

    const handle = setTimeout(() => remove(id), duration);
    timeoutMap.set(id, handle);
  };

  const clearTimer = (id: string) => {
    const timer = timeoutMap.get(id);
    if (timer) {
      clearTimeout(timer);
      timeoutMap.delete(id);
    }
  };

  const remove = (id: string) => {
    clearTimer(id);
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  };

  const push = (payload: ToastPayload): string => {
    const id = payload.id ?? generateId();
    const toast: ToastMessage = {
      id,
      title: payload.title,
      message: payload.message,
      variant: payload.variant ?? 'info',
      duration: payload.duration ?? DEFAULT_DURATION,
      createdAt: Date.now(),
    };

    toasts.value = [...toasts.value, toast];

    if (toast.duration > 0) {
      scheduleRemoval(id, toast.duration);
    }

    return id;
  };

  const clear = () => {
    Array.from(timeoutMap.keys()).forEach((id) => clearTimer(id));
    toasts.value = [];
  };

  return {
    toasts,
    push,
    remove,
    clear,
  };
});
