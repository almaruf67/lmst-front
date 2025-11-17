<template>
  <div class="flex min-h-screen bg-surface-muted text-foreground">
    <AppSidebarMobile :open="isMobileSidebarOpen" @close="closeMobileSidebar" />
    <AppSidebar
      :collapsed="isSidebarCollapsed"
      :is-desktop="isDesktop"
      @toggle="toggleSidebar"
    />
    <div class="flex flex-1 flex-col transition-all duration-300">
      <AppHeader
        :collapsed="isSidebarCollapsed"
        :color-mode="colorMode"
        @toggle-sidebar="toggleSidebar"
        @toggle-theme="toggleTheme"
        @logout="handleLogout"
      />
      <main class="flex-1 overflow-y-auto bg-surface px-4 py-6 lg:px-8 lg:py-8">
        <div class="mx-auto max-w-7xl">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from '~/composables/useAuth';

const isSidebarCollapsed = ref(true);
const isMobileSidebarOpen = ref(false);
const colorMode = useState<'light' | 'dark'>('color-mode', () => 'light');
const isDesktop = ref(true);
const { logout } = useAuth();

const updateIsDesktop = () => {
  if (!import.meta.client) {
    return;
  }

  isDesktop.value = window.matchMedia('(min-width: 1024px)').matches;
};

if (import.meta.client) {
  updateIsDesktop();
}

onMounted(() => {
  if (!import.meta.client) {
    return;
  }

  window.addEventListener('resize', updateIsDesktop);
});

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return;
  }

  window.removeEventListener('resize', updateIsDesktop);
});

watch(isDesktop, (desktop) => {
  if (desktop) {
    isMobileSidebarOpen.value = false;
  } else {
    isSidebarCollapsed.value = true;
  }
});

const toggleSidebar = () => {
  if (isDesktop.value) {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  } else {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
  }
};

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false;
};

const toggleTheme = () => {
  colorMode.value = colorMode.value === 'light' ? 'dark' : 'light';
};

const handleLogout = async () => {
  await logout();
};
</script>
