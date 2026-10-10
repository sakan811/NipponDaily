<template>
  <AppShell>
    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <div class="max-w-2xl space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">
          The Calendar
        </p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          Every word, every day
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          One word is opened each day at midnight in Japan. Pick any day that
          has arrived to read how its word is built and where it came from, or
          filter the calendar to light up the days whose words share a level,
          layer, process or part of speech.
        </p>
        <p
          data-testid="calendar-first-opened-note"
          class="text-sm text-stone-500 dark:text-stone-400 font-sans"
        >
          A word sits on the day it was first opened. Once every word has had
          its day, they come round again: those days are marked
          <span aria-hidden="true">↻</span> and open the word's original day.
        </p>
      </div>

      <div class="mt-10 space-y-4">
        <button
          type="button"
          data-testid="calendar-filter-toggle"
          :aria-expanded="showFilters"
          aria-controls="calendar-filters"
          class="season-chip inline-flex items-center gap-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-3 py-1.5 text-sm hover:border-primary-500 transition-colors"
          @click="showFilters = !showFilters"
        >
          <UIcon
            :name="showFilters ? 'i-heroicons-minus' : 'i-heroicons-plus'"
            class="h-4 w-4"
          />
          Filter the calendar
          <span
            v-if="activeCount"
            data-testid="calendar-filter-count"
            class="text-xs text-primary-600 dark:text-primary-400"
            >{{ activeCount }} active</span
          >
        </button>
        <WordFilters
          v-if="showFilters"
          id="calendar-filters"
          v-model="filters"
          :facets="calendar?.facets"
          @update:model-value="applyFilters"
        />
      </div>

      <TrendingFallback
        v-if="error"
        class="mt-10"
        :error="error"
        :loading="loading"
        title="Unable to Load the Calendar"
        @retry="refresh()"
      />

      <section v-else-if="calendar" class="mt-10 space-y-4">
        <!-- Month navigation -->
        <div class="flex items-center justify-between gap-2 sm:gap-4">
          <UButton
            data-testid="calendar-prev"
            label="Earlier"
            icon="i-heroicons-arrow-left"
            color="secondary"
            variant="outline"
            size="sm"
            :disabled="!prevMonth"
            @click="prevMonth && go(prevMonth)"
          />
          <h2
            data-testid="calendar-month"
            class="text-lg min-[400px]:text-2xl sm:text-3xl font-serif font-bold text-center text-stone-900 dark:text-white"
          >
            {{ monthLabel(calendar.month) }}
          </h2>
          <UButton
            data-testid="calendar-next"
            label="Later"
            icon="i-heroicons-arrow-right"
            trailing
            color="secondary"
            variant="outline"
            size="sm"
            :disabled="!nextMonth"
            @click="nextMonth && go(nextMonth)"
          />
        </div>

        <!-- Jump to a year and month -->
        <nav aria-label="Jump to a month" class="space-y-2">
          <div class="flex flex-wrap gap-2" data-testid="calendar-years">
            <button
              v-for="y in years"
              :key="y"
              type="button"
              :data-testid="`calendar-year-${y}`"
              :aria-pressed="y === selectedYear"
              :class="chip(y === selectedYear, false)"
              @click="pickYear(y)"
            >
              {{ y }}
            </button>
          </div>
          <div
            class="grid grid-cols-6 sm:grid-cols-12 gap-1.5"
            data-testid="calendar-months"
          >
            <button
              v-for="m in monthChoices"
              :key="m.key"
              type="button"
              data-testid="calendar-pick-month"
              :data-month="m.key"
              :aria-pressed="m.key === calendar.month"
              :aria-label="m.label"
              :disabled="!m.exists"
              :class="[
                chip(m.key === calendar.month, !m.exists),
                'flex-col !gap-0 !px-1 justify-center',
                filtersActive && m.exists && !m.count && 'opacity-60',
              ]"
              @click="go(m.key)"
            >
              {{ m.short }}
              <span v-if="filtersActive && m.exists" class="chip-count">{{
                m.count
              }}</span>
            </button>
          </div>
        </nav>

        <!-- What the filters found -->
        <div
          v-if="filtersActive"
          data-testid="calendar-summary"
          class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600 dark:text-stone-400"
          aria-live="polite"
        >
          <p>
            <strong data-testid="calendar-month-matches">{{
              monthMatches
            }}</strong>
            {{ monthMatches === 1 ? "word" : "words" }} in
            {{ monthLabel(calendar.month) }} match;
            <span data-testid="calendar-total-matches">{{
              calendar.count
            }}</span>
            of {{ calendar.total }} across every month.
          </p>
          <button
            v-if="!monthMatches && earlierMatch"
            type="button"
            data-testid="calendar-earlier-match"
            class="underline hover:text-primary-600 dark:hover:text-primary-400"
            @click="go(earlierMatch)"
          >
            Earlier match: {{ monthLabel(earlierMatch) }}
          </button>
          <button
            v-if="!monthMatches && laterMatch"
            type="button"
            data-testid="calendar-later-match"
            class="underline hover:text-primary-600 dark:hover:text-primary-400"
            @click="go(laterMatch)"
          >
            Later match: {{ monthLabel(laterMatch) }}
          </button>
        </div>

        <!-- Month grid -->
        <div
          class="grid grid-cols-7 gap-1.5 sm:gap-2"
          role="grid"
          :aria-label="`Words for ${monthLabel(calendar.month)}`"
        >
          <div
            v-for="d in WEEKDAYS"
            :key="d"
            role="columnheader"
            class="kicker text-center text-stone-400 dark:text-stone-500 pb-1"
          >
            {{ d }}
          </div>

          <div v-for="n in leadingBlanks" :key="`blank-${n}`" role="gridcell" />

          <template v-for="cell in cells" :key="cell.date">
            <NuxtLink
              v-if="cell.day?.status === 'open'"
              :to="`/words/${cell.day.wordDate ?? cell.date}`"
              role="gridcell"
              data-testid="calendar-day-open"
              :data-match="filtersActive ? cell.day.match : undefined"
              :aria-label="`${formatLongDate(cell.date)}: ${cell.day.term}${isRepeat(cell) ? `, first opened ${formatLongDate(cell.day.wordDate!)}` : ''}${dimmed(cell.day) ? ' (does not match the filters)' : ''}`"
              :class="[
                'group season-box block min-h-[4.5rem] sm:min-h-[6rem] border p-1.5 sm:p-2.5 transition-colors hover:border-primary-500',
                cell.date === calendar.today
                  ? 'border-primary-500 ring-2 ring-primary-500/30'
                  : filtersActive && cell.day.match
                    ? 'border-primary-500'
                    : 'border-stone-300 dark:border-stone-700',
                filtersActive && cell.day.match
                  ? 'bg-primary-500/10'
                  : 'bg-white dark:bg-stone-900/50',
                dimmed(cell.day) && 'opacity-35',
              ]"
            >
              <span
                class="flex items-start justify-between text-[11px] sm:text-xs text-stone-500 dark:text-stone-400"
              >
                {{ cell.dayOfMonth }}
                <span
                  v-if="isRepeat(cell)"
                  data-testid="calendar-day-repeat"
                  :title="`Repeat: first opened ${formatLongDate(cell.day.wordDate!)}`"
                  aria-hidden="true"
                  >↻</span
                >
                <span
                  v-if="cell.day.stratum"
                  :class="[
                    'inline-block h-2 w-2 rounded-full mt-0.5',
                    STRATUM_DOT[cell.day.stratum],
                  ]"
                  :title="WORD_STRATA[cell.day.stratum].label"
                />
              </span>
              <span
                class="mt-1 block text-lg sm:text-2xl font-serif font-bold leading-tight text-stone-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 break-all"
              >
                {{ cell.day.term }}
              </span>
              <span
                class="hidden sm:block text-xs text-stone-500 dark:text-stone-400 truncate"
              >
                {{ cell.day.kana }}
              </span>
            </NuxtLink>

            <div
              v-else-if="cell.day"
              role="gridcell"
              data-testid="calendar-day-closed"
              :aria-label="`${formatLongDate(cell.date)}: not yet open`"
              class="min-h-[4.5rem] sm:min-h-[6rem] border border-dashed border-stone-300/70 dark:border-stone-800 p-1.5 sm:p-2.5 text-[11px] sm:text-xs text-stone-400 dark:text-stone-600"
            >
              {{ cell.dayOfMonth }}
            </div>

            <div
              v-else
              role="gridcell"
              data-testid="calendar-day-empty"
              :aria-label="`${formatLongDate(cell.date)}: no word`"
              class="min-h-[4.5rem] sm:min-h-[6rem] p-1.5 sm:p-2.5 text-[11px] sm:text-xs text-stone-300 dark:text-stone-700"
            >
              {{ cell.dayOfMonth }}
            </div>
          </template>
        </div>

        <!-- Legend -->
        <ul
          class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-500 dark:text-stone-400"
          aria-label="Word layers"
        >
          <li
            v-for="(info, key) in WORD_STRATA"
            :key="key"
            class="flex items-center gap-1.5"
          >
            <span
              :class="['inline-block h-2 w-2 rounded-full', STRATUM_DOT[key]]"
            />
            {{ info.native }} {{ info.label }}
          </li>
          <li class="flex items-center gap-1.5">
            <span aria-hidden="true">↻</span>
            A repeat: the word was first opened on another day
          </li>
          <li v-if="filtersActive" class="flex items-center gap-1.5">
            <span
              class="inline-block h-2 w-2 border border-stone-400 opacity-40"
            />
            Faded: doesn't match the filters
          </li>
        </ul>
      </section>

      <div v-else class="mt-10 space-y-3" aria-busy="true">
        <USkeleton class="h-10 w-64" />
        <USkeleton class="h-96 w-full" />
      </div>
    </main>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from "../../components/AppShell.vue";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "#app";
