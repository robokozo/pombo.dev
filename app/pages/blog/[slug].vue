<script setup lang="ts">
import { useAsyncData, useRoute, useRouter, createError } from "#app";
import { queryCollection } from "#imports";
import { ContentRenderer } from "#components";
import { useGamepadNav } from "../../composables/useGamepadNav";

const route = useRoute();
const router = useRouter();
useGamepadNav({
  onBack() {
    router.push("/blog");
  },
});

const { data: article } = await useAsyncData(route.path, () =>
  queryCollection("blog").path(route.path).first(),
);

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: "Article not found" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<template>
  <div class="relative w-screen min-h-dvh bg-[#050508] font-mono text-slate-200 flex flex-col">
    <!-- header -->
    <header class="flex items-center justify-between px-10 py-8 border-b border-slate-800">
      <button
        class="text-[0.85rem] tracking-[0.3em] uppercase text-slate-400 hover:text-pink-300 transition-colors duration-200 flex items-center gap-2"
        @click="router.push('/blog')"
      >
        <span>◀</span> All Articles
      </button>
      <div class="text-[0.75rem] tracking-[0.4em] text-slate-500 uppercase">John Pombo</div>
    </header>

    <main class="flex-1 px-10 py-12 max-w-3xl">
      <!-- meta -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <time class="text-[0.75rem] tracking-[0.25em] text-slate-500 uppercase">
          {{ formatDate(article!.date) }}
        </time>
        <span
          v-for="tag in article!.tags"
          :key="tag"
          class="text-[0.65rem] tracking-[0.2em] uppercase px-2 py-0.5 border border-pink-300/30 text-pink-300"
        >
          {{ tag }}
        </span>
      </div>

      <!-- title -->
      <h1
        class="text-[2.4rem] font-black tracking-[0.03em] text-slate-50 uppercase leading-tight mb-4"
      >
        {{ article!.title }}
      </h1>

      <p
        class="text-[1rem] text-slate-400 leading-relaxed mb-10 border-l-2 border-pink-300/40 pl-4"
      >
        {{ article!.description }}
      </p>

      <div class="w-16 h-px bg-pink-300 shadow-[0_0_8px_rgba(249,168,212,0.5)] mb-10" />

      <!-- rendered markdown -->
      <ContentRenderer
        :value="article!"
        class="prose prose-invert prose-slate max-w-none prose-headings:font-black prose-headings:tracking-wide prose-headings:uppercase prose-headings:text-slate-100 prose-p:text-slate-300 prose-p:leading-relaxed prose-p:tracking-wide prose-a:text-pink-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-100 prose-code:text-pink-300 prose-code:bg-slate-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-hr:border-slate-700 prose-li:text-slate-300"
      />
    </main>
  </div>
</template>
