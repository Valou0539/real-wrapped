import tailwindcss from "@tailwindcss/vite";
import { PrimeVuePreset } from "./primevue-theme";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/color-mode",
    "@primevue/nuxt-module",
    "@nuxt/image",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/google-fonts",
    "@nuxtjs/i18n",
  ],
  colorMode: {
    classSuffix: "",
  },
  primevue: {
    options: {
      theme: {
        preset: PrimeVuePreset,
        options: {
          darkModeSelector: ".dark",
          cssLayer: {
            name: "primevue",
            order: "theme, base, primevue, components, utilities",
          },
        },
      },
    },
  },
  googleFonts: {
    families: {
      Poppins: true,
    },
  },
  i18n: {
    defaultLocale: "en",
    locales: [
      {
        code: "en",
        files: [
          "en/account.json",
          "en/authentication.json",
          "en/layout.json",
          "en/home.json",
          "en/error.json",
          "en/primevue.json",
        ],
        name: "English",
      },
      {
        code: "fr",
        files: [
          "fr/account.json",
          "fr/authentication.json",
          "fr/layout.json",
          "fr/home.json",
          "fr/error.json",
          "fr/primevue.json",
        ],
        name: "Français",
      },
    ],
  },

  runtimeConfig: {
    public: {
      appUrl: process.env.APP_URL,
      adminUrl: process.env.ADMIN_URL,
    },
    apiUrl: process.env.API_URL,
  },

  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  imports: {
    dirs: ["~/composables/**"],
  },
});
