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
  },
);

const rootClass = computed(() => {
  if (props.ui?.root !== undefined) {
    return props.ui.root;
  }
  // Corner shape, shadow, and corner motif come from the season's
  // --shape-*/--motif-* tokens (app/assets/css/tailwind.css).
  return "u-card w-full rounded-(--shape-card) border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-stone-900/50";
});

const headerClass = computed(() => {
  return (
    props.ui?.header ??
    "px-4 sm:px-6 py-4 border-b border-stone-100 dark:border-stone-800/80"
  );
});

const bodyClass = computed(() => {
  return props.ui?.body ?? "p-4 sm:p-6";
});

const footerClass = computed(() => {
  return (
    props.ui?.footer ??
    "px-4 sm:px-6 py-4 border-t border-stone-100 dark:border-stone-800/80"
  );
});
</script>
