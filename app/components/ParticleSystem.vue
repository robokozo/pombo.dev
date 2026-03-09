<script setup lang="ts">
import { ref } from "vue";
import { useLoop } from "@tresjs/core";
import { BufferGeometry, BufferAttribute, PointsMaterial, LineBasicMaterial, Color } from "three";

const props = defineProps<{
  activeColor: string | null;
}>();

// ─── Particle data ────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 1800;
const positions = new Float32Array(PARTICLE_COUNT * 3);
const velocities = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 40;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  velocities[i * 3] = (Math.random() - 0.5) * 0.008;
  velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
  // z moves ~half as fast as x — gives a parallax depth feel
  velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.006;
}

const posAttr = new BufferAttribute(positions, 3);
const geometry = new BufferGeometry();
geometry.setAttribute("position", posAttr);

const currentColor = new Color("#6366f1");
const material = new PointsMaterial({
  size: 0.08,
  color: currentColor,
  transparent: true,
  opacity: 0.7,
  sizeAttenuation: true,
});

// ─── Arc / neuron-firing data ─────────────────────────────────────────────────
// Each arc tracks two live particle indices. The path is re-baked every frame
// from the current (drifting) particle positions with fresh jitter, giving a
// continuous crackling / wiggling electric effect. Slots are recycled on death.

const MAX_ARCS = 18;
const ARC_STEPS = 8; // 9 points, 8 segments
const ARC_PTS = ARC_STEPS + 1;
const VERTS_PER_ARC = ARC_STEPS * 2; // LineSegments needs explicit pairs

const arcPositions = new Float32Array(MAX_ARCS * VERTS_PER_ARC * 3);
const arcColors = new Float32Array(MAX_ARCS * VERTS_PER_ARC * 3);
const arcPosAttr = new BufferAttribute(arcPositions, 3);
const arcColAttr = new BufferAttribute(arcColors, 3);
const arcGeometry = new BufferGeometry();
arcGeometry.setAttribute("position", arcPosAttr);
arcGeometry.setAttribute("color", arcColAttr);
const arcMaterial = new LineBasicMaterial({ vertexColors: true, transparent: true });

// Per-slot state — Float32Array keeps element access typed as `number`
const arcLife = new Float32Array(MAX_ARCS);
const arcDecay = new Float32Array(MAX_ARCS);
const arcParticleA = new Int32Array(MAX_ARCS).fill(-1);
const arcParticleB = new Int32Array(MAX_ARCS).fill(-1);
// Per-slot jitter magnitude (constant per arc so amplitude is consistent)
const arcJitterMag = new Float32Array(MAX_ARCS);
// Smoothed jitter offsets — lerped toward new targets each frame so
// the path drifts rather than snapping to a completely new shape every tick.
// Layout: ARC_STEPS - 1 interior points × 2 axes (x, y) per slot.
const ARC_INTERIOR = ARC_STEPS - 1;
const arcJitterOffsets = new Float32Array(MAX_ARCS * ARC_INTERIOR * 2);

let arcSpawnTimer = 0;

// Find two nearby particles (2–10 world units apart)
function pickPair(): [number, number] | null {
  const a = Math.floor(Math.random() * PARTICLE_COUNT);
  const ax = positions[a * 3] ?? 0;
  const ay = positions[a * 3 + 1] ?? 0;
  for (let attempt = 0; attempt < 30; attempt++) {
    const b = Math.floor(Math.random() * PARTICLE_COUNT);
    if (b === a) continue;
    const dx = (positions[b * 3] ?? 0) - ax;
    const dy = (positions[b * 3 + 1] ?? 0) - ay;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 2 && d < 10) return [a, b];
  }
  return null;
}

// Claim a slot: record which particle pair, set lifetime, jitter magnitude.
// Geometry is NOT written here — redrawArc handles that every frame.
function spawnArc({ slot }: { slot: number }): void {
  const pair = pickPair();
  if (!pair) return;
  arcParticleA[slot] = pair[0];
  arcParticleB[slot] = pair[1];
  arcLife[slot] = 1.0;
  arcDecay[slot] = 0.007 + Math.random() * 0.004; // ~125–143 frames ≈ 2–2.4 s at 60 fps
  // Smaller jitter range for calmer arcs
  arcJitterMag[slot] = 0.05 + Math.random() * 0.08;
  // Seed the smoothed offsets at zero so arc starts on the straight line
  const base = slot * ARC_INTERIOR * 2;
  for (let k = 0; k < ARC_INTERIOR * 2; k++) arcJitterOffsets[base + k] = 0;
}

