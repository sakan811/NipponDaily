<template>
  <DocsBook slug="roadmap">
    <template #lede>
      What is left to build or fix, and nothing else. A finished item is deleted
      from here, and the chapter that owns the feature describes it.
    </template>

    <p>
      Any item follows the
      <NuxtLink to="/docs/core-theme">principles</NuxtLink> and the
      <NuxtLink to="/docs/architecture">import rule</NuxtLink>: read open days
      only, derive rather than claim, and store nothing about a reader.
    </p>

    <p><strong>Nothing is open right now.</strong></p>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
</script>
