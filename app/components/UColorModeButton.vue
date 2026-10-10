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
import { STORAGE_KEYS } from "~~/shared/storage-keys";

const isDark = ref(false);

const toggleColorMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem(STORAGE_KEYS.colorTheme, "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem(STORAGE_KEYS.colorTheme, "light");
  }
};

onMounted(() => {
  // Sync state with HTML element class
  isDark.value = document.documentElement.classList.contains("dark");
});
</script>
