<template>
  <div
    v-if="toasts.length"
    class="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6"
    aria-live="assertive"
  >
    <TransitionGroup
      name="toast"
      tag="div"
      class="flex w-full flex-col items-stretch gap-3 sm:items-end"
    >
      <article
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 shadow-lg shadow-black/5 backdrop-blur"
        :class="variantTone(toast.variant)"
        role="status"
      >
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <p class="text-sm font-semibold">{{ toast.title }}</p>
            <p class="text-sm text-foreground-muted">{{ toast.message }}</p>
          </div>
          <button
            type="button"
            class="text-xs font-semibold uppercase tracking-wide text-foreground-muted transition hover:text-foreground"
            @click="dismiss(toast.id)"
          >
            Close
          </button>
        </div>
      </article>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import { useNotificationStore } from '~/stores/notifications';

const notificationStore = useNotificationStore();
const { toasts } = storeToRefs(notificationStore);

const variantTone = (variant: 'success' | 'info' | 'warning' | 'error') => {
  switch (variant) {
    case 'success':
      return 'border-emerald-300/60 bg-emerald-500/10 text-emerald-900';
    case 'warning':
      return 'border-amber-300/60 bg-amber-100 text-amber-900';
    case 'error':
      return 'border-rose-300/60 bg-rose-100 text-rose-900';
    default:
      return 'border-border bg-surface text-foreground';
  }
};

const dismiss = (id: string) => {
  notificationStore.remove(id);
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
