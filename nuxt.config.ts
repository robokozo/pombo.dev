import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],

  css: ["~/assets/css/main.css"],

  // Disable auto-imports — all imports must be explicit per project guidelines
  imports: {
    autoImport: false,
  },

  // Disable component auto-imports — use explicit imports from #components
  components: {
    dirs: [],
  },

  compatibilityDate: "2024-11-01",

  devtools: { enabled: true },

  nitro: {
    preset: "github-pages",
  },
});
