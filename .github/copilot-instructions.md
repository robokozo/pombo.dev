# Project Instructions

This is a **Nuxt 4** project using **Nuxt UI v4** and **TypeScript**.

## Component style

- Always use `<script setup lang="ts">`
- Component block order: `<script>` → `<template>` → `<style>` (top to bottom)

## Key conventions

- Auto-imports are **disabled** (`imports.autoImport: false`, `components.dirs: []`)
- All imports must be explicit
- Components must be imported from `#components`
- Vue composables (`ref`, `computed`, etc.) must be imported from `vue`
- Nuxt composables (`useRoute`, `useRouter`, `useFetch`, etc.) must be imported from `#app`
- `defineAppConfig` must be defined locally in `app/app.config.ts` as `const defineAppConfig = <T>(config: T): T => config` — do not import it from anywhere (unimport does not transform this file, and importing from `#app` causes a Nitro impound error)
- Formatter is **oxfmt** (Prettier-compatible) — run `npm run format`

## Directory structure (Nuxt 4)

Source files live under `app/` (the Nuxt 4 default srcDir):

```
app/
  app.vue           — root component
  app.config.ts     — runtime app config (Nuxt UI theme etc.)
  assets/
    css/
      main.css
  components/       — Vue components (explicit imports only)
  composables/      — composables (explicit imports only)
  pages/            — file-based routing
  layouts/          — layout components
  middleware/       — route middleware
  plugins/          — Nuxt plugins
nuxt.config.ts      — Nuxt configuration
tsconfig.json       — extends .nuxt/tsconfig.json
package.json
```

## Design philosophy

- **Mobile-first**: write base styles for mobile, layer `md:`/`lg:` overrides for desktop
- Desktop must also work, but mobile is the primary target
- Tailwind/Nuxt UI breakpoints: default = mobile, `sm:` = 640px, `md:` = 768px, `lg:` = 1024px, `xl:` = 1280px

## Nuxt 4 docs

Full documentation index: https://nuxt.com/llms.txt
Nuxt v4 docs base URL: https://nuxt.com/raw/docs/4.x/

Key references:

- Configuration: https://nuxt.com/raw/docs/4.x/getting-started/configuration.md
- Auto-imports: https://nuxt.com/raw/docs/4.x/guide/concepts/auto-imports.md
- Directory structure: https://nuxt.com/raw/docs/4.x/directory-structure.md
- app.config.ts: https://nuxt.com/raw/docs/4.x/directory-structure/app/app-config.md
- Components: https://nuxt.com/raw/docs/4.x/directory-structure/app/components.md
- Composables: https://nuxt.com/raw/docs/4.x/directory-structure/app/composables.md
- Pages: https://nuxt.com/raw/docs/4.x/directory-structure/app/pages.md
- Nuxt config reference: https://nuxt.com/raw/docs/4.x/api/nuxt-config.md
- GitHub Pages deployment: https://nuxt.com/raw/deploy/github-pages.md
- Built-in components: https://nuxt.com/raw/docs/4.x/api/components/nuxt-time.md

## Package installation policy

**Always check the Nuxt docs before installing a package.** Many things that were previously third-party modules are now built into Nuxt core (e.g. `<NuxtTime>`, `useHead`, `useSeoMeta`). Installing a package that duplicates built-in functionality adds unnecessary dependencies and may cause deprecation warnings.

Before running `npm install <pkg>`:

1. Check https://nuxt.com/llms.txt and the relevant docs page to see if Nuxt already provides the feature natively.
2. Check if the installed modules (`@nuxt/ui`, `@vueuse/nuxt`, `@nuxt/content`, `@tresjs/nuxt`) already cover the need.
