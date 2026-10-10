<template>
  <AppShell>
    <main
      class="relative z-10 container mx-auto px-4 py-16 text-center max-w-lg flex-1"
    >
      <h1
        class="text-6xl font-serif font-bold text-primary-600 dark:text-primary-400 mb-4"
      >
        404
      </h1>
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
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from "../components/AppShell.vue";
import { setResponseStatus, useRequestEvent, useSeoMeta } from "#app";

definePageMeta({
  layout: false,
});

// A real 404 for crawlers, not a 200 that happens to say "not found".
if (import.meta.server) {
  const event = useRequestEvent();
  if (event) setResponseStatus(event, 404);
}
useSeoMeta({ title: "Page not found", robots: "noindex, nofollow" });
</script>
