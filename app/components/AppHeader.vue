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
        <div
          class="hidden items-center gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground-muted lg:flex"
        >
          <span class="text-base">🔍</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search..."
            class="bg-transparent w-32 focus:outline-none placeholder:text-foreground-muted"
          />
        </div>
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-base hover:bg-surface-muted transition-colors duration-200"
          @click="emit('toggle-theme')"
        >
          {{ colorMode === 'dark' ? '🌙' : '☀️' }}
        </button>
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

const props = defineProps<{
  collapsed: boolean;
  colorMode: 'light' | 'dark';
}>();
const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
  (e: 'toggle-theme'): void;
  (e: 'search', term: string): void;
  (e: 'logout'): void;
}>();
const searchQuery = ref('');
const showMenu = ref(false);
const userMenuAnchor = ref<HTMLElement | null>(null);

const route = useRoute();
const authStore = useAuthStore();
const { avatarUrl, initials, profile } = storeToRefs(authStore);
const userName = computed(() => profile.value?.name ?? 'Account');
const userEmail = computed(() => profile.value?.email ?? '');
const pageTitle = computed(() => {
  if (route.path.startsWith('/students')) return 'Roster';
  if (route.path.startsWith('/attendance')) return 'Attendance';
  if (route.path.startsWith('/dashboard')) return 'Overview';
  return 'Dashboard';
});

watch(searchQuery, (value) => {
  emit('search', value.trim());
});

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const closeMenu = () => {
  showMenu.value = false;
};

const handleLogout = () => {
  closeMenu();
  emit('logout');
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
};

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>
