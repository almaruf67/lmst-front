<template>
  <section
    class="card-surface mb-6 flex flex-col gap-6 border border-border rounded-lg px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-6 shadow-sm"
  >
    <div class="space-y-1">
      <p
        class="text-xs font-bold uppercase tracking-widest text-foreground-muted"
      >
        {{ eyebrow }}
      </p>
      <h2 class="text-2xl font-bold leading-tight text-foreground">
        {{ title }}
      </h2>
      <p class="text-sm text-foreground-muted mt-1">{{ description }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2 lg:gap-3">
      <slot name="filters" />
      <slot name="actions" />
    </div>
  </section>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{ title: string; description?: string; eyebrow?: string }>(),
  {
    description: '',
    eyebrow: 'Dashboard',
  }
);
</script>
