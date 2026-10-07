<template>
  <form
    class="space-y-6"
    role="search"
    aria-label="Filter the words"
    @submit.prevent="applySearch"
  >
    <div class="flex flex-col sm:flex-row gap-3">
      <label class="sr-only" for="word-filter-q">Search words</label>
      <input
        id="word-filter-q"
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
          :aria-pressed="chosen('level', f.value)"
          :disabled="!f.count && !chosen('level', f.value)"
          :class="chip(chosen('level', f.value), !f.count)"
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
          :aria-pressed="chosen('stratum', f.value)"
          :disabled="!f.count && !chosen('stratum', f.value)"
          :title="layer(f.value).description"
          :class="chip(chosen('stratum', f.value), !f.count)"
          @click="toggle('stratum', f.value)"
        >
          <span
            :class="['inline-block h-2 w-2 rounded-full', STRATUM_DOT[f.value]]"
            aria-hidden="true"
          />
          {{ layer(f.value).native }}
          {{ layer(f.value).label }}
          <span class="chip-count">{{ f.count }}</span>
        </button>
      </div>
    </fieldset>

    <fieldset class="space-y-2">
      <legend class="kicker text-stone-500 dark:text-stone-400">Process</legend>
      <div class="flex flex-wrap gap-2" data-testid="facet-process">
        <button
          v-for="f in facets?.process ?? []"
          :key="f.value"
          type="button"
          :aria-pressed="chosen('process', f.value)"
          :disabled="!f.count && !chosen('process', f.value)"
          :title="WORD_PROCESSES[f.value].description"
          :class="chip(chosen('process', f.value), !f.count)"
          @click="toggle('process', f.value)"
        >
          {{ WORD_PROCESSES[f.value].label }}
          <span class="chip-count">{{ f.count }}</span>
        </button>
      </div>
    </fieldset>

    <fieldset class="space-y-2">
      <legend class="kicker text-stone-500 dark:text-stone-400">
        Part of speech
      </legend>
      <div class="flex flex-wrap gap-2" data-testid="facet-pos">
        <button
          v-for="f in facets?.pos ?? []"
          :key="f.value"
          type="button"
          :aria-pressed="chosen('pos', f.value)"
          :disabled="!f.count && !chosen('pos', f.value)"
          :title="POS_GROUPS[f.value].description"
          :class="chip(chosen('pos', f.value), !f.count)"
          @click="toggle('pos', f.value)"
        >
          {{ POS_GROUPS[f.value].label }}
          <span class="chip-count">{{ f.count }}</span>
        </button>
      </div>
    </fieldset>

    <fieldset class="space-y-2">
      <legend class="kicker text-stone-500 dark:text-stone-400">
        How common (JMdict)
      </legend>
      <div class="flex flex-wrap gap-2" data-testid="facet-frequency">
        <button
          v-for="f in facets?.frequency ?? []"
          :key="f.value"
          type="button"
          :aria-pressed="chosen('frequency', f.value)"
          :disabled="!f.count && !chosen('frequency', f.value)"
          :title="FREQUENCY_GROUPS[f.value].description"
          :class="chip(chosen('frequency', f.value), !f.count)"
          @click="toggle('frequency', f.value)"
        >
          {{ FREQUENCY_GROUPS[f.value].label }}
          <span class="chip-count">{{ f.count }}</span>
        </button>
      </div>
    </fieldset>

    <fieldset class="space-y-2">
      <legend class="kicker text-stone-500 dark:text-stone-400">
        When you pick several
      </legend>
      <div
        class="flex flex-wrap items-center gap-x-4 gap-y-2"
        data-testid="facet-match"
      >
        <div class="flex gap-2">
          <button
            v-for="m in MATCH_OPTIONS"
            :key="m.value"
            type="button"
            :data-testid="`match-${m.value}`"
            :aria-pressed="matchMode === m.value"
            :class="chip(matchMode === m.value, false)"
            @click="setMatch(m.value)"
          >
            {{ m.label }}
          </button>
        </div>
        <p class="text-xs text-stone-500 dark:text-stone-400 max-w-md">
          {{ matchHelp }}
        </p>
      </div>
    </fieldset>

    <p
      v-if="modelValue.part"
      class="text-sm text-stone-600 dark:text-stone-400"
    >
      Only words taken apart into
      <NuxtLink
        :to="partPath(modelValue.part)"
        class="font-serif text-lg text-primary-600 dark:text-primary-400"
        >{{ modelValue.part }}</NuxtLink
      >.
      <button
        type="button"
        data-testid="explore-clear-part"
        class="underline hover:text-primary-500"
        @click="removePart"
      >
        Remove
      </button>
    </p>
  </form>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { partPath } from "../utils/seo";
