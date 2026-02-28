<template>
  <UPage>
    <UHeader :toggle="false">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" />
          <span>NipponDaily</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UButton
            to="/news"
            label="Get News"
            variant="ghost"
            color="primary"
            icon="i-heroicons-newspaper"
          />
          <UColorModeButton />
        </div>
      </template>
    </UHeader>

    <main class="max-w-4xl mx-auto py-8 px-4 prose dark:prose-invert max-w-none">
      <h1 class="text-3xl font-bold mb-6 text-primary-500">Documentation Overview</h1>
      <p class="mb-4 text-gray-700 dark:text-gray-300">
        Welcome to the NipponDaily documentation. Here you can find details about our system architecture and the features we offer.
      </p>

      <div class="flex gap-4 mt-8">
        <UButton to="/docs/architecture" label="Architecture" icon="i-heroicons-building-office-2" />
        <UButton to="/docs/features" label="Features" icon="i-heroicons-star" />
      </div>
    </main>

    <UFooter>
      <template #left>
        <p class="text-sm text-secondary-500">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. All rights reserved.
        </p>
      </template>
    </UFooter>
  </UPage>
</template>

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
