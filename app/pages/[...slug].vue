<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 flex flex-col justify-between"
  >
    <AppHeader />

    <main class="container mx-auto px-4 py-16 text-center max-w-lg">
      <h1 class="text-6xl font-serif font-bold text-primary-500 mb-4">404</h1>
      <h2 class="text-2xl font-bold mb-3">Page Not Found</h2>
      <p class="text-stone-600 dark:text-stone-400 mb-6">
        The page or resource you are looking for does not exist or has been
        moved.
      </p>
      <UButton
        to="/"
        label="Return to Home"
        color="primary"
        icon="i-heroicons-home"
      />
    </main>

    <UFooter
      class="border-t border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-[#0B0E14]"
    >
      <template #left>
        <p class="text-xs text-stone-500 dark:text-stone-400">
          &copy; {{ new Date().getFullYear() }} NipponDaily. All rights
          reserved.
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue";

definePageMeta({
  layout: false,
});
</script>
