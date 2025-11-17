<template>
  <Teleport to="body">
    <Transition name="mobile-sidebar">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex"
        aria-modal="true"
        role="dialog"
      >
        <div
          class="flex h-full w-72 max-w-[280px] flex-col border-r border-border bg-card px-2.5 py-4 text-sm text-foreground shadow-2xl"
        >
          <div class="flex items-center justify-between px-2">
            <NuxtLink to="/" class="flex items-center gap-2.5">
              <div
                class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm"
              >
                LM
              </div>
              <span class="text-base font-bold tracking-tight text-foreground"
                >LMST</span
              >
            </NuxtLink>
            <button
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg hover:bg-surface-muted"
              type="button"
              aria-label="Close sidebar"
              @click="$emit('close')"
            >
              ×
            </button>
          </div>

          <nav class="mt-6 flex-1 space-y-1.5">
            <button
              v-for="item in navItems"
              :key="item.to"
              class="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-foreground transition-all duration-200"
              :class="[
                isActive(item.to)
                  ? 'bg-primary/20 text-primary font-semibold shadow-sm'
                  : 'text-foreground-muted hover:bg-surface-muted/70 hover:text-foreground',
              ]"
              @click="handleNavigate(item.to)"
            >
              <span class="text-xl shrink-0" aria-hidden="true">{{
                item.icon
              }}</span>
              <span class="truncate text-sm">{{ item.label }}</span>
            </button>
          </nav>
        </div>
        <div class="flex-1" @click="$emit('close')" aria-hidden="true"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { resolveSidebarNavItems } from './sidebarItems';
import { useAuthStore } from '~/stores/auth';

const { open } = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const authStore = useAuthStore();
const { profile } = storeToRefs(authStore);

const navItems = computed(() =>
  resolveSidebarNavItems(profile.value?.user_type ?? null)
);

const router = useRouter();
const route = useRoute();

const isActive = (to: string) => route.path.startsWith(to);

const handleNavigate = (to: string) => {
  router.push(to);
  emit('close');
};
</script>

<style scoped>
.mobile-sidebar-enter-active,
.mobile-sidebar-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.mobile-sidebar-enter-from,
.mobile-sidebar-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>
