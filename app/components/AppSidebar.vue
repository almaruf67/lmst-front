<template>
  <aside
    v-show="isDesktop"
    :class="[
      'h-screen border-r border-border bg-card text-sm font-medium text-foreground transition-all duration-300',
      collapsed ? 'w-20' : 'w-72',
    ]"
  >
    <div
      class="flex items-center justify-center gap-3 border-b px-4 py-3.5 lg:px-5"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <div
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm"
        >
          LM
        </div>
        <span
          v-if="!collapsed"
          class="text-base font-bold tracking-tight text-foreground"
          >LMST</span
        >
      </NuxtLink>
    </div>

    <nav class="mt-4 flex-1 space-y-1.5 px-2.5 lg:px-3">
      <button
        v-for="item in navItems"
        :key="item.to"
        class="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200"
        :class="[
          isActive(item.to)
            ? 'bg-primary/20 text-primary font-semibold shadow-sm'
            : 'text-foreground-muted hover:bg-surface-muted/70 hover:text-foreground',
          collapsed ? 'justify-center' : '',
        ]"
        @click="navigate(item.to)"
      >
        <span class="text-xl shrink-0" aria-hidden="true">{{ item.icon }}</span>
        <span v-if="!collapsed" class="truncate text-sm">{{ item.label }}</span>
      </button>
    </nav>

    <div class="border-t border-border px-2.5 py-4 lg:px-3">
      <button
        class="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground transition-colors duration-200"
        :class="collapsed ? 'justify-center' : ''"
        @click="$emit('toggle')"
      >
        <span class="text-xl shrink-0" aria-hidden="true">
          {{ collapsed ? '›' : '‹' }}
        </span>
        <span v-if="!collapsed">Collapse</span>
      </button>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { sidebarNavItems } from './sidebarItems';

const props = defineProps<{ collapsed: boolean; isDesktop: boolean }>();
defineEmits<{ (e: 'toggle'): void }>();

const navItems = sidebarNavItems;
const router = useRouter();
const route = useRoute();

const navigate = (to: string) => {
  router.push(to);
};

const isActive = (to: string) => {
  return route.path.startsWith(to);
};
</script>
