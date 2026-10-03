<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <div class="season-backdrop" />

    <AppHeader />

    <main
      class="relative z-10 container mx-auto px-4 max-w-6xl py-8 sm:py-12 flex-1 lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-12"
    >
      <details class="docs-menu lg:hidden">
        <summary>Contents</summary>
        <DocsContents :current="slug" />
      </details>
      <aside class="hidden lg:block">
        <div class="sticky top-24">
          <DocsContents :current="slug" />
        </div>
      </aside>

      <article class="book-page">
        <header class="book-head">
          <span class="kicker"
            ><span class="season-glyph" aria-hidden="true" /> NipponDaily</span
          >
          <span>{{ chapter.part }}</span>
        </header>

        <p v-if="number" class="book-chapter">
          <span class="book-chapter-kanji" aria-hidden="true"
            >第{{ kanjiNumeral(number) }}章</span
          >
          <span class="kicker">Chapter {{ number }}</span>
        </p>
        <h1>{{ chapter.title }}</h1>
        <div class="rule-double max-w-[120px]" />

        <p class="book-lede">
          <slot name="lede">{{ chapter.summary }}</slot>
        </p>

        <div class="book-prose">
          <slot />
        </div>

        <footer class="book-foot">
          <NuxtLink v-if="prev" :to="docPath(prev.slug)" class="book-prev">
            <span class="kicker">Previous</span>
            {{ prev.title }}
          </NuxtLink>
          <span v-else />
          <span v-if="number" class="book-folio">{{ number }}</span>
          <span v-else />
          <NuxtLink v-if="next" :to="docPath(next.slug)" class="book-next">
            <span class="kicker">Next</span>
            {{ next.title }}
          </NuxtLink>
          <NuxtLink v-else to="/docs" class="book-next">
            <span class="kicker">Back to</span>
            Contents
          </NuxtLink>
        </footer>
      </article>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppHeader from "./AppHeader.vue";
import AppFooter from "./AppFooter.vue";
import DocsContents from "./DocsContents.vue";
import { usePageSeo } from "../composables/usePageSeo";
import {
  DOC_FRONT,
  chapterBySlug,
  chapterNumber,
  docPath,
  kanjiNumeral,
  neighbours,
} from "~~/shared/docs";

/**
 * One chapter of the docs, set as a book page. The title, summary, path and
 * the previous/next links all come from `shared/docs.ts`; a chapter only
 * supplies its body. The page itself follows the season (colour tokens,
 * motif, backdrop); the book look is the paper, the running head, the folio.
 */
const props = defineProps<{ slug?: string }>();

/** Without a slug this is the front page (`/docs`), the contents. */
const chapter = computed(() => {
  if (!props.slug) return DOC_FRONT;
  const found = chapterBySlug(props.slug);
  if (!found) throw new Error(`Unknown docs chapter "${props.slug}"`);
  return found;
});
const number = computed(() => (props.slug ? chapterNumber(props.slug) : 0));
const prev = computed(() => neighbours(props.slug).prev);
const next = computed(() => neighbours(props.slug).next);

usePageSeo({
  title: chapter.value.title,
  description: chapter.value.summary,
  path: props.slug ? docPath(props.slug) : "/docs",
});
</script>

<style scoped>
.docs-menu {
  margin-bottom: 1.25rem;
  padding: 0.6rem 1rem;
  border: 1px solid color-mix(in srgb, var(--primary-500) 25%, transparent);
  border-radius: var(--shape-panel);
  corner-shape: var(--corner-panel);
  font-family: var(--font-sans);
}
.docs-menu summary {
  cursor: pointer;
  font-family: var(--font-serif);
  font-weight: 700;
}
.docs-menu[open] summary {
  margin-bottom: 0.5rem;
}

/* The page: paper, a shadow in the gutter, a few page edges, and a printed
   frame in the season's colour. */
.book-page {
  --paper: #fffdf8;
  --paper-edge: #e6dfd0;
  position: relative;
  min-width: 0;
  padding: 2.25rem clamp(1.25rem, 5vw, 4.25rem) 1.75rem;
  color: #2b2622;
  background-color: var(--paper);
  background-image:
    linear-gradient(90deg, rgb(0 0 0 / 0.07), transparent 2.75rem),
    radial-gradient(circle at 80% 10%, rgb(0 0 0 / 0.015), transparent 45%);
  border-radius: 3px 0.9rem 0.9rem 3px;
  box-shadow:
    1px 1px 0 var(--paper-edge),
    2px 2px 0 var(--paper),
    3px 3px 0 var(--paper-edge),
    4px 4px 0 var(--paper),
    5px 5px 0 var(--paper-edge),
    0 28px 40px -28px color-mix(in srgb, var(--primary-500) 40%, transparent);
}
.book-page::after {
  content: "";
  position: absolute;
  inset: 0.7rem 0.7rem 0.7rem 1.4rem;
  border: 1px solid color-mix(in srgb, var(--primary-500) 16%, transparent);
  border-radius: 2px 0.5rem 0.5rem 2px;
  pointer-events: none;
}

.book-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2.5rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid
    color-mix(in srgb, var(--primary-500) 22%, transparent);
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-style: italic;
  letter-spacing: 0.04em;
  opacity: 0.75;
}
.book-head .kicker {
  font-style: normal;
}

.book-chapter {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin: 0 0 0.25rem;
  color: var(--primary-500);
}
.book-chapter-kanji {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 700;
}