import TrendingFallback from "../../components/TrendingFallback.vue";
import WordFilters from "../../components/WordFilters.vue";
import { useWordCalendar } from "../../composables/useDailyWord";
import { usePageSeo } from "../../composables/usePageSeo";
import { formatLongDate } from "../../utils/date";
import { monthLabel } from "~~/shared/catalogue";
import { WORD_STRATA } from "~~/shared/word-labels";
import { filtersFromQuery, queryFromFilters } from "~~/shared/explore-query";
import { STRATUM_DOT } from "../../utils/stratum";
import type { ExploreFilters, WordCalendarDay } from "~~/types/index";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const route = useRoute();
const router = useRouter();
const requested = route.query.month;
const month = ref<string | undefined>(
  typeof requested === "string" ? requested : undefined,
);
const filters = ref<ExploreFilters>(filtersFromQuery(route.query));
const { calendar, loading, error, refresh } = useWordCalendar(month, filters);

const activeCount = computed(() => Object.keys(filters.value).length);
const filtersActive = computed(() => activeCount.value > 0);
// Open from the start when the link carries filters, so they are never hidden.
const showFilters = ref(filtersActive.value);

usePageSeo({
  title: () =>
    calendar.value
      ? `Words for ${monthLabel(calendar.value.month)}`
      : "The word calendar",
  description:
    "Every Japanese word NipponDaily has taken apart so far, one per day, in a month-by-month calendar you can filter by level, layer, process and part of speech.",
  // Filtered views are the same page seen through a filter, so they point
  // search engines at the plain month.
  path: () =>
    calendar.value ? `/words?month=${calendar.value.month}` : "/words",
  noindex: () => !calendar.value,
});

