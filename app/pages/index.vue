<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "#app";
import ThreeBackground from "../components/ThreeBackground.vue";
import ElectricBolt from "../components/ElectricBolt.vue";
import { useGamepadNav } from "../composables/useGamepadNav";

// ─── Menu items ────────────────────────────────────────────────────────────────
const menuItems = [
  {
    id: "about",
    label: "About",
    sub: "Who I am",
    to: "/about",
    color: "#a5b4fc",
    glowColor: "rgba(165,180,252,0.7)",
    bgAccent: "#1e1b4b",
  },
  {
    id: "projects",
    label: "Projects",
    sub: "What I've built",
    to: "/projects",
    color: "#67e8f9",
    glowColor: "rgba(103,232,249,0.7)",
    bgAccent: "#083344",
  },
  {
    id: "skills",
    label: "Skills",
    sub: "What I know",
    to: "/skills",
    color: "#fcd34d",
    glowColor: "rgba(252,211,77,0.7)",
    bgAccent: "#292400",
  },
  {
    id: "contact",
    label: "Contact",
    sub: "Get in touch",
    to: "/contact",
    color: "#f9a8d4",
    glowColor: "rgba(249,168,212,0.7)",
    bgAccent: "#2d0a1e",
  },
  {
    id: "blog",
    label: "Blog",
    sub: "What I write",
    to: "/blog",
    color: "#86efac",
    glowColor: "rgba(134,239,172,0.7)",
    bgAccent: "#052e16",
  },
];

// ─── State ─────────────────────────────────────────────────────────────────────
const hoveredIndex = ref<number | null>(null);
const selectedIndex = ref<number | null>(null);
const transitionColor = ref<string | null>(null);
const titleVisible = ref(false);
const menuVisible = ref(false);
const router = useRouter();

const activeItem = computed(() =>
  hoveredIndex.value !== null ? menuItems[hoveredIndex.value] : null,
);

// ─── Mount animations ───────────────────────────────────────────────────────────
onMounted(() => {
  setTimeout(() => {
    titleVisible.value = true;
  }, 200);
  setTimeout(() => {
    menuVisible.value = true;
  }, 700);
});

function onTransitionDone() {
  if (selectedIndex.value !== null) {
    router.push(menuItems[selectedIndex.value]?.to ?? "/");
  }
}

// ─── Gamepad navigation ────────────────────────────────────────────────────────
useGamepadNav({
  onUp() {
    if (hoveredIndex.value === null) {
      hoveredIndex.value = 0;
    } else {
      hoveredIndex.value = (hoveredIndex.value - 1 + menuItems.length) % menuItems.length;
    }
  },
  onDown() {
    if (hoveredIndex.value === null) {
      hoveredIndex.value = 0;
    } else {
      hoveredIndex.value = (hoveredIndex.value + 1) % menuItems.length;
    }
  },
  onConfirm() {
    const i = hoveredIndex.value;
    if (i !== null) {
      const item = menuItems[i];
      if (item) {
        selectedIndex.value = i;
        transitionColor.value = item.color;
      }
    }
  },
});
</script>

