<template>
  <div
    :class="[
      'min-h-screen w-full bg-(--color-surface) text-(--color-foreground)',
      colorMode,
    ]"
  >
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="oklch(0.72 0.13 262)" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastStack />
  </div>
</template>

<script lang="ts" setup>
const colorMode = useState<'light' | 'dark'>('color-mode', () => 'light');

const syncDocumentClass = (mode: 'light' | 'dark') => {
  if (!import.meta.client) {
    return;
  }

  document.documentElement.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('lmst-color-mode', mode);
};

onMounted(() => {
  if (!import.meta.client) {
    return;
  }
  const stored = localStorage.getItem('lmst-color-mode');
  if (stored === 'dark' || stored === 'light') {
    colorMode.value = stored;
  }
  syncDocumentClass(colorMode.value);
});

watch(colorMode, (mode) => {
  syncDocumentClass(mode);
});
</script>
