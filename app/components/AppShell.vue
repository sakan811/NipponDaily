<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <!-- Season-patterned backdrop (shoji grid / ripples / hishi lattice / snow) -->
    <div class="season-backdrop" />

    <AppHeader />

    <slot />

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import AppFooter from "./AppFooter.vue";
</script>
