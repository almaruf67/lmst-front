// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/image',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  // CSS
  css: [
    '~/assets/css/main.css'
  ],


  // Runtime config
  runtimeConfig: {
    // Public keys (exposed to client-side)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1'
    }
  },

  // App configuration
  app: {
    head: {
      title: 'School Attendance System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'School Attendance Management System with RBAC' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false
  },
})
