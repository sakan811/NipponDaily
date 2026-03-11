<template>
  <UPage>
    <UHeader>
      <template #left>
        <NuxtLink to="/docs" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" />
          <span>NipponDaily Docs</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UColorModeButton />
        </div>
      </template>
    </UHeader>

    <main
      class="max-w-4xl mx-auto py-12 px-4 prose dark:prose-invert flex flex-col items-center text-center"
    >
      <h1 class="text-4xl font-extrabold mb-6 text-primary-500">
        Documentation Overview
      </h1>
      <p class="mb-8 text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
        Welcome to the NipponDaily documentation. Here you can find details
        about our system architecture and the features we offer.
      </p>

      <div class="flex flex-wrap justify-center gap-6 mt-4">
        <UButton
          to="/docs/architecture"
          size="lg"
          label="Architecture"
          icon="i-heroicons-building-office-2"
          class="px-8"
        />
        <UButton
          to="/docs/features"
          size="lg"
          label="Features"
          icon="i-heroicons-star"
          variant="soft"
          class="px-8"
        />
      </div>
    </main>

    <UFooter>
      <template #left>
        <p class="text-sm text-secondary-500">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. Released
          under the Apache-2.0 License.
        </p>
      </template>
    </UFooter>
  </UPage>
</template>

<script setup lang="ts">
// Docs overview
</script>

<style>
@reference "../../assets/css/tailwind.css";

/* Basic markdown styling for standard elements */
h1 {
  @apply text-3xl font-bold mb-6 text-primary-500;
}
h2 {
  @apply text-2xl font-semibold mb-4 text-primary-500;
}
p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}
</style>
