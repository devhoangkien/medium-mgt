// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  runtimeConfig: {
    // Private keys (server-side only)
    jwtSecret: process.env.JWT_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,

    // Public keys (exposed to client)
    public: {
      appName: 'Medium Bot Manager',
    }
  },

  app: {
    head: {
      title: 'Medium Bot Manager',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Manage and automate Medium posting across multiple accounts' },
      ],
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
    },
  },

  compatibilityDate: '2024-01-01',
})
