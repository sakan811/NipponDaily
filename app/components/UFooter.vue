<template>
  <footer class="u-footer w-full py-8 mt-auto">
    <div class="mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center w-full sm:w-auto">
        <slot name="left" />
      </div>
      <div class="flex items-center w-full sm:w-auto justify-end">
        <slot name="right" />
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Simple page footer layout
</script>
