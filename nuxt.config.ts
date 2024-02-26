// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    'nuxt3-leaflet'
  ],
  runtimeConfig: {
    public: {
      maptiler: process.env.MAPTILER,
    }
  }
})
