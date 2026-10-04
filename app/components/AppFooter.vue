<template>
  <UFooter
    class="relative z-10 border-t border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-[#0B0E14]"
  >
    <template #left>
      <p class="text-xs text-stone-500 dark:text-stone-400 font-sans">
        &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. Released under
        the Apache-2.0 License.
      </p>
    </template>
    <template #right>
      <p class="text-xs text-stone-500 dark:text-stone-400 font-sans">
        Origins quoted from
        <a
          :href="SOURCES.wiktionary.url"
          target="_blank"
          rel="noopener"
          class="underline hover:text-primary-500"
          >{{ SOURCES.wiktionary.short }}</a
        >
        ({{ SOURCES.wiktionary.licence.name }}) via
        <a
          :href="SOURCES.wiktionary.via.url"
          target="_blank"
          rel="noopener"
          class="underline hover:text-primary-500"
          >{{ SOURCES.wiktionary.via.name }}</a
        >; meanings &amp; kanji from {{ SOURCES.edrdg.short }} ({{
          SOURCES.edrdg.holderShort
        }}, {{ SOURCES.edrdg.licence.name }}) —
        <NuxtLink
          to="/docs/data-integrity"
          class="underline hover:text-primary-500"
          >how we check it</NuxtLink
        >
      </p>
    </template>
  </UFooter>
</template>

<script setup lang="ts">
import { SOURCES } from "~~/shared/sources";
</script>
