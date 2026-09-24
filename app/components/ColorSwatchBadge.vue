<template>
  <UBadge
    color="gray"
    variant="outline"
    size="sm"
    class="gap-1.5 whitespace-nowrap"
    :title="`${swatch.name} ${hex}`"
  >
    <span
      class="inline-block w-2.5 h-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/20 shrink-0"
      :style="{ backgroundColor: swatch.hex }"
      aria-hidden="true"
    />
    <span>{{ swatch.name }}</span>
    <span class="font-mono font-normal opacity-70">{{ hex }}</span>
  </UBadge>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Swatch } from "~~/shared/seasons";

const props = defineProps<{ swatch: Swatch }>();

const hex = computed(() => props.swatch.hex.toUpperCase());
</script>
