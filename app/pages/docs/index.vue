<template>
  <DocsBook>
    <h2 class="sr-only">Chapters</h2>
    <template v-for="part in DOC_PARTS" :key="part">
      <div class="part">{{ part }}</div>
      <ol class="toc">
        <li v-for="c in chaptersOf(part)" :key="c.slug">
          <NuxtLink :to="docPath(c.slug)">
            <span class="toc-line">
              <span class="toc-title">{{ c.title }}</span>
              <span class="toc-no">{{ chapterNumber(c.slug) }}</span>
            </span>
            <span class="toc-summary">{{ c.summary }}</span>
          </NuxtLink>
        </li>
      </ol>
    </template>
  </DocsBook>
</template>

<script setup lang="ts">
import DocsBook from "../../components/DocsBook.vue";
import {
  DOC_CHAPTERS,
  DOC_PARTS,
  chapterNumber,
  docPath,
} from "~~/shared/docs";

const chaptersOf = (part: string) =>
  DOC_CHAPTERS.filter((c) => c.part === part);
</script>

<style scoped>
.part {
  margin: 2rem 0 0.75rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--primary-500);
}
ol.toc {
  margin: 0;
  padding: 0;
  list-style: none;
}
ol.toc > li {
  margin: 0 0 1rem;
}
ol.toc a {
  display: block;
  color: inherit;
  text-decoration: none;
}
.toc-line {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  font-weight: 700;
}
/* The dotted leader between a title and its page number. */
.toc-line::after {
  content: "";
  order: 1;
  flex: 1;
  border-bottom: 2px dotted color-mix(in srgb, currentColor 30%, transparent);
  transform: translateY(-0.25em);
}
.toc-no {
  order: 2;
  font-variant-numeric: tabular-nums;
}
ol.toc a:hover .toc-title {
  color: var(--primary-500);
}
.toc-summary {
  display: block;
  max-width: 34rem;
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.75;
}
</style>
