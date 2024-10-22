// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  app: {
    head: {
      title: 'Anime Ringtone Converter',
      meta: [
        { name: 'description', content: 'Convert anime intros to iPhone ringtones' }
      ]
    }
  },
  nitro: {
    routeRules: {
      '/api/**': { cors: true }
    }
  }
})