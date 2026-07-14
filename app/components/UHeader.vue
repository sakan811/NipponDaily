<template>
  <header
    class="u-header sticky top-0 z-40 w-full bg-[#FCFBF7]/80 dark:bg-[#0B0E14]/80 backdrop-blur-md border-b border-stone-200/50 dark:border-stone-800/50"
  >
    <div class="mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
      <!-- Left side (Logo & Brand) -->
      <div class="flex items-center">
        <slot name="left" />
      </div>

      <!-- Right side actions & Hamburger Menu -->
      <div class="flex items-center gap-2 md:gap-4">
        <slot name="right" />
        <button
          v-if="$slots.body"
          type="button"
          class="md:hidden p-2 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
          @click="toggleMenu"
        >
          <UIcon
            :name="open ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
            class="w-5 h-5"
          />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Panel -->
    <transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div
        v-if="open && $slots.body"
        class="md:hidden border-b border-stone-200 dark:border-stone-800 bg-[#FCFBF7] dark:bg-[#0B0E14] px-4 py-4 space-y-3 shadow-lg"
      >
        <slot name="body" />
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open?: boolean;
  }>(),
  {
    open: false,
  },
);

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const toggleMenu = () => {
  emit("update:open", !props.open);
};
</script>