import { STRATUM_DOT } from "../utils/stratum";
import {
  FREQUENCY_GROUPS,
  POS_GROUPS,
  STRATUM_UNSTATED,
  WORD_PROCESSES,
  WORD_STRATA,
} from "~~/shared/word-labels";
import type {
  ExploreFacets,
  ExploreFilters,
  ExploreMatch,
  StratumKey,
} from "~~/types/index";

/**
 * The filter form shared by Explore and the calendar: search text, one group of
 * chips per facet, and whether several choices mean "any" or "all". It owns no
 * data: the page holds the filters, passes the facet counts it fetched, and
 * writes the filters wherever they live (the URL).
 */

/** The filters that hold several choices, and the ones a choice can be toggled in. */
type ListFilter = "level" | "stratum" | "process" | "pos" | "frequency";

const props = defineProps<{
  modelValue: ExploreFilters;
  facets?: ExploreFacets;
}>();
const emit = defineEmits<{
  "update:modelValue": [filters: ExploreFilters];
}>();

const MATCH_OPTIONS: { value: ExploreMatch; label: string }[] = [
  { value: "any", label: "Any of them" },
  { value: "all", label: "All of them" },
];

const clean = (f: ExploreFilters): ExploreFilters =>
  Object.fromEntries(
    Object.entries(f).filter(
      ([, v]) =>
        v !== undefined && v !== "" && !(Array.isArray(v) && !v.length),
    ),
  );

const set = (next: ExploreFilters): void => {
  emit("update:modelValue", clean(next));
};

const text = ref(props.modelValue.q ?? "");
// A page that changes the filters itself (clearing them, following the URL)
// brings the search box with it.
watch(
  () => props.modelValue.q,
  (q) => {
    if ((q ?? "") !== text.value.trim()) text.value = q ?? "";
  },
);

const active = computed(() => Object.keys(props.modelValue).length > 0);
const matchMode = computed<ExploreMatch>(() => props.modelValue.match ?? "any");
const matchHelp = computed(() =>
  matchMode.value === "all"
    ? "A word must carry every process and every part of speech you picked. A word has one level, one layer and one frequency group, so those still match any."
    : "A word needs at least one of the options picked in a group. Different groups always narrow together.",
);

const layer = (key: StratumKey) =>
  key === "unstated" ? STRATUM_UNSTATED : WORD_STRATA[key];

const chosen = (key: ListFilter, value: string): boolean =>
  (props.modelValue[key] as readonly string[] | undefined)?.includes(value) ??
  false;

/** Adds `value` to a filter's choices, or removes it if it is already there. */
function toggle(key: ListFilter, value: string): void {
  const now = (props.modelValue[key] as string[] | undefined) ?? [];
  set({
    ...props.modelValue,
    [key]: now.includes(value)
      ? now.filter((v) => v !== value)
      : [...now, value],
  });
}

/** Drops the part filter, which is a single value rather than a list. */
const removePart = (): void => {
  set({ ...props.modelValue, part: undefined });
};

const setMatch = (match: ExploreMatch): void => {
  set({ ...props.modelValue, match: match === "all" ? "all" : undefined });
};

let timer: ReturnType<typeof setTimeout> | undefined;
const applySearch = (): void => {
  clearTimeout(timer);
  set({ ...props.modelValue, q: text.value.trim() || undefined });
};
const onType = (): void => {
  clearTimeout(timer);
  timer = setTimeout(applySearch, 250);
};
onBeforeUnmount(() => clearTimeout(timer));

const clear = (): void => {
  clearTimeout(timer);
  text.value = "";
  set({});
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
