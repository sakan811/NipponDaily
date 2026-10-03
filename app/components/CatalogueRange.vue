<template>
  <span>{{ text }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCatalogue } from "../composables/useCatalogue";
import { rangeMonthsText } from "~~/shared/catalogue";

/**
 * The written word range and count, read live from `GET /api/catalogue` so no
 * page types them. States no number if the fetch fails.
 */
const { catalogue } = useCatalogue();

const text = computed(() => {
  const c = catalogue.value;
  return c
    ? `${rangeMonthsText(c)} (${c.total} words)`
    : "the months written so far";
});
</script>
