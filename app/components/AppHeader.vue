<template>
  <UHeader :open="open" @update:open="$emit('update:open', $event)">
    <template #top>
      <div
        class="h-8 flex items-center justify-between text-stone-500 dark:text-stone-400"
      >
        <span class="kicker"
          ><span class="season-glyph" aria-hidden="true" /> {{ dateline }}</span
        >
        <span class="kicker hidden sm:inline"
          >A New Japanese Game Every Day</span
        >
      </div>
    </template>

    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2.5 text-2xl sm:text-3xl">
        <span
          class="relative flex items-center justify-center w-[1.35em] h-[1.35em] rounded-full bg-primary-500/10 ring-1 ring-primary-500/30 shrink-0"
        >
          <img
            src="/favicon-light.ico"
            alt="NipponDaily"
            class="w-[0.8em] h-[0.8em] dark:hidden rounded-full"
          />
          <img
            src="/favicon-dark.ico"
            alt="NipponDaily"
            class="w-[0.8em] h-[0.8em] hidden dark:block rounded-full"
          />
        </span>
        <span
          class="font-serif font-bold text-[1em] leading-none text-stone-900 dark:text-white"
          >NipponDaily</span
        >
      </NuxtLink>
    </template>

    <template #right>
      <div class="flex items-center gap-4">
        <nav
          class="hidden sm:flex items-center gap-4 text-sm font-medium text-stone-600 dark:text-stone-300"
        >
          <NuxtLink to="/learn" class="hover:text-primary-500 transition-colors"
            >Lessons</NuxtLink
          >
          <NuxtLink to="/vocab" class="hover:text-primary-500 transition-colors"
            >Vocabulary</NuxtLink
          >
          <NuxtLink to="/game" class="hover:text-primary-500 transition-colors"
            >Daily Game</NuxtLink
          >
        </nav>
        <UColorModeButton class="hover:text-primary-500 transition-colors" />
      </div>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

defineProps<{
  open?: boolean;
}>();

defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const dateline = ref("");

onMounted(() => {
  dateline.value = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});
</script>
