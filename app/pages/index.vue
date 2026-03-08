<script setup lang="ts">
import { UButton, UCard, UBadge } from '#components'
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-16">
    <div class="w-full max-w-2xl flex flex-col items-center gap-6 text-center">
      <UBadge label="Available for work" color="primary" variant="soft" />

      <h1 class="text-4xl font-bold tracking-tight md:text-6xl">
        Hi, I'm John Pombo
      </h1>

      <p class="text-lg text-muted md:text-xl">
        A developer building things for the web.
      </p>

      <div class="flex flex-wrap justify-center gap-3">
        <UButton label="See my work" size="lg" />
        <UButton label="Get in touch" size="lg" variant="outline" />
      </div>

      <UCard class="w-full mt-4">
        <p class="text-sm text-muted">
          This is a placeholder landing page. More coming soon.
        </p>
      </UCard>
    </div>
  </div>
</template>
