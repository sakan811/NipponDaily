<template>
  <UHeader :open="open" @update:open="$emit('update:open', $event)">
    <template #top>
      <div
        class="h-8 flex items-center justify-between text-stone-500 dark:text-stone-400"
      >
        <span class="kicker">{{ dateline }}</span>
        <span class="kicker hidden sm:inline">Japan News & Analysis</span>
      </div>
    </template>

    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2.5 text-2xl sm:text-3xl">
        <img
          src="/favicon-light.ico"
          alt="NipponDaily"
          class="w-[1em] h-[1em] dark:hidden border-[0.5px] border-neutral-900/60 rounded-sm opacity-70"
        />
        <img
          src="/favicon-dark.ico"
          alt="NipponDaily"
          class="w-[1em] h-[1em] hidden dark:block border-[0.5px] border-neutral-50/60 rounded-sm opacity-70"
        />
        <span
          class="font-serif font-bold text-[1em] tracking-tight leading-none text-stone-900 dark:text-white"
          >NipponDaily</span
        >
      </NuxtLink>
    </template>

    <template #right>
      <div class="flex items-center gap-4">
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
