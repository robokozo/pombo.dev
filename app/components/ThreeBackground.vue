<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import ParticleSystem from "./ParticleSystem.vue";

defineProps<{
  activeColor: string | null;
  transitionColor: string | null;
}>();

const emit = defineEmits<{ "transition-done": [] }>();
</script>

<template>
  <TresCanvas window-size :alpha="false" :antialias="true">
    <TresPerspectiveCamera :position="[0, 0, 10]" :fov="60" />
    <TresAmbientLight :intensity="0.4" />
    <ParticleSystem
      :active-color="activeColor"
      :transition-color="transitionColor"
      @transition-done="emit('transition-done')"
    />
  </TresCanvas>
</template>
