import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';
import { unref } from 'vue';

import { useAuthStore } from '~/stores/auth';

declare global {
  interface Window {
    Echo: Echo<any>;
    Pusher: typeof Pusher;
  }
}

declare module '#app' {
  interface NuxtApp {
    $echo?: Echo<any>;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $echo?: Echo<any>;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) {
    return;
  }

  const runtimeConfig = useRuntimeConfig();
  const reverb = runtimeConfig.public.reverb ?? {};

  if (!reverb.key || !reverb.host || !reverb.port) {
    console.warn('Reverb config missing or incomplete', reverb);
    return;
  }

  window.Pusher = Pusher;

  const authStore = useAuthStore();
  const authEndpoint = runtimeConfig.public.broadcastAuthEndpoint;
  const authHeaders = {
    get Authorization() {
      authStore.hydrateFromCookies();
      const token = unref(authStore.accessToken);
      return token ? `Bearer ${token}` : '';
    },
  };

  const echo = new Echo({
    broadcaster: 'reverb',
    key: reverb.key,
    wsHost: reverb.host,
    wsPort: Number(reverb.port) || 80,
    wssPort: Number(reverb.wssPort) || 443,
    forceTLS: (reverb.scheme || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    wsPath: reverb.wsPath || undefined,
    authEndpoint,
    auth: {
      headers: authHeaders,
    },
  });

  window.Echo = echo;
  nuxtApp.provide('echo', echo);
});
