<template>
  <div class="flex min-h-[60vh] items-center justify-center text-(--color-foreground-muted)">
    Redirecting to dashboard…
  </div>
</template>

<script lang="ts" setup>
const router = useRouter()

onMounted(() => {
  router.replace('/dashboard')
})
</script>