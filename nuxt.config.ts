// https://nuxt.com/docs/api/configuration/nuxt-config
const defaultApiBase =
  process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1';
const apiOrigin = defaultApiBase.replace(/\/?api\/v\d+$/i, '');
const broadcastAuthEndpoint =
  process.env.NUXT_PUBLIC_BROADCAST_AUTH_ENDPOINT ||
  `${apiOrigin.replace(/\/$/, '')}/api/broadcasting/auth`;

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/image', '@pinia/nuxt', '@nuxtjs/tailwindcss'],

  // CSS
  css: ['~/assets/css/main.css'],

  // Runtime config
  runtimeConfig: {
    // Public keys (exposed to client-side)
    public: {
      apiBase: defaultApiBase,
      assetBase: process.env.NUXT_PUBLIC_ASSET_BASE || 'http://localhost:8000',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'ws://localhost:6001',
      broadcastAuthEndpoint,
      reverb: {
        host: process.env.NUXT_PUBLIC_REVERB_HOST || '127.0.0.1',
        port: Number(process.env.NUXT_PUBLIC_REVERB_PORT) || 8080,
        wssPort: Number(process.env.NUXT_PUBLIC_REVERB_WSS_PORT) || 443,
        key: process.env.NUXT_PUBLIC_REVERB_KEY || 'local-key',
        scheme: process.env.NUXT_PUBLIC_REVERB_SCHEME || 'http',
        wsPath: process.env.NUXT_PUBLIC_REVERB_WS_PATH || '',
      },
    },
  },

  // App configuration
  app: {
    head: {
      title: 'School Attendance System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'School Attendance Management System with RBAC',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false,
  },
});
