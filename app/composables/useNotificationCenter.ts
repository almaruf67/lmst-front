import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import {
  useNotificationFeedStore,
  type NotificationItem,
  type NotificationPriority,
} from '~/stores/notificationFeed';

export const useNotificationCenter = () => {
  const feedStore = useNotificationFeedStore();
  const { notifications, loading, error, unreadCount, priorityCounts } =
    storeToRefs(feedStore);

  const selected = ref<Set<string>>(new Set());

  const selectedIds = computed(() => Array.from(selected.value));

  const toggleSelection = (id: string) => {
    const draft = new Set(selected.value);
    if (draft.has(id)) {
      draft.delete(id);
    } else {
      draft.add(id);
    }
    selected.value = draft;
  };

  const clearSelection = () => {
    selected.value = new Set();
  };

  const fetchNotifications = async () => {
    await feedStore.fetchNotifications();
  };

  const markSelectedAsRead = async () => {
    const ids = selectedIds.value;
    if (!ids.length) {
      return;
    }

    await feedStore.markSelectedAsRead(ids);
    clearSelection();
  };

  const markAllAsRead = async () => {
    await feedStore.markAllAsRead();
    clearSelection();
  };

  const markNotificationAsRead = async (id: string) => {
    await feedStore.markNotificationAsRead(id);
    const draft = new Set(selected.value);
    draft.delete(id);
    selected.value = draft;
  };

  onMounted(() => {
    feedStore.initialize();
  });

  return {
    notifications,
    loading,
    error,
    unreadCount,
    priorityCounts,
    selectedIds,
    toggleSelection,
    clearSelection,
    fetchNotifications,
    markSelectedAsRead,
    markAllAsRead,
    markNotificationAsRead,
  };
};