h1 {
  margin: 0 0 0.75rem;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.book-lede {
  margin: 1.5rem 0 0;
  font-family: var(--font-body-serif);
  font-size: 1.125rem;
  line-height: 1.8;
  opacity: 0.85;
}
.book-lede::first-letter {
  float: left;
  margin: 0.05em 0.1em 0 0;
  font-family: var(--font-serif);
  font-size: 3.4em;
  font-weight: 700;
  line-height: 0.8;
  color: var(--primary-500);
}

.book-prose {
  counter-reset: section figure;
  margin-top: 2rem;
  font-family: var(--font-body-serif);
  font-size: 1rem;
  line-height: 1.85;
}

.book-prose :deep(h2) {
  counter-increment: section;
  margin: 3rem 0 1rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid
    color-mix(in srgb, var(--primary-500) 25%, transparent);
  font-family: var(--font-serif);
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.3;
  scroll-margin-top: 6rem;
}
.book-prose :deep(h2)::before {
  content: counter(section) ". ";
  color: var(--primary-500);
}
.book-prose :deep(h3) {
  margin: 2rem 0 0.5rem;
  font-family: var(--font-serif);
  font-size: 1.2rem;
  font-weight: 700;
}
.book-prose :deep(p),
.book-prose :deep(ul),
.book-prose :deep(ol),
.book-prose :deep(dl) {
  margin: 0 0 1rem;
}
.book-prose :deep(ul),
.book-prose :deep(ol) {
  padding-left: 1.4rem;
}
.book-prose :deep(ul) {
  list-style: disc;
}
.book-prose :deep(ol) {
  list-style: decimal;
}
.book-prose :deep(li) {
  margin-bottom: 0.4rem;
}
.book-prose :deep(li)::marker {
  color: var(--primary-500);
}
.book-prose :deep(a) {
  color: var(--primary-600);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.book-prose :deep(code) {
  padding: 0.1em 0.35em;
  border-radius: 4px;
  background: color-mix(in srgb, var(--primary-500) 9%, transparent);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
  overflow-wrap: anywhere;
}
.book-prose :deep(pre) {
  margin: 0 0 1.25rem;
  padding: 0.9rem 1rem;
  overflow-x: auto;
  border-radius: var(--shape-panel);
  corner-shape: var(--corner-panel);
  background: color-mix(in srgb, var(--primary-500) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary-500) 15%, transparent);
  font-size: 0.8rem;
  line-height: 1.6;
}
.book-prose :deep(pre code) {
  padding: 0;
  background: none;
  font-size: inherit;
  overflow-wrap: normal;
}

/* A table set like a book's: rules above and below, none between columns. */
.book-prose :deep(.table-wrap) {
  margin: 0 0 1.5rem;
  overflow-x: auto;
}
.book-prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  border-top: 2px solid var(--primary-500);
  border-bottom: 2px solid var(--primary-500);
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  line-height: 1.6;
}
.book-prose :deep(th) {
  padding: 0.5rem 0.75rem 0.5rem 0;
  border-bottom: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-align: left;
  text-transform: uppercase;
}
.book-prose :deep(td) {
  padding: 0.5rem 0.75rem 0.5rem 0;
  vertical-align: top;
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
}
.book-prose :deep(tr:last-child td) {
  border-bottom: 0;
}

/* A note: the season-shaped box in the margin of the page. */
.book-prose :deep(.note) {
  margin: 1.5rem 0;
  padding: 0.9rem 1.1rem;
  border-radius: var(--shape-panel);
  corner-shape: var(--corner-panel);
  border: 1px solid color-mix(in srgb, var(--primary-500) 30%, transparent);
  border-left-width: 4px;
  background: color-mix(in srgb, var(--primary-500) 6%, transparent);
  font-size: 0.9rem;
  line-height: 1.7;
}
.book-prose :deep(.note > :last-child) {
  margin-bottom: 0;
}
.book-prose :deep(.note-title) {
  display: block;
  margin-bottom: 0.25rem;
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary-600);
}

.book-foot {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: start;
  gap: 1rem;
  margin-top: 3.5rem;
  padding-top: 1rem;
  border-top: 1px solid color-mix(in srgb, var(--primary-500) 22%, transparent);
  font-family: var(--font-serif);
  font-size: 0.95rem;
}
.book-foot a {
  display: block;
  text-decoration: none;
}
.book-foot a:hover {
  color: var(--primary-500);
}
.book-foot .kicker {
  display: flex;
  opacity: 0.55;
}
.book-next {
  text-align: right;
}
.book-next .kicker {
  justify-content: flex-end;
}
.book-folio {
  font-family: var(--font-serif);
  font-size: 0.9rem;
  opacity: 0.6;
}
.book-folio::before,
.book-folio::after {
  content: " — ";
}
</style>

<style>
/* Dark mode: the class is on <html>, outside this component's scope. */
.dark .book-page {
  --paper: #151a24;
  --paper-edge: #262d3b;
  color: #e7e2d9;
  background-image:
    linear-gradient(90deg, rgb(0 0 0 / 0.35), transparent 2.75rem),
    radial-gradient(circle at 80% 10%, rgb(255 255 255 / 0.02), transparent 45%);
}
.dark .book-prose a {
  color: var(--primary-400);
}
.dark .book-prose .note-title {
  color: var(--primary-400);
}
</style>
