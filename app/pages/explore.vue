<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <div class="season-backdrop" />

    <AppHeader />

    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <div class="max-w-2xl space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">Explore</p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Find words by how they're built
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          Search every word that has opened, then narrow by JLPT level, layer of
          the vocabulary or the process that shaped it. Each option shows how
          many words it would leave.
        </p>
      </div>

      <form
        class="mt-10 space-y-6"
        role="search"
        aria-label="Filter the words"
        @submit.prevent="applySearch"
      >
        <div class="flex flex-col sm:flex-row gap-3">
          <label class="sr-only" for="explore-q">Search words</label>
          <input
            id="explore-q"
            v-model="text"
            data-testid="explore-search"
            type="search"
            maxlength="50"
            autocomplete="off"
            placeholder="Search a word, its reading, or its meaning"
            class="flex-1 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-2.5 font-body-serif text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
            @input="onType"
          />
          <UButton
            v-if="active"
            data-testid="explore-clear"
            label="Clear filters"
            color="secondary"
            variant="outline"
            size="sm"
            @click="clear"
          />
        </div>

        <fieldset class="space-y-2">
          <legend class="kicker text-stone-500 dark:text-stone-400">
            JLPT level
          </legend>
          <div class="flex flex-wrap gap-2" data-testid="facet-level">
            <button
              v-for="f in facets?.level ?? []"
              :key="f.value"
              type="button"
              :aria-pressed="filters.level === f.value"
              :disabled="!f.count && filters.level !== f.value"
              :class="chip(filters.level === f.value, !f.count)"
              @click="toggle('level', f.value)"
            >
              {{ f.value }}
              <span class="chip-count">{{ f.count }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="kicker text-stone-500 dark:text-stone-400">
            Layer of the vocabulary
          </legend>
          <div class="flex flex-wrap gap-2" data-testid="facet-stratum">
            <button
              v-for="f in facets?.stratum ?? []"
              :key="f.value"
              type="button"
              :aria-pressed="filters.stratum === f.value"
              :disabled="!f.count && filters.stratum !== f.value"
              :class="chip(filters.stratum === f.value, !f.count)"
              @click="toggle('stratum', f.value)"
            >
              <span
                :class="[
                  'inline-block h-2 w-2 rounded-full',
                  STRATUM_DOT[f.value],
                ]"
                aria-hidden="true"
              />
              {{ WORD_STRATA[f.value].native }}
              {{ WORD_STRATA[f.value].label }}
              <span class="chip-count">{{ f.count }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="kicker text-stone-500 dark:text-stone-400">
            Process
          </legend>
          <div class="flex flex-wrap gap-2" data-testid="facet-process">
            <button
              v-for="f in facets?.process ?? []"
              :key="f.value"
              type="button"
              :aria-pressed="filters.process === f.value"
              :disabled="!f.count && filters.process !== f.value"
              :title="WORD_PROCESSES[f.value].description"
              :class="chip(filters.process === f.value, !f.count)"
              @click="toggle('process', f.value)"
            >
              {{ WORD_PROCESSES[f.value].label }}
              <span class="chip-count">{{ f.count }}</span>
            </button>
          </div>
        </fieldset>

        <p
          v-if="filters.part"
          class="text-sm text-stone-600 dark:text-stone-400"
        >
          Only words taken apart into
          <NuxtLink
            :to="partPath(filters.part)"
            class="font-serif text-lg text-primary-600 dark:text-primary-400"
            >{{ filters.part }}</NuxtLink
          >.
          <button
            type="button"
            data-testid="explore-clear-part"
            class="underline hover:text-primary-500"
            @click="toggle('part', filters.part)"
          >
            Remove
          </button>
        </p>
      </form>

      <TrendingFallback
        v-if="error"
        class="mt-10"
        :error="error"
        :loading="loading"
        title="Unable to Load the Words"
        @retry="refresh()"
      />

      <section v-else-if="result" class="mt-10 space-y-4" aria-live="polite">
        <p
          data-testid="explore-count"
          class="text-sm text-stone-500 dark:text-stone-400"
        >
          {{ result.count }} of {{ result.total }}
          {{ result.total === 1 ? "word" : "words" }}
        </p>

        <ul
          v-if="result.words.length"
          data-testid="explore-results"
          class="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <li v-for="w in result.words" :key="w.date">
            <NuxtLink
              :to="`/words/${w.date}`"
              data-testid="explore-word"
              class="season-box block h-full border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3 hover:border-primary-500 transition-colors"
            >
              <span class="flex items-baseline justify-between gap-3">
                <span
                  class="text-2xl font-serif font-bold text-stone-900 dark:text-white break-all"
                  >{{ w.term }}</span
                >
                <span
                  class="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 shrink-0"
                >
                  <span
                    v-if="w.stratum"
                    :class="[
                      'inline-block h-2 w-2 rounded-full',
                      STRATUM_DOT[w.stratum],
                    ]"
                    :title="WORD_STRATA[w.stratum].label"
                  />
                  {{ w.level }}
                </span>
              </span>
              <span
                class="block text-sm text-primary-600 dark:text-primary-400"
                >{{ w.kana }}</span
              >
              <span
                class="mt-1 block text-sm text-stone-600 dark:text-stone-400 font-body-serif"
                >{{ w.meaning }}</span
              >
              <span
                class="mt-1 block text-xs text-stone-400 dark:text-stone-500"
                >{{ formatLongDate(w.date) }}</span
              >
            </NuxtLink>
          </li>
        </ul>
        <p
          v-else
          data-testid="explore-empty"
          class="text-stone-600 dark:text-stone-400 font-body-serif"
        >
          No word that has opened matches all of those. Remove a filter to widen
          the search.
        </p>

        <p class="pt-6 text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
          Only words that have opened are searched. A layer is shown only when
          KANJIDIC2 or the cited text establishes it, so a few words have none
          and never match a layer filter.
        </p>
      </section>

      <div v-else class="mt-10 space-y-3" aria-busy="true">
        <USkeleton class="h-6 w-32" />
        <USkeleton class="h-48 w-full" />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useRoute, useRouter } from "#app";
