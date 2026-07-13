<template>
  <kbd :class="kbdClasses">
    <slot />
  </kbd>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    size?: "sm" | "md" | "lg";
  }>(),
  {
    size: "md",
  }
);

const kbdClasses = computed(() => {
  const base = "u-kbd inline-flex items-center justify-center font-mono font-bold border border-stone-200/80 dark:border-stone-800 bg-stone-100/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-400 rounded shadow-[0_1.5px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_1.5px_0_0_rgba(255,255,255,0.05)] select-none";
  
  const sizes = {
    sm: "px-1 text-[9px] min-h-[16px]",
    md: "px-1.5 py-0.5 text-[10px] sm:text-[11px] min-h-[20px]",
    lg: "px-2 py-1 text-xs min-h-[24px]",
  };
  
  return [base, sizes[props.size] || sizes.md].join(" ");
});
</script>
