<template>
  <div class="space-y-4">
    <button
      type="button"
      data-testid="filter-toggle"
      :aria-expanded="open"
      aria-controls="word-filters"
      class="season-chip inline-flex items-center gap-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-3 py-1.5 text-sm hover:border-primary-500 transition-colors"
      @click="open = !open"
    >
      <UIcon
        :name="open ? 'i-heroicons-minus' : 'i-heroicons-plus'"
        class="h-4 w-4"
      />
      {{ label }}
      <span
        v-if="activeCount"
        data-testid="filter-count"
        class="text-xs text-primary-600 dark:text-primary-400"
        >{{ activeCount }} active</span
      >
    </button>
    <form
      v-if="open"
      id="word-filters"
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
          :maxlength="MAX_QUERY_LENGTH"
          autocomplete="off"
          placeholder="Search a word, its reading (kana or romaji), or its meaning"
          class="flex-1 border border-stone-500 bg-white dark:bg-stone-900/50 px-4 py-2.5 font-body-serif text-base focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
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

      <div
        class="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter groups"
        data-testid="facet-tabs"
      >
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          :data-testid="`facet-tab-${t.key}`"
          :aria-expanded="openKey === t.key"
          :aria-controls="`facet-panel-${t.key}`"
          :class="chip(openKey === t.key || !!t.picked, false)"
          @click="openKey = openKey === t.key ? null : t.key"
        >
          {{ t.label }}
          <span v-if="t.picked" class="chip-count">{{ t.picked }}</span>
          <UIcon
            :name="
              openKey === t.key
                ? 'i-heroicons-chevron-up'
                : 'i-heroicons-chevron-down'
            "
            class="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </button>
      </div>

      <fieldset
        v-for="g in groups"
        v-show="openKey === g.key"
        :id="`facet-panel-${g.key}`"
        :key="g.key"
        class="space-y-2"
      >
        <legend class="sr-only">
          {{ g.legend }}
        </legend>
        <div class="flex flex-wrap gap-2" :data-testid="`facet-${g.key}`">
          <button
            v-for="o in g.options"
            :key="o.value"
            type="button"
            :aria-pressed="chosen(g.key, o.value)"
            :disabled="!o.count && !chosen(g.key, o.value)"
            :title="o.title"
            :class="chip(chosen(g.key, o.value), !o.count)"
            @click="toggle(g.key, o.value)"
          >
            <span
              v-if="o.dot"
              :class="['inline-block h-2 w-2 rounded-full', o.dot]"
              aria-hidden="true"
            />
            {{ o.label }}
            <span class="chip-count">{{ o.count }}</span>
          </button>
        </div>
      </fieldset>

      <fieldset
        v-show="openKey === 'match'"
        id="facet-panel-match"
        class="space-y-2"
      >
        <legend class="sr-only">When you pick several</legend>
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
          <p class="text-xs text-stone-600 dark:text-stone-400 max-w-md">
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
          class="underline hover:text-primary-600 dark:hover:text-primary-400"
          @click="removePart"
        >
          Remove
        </button>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { chipClass as chip } from "../utils/chip";
import { partPath } from "../utils/seo";
import { STRATUM_DOT } from "../utils/stratum";
import { MAX_QUERY_LENGTH } from "~~/shared/limits";
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
 * The filter form shared by Explore and the calendar: a toggle that folds it
 * away, then search text, one button per facet group (one group open at a
 * time) and whether several choices mean "any" or "all". It owns no data: the page holds the filters, passes the facet counts it fetched, and
 * writes the filters wherever they live (the URL).
 */

/** The filters that hold several choices, and the ones a choice can be toggled in. */
type ListFilter = "level" | "stratum" | "process" | "pos" | "frequency";

const props = withDefaults(
  defineProps<{
    modelValue: ExploreFilters;
    facets?: ExploreFacets;
    /** The toggle's words, e.g. "Filter the calendar". */
    label?: string;
    /** Start unfolded; a page whose filters are already set (or whose job is
     *  searching) opens them so nothing active is hidden. */
    startOpen?: boolean;
  }>(),
  { label: "Filter the words" },
);
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

const activeCount = computed(() => Object.keys(props.modelValue).length);
const active = computed(() => activeCount.value > 0);
const open = ref(props.startOpen || active.value);
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

interface FacetOption {
  value: string;
  count: number;
  label: string;
  title?: string;
  dot?: string;
}

/** One group of chips: its filter, its heading, and the options with counts. */
const groups = computed<
  { key: ListFilter; legend: string; tab: string; options: FacetOption[] }[]
>(() => {
  const f = props.facets;
  return [
    {
      key: "level",
      legend: "JLPT level",
      tab: "Level",
      options: (f?.level ?? []).map((o) => ({ ...o, label: o.value })),
    },
    {
      key: "stratum",
      legend: "Layer of the vocabulary",
      tab: "Layer",
      options: (f?.stratum ?? []).map((o) => ({
        ...o,
        label: `${layer(o.value).native} ${layer(o.value).label}`,
        title: layer(o.value).description,
        dot: STRATUM_DOT[o.value],
      })),
    },
    {
      key: "process",
      legend: "Process",
      tab: "Process",
      options: (f?.process ?? []).map((o) => ({
        ...o,
        label: WORD_PROCESSES[o.value].label,
        title: WORD_PROCESSES[o.value].description,
      })),
    },
    {
      key: "pos",
      legend: "Part of speech",
      tab: "Part of speech",
      options: (f?.pos ?? []).map((o) => ({
        ...o,
        label: POS_GROUPS[o.value].label,
        title: POS_GROUPS[o.value].description,
      })),
    },
    {
      key: "frequency",
      legend: "How common (JMdict)",
      tab: "How common",
      options: (f?.frequency ?? []).map((o) => ({
        ...o,
        label: FREQUENCY_GROUPS[o.value].label,
        title: FREQUENCY_GROUPS[o.value].description,
      })),
    },
  ];
});

const openKey = ref<string | null>(null);

/** The buttons of the compact form, each with how many choices it holds. */
const tabs = computed(() => [
  ...groups.value.map((g) => ({
    key: g.key as string,
    label: g.tab,
    picked: (props.modelValue[g.key] as readonly string[] | undefined)?.length,
  })),
  {
    key: "match",
    label: matchMode.value === "all" ? "Match: all" : "Match: any",
    picked: 0,
  },
]);

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
</script>

<style scoped>
.chip-count {
  font-size: 0.7rem;
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
}
</style>
