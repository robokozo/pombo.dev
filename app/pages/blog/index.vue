<script setup lang="ts">
import { useAsyncData } from "#app";
import { useRouter } from "#app";
import { queryCollection } from "#imports";
import { useGamepadNav } from "../../composables/useGamepadNav";

const router = useRouter();
useGamepadNav({
  onBack() {
    router.push("/");
  },
});

const { data: articles } = await useAsyncData("blog", () =>
  queryCollection("blog").order("date", "DESC").all(),
);

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
        @click="router.push('/')"
      >
        <span>◀</span> Back
      </button>
      <div class="text-[0.75rem] tracking-[0.4em] text-slate-500 uppercase">John Pombo</div>
    </header>

    <!-- page title -->
    <div class="px-10 py-12 border-b border-slate-800">
      <p class="text-[0.8rem] tracking-[0.4em] text-pink-300 uppercase mb-3">Writing</p>
      <h1 class="text-[3rem] font-black tracking-[0.06em] text-slate-50 uppercase leading-none">
        Blog
      </h1>
    </div>

    <!-- article list -->
    <main class="flex-1 px-10 py-10">
      <ul class="flex flex-col divide-y divide-slate-800/60 max-w-3xl">
        <li
          v-for="article in articles"
          :key="article.path"
          class="group py-8 cursor-pointer"
          @click="router.push(article.path)"
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-4">
              <time class="text-[0.75rem] tracking-[0.25em] text-slate-500 uppercase">
                {{ formatDate(article.date) }}
              </time>
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="text-[0.65rem] tracking-[0.2em] uppercase px-2 py-0.5 border border-slate-700 text-slate-500 group-hover:border-pink-300/40 group-hover:text-pink-300 transition-colors duration-200"
              >
                {{ tag }}
              </span>
            </div>

            <h2
              class="text-[1.4rem] font-bold tracking-[0.04em] text-slate-100 group-hover:text-pink-300 transition-colors duration-200"
            >
              {{ article.title }}
            </h2>

            <p class="text-[0.9rem] text-slate-400 leading-relaxed tracking-wide">
              {{ article.description }}
            </p>

            <div
              class="text-[0.75rem] tracking-[0.3em] uppercase text-slate-600 group-hover:text-pink-300 transition-colors duration-200 flex items-center gap-2 mt-1"
            >
              Read more
              <span class="group-hover:translate-x-1 transition-transform duration-200 inline-block"
                >▶</span
              >
            </div>
          </div>
        </li>
      </ul>

      <p v-if="!articles?.length" class="text-slate-500 tracking-widest uppercase text-sm">
        No articles yet.
      </p>
    </main>
  </div>
</template>
