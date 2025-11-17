import { navigateTo } from '#imports';

import { useAuthStore } from '~/stores/auth';

const PUBLIC_ROUTES = new Set(['/login']);

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  authStore.hydrateFromCookies();

  const hasSession = Boolean(authStore.accessToken);
  const isPublic = PUBLIC_ROUTES.has(to.path);

  if (!hasSession && !isPublic) {
    return navigateTo('/login');
  }

  if (hasSession && isPublic) {
    return navigateTo('/dashboard');
  }

  if (hasSession) {
    const ok = await authStore.ensureSession();
    if (!ok) {
      return navigateTo('/login');
    }
  }
});
