<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  color: string;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let timerId: ReturnType<typeof setInterval> | null = null;

// Recursive midpoint displacement — builds a jagged lightning path via lineTo calls.
function segment({
  ctx,
  x1,
  y1,
  x2,
  y2,
  spread,
  depth,
}: {
  ctx: CanvasRenderingContext2D;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  spread: number;
  depth: number;
}) {
  if (depth === 0) {
    ctx.lineTo(x2, y2);
    return;
  }
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread * 0.35;
  segment({ ctx, x1, y1, x2: mx, y2: my, spread: spread * 0.58, depth: depth - 1 });
  segment({ ctx, x1: mx, y1: my, x2, y2, spread: spread * 0.58, depth: depth - 1 });
}

function drawFrame() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const count = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const sy = Math.random() * canvas.height;
    const ey = Math.random() * canvas.height;
    const spread = canvas.height * 0.55;

    // Wide outer glow pass
    ctx.beginPath();
    ctx.moveTo(0, sy);
    segment({ ctx, x1: 0, y1: sy, x2: canvas.width, y2: ey, spread, depth: 6 });
    ctx.strokeStyle = props.color;
    ctx.lineWidth = 4 + Math.random() * 4;
    ctx.globalAlpha = 0.03 + Math.random() * 0.07;
    ctx.shadowBlur = 28;
    ctx.shadowColor = props.color;
    ctx.stroke();

    // Thin bright core — new random path for the crackling look
    ctx.beginPath();
    ctx.moveTo(0, sy);
    segment({ ctx, x1: 0, y1: sy, x2: canvas.width, y2: ey, spread, depth: 6 });
    ctx.strokeStyle = props.color;
    ctx.lineWidth = 0.5 + Math.random() * 1.2;
    ctx.globalAlpha = 0.2 + Math.random() * 0.2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffffff";
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (canvas) {
    canvas.width = canvas.parentElement?.offsetWidth ?? 400;
    canvas.height = canvas.parentElement?.offsetHeight ?? 64;
  }
  drawFrame();
  timerId = setInterval(drawFrame, 55);
});

onUnmounted(() => {
  if (timerId !== null) clearInterval(timerId);
});
</script>

<template>
  <canvas ref="canvasRef" class="absolute inset-0 w-full h-full pointer-events-none" />
</template>