<template>
  <div class="relative w-screen h-dvh overflow-hidden bg-[#050508] font-mono text-slate-200">
    <!-- ── 3-D background canvas ───────────────────────────── -->
    <div class="absolute inset-0 z-0">
      <ClientOnly>
        <ThreeBackground
          :active-color="activeItem?.color ?? null"
          :transition-color="transitionColor"
          @transition-done="onTransitionDone"
        />
      </ClientOnly>
    </div>

    <!-- ── Overlay effects ──────────────────────────────────── -->
    <div class="scanlines pointer-events-none absolute inset-0 z-20" />
    <div class="vignette pointer-events-none absolute inset-0 z-20" />

    <!-- ── Background color accent ──────────────────────────── -->
    <Transition name="bg-fade">
      <div
        v-if="activeItem"
        :key="activeItem.id"
        class="absolute inset-0 z-10 opacity-[0.22] transition-colors duration-500"
        :style="{ backgroundColor: activeItem.bgAccent }"
      />
    </Transition>

    <!-- ── Main HUD layout ───────────────────────────────────── -->
    <div
      class="relative z-10 flex items-center justify-between h-full px-12 py-8 gap-8 max-md:flex-col max-md:justify-end max-md:items-start max-md:px-5 max-md:py-6"
    >
      <!-- ── Left: nav menu ─────────────────────────────────── -->
      <nav
        class="flex flex-col gap-6 min-w-65 max-w-85 max-md:max-w-none max-md:w-full max-md:min-w-0"
      >
        <div class="text-[0.95rem] tracking-[0.35em] text-slate-300 pl-5">PORTFOLIO</div>

        <ul class="list-none m-0 p-0 flex flex-col gap-1">
          <li
            v-for="(item, i) in menuItems"
            :key="item.id"
            class="menu-item-enter flex items-center gap-3 py-3.5 px-5 cursor-pointer relative border-l-2 transition-opacity duration-200 overflow-hidden"
            :class="menuVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'"
            :style="{
              '--delay': `${i * 80}ms`,
              borderLeftColor:
                hoveredIndex === i || selectedIndex === i ? item.color : 'transparent',
              background:
                hoveredIndex === i
                  ? `linear-gradient(90deg, ${item.color}40, transparent)`
                  : selectedIndex === i
                    ? `linear-gradient(90deg, ${item.color}55, transparent)`
                    : 'transparent',
              opacity: hoveredIndex !== null && hoveredIndex !== i ? '0.3' : undefined,
            }"
            @mouseenter="hoveredIndex = i"
            @mouseleave="hoveredIndex = null"
            @click="
              selectedIndex = i;
              transitionColor = item.color;
            "
          >
            <!-- electricity behind text -->
            <ElectricBolt v-if="hoveredIndex === i || selectedIndex === i" :color="item.color" />

            <!-- cursor arrow -->
            <span
              class="text-[0.85rem] shrink-0 transition-all duration-150"
              :class="
                hoveredIndex === i || selectedIndex === i
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-1.5'
              "
              :style="{ color: item.color }"
              >▶</span
            >

            <span class="flex flex-col gap-0.5">
              <span
                class="text-[1.6rem] font-bold tracking-[0.12em] uppercase transition-all duration-200"
                :style="
                  hoveredIndex === i
                    ? {
                        color: item.color,
                        textShadow: `0 0 18px ${item.glowColor}, 0 0 40px ${item.glowColor}`,
                      }
                    : { color: '#f8fafc' }
                "
                >{{ item.label }}</span
              >
              <span
                class="text-[0.95rem] tracking-[0.2em] uppercase transition-colors duration-200"
                :style="{ color: hoveredIndex === i ? item.color : '#94a3b8' }"
                >{{ item.sub }}</span
              >
            </span>

            <!-- expanding underline -->
            <span
              class="absolute bottom-0 left-0 h-px transition-all duration-300"
              :style="{
                width: hoveredIndex === i || selectedIndex === i ? '100%' : '0%',
                backgroundColor: item.color,
                boxShadow: `0 0 8px ${item.glowColor}`,
              }"
            />
          </li>
        </ul>

        <div class="text-[0.9rem] tracking-[0.3em] text-slate-400 pl-5 flex items-center gap-2">
          <span class="animate-blink">■</span> READY
        </div>
      </nav>

      <!-- ── Right: title block ─────────────────────────────── -->
      <div
        class="flex-1 flex flex-col items-end text-right gap-5 transition-all duration-700 max-md:items-start max-md:text-left max-md:order-first"
        :class="titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <div class="flex items-center gap-3 text-[0.95rem] tracking-[0.3em] text-slate-300">
          <span>{{ new Date().getFullYear() }}</span>
          <span class="text-slate-500">—</span>
          <span class="text-slate-300">FULL-STACK DEVELOPER</span>
        </div>

        <h1 class="flex flex-col items-end leading-[0.9] m-0 max-md:items-start">
          <span
            class="text-[clamp(4rem,9vw,8rem)] font-black tracking-[0.04em] text-slate-50 [text-shadow:0_0_40px_rgba(255,255,255,0.08)]"
            >JOHN</span
          >
          <span
            class="text-[clamp(6rem,14vw,13rem)] font-black tracking-[0.02em] transition-all duration-500"
            :style="
              activeItem
                ? {
                    color: activeItem.color,
                    textShadow: `0 0 60px ${activeItem.glowColor}, 0 0 120px ${activeItem.glowColor}`,
                  }
                : {
                    color: '#a5b4fc',
                    textShadow: '0 0 60px rgba(165,180,252,0.6), 0 0 120px rgba(165,180,252,0.3)',
                  }
            "
            >POMBO</span
          >
        </h1>

        <div
          class="text-[1.05rem] tracking-[0.35em] uppercase transition-colors duration-500 font-semibold"
          :style="{ color: activeItem?.color ?? '#a5b4fc' }"
        >
          {{ activeItem ? activeItem.sub.toUpperCase() : "SELECT AN OPTION" }}
        </div>

        <!-- decorative separator -->
        <div
          class="w-[clamp(160px,30vw,380px)] h-px transition-colors duration-500"
          :style="{
            backgroundColor: activeItem?.color ?? '#a5b4fc',
            boxShadow: `0 0 8px ${activeItem?.glowColor ?? 'rgba(165,180,252,0.5)'}`,
          }"
        />

        <div class="text-[0.9rem] tracking-[0.25em] text-slate-400 uppercase flex items-center">
          <span>PRESS ANY KEY TO CONTINUE</span>
          <span class="animate-blink ml-2">_</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scanlines — not expressible in Tailwind */
.scanlines {
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.18) 3px,
    rgba(0, 0, 0, 0.18) 4px
  );
}

/* Vignette — not expressible in Tailwind */
.vignette {
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.85) 100%);
}

/* bg-fade Transition hooks */
.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 0.4s ease;
}
.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}

/* Staggered entrance: delay only on opacity + transform, not on hover properties */
.menu-item-enter {
  transition:
    opacity 0.4s ease var(--delay),
    transform 0.4s ease var(--delay),
    border-color 0.15s ease,
    background 0.15s ease;
}

/* Blink animation */
.animate-blink {
  animation: blink 1.1s step-start infinite;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* Scene transition burst — a circle that expands from center to fill the screen */
.transition-burst {
  /* Center the circle on screen */
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  margin-left: -10px;
  opacity: 0.9;
  animation: burst 0.65s cubic-bezier(0.2, 0, 0.6, 1) forwards;
}
@keyframes burst {
  0% {
    transform: scale(1);
    opacity: 0.95;
  }
  100% {
    /* 300vmax guarantees full coverage regardless of aspect ratio */
    transform: scale(300);
    opacity: 1;
  }
}
</style>
