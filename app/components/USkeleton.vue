<template>
  <div
    :class="[
      'u-skeleton animate-pulse bg-stone-200 dark:bg-stone-850',
      $attrs.class,
    ]"
  />
</template>

<script setup lang="ts">
// Simple loading skeleton element
defineOptions({
  inheritAttrs: false,
});
</script>
