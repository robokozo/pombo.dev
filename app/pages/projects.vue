<script setup lang="ts">
import { useRouter } from "#app";
import { useGamepadNav } from "../composables/useGamepadNav";

const router = useRouter();
useGamepadNav({
  onBack() {
    router.push("/");
  },
});
</script>

<template>
  <div
    class="relative w-screen h-dvh overflow-hidden bg-[#050508] font-mono text-slate-200 flex flex-col items-center justify-center gap-8"
  >
    <!-- back button -->
    <button
      class="absolute top-8 left-8 text-[0.85rem] tracking-[0.3em] uppercase text-slate-400 hover:text-cyan-300 transition-colors duration-200 flex items-center gap-2"
      @click="router.push('/')"
    >
      <span>◀</span> Back
    </button>

    <div class="flex flex-col items-center gap-4 text-center">
      <p class="text-[0.8rem] tracking-[0.4em] text-cyan-300 uppercase">Section</p>
      <h1 class="text-[4rem] font-black tracking-[0.06em] text-slate-50 uppercase">Projects</h1>
      <div class="w-24 h-0.5 bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.6)]" />
      <p class="text-[1rem] tracking-[0.2em] text-slate-400 uppercase mt-2">— Work in progress —</p>
    </div>
  </div>
</template>
