<template>
  <section class="w-full">
    <div class="mb-10 space-y-3 text-center">
      <p class="text-xs font-semibold uppercase tracking-[0.5em] text-primary">
        LMST ACCESS
      </p>
      <h1 class="text-3xl font-bold text-foreground">Sign in to continue</h1>
      <p class="text-sm text-foreground-muted">
        Enter the credentials issued by your administrator to manage attendance,
        students, and analytics.
      </p>
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <label for="email" class="text-sm font-medium text-foreground"
          >Email</label
        >
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="teacher@school.edu"
          class="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <label for="password" class="font-medium text-foreground"
            >Password</label
          >
          <span class="text-xs font-medium text-primary/80"
            >Forgot? Contact admin.</span
          >
        </div>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          minlength="6"
          placeholder="••••••••"
          class="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div
        v-if="errorMessage"
        class="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {{ errorMessage }}
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span
          v-if="loading"
          class="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        ></span>
        {{ loading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <p class="mt-8 text-center text-xs text-foreground-muted">
      Need access? Contact your school administrator to enable your LMST
      account.
    </p>
  </section>
</template>

<script lang="ts" setup>
import { useAuth } from '~/composables/useAuth';

definePageMeta({ layout: 'auth' });

const router = useRouter();
const { login, loading, errorMessage } = useAuth();

const form = reactive({
  email: '',
  password: '',
});

const handleSubmit = async () => {
  if (loading.value) {
    return;
  }

  try {
    await login({ ...form });
    await router.push('/dashboard');
  } catch (error) {
    console.error('Login failed', error);
  }
};
</script>
