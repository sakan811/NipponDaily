<template>
  <div
    class="min-h-screen bg-[#FDFBF7] dark:bg-[#0B0E14] text-stone-900 dark:text-stone-100 selection:bg-primary-500/20 flex flex-col"
  >
    <div class="season-backdrop" />

    <AppHeader />

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
          has arrived to read how its word is built and where it came from.
        </p>
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
            {{ formatMonthYear(calendar.month) }}
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

        <!-- Month grid -->
        <div
          class="grid grid-cols-7 gap-1.5 sm:gap-2"
          role="grid"
          :aria-label="`Words for ${formatMonthYear(calendar.month)}`"
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
              :to="`/words/${cell.date}`"
              role="gridcell"
              data-testid="calendar-day-open"
              :aria-label="`${formatLongDate(cell.date)}: ${cell.day.term}`"
              :class="[
                'group season-box block min-h-[4.5rem] sm:min-h-[6rem] border bg-white dark:bg-stone-900/50 p-1.5 sm:p-2.5 transition-colors hover:border-primary-500',
                cell.date === calendar.today
                  ? 'border-primary-500 ring-2 ring-primary-500/30'
                  : 'border-stone-300 dark:border-stone-700',
              ]"
            >
              <span
                class="flex items-start justify-between text-[11px] sm:text-xs text-stone-500 dark:text-stone-400"
              >
                {{ cell.dayOfMonth }}
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
                class="mt-1 block text-lg sm:text-2xl font-serif font-bold leading-tight text-stone-900 dark:text-white group-hover:text-primary-500 break-all"
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
              v-else
              role="gridcell"
              data-testid="calendar-day-closed"
              :aria-label="`${formatLongDate(cell.date)}: not yet open`"
              class="min-h-[4.5rem] sm:min-h-[6rem] border border-dashed border-stone-300/70 dark:border-stone-800 p-1.5 sm:p-2.5 text-[11px] sm:text-xs text-stone-400 dark:text-stone-600"
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
        </ul>
      </section>

      <div v-else class="mt-10 space-y-3" aria-busy="true">
        <USkeleton class="h-10 w-64" />
        <USkeleton class="h-96 w-full" />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "#app";
import AppHeader from "../../components/AppHeader.vue";
import AppFooter from "../../components/AppFooter.vue";
import TrendingFallback from "../../components/TrendingFallback.vue";
import { useWordCalendar } from "../../composables/useDailyWord";
import { usePageSeo } from "../../composables/usePageSeo";
import { formatLongDate, formatMonthYear } from "../../utils/date";
import { WORD_STRATA } from "~~/shared/word-labels";
import { STRATUM_DOT } from "../../utils/stratum";
import type { WordCalendarDay } from "~~/types/index";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const route = useRoute();
const router = useRouter();
const requested = route.query.month;
const month = ref<string | undefined>(
  typeof requested === "string" ? requested : undefined,
);
const { calendar, loading, error, refresh } = useWordCalendar(month);

usePageSeo({
  title: () =>
    calendar.value
      ? `Words for ${formatMonthYear(calendar.value.month)}`
      : "The word calendar",
  description:
    "Every Japanese word NipponDaily has taken apart so far, one per day, in a month-by-month calendar.",
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

const go = async (target: string): Promise<void> => {
  month.value = target;
  await router.replace({ query: { month: target } });
};

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
</script>
