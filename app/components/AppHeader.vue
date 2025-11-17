<template>
  <header
    class="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur shadow-sm"
  >
    <div class="flex items-center justify-between px-4 py-3.5 lg:px-8">
      <div class="flex items-center gap-4">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-lg font-semibold hover:bg-surface-muted transition-colors duration-200"
          @click="emit('toggle-sidebar')"
          :aria-label="collapsed ? 'Open sidebar' : 'Close sidebar'"
        >
          ☰
        </button>
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wider text-foreground-muted"
          >
            {{ pageTitle }}
          </p>
          <h1 class="text-base font-bold leading-tight text-foreground">
            School Attendance
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-2 lg:gap-4">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-base hover:bg-surface-muted transition-colors duration-200"
          @click="emit('toggle-theme')"
        >
          {{ colorMode === 'dark' ? '🌙' : '☀️' }}
        </button>
        <div ref="notificationMenuAnchor" class="relative">
          <button
            class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-base font-semibold transition-colors duration-200 hover:bg-surface-muted"
            type="button"
            @click.stop="toggleNotifications"
            :aria-expanded="showNotifications"
            aria-label="Notifications"
          >
            🔔
            <span
              v-if="notificationBadge"
              class="absolute -top-1 -right-1 inline-flex min-w-[1.4rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white"
            >
              {{ notificationBadge }}
            </span>
          </button>
          <div
            v-if="showNotifications"
            class="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card shadow-lg shadow-black/20"
          >
            <div
              class="flex items-center justify-between border-b border-border px-4 py-3"
            >
              <div>
                <p class="text-xs uppercase text-foreground-muted">
                  Notifications
                </p>
                <p class="text-sm font-semibold text-foreground">
                  Recent activity
                </p>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-primary disabled:opacity-40"
                :disabled="!feedUnreadCount"
                @click="markAllHeaderNotifications"
              >
                Mark all
              </button>
            </div>
            <div class="max-h-80 divide-y divide-border/60 overflow-y-auto">
              <div
                v-if="notificationsError"
                class="px-4 py-3 text-xs text-destructive"
              >
                {{ notificationsError }}
              </div>
              <div
                v-else-if="notificationsLoading"
                class="px-4 py-4 text-sm text-foreground-muted"
              >
                Loading...
              </div>
              <template v-else>
                <ul
                  v-if="recentNotifications.length"
                  class="divide-y divide-border/60"
                >
                  <li
                    v-for="notification in recentNotifications"
                    :key="notification.id"
                    class="px-4 py-3"
                  >
                    <div class="flex items-start gap-3">
                      <div class="flex-1">
                        <p class="text-sm font-semibold text-foreground">
                          {{ notification.title }}
                          <span
                            v-if="!notification.read_at"
                            class="ml-2 inline-block h-2 w-2 rounded-full bg-primary"
                          />
                        </p>
                        <p class="text-xs text-foreground-muted">
                          {{ notification.message }}
                        </p>
                        <p class="text-[11px] text-foreground-muted">
                          {{ formatTimestamp(notification.created_at) }}
                        </p>
                      </div>
                      <button
                        v-if="!notification.read_at"
                        class="text-xs font-semibold text-primary"
                        type="button"
                        @click="markHeaderNotification(notification.id)"
                      >
                        Mark
                      </button>
                    </div>
                  </li>
                </ul>
                <div
                  v-else
                  class="px-4 py-6 text-center text-sm text-foreground-muted"
                >
                  You’re all caught up.
                </div>
              </template>
            </div>
          </div>
        </div>
        <div ref="userMenuAnchor" class="relative">
          <button
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary font-semibold transition duration-200 hover:bg-primary/30"
            @click.stop="toggleMenu"
            type="button"
          >
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              alt="User avatar"
              class="h-10 w-10 rounded-full object-cover"
            />
            <span v-else class="text-sm font-semibold uppercase">
              {{ initials || 'LM' }}
            </span>
          </button>
          <div
            v-if="showMenu"
            class="absolute right-0 mt-2 w-40 rounded-2xl border border-border bg-card py-1 text-sm shadow-lg shadow-black/20"
          >
            <div class="border-b border-border px-4 py-3 text-left">
              <p class="text-sm font-semibold text-foreground">
                {{ userName }}
              </p>
              <p v-if="userEmail" class="text-[11px] text-foreground-muted">
                {{ userEmail }}
              </p>
            </div>
            <NuxtLink
              to="/profile"
              class="block px-4 py-2 text-foreground hover:bg-surface-muted"
              @click="closeMenu"
            >
              Profile
            </NuxtLink>
            <button
              class="flex w-full items-center gap-2 px-4 py-2 text-left text-foreground-muted hover:bg-surface-muted"
              type="button"
              @click="handleLogout"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import { useAuthStore } from '~/stores/auth';
import { useNotificationFeedStore } from '~/stores/notificationFeed';

defineProps<{
  collapsed: boolean;
  colorMode: 'light' | 'dark';
}>();
const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
  (e: 'toggle-theme'): void;
  (e: 'logout'): void;
}>();
const showMenu = ref(false);
const showNotifications = ref(false);
const userMenuAnchor = ref<HTMLElement | null>(null);
const notificationMenuAnchor = ref<HTMLElement | null>(null);

const route = useRoute();
const authStore = useAuthStore();
const { avatarUrl, initials, profile } = storeToRefs(authStore);
const notificationFeed = useNotificationFeedStore();
const {
  recentNotifications,
  unreadCount: feedUnreadCount,
  loading: notificationsLoading,
  error: notificationsError,
} = storeToRefs(notificationFeed);
const userName = computed(() => profile.value?.name ?? 'Account');
const userEmail = computed(() => profile.value?.email ?? '');
const pageTitle = computed(() => {
  if (route.path.startsWith('/students')) return 'Roster';
  if (route.path.startsWith('/attendance')) return 'Attendance';
  if (route.path.startsWith('/dashboard')) return 'Overview';
  return 'Dashboard';
});

const notificationBadge = computed(() => {
  const count = feedUnreadCount.value;
  if (!count) {
    return '';
  }

  if (count > 99) {
    return '99+';
  }

  return String(count);
});

const toggleMenu = () => {
  showNotifications.value = false;
  showMenu.value = !showMenu.value;
};

const closeMenu = () => {
  showMenu.value = false;
};

const toggleNotifications = () => {
  showMenu.value = false;
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    notificationFeed.initialize();
  }
};

const closeNotifications = () => {
  showNotifications.value = false;
};

const handleLogout = () => {
  closeMenu();
  emit('logout');
};

const markHeaderNotification = async (id: string) => {
  await notificationFeed.markNotificationAsRead(id);
};

const markAllHeaderNotifications = async () => {
  await notificationFeed.markAllAsRead();
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleDocumentClick = (event: Event) => {
  const target = event.target as Node | null;
  if (
    showMenu.value &&
    userMenuAnchor.value &&
    !userMenuAnchor.value.contains(target)
  ) {
    closeMenu();
  }

  if (
    showNotifications.value &&
    notificationMenuAnchor.value &&
    !notificationMenuAnchor.value.contains(target)
  ) {
    closeNotifications();
  }
};

onMounted(() => {
  notificationFeed.initialize();
  document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>
