import { computed, ref, watch } from 'vue';
import { useNuxtApp } from '#imports';
import { defineStore } from 'pinia';

import { useApi } from '~/composables/useApi';
import { useAuthStore } from '~/stores/auth';
import { useNotificationStore } from '~/stores/notifications';
import { resolveApiErrorMessage } from '~/utils/http';

export type NotificationAudience = 'admin' | 'teacher';

export type NotificationPriority = 'high' | 'medium' | 'low';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read_at?: string | null;
  priority: NotificationPriority;
  audience: NotificationAudience;
  type?: string | null;
  context?: Record<string, unknown> | null;
};

const FALLBACK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'seed-1',
    title: 'Attendance Recorded',
    message: 'Class 5A submitted attendance for today.',
    created_at: new Date().toISOString(),
    priority: 'high',
    audience: 'teacher',
    context: { class_name: '5', section: 'A' },
  },
  {
    id: 'seed-2',
    title: 'Report Ready',
    message: 'The monthly attendance report finished exporting.',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    priority: 'medium',
    audience: 'admin',
    context: null,
  },
];

const resolvePriority = (
  payload: Record<string, unknown>
): NotificationPriority => {
  const normalized = String(payload.priority ?? '').toLowerCase();
  if (
    normalized === 'high' ||
    normalized === 'medium' ||
    normalized === 'low'
  ) {
    return normalized;
  }

  if ((payload.context as Record<string, unknown> | undefined)?.urgent) {
    return 'high';
  }

  return 'low';
};

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `notification-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2, 10)}`;
};

const normalizeNotification = (
  record: Record<string, unknown>
): NotificationItem => ({
  id: String(record.id ?? generateId()),
  title: String(record.title ?? 'Notification'),
  message: String(record.message ?? ''),
  created_at: String(record.created_at ?? new Date().toISOString()),
  read_at: (record.read_at as string | undefined | null) ?? null,
  priority: resolvePriority(record),
  audience:
    String(
      (record.audience as string | undefined) ?? 'teacher'
    ).toLowerCase() === 'admin'
      ? 'admin'
      : 'teacher',
  type: (record.type as string | undefined) ?? null,
  context: (record.context as Record<string, unknown> | undefined) ?? null,
});

const extractRecords = (input: unknown): Record<string, unknown>[] => {
  if (
    input &&
    typeof input === 'object' &&
    Array.isArray((input as { data?: unknown[] }).data)
  ) {
    return (input as { data: unknown[] }).data as Record<string, unknown>[];
  }

  if (Array.isArray(input)) {
    return input as Record<string, unknown>[];
  }

  return [];
};

export const useNotificationFeedStore = defineStore('notification-feed', () => {
  const api = useApi();
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore();
  const toastStore = useNotificationStore();

  const notifications = ref<NotificationItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);
  const activeChannel = ref<string | null>(null);

  const prioritize = (records: NotificationItem[]): NotificationItem[] =>
    [...records].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const setNotifications = (records: NotificationItem[]): void => {
    notifications.value = prioritize(records).slice(0, 50);
  };

  const upsertNotification = (record: NotificationItem): void => {
    const deduped = notifications.value.filter((item) => item.id !== record.id);
    notifications.value = [record, ...deduped].slice(0, 50);
  };

  const fetchNotifications = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await api.get('/notifications', {
        params: { per_page: 25 },
      });

      const payload = response.data?.data ?? response.data;
      const data = extractRecords(payload);

      if (data.length) {
        setNotifications(
          data.map((item) =>
            normalizeNotification(item as Record<string, unknown>)
          )
        );
      } else if (!notifications.value.length) {
        setNotifications([...FALLBACK_NOTIFICATIONS]);
      }
    } catch (cause) {
      error.value = resolveApiErrorMessage(
        cause,
        'Unable to load notifications'
      );
      console.error('Failed to load notifications', cause);

      if (!notifications.value.length) {
        setNotifications([...FALLBACK_NOTIFICATIONS]);
      }
    } finally {
      loading.value = false;
      initialized.value = true;
    }
  };

  const markNotificationAsRead = async (id: string): Promise<void> => {
    try {
      await api.post(`/notifications/${id}/read`);
    } catch (cause) {
      console.warn('Failed to mark notification as read', cause);
      toastStore.push({
        variant: 'warning',
        title: 'Unable to reach notifications API',
        message: resolveApiErrorMessage(cause, 'Marking locally for now.'),
      });
    } finally {
      notifications.value = notifications.value.map((notification) =>
        notification.id === id
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      );
    }
  };

  const markSelectedAsRead = async (ids: string[]): Promise<void> => {
    if (!ids.length) {
      return;
    }

    try {
      await api.post('/notifications/read', { ids });
    } catch (cause) {
      console.warn('Failed to mark selected notifications as read', cause);
      toastStore.push({
        variant: 'warning',
        title: 'Unable to reach notifications API',
        message: resolveApiErrorMessage(cause, 'Marking locally for now.'),
      });
    } finally {
      notifications.value = notifications.value.map((notification) =>
        ids.includes(notification.id)
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      );
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      await api.post('/notifications/mark-all-read');
    } catch (cause) {
      console.warn('Failed to mark all notifications as read', cause);
    } finally {
      notifications.value = notifications.value.map((notification) => ({
        ...notification,
        read_at: notification.read_at ?? new Date().toISOString(),
      }));
    }
  };

  const unreadCount = computed(
    () =>
      notifications.value.filter((notification) => !notification.read_at).length
  );

  const priorityCounts = computed(() =>
    notifications.value.reduce(
      (acc, notification) => {
        acc[notification.priority] = (acc[notification.priority] ?? 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 } as Record<NotificationPriority, number>
    )
  );

  const recentNotifications = computed(() => notifications.value.slice(0, 5));

  const tearDownChannel = () => {
    if (!activeChannel.value || !nuxtApp.$echo) {
      return;
    }

    nuxtApp.$echo.leave(activeChannel.value);
    activeChannel.value = null;
  };

  const subscribeToRealtime = () => {
    if (!import.meta.client) {
      return;
    }

    const userId = authStore.profile?.id;
    if (!userId || !nuxtApp.$echo) {
      tearDownChannel();
      return;
    }

    const channelName = `notifications.user.${userId}`;
    if (channelName === activeChannel.value) {
      return;
    }

    tearDownChannel();

    activeChannel.value = channelName;
    nuxtApp.$echo
      .private(channelName)
      .listen('.NotificationCreated', (payload: Record<string, unknown>) => {
        upsertNotification(normalizeNotification(payload));
      });
  };

  watch(
    () => authStore.profile?.id,
    () => {
      if (!process.client) {
        return;
      }

      subscribeToRealtime();
    },
    { immediate: true }
  );

  const initialize = async () => {
    if (!initialized.value) {
      await fetchNotifications();
    }
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    priorityCounts,
    recentNotifications,
    initialize,
    fetchNotifications,
    markNotificationAsRead,
    markSelectedAsRead,
    markAllAsRead,
    upsertNotification,
  };
});
