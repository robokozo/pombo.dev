<script setup lang="ts">
import { TresCanvas } from "@tresjs/core";
import ParticleSystem from "./ParticleSystem.vue";

defineProps<{
  activeColor: string | null;
}>();
</script>

<template>
  <TresCanvas window-size :alpha="false" :antialias="true">
    <TresPerspectiveCamera :position="[0, 0, 10]" :fov="60" />
    <TresAmbientLight :intensity="0.4" />
    <ParticleSystem :active-color="activeColor" />
  </TresCanvas>
</template>
