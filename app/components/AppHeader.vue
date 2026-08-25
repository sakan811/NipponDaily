<template>
  <UHeader
    :open="open"
    class="border-b border-stone-200 dark:border-stone-800 bg-[#FDFBF7]/90 dark:bg-[#0B0E14]/90 backdrop-blur-md"
    @update:open="$emit('update:open', $event)"
  >
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-3">
        <img
          src="/favicon-light.ico"
          alt="NipponDaily"
          class="w-8 h-8 dark:hidden border-[0.5px] border-neutral-900/60 rounded-sm"
        />
        <img
          src="/favicon-dark.ico"
          alt="NipponDaily"
          class="w-8 h-8 hidden dark:block border-[0.5px] border-neutral-50/60 rounded-sm"
        />
        <div class="flex flex-col">
          <span class="font-serif font-bold text-lg tracking-wide leading-none"
            >NipponDaily</span
          >
        </div>
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
defineProps<{
  open?: boolean;
}>();

defineEmits<{
  (e: "update:open", value: boolean): void;
}>();
</script>
