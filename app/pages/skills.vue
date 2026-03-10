<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRuntimeConfig } from "#app";
import { useGamepadNav } from "../composables/useGamepadNav";

const router = useRouter();

// ─── Images ────────────────────────────────────────────────────────────────────
// import.meta.glob handles filenames with special chars (e.g. "c#.png") cleanly
const skillImages = import.meta.glob<string>("../assets/images/skills/*.png", {
  eager: true,
  import: "default",
});

function img(name: string): string {
  return skillImages[`../assets/images/skills/${name}.png`] ?? "";
}

// ─── Character data ────────────────────────────────────────────────────────────
interface Character {
  id: string;
  name: string;
  image: string;
  title: string;
  color: string;
  yearsExp: number;
  scale?: number;
  tx?: number;
  ty?: number;
}

const MAX_YEARS = 16; // coding since 2010

const characters: Character[] = [
  {
    id: "typescript",
    name: "TypeScript",
    image: img("typescript"),
    title: "The Strict Enforcer",
    color: "#3b82f6",
    yearsExp: 8,
  },
  {
    id: "vue",
    name: "Vue",
    image: img("vue"),
    title: "The Reactive Warrior",
    color: "#42b883",
    yearsExp: 7,
  },
  {
    id: "nuxt",
    name: "Nuxt",
    image: img("nuxt"),
    title: "The Framework Sage",
    color: "#00dc82",
    yearsExp: 6,
  },
  {
    id: "css",
    name: "CSS",
    image: img("css"),
    title: "The Style Weaver",
    color: "#818cf8",
    yearsExp: 16,
  },
  {
    id: "tailwind",
    name: "Tailwind",
    image: img("tailwind"),
    title: "The Utility Master",
    color: "#38bdf8",
    yearsExp: 5,
  },
  {
    id: "aws",
    name: "AWS",
    image: img("aws"),
    title: "The Cloud Titan",
    color: "#f97316",
    yearsExp: 6,
  },
  {
    id: "firebase",
    name: "Firebase",
    image: img("firebase"),
    title: "The Real-Time Brawler",
    color: "#facc15",
    yearsExp: 7,
  },
  {
    id: "csharp",
    name: "C#",
    image: img("csharp"),
    title: "The Sharp Shooter",
    color: "#a78bfa",
    yearsExp: 12,
  },
  {
    id: "sensei",
    name: "Sensei",
    image: img("sensei"),
    title: "The Mentor",
    color: "#f87171",
    yearsExp: 8,
    scale: 0.85,
    tx: -24,
    ty: -31,
  },
  {
    id: "spanish",
    name: "Spanish",
    image: img("spanish"),
    title: "The Bilingual Fighter",
    color: "#fb923c",
    yearsExp: 16,
  },
];

// ─── DEBUG: scale calibration (remove when done) ─────────────────────────────
const DEBUG_MODE = false;
const REFERENCE_ID = "typescript"; // stays fully visible as the baseline
const referenceChar = characters.find((c) => c.id === REFERENCE_ID)!;
const charScales = ref<Record<string, number>>(
  Object.fromEntries(characters.map((c) => [c.id, c.scale ?? 1])),
);
const charTranslations = ref<Record<string, { x: number; y: number }>>(
  Object.fromEntries(characters.map((c) => [c.id, { x: c.tx ?? 0, y: c.ty ?? 0 }])),
);
const currentScale = computed(() => charScales.value[selected.value.id] ?? 1);
const currentTranslation = computed(
  () => charTranslations.value[selected.value.id] ?? { x: 0, y: 0 },
);
const debugReadout = computed(() =>
  characters
    .map((c) => {
      const s = (charScales.value[c.id] ?? 1).toFixed(2);
      const t = charTranslations.value[c.id] ?? { x: 0, y: 0 };
      return `${c.id.padEnd(12)} scale:${s}  tx:${t.x.toFixed(0)}  ty:${t.y.toFixed(0)}`;
    })
    .join("\n"),
);

// ─── Background music ─────────────────────────────────────────────────────────
const { app } = useRuntimeConfig();
const muted = ref(false);
let audio: HTMLAudioElement | null = null;
onMounted(() => {
  audio = new Audio(`${app.baseURL}sounds/skill_select.mp3`);
  audio.loop = true;
  audio.volume = 0.4;
  audio.play().catch(() => {}); // browser may block until first interaction
});
onUnmounted(() => {
  audio?.pause();
  audio = null;
});

function toggleMute() {
  muted.value = !muted.value;
  if (audio) audio.muted = muted.value;
}