// Re-bake the jagged path for one live arc from current particle positions.
// Called every frame so the path crackles/wiggles continuously.
function redrawArc({ slot }: { slot: number }): void {
  const a = arcParticleA[slot] ?? -1;
  const b = arcParticleB[slot] ?? -1;
  if (a < 0 || b < 0) return;

  const ax = positions[a * 3] ?? 0;
  const ay = positions[a * 3 + 1] ?? 0;
  const az = positions[a * 3 + 2] ?? 0;
  const bx = positions[b * 3] ?? 0;
  const by = positions[b * 3 + 1] ?? 0;
  const bz = positions[b * 3 + 2] ?? 0;

  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const chordLen = Math.sqrt(dx * dx + dy * dy);
  const jitter = chordLen * (arcJitterMag[slot] ?? 0.2);

  const pts: Array<[number, number, number]> = [];
  const offsetBase = slot * ARC_INTERIOR * 2;
  // Lerp each interior offset toward a new random target (smoothing factor 0.18)
  // so the wiggle is gradual rather than fully re-randomised every frame.
  for (let k = 0; k < ARC_INTERIOR; k++) {
    const ox = offsetBase + k * 2;
    const oy = ox + 1;
    const targetX = (Math.random() - 0.5) * jitter;
    const targetY = (Math.random() - 0.5) * jitter * 0.4;
    arcJitterOffsets[ox] =
      (arcJitterOffsets[ox] ?? 0) + (targetX - (arcJitterOffsets[ox] ?? 0)) * 0.18;
    arcJitterOffsets[oy] =
      (arcJitterOffsets[oy] ?? 0) + (targetY - (arcJitterOffsets[oy] ?? 0)) * 0.18;
  }
  for (let k = 0; k < ARC_PTS; k++) {
    const t = k / ARC_STEPS;
    const interior = k > 0 && k < ARC_STEPS;
    const jx = interior ? (arcJitterOffsets[offsetBase + (k - 1) * 2] ?? 0) : 0;
    const jy = interior ? (arcJitterOffsets[offsetBase + (k - 1) * 2 + 1] ?? 0) : 0;
    pts.push([ax + dx * t + jx, ay + dy * t + jy, az + dz * t]);
  }

  const base = slot * VERTS_PER_ARC;
  for (let s = 0; s < ARC_STEPS; s++) {
    const [px0, py0, pz0] = pts[s]!;
    const [px1, py1, pz1] = pts[s + 1]!;
    const vi = (base + s * 2) * 3;
    arcPositions[vi] = px0;
    arcPositions[vi + 1] = py0;
    arcPositions[vi + 2] = pz0;
    arcPositions[vi + 3] = px1;
    arcPositions[vi + 4] = py1;
    arcPositions[vi + 5] = pz1;
  }
}

// ─── Refs ─────────────────────────────────────────────────────────────────────
const pointLightRef = ref();
let time = 0;

// ─── Per-frame update ─────────────────────────────────────────────────────────
const { onBeforeRender } = useLoop();
onBeforeRender(() => {
  time += 0.01;

  // Particle positions
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const b = i * 3;
    let x = (positions[b] ?? 0) + (velocities[b] ?? 0);
    let y = (positions[b + 1] ?? 0) + (velocities[b + 1] ?? 0);
    let z = (positions[b + 2] ?? 0) + (velocities[b + 2] ?? 0);
    if (x > 20) x = -20;
    if (x < -20) x = 20;
    if (y > 12) y = -12;
    if (y < -12) y = 12;
    // z range matches the initial spread (-10 … 10)
    if (z > 10) z = -10;
    if (z < -10) z = 10;
    positions[b] = x;
    positions[b + 1] = y;
    positions[b + 2] = z;
  }
  posAttr.needsUpdate = true;

  if (pointLightRef.value) {
    pointLightRef.value.intensity = 1.5 + Math.sin(time * 2) * 0.5;
  }

  currentColor.lerp(new Color(props.activeColor ?? "#6366f1"), 0.04);
  material.color.copy(currentColor);

  // ─── Arc updates ──────────────────────────────────────────────────────────
  const isActive = props.activeColor !== null;
  const arcCol = new Color(props.activeColor ?? "#6366f1");

  // Spawn a new arc every ~0.5–0.8 s as long as a slot is free
  if (isActive) {
    arcSpawnTimer += 0.01;
    if (arcSpawnTimer >= 0.18 + Math.random() * 0.12) {
      arcSpawnTimer = 0;
      const burst = 1 + (Math.random() > 0.6 ? 1 : 0);
      let spawned = 0;
      for (let slot = 0; slot < MAX_ARCS && spawned < burst; slot++) {
        if ((arcLife[slot] ?? 0) <= 0) {
          spawnArc({ slot });
          spawned++;
        }
      }
    }
  }

  // Per-frame: redraw path (crackle), fade color, mark dead slots
  let arcsDirty = false;
  for (let slot = 0; slot < MAX_ARCS; slot++) {
    const life = arcLife[slot] ?? 0;
    if (life <= 0) continue;

    // Redraw the jittered path every frame for the crackling/wiggling effect
    redrawArc({ slot });

    const decay = arcDecay[slot] ?? 0.009;
    const newLife = Math.max(0, life - (isActive ? decay : decay * 8));
    arcLife[slot] = newLife;

    // Subtle flicker — narrow band so brightness is mostly stable
    const flicker = 0.88 + Math.random() * 0.12;
    const intensity = Math.pow(newLife, 0.5) * flicker;
    const base = slot * VERTS_PER_ARC;
    for (let v = 0; v < VERTS_PER_ARC; v++) {
      const cv = (base + v) * 3;
      arcColors[cv] = arcCol.r * intensity;
      arcColors[cv + 1] = arcCol.g * intensity;
      arcColors[cv + 2] = arcCol.b * intensity;
    }
    arcsDirty = true;
  }

  if (arcsDirty) {
    arcPosAttr.needsUpdate = true;
    arcColAttr.needsUpdate = true;
  }
});
</script>

<template>
  <TresPointLight
    ref="pointLightRef"
    :position="[0, 0, 5]"
    :color="activeColor ?? '#6366f1'"
    :intensity="2"
    :distance="30"
  />
  <TresPoints :geometry="geometry" :material="material" />
  <TresLineSegments :geometry="arcGeometry" :material="arcMaterial" />
</template>
