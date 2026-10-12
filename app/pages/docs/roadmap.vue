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

    <ul>
      <li>
        <strong>One spelling, several readings.</strong> The origin pins, the
        sentences, the pitch accents and the uniqueness check are keyed by
        spelling, so a pool word whose spelling another word already holds (後
        ご next to 後 あと) is not planned. Keying them by spelling and reading
        would let every pool word in.
      </li>
    </ul>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
</script>
