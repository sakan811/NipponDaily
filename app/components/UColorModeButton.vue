<template>
  <UButton
    :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
    color="gray"
    variant="ghost"
    class="u-color-mode-button"
    aria-label="Toggle color mode"
    @click="toggleColorMode"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const isDark = ref(false);

const toggleColorMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("color-theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("color-theme", "light");
  }
};

onMounted(() => {
  // Sync state with HTML element class
  isDark.value = document.documentElement.classList.contains("dark");
});
</script>
