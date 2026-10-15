<template>
  <nav aria-label="Jump to a month" class="space-y-2">
    <div class="flex items-center gap-2" data-testid="calendar-years">
      <button
        type="button"
        data-testid="calendar-year-prev"
        aria-label="Earlier year"
        :disabled="!prevYear"
        :class="chip(false, !prevYear)"
        @click="prevYear && pickYear(prevYear)"
      >
        <UIcon name="i-heroicons-arrow-left" class="h-3.5 w-3.5" />
      </button>
      <label class="sr-only" for="calendar-year">Year</label>
      <select
        id="calendar-year"
        data-testid="calendar-year"
        :value="selectedYear"
        class="border border-stone-500 bg-white dark:bg-stone-900/50 px-3 py-1 text-sm cursor-pointer hover:border-primary-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30"
        @change="pickYear(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <button
        type="button"
        data-testid="calendar-year-next"
        aria-label="Later year"
        :disabled="!nextYear"
        :class="chip(false, !nextYear)"
        @click="nextYear && pickYear(nextYear)"
      >
        <UIcon name="i-heroicons-arrow-right" class="h-3.5 w-3.5" />
      </button>
    </div>
    <div
      class="grid grid-cols-6 sm:grid-cols-12 gap-1.5"
      data-testid="calendar-months"
    >
      <button
        v-for="m in choices"
        :key="m.key"
        type="button"
        data-testid="calendar-pick-month"
        :data-month="m.key"
        :aria-pressed="m.key === month"
        :aria-label="m.label"
        :disabled="!m.exists"
        :class="[
          chip(m.key === month, !m.exists),
          'flex-col !gap-0 !px-1 justify-center',
          counts && m.exists && !m.count && 'opacity-60',
        ]"
        @click="emit('select', m.key)"
      >
        {{ m.short }}
        <span v-if="counts && m.exists" class="chip-count">{{ m.count }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { chipClass as chip } from "../utils/chip";
import { MONTH_SHORT, monthLabel } from "~~/shared/catalogue";

/**
 * Jumps to a month: a year stepper and menu (a menu, so the picker stays one
 * row however many years the catalogue spans), then the twelve months of that
 * year. It owns no state: the page passes the months that have words and the
 * one shown, and hears which month was picked.
 */
const props = defineProps<{
  /** Every month with words, YYYY-MM, in order. */
  months: readonly string[];
  /** The month shown, YYYY-MM. */
  month: string;
  /** How many words match in each month; given only while filters are on. */
  counts?: Readonly<Record<string, number>>;
}>();
const emit = defineEmits<{ select: [month: string] }>();

const years = computed(() => [
  ...new Set(props.months.map((m) => m.slice(0, 4))),
]);
const selectedYear = computed(() => props.month.slice(0, 4));
const yearIndex = computed(() => years.value.indexOf(selectedYear.value));
const prevYear = computed(() => years.value[yearIndex.value - 1]);
const nextYear = computed(() => years.value[yearIndex.value + 1]);

/** The twelve months of the selected year: those with words can be opened. */
const choices = computed(() =>
  MONTH_SHORT.map((short, i) => {
    const key = `${selectedYear.value}-${String(i + 1).padStart(2, "0")}`;
    return {
      key,
      short,
      label: monthLabel(key),
      exists: props.months.includes(key),
      count: props.counts?.[key] ?? 0,
    };
  }),
);

/** Another year keeps the same month when it has words, else its first one. */
const pickYear = (year: string): void => {
  const same = `${year}-${props.month.slice(5)}`;
  const target = props.months.includes(same)
    ? same
    : props.months.find((m) => m.startsWith(year));
  if (target) emit("select", target);
};
</script>

<style scoped>
.chip-count {
  font-size: 0.65rem;
  opacity: 0.65;
  font-variant-numeric: tabular-nums;
}
</style>
