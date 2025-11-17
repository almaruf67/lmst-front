<template>
  <section class="card-surface flex h-full flex-col border border-border">
    <header class="flex items-center gap-3 border-b border-border px-6 py-4">
      <div class="flex-1">
        <p class="text-xs font-semibold uppercase text-foreground-muted">
          Notifications
        </p>
        <p class="text-lg font-semibold text-foreground">
          {{ unreadCount }} unread
        </p>
      </div>
      <div class="hidden gap-2 text-xs font-semibold sm:flex">
        <span class="rounded-full bg-red-100 px-3 py-1 text-red-700"
          >High: {{ priorityCounts.high }}</span
        >
        <span class="rounded-full bg-amber-100 px-3 py-1 text-amber-800"
          >Medium: {{ priorityCounts.medium }}</span
        >
        <span class="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800"
          >Low: {{ priorityCounts.low }}</span
        >
      </div>
    </header>

    <div class="flex items-center gap-2 px-6 py-3 text-sm">
      <button
        v-for="option in filterOptions"
        :key="option.value"
        type="button"
        class="rounded-full px-3 py-1 font-medium transition-colors"
        :class="
          filter === option.value
            ? 'bg-primary/10 text-primary'
            : 'bg-surface-muted text-foreground-muted'
        "
        @click="filter = option.value"
      >
        {{ option.label }}
      </button>
      <span class="ml-auto text-xs text-foreground-muted">
        {{ selectedIds.length }} selected
      </span>
    </div>

    <div
      v-if="error"
      class="mx-6 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
    >
      {{ error }}
    </div>

    <div class="flex-1 overflow-y-auto px-2">
      <TransitionGroup
        name="notification-item"
        tag="ul"
        class="space-y-3 px-4 py-3"
      >
        <li
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="rounded-2xl border border-border bg-surface px-4 py-3"
        >
          <div class="flex items-start gap-3">
            <input
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
              :checked="selectedIds.includes(notification.id)"
              @change="$emit('toggle-select', notification.id)"
            />
            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2 text-sm font-semibold">
                <span>{{ notification.title }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-xs"
                  :class="priorityVariant(notification.priority)"
                >
                  {{ notification.priority }}
                </span>
                <span
                  v-if="!notification.read_at"
                  class="h-2 w-2 rounded-full bg-primary"
                />
              </div>
              <p class="text-sm text-foreground-muted">
                {{ notification.message }}
              </p>
              <p class="text-xs text-foreground-muted">
                {{ formatTimestamp(notification.created_at) }}
              </p>
              <div
                v-if="notification.context"
                class="text-xs text-foreground-muted"
              >
                <span
                  v-for="(value, key) in notification.context"
                  :key="key"
                  class="mr-2"
                >
                  <span class="font-semibold">{{ key }}:</span> {{ value }}
                </span>
              </div>
            </div>
            <button
              class="text-xs font-semibold text-primary"
              type="button"
              @click="$emit('mark-single', notification.id)"
            >
              Mark read
            </button>
          </div>
        </li>
        <li
          v-if="!loading && !filteredNotifications.length"
          key="empty"
          class="rounded-2xl border border-border bg-surface px-4 py-6 text-center text-sm text-foreground-muted"
        >
          Nothing to review right now.
        </li>
      </TransitionGroup>

      <div
        v-if="loading"
        class="px-4 py-6 text-center text-sm text-foreground-muted"
      >
        Loading notifications…
      </div>
    </div>

    <footer
      class="flex flex-col gap-3 border-t border-border px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex gap-3">
        <button
          type="button"
          class="btn-secondary h-10 px-4 text-sm"
          :disabled="!selectedIds.length"
          @click="$emit('mark-selected')"
        >
          Mark selected
        </button>
        <button
          type="button"
          class="btn-secondary h-10 px-4 text-sm"
          @click="$emit('mark-all')"
        >
          Mark all read
        </button>
      </div>
      <button
        type="button"
        class="btn-primary h-10 px-4 text-sm"
        @click="$emit('refresh')"
      >
        Refresh
      </button>
    </footer>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import type {
  NotificationItem,
  NotificationPriority,
} from '~/stores/notificationFeed';

const props = defineProps<{
  notifications: NotificationItem[];
  loading?: boolean;
  error?: string | null;
  selectedIds: string[];
  unreadCount: number;
  priorityCounts: Record<NotificationPriority, number>;
}>();

defineEmits<{
  (event: 'refresh'): void;
  (event: 'toggle-select', id: string): void;
  (event: 'mark-selected'): void;
  (event: 'mark-all'): void;
  (event: 'mark-single', id: string): void;
}>();

const filter = ref<'all' | 'unread' | 'high'>('all');

const filterOptions = [
  { label: 'All', value: 'all' as const },
  { label: 'Unread', value: 'unread' as const },
  { label: 'High Priority', value: 'high' as const },
];

const filteredNotifications = computed(() => {
  if (filter.value === 'unread') {
    return props.notifications.filter((notification) => !notification.read_at);
  }

  if (filter.value === 'high') {
    return props.notifications.filter(
      (notification) => notification.priority === 'high'
    );
  }

  return props.notifications;
});

const priorityVariant = (priority: NotificationPriority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700';
    case 'medium':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-emerald-100 text-emerald-800';
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString();
};
</script>

<style scoped>
.notification-item-enter-active,
.notification-item-leave-active {
  transition: all 0.15s ease;
}

.notification-item-enter-from,
.notification-item-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
