<template>
  <div :class="rootClass">
    <div v-if="$slots.header" :class="headerClass">
      <slot name="header" />
    </div>
    <div :class="bodyClass">
      <slot />
    </div>
    <div v-if="$slots.footer" :class="footerClass">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  inheritAttrs: true,
});

const props = withDefaults(
  defineProps<{
    ui?: {
      root?: string;
      header?: string;
      body?: string;
      footer?: string;
    };
  }>(),
  {
    ui: undefined,
  }
);

const rootClass = computed(() => {
  if (props.ui?.root !== undefined) {
    return props.ui.root;
  }
  return "u-card w-full rounded-xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900/50 shadow-sm";
});

const headerClass = computed(() => {
  return props.ui?.header ?? "px-4 sm:px-6 py-4 border-b border-stone-100 dark:border-stone-800/80";
});

const bodyClass = computed(() => {
  return props.ui?.body ?? "p-4 sm:p-6";
});

const footerClass = computed(() => {
  return props.ui?.footer ?? "px-4 sm:px-6 py-4 border-t border-stone-100 dark:border-stone-800/80";
});
</script>
