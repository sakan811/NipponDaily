<template>
  <div ref="container" class="u-popover relative inline-block w-full">
    <!-- Trigger -->
    <div @click="togglePopover">
      <slot />
    </div>

    <!-- Content Panel -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95 -translate-y-2"
      enter-to-class="transform opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100 translate-y-0"
      leave-to-class="transform opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 mt-2 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl overflow-hidden p-2"
      >
        <slot name="content" :close="closePopover" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isOpen = ref(false);
const container = ref<HTMLElement | null>(null);

const togglePopover = () => {
  isOpen.value = !isOpen.value;
};

const closePopover = () => {
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    closePopover();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