// ─── Selection state ───────────────────────────────────────────────────────────
const selectedIndex = ref(0);
const selected = computed(() => characters[selectedIndex.value] ?? characters[0]!);

function selectCharacter(index: number) {
  selectedIndex.value = index;
}

// ─── Keyboard / Gamepad navigation ────────────────────────────────────────────
const COLS = 5;

function navigate(dir: "left" | "right" | "up" | "down") {
  const total = characters.length;
  let i = selectedIndex.value;
  if (dir === "left") i = (i - 1 + total) % total;
  if (dir === "right") i = (i + 1) % total;
  if (dir === "up") i = Math.max(0, i - COLS);
  if (dir === "down") i = Math.min(total - 1, i + COLS);
  selectedIndex.value = i;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    navigate("left");
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    navigate("right");
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    navigate("up");
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    navigate("down");
  }
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

useGamepadNav({
  onBack() {
    router.push("/");
  },
  onUp() {
    navigate("up");
  },
  onDown() {
    navigate("down");
  },
  onLeft() {
    navigate("left");
  },
  onRight() {
    navigate("right");
  },
});
</script>

<template>
  <div
    class="relative w-screen h-dvh overflow-hidden bg-[#050508] font-mono text-slate-200 select-none"
  >
    <!-- Scanline overlay -->
    <div
      class="pointer-events-none absolute inset-0 z-60 opacity-[0.025]"
      style="
        background: repeating-linear-gradient(
          0deg,
          #000 0px,
          #000 1px,
          transparent 1px,
          transparent 4px
        );
      "
    />

    <!-- Back button -->
    <button
      class="absolute top-4 left-4 z-50 text-[0.75rem] tracking-[0.3em] uppercase text-slate-400 hover:text-amber-300 transition-colors duration-200 flex items-center gap-2"
      @click="router.push('/')"
    >
      <span>◀</span> Back
    </button>

    <!-- Mute / unmute button -->
    <button
      class="absolute top-4 right-4 z-50 text-[0.65rem] tracking-[0.3em] uppercase transition-colors duration-200 flex items-center gap-1.5"
      :class="
        muted ? 'text-slate-600 hover:text-slate-400' : 'text-amber-400/70 hover:text-amber-300'
      "
      :title="muted ? 'Unmute' : 'Mute'"
      @click="toggleMute()"
    >
      <span>{{ muted ? "🔇" : "🔊" }}</span>
    </button>

    <!-- Main layout: stacked on mobile, side-by-side on desktop -->
    <div class="h-full flex flex-col lg:flex-row">
      <!-- ═══════════════════════════════════════════════════════
           LEFT / TOP — Selected character display
           ═══════════════════════════════════════════════════════ -->
      <div class="relative shrink-0 flex flex-col h-[38%] lg:h-full lg:w-[38%] overflow-hidden">
        <!-- Per-character background glow -->
        <div
          class="absolute inset-0 transition-all duration-700"
          :style="{
            background: `radial-gradient(ellipse at 50% 110%, ${selected.color}22 0%, transparent 65%)`,
          }"
        />

        <!-- Character art -->
        <div
          class="relative flex-1 overflow-hidden flex items-end justify-center lg:justify-start lg:pl-4"
        >
          <!-- Glow pool at the character's feet -->
          <div
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 blur-3xl rounded-full transition-all duration-700"
            :style="{ background: `${selected.color}2e` }"
          />

          <!-- DEBUG: Reference character ghost (always visible baseline) -->
          <div
            v-if="DEBUG_MODE && selected.id !== REFERENCE_ID"
            class="absolute inset-0 flex items-end justify-center lg:justify-start lg:pl-4 z-5 pointer-events-none"
          >
            <img
              :src="referenceChar.image"
              :alt="referenceChar.name"
              class="h-full max-h-full w-auto object-contain object-bottom"
              :style="{
                transform: `scale(${charScales[REFERENCE_ID] ?? 1})`,
                transformOrigin: 'bottom center',
              }"
            />
          </div>

          <Transition name="char-art" mode="out-in">
            <img
              :key="selected.id"
              :src="selected.image"
              :alt="selected.name"
              class="relative z-10 h-full max-h-full w-auto object-contain object-bottom"
              :style="{
                transform: `translate(${currentTranslation.x}px, ${currentTranslation.y}px) scale(${currentScale})`,
                transformOrigin: 'bottom center',
                opacity: DEBUG_MODE && selected.id !== REFERENCE_ID ? 0.5 : 1,
              }"
            />
          </Transition>
        </div>

        <!-- Character info bar -->
        <div class="relative z-20 px-4 lg:px-6 pb-4 pt-1">
          <div
            class="w-10 h-px mb-1.5 transition-all duration-500"
            :style="{ background: selected.color, boxShadow: `0 0 8px ${selected.color}` }"
          />
          <p
            class="text-[0.58rem] tracking-[0.4em] uppercase transition-colors duration-500"
            :style="{ color: selected.color }"
          >
            {{ selected.title }}
          </p>
          <h2
            class="text-xl lg:text-3xl font-black tracking-[0.06em] uppercase text-slate-50 leading-none mb-3"
          >
            {{ selected.name }}
          </h2>

          <!-- Experience bar -->
          <div class="flex items-center gap-3">
            <span class="text-[0.5rem] tracking-[0.35em] uppercase text-slate-500 shrink-0"
              >Experience</span
            >
            <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700 ease-out"
                :style="{
                  width: `${(selected.yearsExp / MAX_YEARS) * 100}%`,
                  background: selected.color,
                  boxShadow: `0 0 8px ${selected.color}80`,
                }"
              />
            </div>
            <span
              class="text-[0.6rem] font-black tabular-nums transition-colors duration-500 w-10 text-right"
              :style="{ color: selected.color }"
              >{{ selected.yearsExp }} yrs</span
            >
          </div>
        </div>

        <!-- DEBUG: Scale calibration panel -->
        <div
          v-if="DEBUG_MODE"
          class="relative z-30 border-t border-slate-700/60 bg-[#080810]/90 px-4 py-3 space-y-2"
        >
          <div class="flex items-center justify-between">
            <p class="text-[0.55rem] tracking-[0.3em] uppercase text-amber-400">
              ⚙ Debug — {{ selected.name }}
            </p>
            <button
              class="text-[0.6rem] px-2 py-0.5 border border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-300 uppercase tracking-widest transition-colors"
              @click="
                () => {
                  charScales[selected.id] = 1;
                  charTranslations[selected.id] = { x: 0, y: 0 };
                }
              "
            >
              Reset
            </button>
          </div>
          <!-- Scale -->
          <div class="flex items-center gap-2">
            <span class="text-[0.48rem] w-10 shrink-0 text-slate-500 uppercase tracking-widest"
              >Scale</span
            >
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.01"
              :value="charScales[selected.id] ?? 1"
              class="flex-1 h-1 accent-amber-400 cursor-pointer"
              @input="
                (e) => (charScales[selected.id] = parseFloat((e.target as HTMLInputElement).value))
              "
            />
            <span class="text-[0.58rem] font-black text-amber-300 tabular-nums w-8 text-right">{{
              currentScale.toFixed(2)
            }}</span>
          </div>
          <!-- Translate X -->
          <div class="flex items-center gap-2">
            <span class="text-[0.48rem] w-10 shrink-0 text-slate-500 uppercase tracking-widest"
              >X</span
            >
            <input
              type="range"
              min="-300"
              max="300"
              step="1"
              :value="currentTranslation.x"
              class="flex-1 h-1 accent-sky-400 cursor-pointer"
              @input="
                (e) =>
                  (charTranslations[selected.id] = {
                    ...currentTranslation,
                    x: parseFloat((e.target as HTMLInputElement).value),
                  })
              "
            />
            <span class="text-[0.58rem] font-black text-sky-300 tabular-nums w-8 text-right">{{
              currentTranslation.x.toFixed(0)
            }}</span>
          </div>
          <!-- Translate Y -->
          <div class="flex items-center gap-2">
            <span class="text-[0.48rem] w-10 shrink-0 text-slate-500 uppercase tracking-widest"
              >Y</span
            >
            <input
              type="range"
              min="-300"
              max="300"
              step="1"
              :value="currentTranslation.y"
              class="flex-1 h-1 accent-rose-400 cursor-pointer"
              @input="
                (e) =>
                  (charTranslations[selected.id] = {
                    ...currentTranslation,
                    y: parseFloat((e.target as HTMLInputElement).value),
                  })
              "
            />
            <span class="text-[0.58rem] font-black text-rose-300 tabular-nums w-8 text-right">{{
              currentTranslation.y.toFixed(0)
            }}</span>
          </div>
          <details class="text-[0.48rem] text-slate-500">
            <summary class="cursor-pointer tracking-widest uppercase hover:text-slate-300">
              All values
            </summary>
            <pre class="mt-1 text-[0.48rem] text-slate-400 whitespace-pre leading-relaxed">{{
              debugReadout
            }}</pre>
          </details>
        </div>

        <!-- Right edge divider (desktop only) -->
        <div class="hidden lg:block absolute top-0 right-0 w-px h-full bg-slate-800" />
      </div>

      <!-- ═══════════════════════════════════════════════════════
           RIGHT / BOTTOM — Portrait selection grid
           ═══════════════════════════════════════════════════════ -->
      <div class="flex-1 flex flex-col min-h-0">
        <!-- Panel header -->
        <div
          class="flex items-center justify-between px-4 lg:px-8 py-2.5 border-b border-slate-800/80"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(252,211,77,0.9)] animate-pulse"
            />
            <span class="text-[0.58rem] tracking-[0.4em] uppercase text-amber-300">
              Player 1 — Select Your Fighter
            </span>
          </div>
          <span class="text-[0.58rem] tracking-[0.2em] text-slate-600">
            {{ selectedIndex + 1 }}&thinsp;/&thinsp;{{ characters.length }}
          </span>
        </div>

        <!-- Grid area -->
        <div class="flex-1 flex items-center justify-center p-4 lg:p-10 min-h-0">
          <div class="w-full max-w-135 grid grid-cols-5 gap-2 lg:gap-4">
            <button
              v-for="(char, i) in characters"
              :key="char.id"
              class="group relative aspect-3/4 overflow-hidden bg-[#0a0a12] border-2 transition-all duration-150 cursor-pointer focus:outline-none"
              :class="
                i === selectedIndex
                  ? 'border-amber-400 shadow-[0_0_16px_rgba(252,211,77,0.4)] scale-[1.05] z-10'
                  : 'border-slate-700/60 hover:border-slate-500 hover:scale-[1.02]'
              "
              @click="selectCharacter(i)"
            >
              <!-- TODO: replace inner div with <img :src="char.portrait"> once head-portrait crops exist -->
              <!-- Portrait stub — generic silhouette placeholder -->
              <div class="absolute inset-0 flex items-center justify-center pb-4">
                <div class="flex flex-col items-center opacity-[0.18]">
                  <div class="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-slate-400" />
                  <div class="w-9 h-5 lg:w-12 lg:h-6 mt-0.5 bg-slate-400 rounded-t-[40%]" />
                </div>
              </div>

              <!-- Subtle per-character tint when selected -->
              <div
                v-if="i === selectedIndex"
                class="absolute inset-0 opacity-[0.07] transition-colors duration-500"
                :style="{ background: selected.color }"
              />

              <!-- P1 badge -->
              <div
                v-if="i === selectedIndex"
                class="absolute top-1 right-1 bg-amber-400 text-[#050508] text-[0.42rem] lg:text-[0.48rem] font-black tracking-widest px-0.5 py-px uppercase leading-none"
              >
                P1
              </div>

              <!-- Corner brackets on selected -->
              <template v-if="i === selectedIndex">
                <div
                  class="absolute top-0.75 left-0.75 w-2 h-2 border-t-2 border-l-2 border-amber-400"
                />
                <div
                  class="absolute top-0.75 right-0.75 w-2 h-2 border-t-2 border-r-2 border-amber-400"
                />
                <div
                  class="absolute bottom-5.5 left-0.75 w-2 h-2 border-b-2 border-l-2 border-amber-400"
                />
                <div
                  class="absolute bottom-5.5 right-0.75 w-2 h-2 border-b-2 border-r-2 border-amber-400"
                />
              </template>

              <!-- Name bar -->
              <div
                class="absolute bottom-0 inset-x-0 text-center font-bold uppercase tracking-wider transition-all duration-150 text-[0.48rem] lg:text-[0.52rem] py-1"
                :class="
                  i === selectedIndex
                    ? 'bg-amber-400 text-[#050508]'
                    : 'bg-slate-800/80 text-slate-500'
                "
              >
                {{ char.name }}
              </div>
            </button>
          </div>
        </div>

        <!-- Footer hints -->
        <div class="flex items-center justify-center gap-4 px-4 py-2 border-t border-slate-800/80">
          <span class="text-[0.52rem] tracking-[0.2em] text-slate-700 uppercase"
            >↑ ↓ ← → to navigate</span
          >
          <span class="text-[0.52rem] text-slate-800">|</span>
          <span class="text-[0.52rem] tracking-[0.2em] text-slate-700 uppercase"
            >click or A to select</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.char-art-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.char-art-leave-active {
  transition: opacity 0.1s ease;
}
.char-art-enter-from {
  opacity: 0;
  transform: scale(0.97);
}
.char-art-leave-to {
  opacity: 0;
}
</style>
