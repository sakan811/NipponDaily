<template>
  <nav class="docs-contents" aria-label="Contents">
    <NuxtLink to="/docs" class="docs-contents-title">Contents</NuxtLink>
    <template v-for="part in DOC_PARTS" :key="part">
      <p class="docs-contents-part">{{ part }}</p>
      <ol>
        <li v-for="c in chaptersOf(part)" :key="c.slug">
          <NuxtLink
            :to="docPath(c.slug)"
            :aria-current="c.slug === current ? 'page' : undefined"
            :class="{ 'is-current': c.slug === current }"
          >
            <span class="docs-contents-no">{{
              chapterNumber(c.slug).toString().padStart(2, "0")
            }}</span>
            {{ c.title }}
          </NuxtLink>
        </li>
      </ol>
    </template>
  </nav>
</template>

<script setup lang="ts">
import {
  DOC_CHAPTERS,
  DOC_PARTS,
  chapterNumber,
  docPath,
} from "~~/shared/docs";

defineProps<{ current?: string }>();

const chaptersOf = (part: string) =>
  DOC_CHAPTERS.filter((c) => c.part === part);
</script>

<style scoped>
.docs-contents {
  font-family: var(--font-sans);
  font-size: 0.8125rem;
}
.docs-contents-title {
  display: block;
  margin-bottom: 0.5rem;
  font-family: var(--font-serif);
  font-size: 1.125rem;
  font-weight: 700;
  text-decoration: none;
}
.docs-contents-part {
  margin: 1rem 0 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
}
ol {
  margin: 0;
  padding: 0;
  list-style: none;
}
a {
  position: relative;
  display: block;
  padding: 0.2rem 0 0.2rem 0.75rem;
  text-decoration: none;
  opacity: 0.8;
}
a:hover {
  color: var(--primary-500);
  opacity: 1;
}
.docs-contents-no {
  margin-right: 0.35rem;
  font-variant-numeric: tabular-nums;
  opacity: 0.5;
}
/* The bookmark ribbon on the chapter being read. */
a.is-current {
  font-weight: 600;
  opacity: 1;
}
a.is-current::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.15rem;
  width: 0.3rem;
  height: 1.35rem;
  background: var(--primary-500);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
}
</style>