import AppHeader from "../components/AppHeader.vue";
import AppFooter from "../components/AppFooter.vue";
import TrendingFallback from "../components/TrendingFallback.vue";
import { useExplore } from "../composables/useExplore";
import { usePageSeo } from "../composables/usePageSeo";
import { formatLongDate } from "../utils/date";
import { partPath } from "../utils/seo";
import { STRATUM_DOT } from "../utils/stratum";
import { JLPT_LEVELS } from "~~/shared/jlpt";
import { WORD_PROCESSES, WORD_STRATA } from "~~/shared/word-labels";
import type { ExploreFilters } from "~~/types/index";

const route = useRoute();
const router = useRouter();

const first = (v: unknown): string | undefined => {
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" && s ? s : undefined;
};

/** The filters in the URL, keeping only values the API would accept so a stale or
 *  hand-edited link opens the page rather than an error. */
function fromQuery(query: Record<string, unknown>): ExploreFilters {
  const level = first(query.level);
  const stratum = first(query.stratum);
  const process = first(query.process);
  return {
    q: first(query.q)?.slice(0, 50),
    level: (JLPT_LEVELS as readonly string[]).includes(level ?? "")
      ? (level as ExploreFilters["level"])
      : undefined,
    stratum: stratum && stratum in WORD_STRATA ? (stratum as never) : undefined,
    process:
      process && process in WORD_PROCESSES ? (process as never) : undefined,
    part: first(query.part)?.slice(0, 12),
  };
}

const clean = (f: ExploreFilters): ExploreFilters =>
  Object.fromEntries(
    Object.entries(f).filter(([, v]) => v !== undefined && v !== ""),
  );

const filters = ref<ExploreFilters>(clean(fromQuery(route.query)));
const text = ref(filters.value.q ?? "");

const { result, loading, error, refresh } = useExplore(() => filters.value);
const facets = computed(() => result.value?.facets);
const active = computed(() => Object.keys(filters.value).length > 0);

usePageSeo({
  title: "Explore the words",
  description:
    "Search every word NipponDaily has taken apart and filter by JLPT level, layer of the vocabulary and the process that shaped it.",
  path: "/explore",
});

const set = async (next: ExploreFilters): Promise<void> => {
  filters.value = clean(next);
  await router.replace({ query: { ...filters.value } });
};

function toggle<K extends keyof ExploreFilters>(
  key: K,
  value: ExploreFilters[K],
): void {
  void set({
    ...filters.value,
    [key]: filters.value[key] === value ? undefined : value,
  });
}

let timer: ReturnType<typeof setTimeout> | undefined;
const applySearch = (): void => {
  clearTimeout(timer);
  void set({ ...filters.value, q: text.value.trim() || undefined });
};
const onType = (): void => {
  clearTimeout(timer);
  timer = setTimeout(applySearch, 250);
};
onBeforeUnmount(() => clearTimeout(timer));

const clear = (): void => {
  clearTimeout(timer);
  text.value = "";
  void set({});
};

const chip = (pressed: boolean, empty: boolean): string =>
  [
    "season-chip inline-flex items-center gap-1.5 border px-3 py-1 text-sm transition-colors",
    pressed
      ? "border-primary-500 bg-primary-500/10 text-primary-700 dark:text-primary-300"
      : "border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 hover:border-primary-500",
    empty && !pressed ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
  ].join(" ");
</script>

<style scoped>
.chip-count {
  font-size: 0.7rem;
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
}
</style>