const months = computed(() => calendar.value?.months ?? []);
const index = computed(() =>
  calendar.value ? months.value.indexOf(calendar.value.month) : -1,
);
const prevMonth = computed(() => months.value[index.value - 1]);
const nextMonth = computed(() => months.value[index.value + 1]);

/** The URL that carries the month (when one was picked) and the filters. */
const syncUrl = async (): Promise<void> => {
  await router.replace({
    query: {
      ...(month.value ? { month: month.value } : {}),
      ...queryFromFilters(filters.value),
    },
  });
};

const go = async (target: string): Promise<void> => {
  month.value = target;
  await syncUrl();
};

const applyFilters = async (): Promise<void> => {
  await syncUrl();
};

const years = computed(() => [
  ...new Set(months.value.map((m) => m.slice(0, 4))),
]);
const selectedYear = computed(() => calendar.value?.month.slice(0, 4) ?? "");

/** Twelve months of the selected year: those with words can be opened. */
const monthChoices = computed(() =>
  MONTH_SHORT.map((short, i) => {
    const key = `${selectedYear.value}-${String(i + 1).padStart(2, "0")}`;
    return {
      key,
      short,
      label: monthLabel(key),
      exists: months.value.includes(key),
      count: calendar.value?.monthCounts[key] ?? 0,
    };
  }),
);

/** Another year keeps the same month when it has words, else its first one. */
const pickYear = (year: string): void => {
  if (!calendar.value) return;
  const same = `${year}-${calendar.value.month.slice(5)}`;
  const target = months.value.includes(same)
    ? same
    : months.value.find((m) => m.startsWith(year));
  if (target) void go(target);
};

const monthMatches = computed(() =>
  calendar.value ? (calendar.value.monthCounts[calendar.value.month] ?? 0) : 0,
);
const withMatches = computed(() =>
  months.value.filter((m) => (calendar.value?.monthCounts[m] ?? 0) > 0),
);
/** The nearest months on either side that hold a match, for a month with none. */
const earlierMatch = computed(() =>
  withMatches.value.filter((m) => m < (calendar.value?.month ?? "")).at(-1),
);
const laterMatch = computed(() =>
  withMatches.value.find((m) => m > (calendar.value?.month ?? "")),
);

/** An open day the filters rule out; shown faded, still a link. */
const dimmed = (day: WordCalendarDay): boolean =>
  filtersActive.value && day.match === false;

/** An open day showing a word that first opened on another day (a later lap). */
const isRepeat = (cell: { date: string; day?: WordCalendarDay }): boolean =>
  !!cell.day?.wordDate && cell.day.wordDate !== cell.date;

/** Sunday-first blanks before the 1st. */
const leadingBlanks = computed(() => {
  if (!calendar.value) return 0;
  return new Date(`${calendar.value.month}-01T00:00:00Z`).getUTCDay();
});

const cells = computed(() => {
  if (!calendar.value) return [];
  const byDate = new Map<string, WordCalendarDay>(
    calendar.value.days.map((d) => [d.date, d]),
  );
  const [y, m] = calendar.value.month.split("-").map(Number) as [
    number,
    number,
  ];
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const dayOfMonth = i + 1;
    const date = `${calendar.value!.month}-${String(dayOfMonth).padStart(2, "0")}`;
    return { date, dayOfMonth, day: byDate.get(date) };
  });
});

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
  font-size: 0.65rem;
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
}
</style>
