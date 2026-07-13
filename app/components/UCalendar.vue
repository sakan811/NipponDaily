<template>
  <div class="u-calendar bg-white dark:bg-stone-900 select-none p-3 max-w-full">
    <!-- Header with controls -->
    <div class="flex items-center justify-between mb-4">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        color="gray"
        size="xs"
        @click="prevMonth"
      />
      <span class="text-sm font-serif font-bold text-stone-850 dark:text-stone-150">
        {{ getMonthName(navMonth) }} {{ navYear }}
        <span class="mx-2 text-stone-300 dark:text-stone-700">|</span>
        {{ getMonthName(nextMonthData.month) }} {{ nextMonthData.year }}
      </span>
      <UButton
        icon="i-heroicons-arrow-right"
        variant="ghost"
        color="gray"
        size="xs"
        @click="nextMonth"
      />
    </div>

    <!-- Dual Months Container -->
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Month 1 -->
      <div class="flex-1">
        <div class="text-center font-serif font-bold text-xs mb-2 text-stone-500">
          {{ getMonthName(navMonth) }} {{ navYear }}
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400 mb-1">
          <span v-for="d in daysOfWeek" :key="d" class="w-8 h-8 flex items-center justify-center">{{ d }}</span>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center">
          <!-- Leading blanks -->
          <span v-for="b in month1Blanks" :key="'b1-' + b" class="w-8 h-8" />
          
          <!-- Month Days -->
          <button
            v-for="day in month1Days"
            :key="'d1-' + day"
            type="button"
            :disabled="isDateDisabled(navYear, navMonth, day)"
            :class="[
              'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer',
              getDateClass(navYear, navMonth, day)
            ]"
            @click="selectDate(navYear, navMonth, day)"
          >
            {{ day }}
          </button>
        </div>
      </div>

      <!-- Divider (mobile only) -->
      <div class="h-px bg-stone-100 dark:bg-stone-800 md:hidden" />

      <!-- Month 2 -->
      <div class="flex-1">
        <div class="text-center font-serif font-bold text-xs mb-2 text-stone-500">
          {{ getMonthName(nextMonthData.month) }} {{ nextMonthData.year }}
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-stone-400 mb-1">
          <span v-for="d in daysOfWeek" :key="d" class="w-8 h-8 flex items-center justify-center">{{ d }}</span>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center">
          <!-- Leading blanks -->
          <span v-for="b in month2Blanks" :key="'b2-' + b" class="w-8 h-8" />
          
          <!-- Month Days -->
          <button
            v-for="day in month2Days"
            :key="'d2-' + day"
            type="button"
            :disabled="isDateDisabled(nextMonthData.year, nextMonthData.month, day)"
            :class="[
              'w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer',
              getDateClass(nextMonthData.year, nextMonthData.month, day)
            ]"
            @click="selectDate(nextMonthData.year, nextMonthData.month, day)"
          >
            {{ day }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { CalendarDate } from "@internationalized/date";

const props = defineProps<{
  modelValue?: { start: CalendarDate | null; end: CalendarDate | null } | CalendarDate | null;
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
  range?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: { start: CalendarDate | null; end: CalendarDate | null } | CalendarDate | null): void;
}>();

// Navigation month state (Month 1 display)
const now = new Date();
const navYear = ref(now.getFullYear());
const navMonth = ref(now.getMonth() + 1); // 1-indexed

// Sync navigation month from modelValue start date
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if ("start" in val && val.start) {
        navYear.value = val.start.year;
        navMonth.value = val.start.month;
      } else if (val instanceof CalendarDate) {
        navYear.value = val.year;
        navMonth.value = val.month;
      }
    }
  },
  { immediate: true }
);

const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const getMonthName = (m: number) => {
  const date = new Date(2000, m - 1, 1);
  return date.toLocaleString("en-US", { month: "long" });
};

// Next month data helper
const nextMonthData = computed(() => {
  let y = navYear.value;
  let m = navMonth.value + 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return { year: y, month: m };
});

// Month calculations
const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m - 1, 1).getDay();

const month1Days = computed(() => getDaysInMonth(navYear.value, navMonth.value));
const month1Blanks = computed(() => getFirstDayOfMonth(navYear.value, navMonth.value));

const month2Days = computed(() => getDaysInMonth(nextMonthData.value.year, nextMonthData.value.month));
const month2Blanks = computed(() => getFirstDayOfMonth(nextMonthData.value.year, nextMonthData.value.month));

// Navigation methods
const prevMonth = () => {
  navMonth.value -= 1;
  if (navMonth.value < 1) {
    navMonth.value = 12;
    navYear.value -= 1;
  }
};

const nextMonth = () => {
  navMonth.value += 1;
  if (navMonth.value > 12) {
    navMonth.value = 1;
    navYear.value += 1;
  }
};

// Date comparison helpers
const toMs = (y: number, m: number, d: number) => new Date(y, m - 1, d).getTime();

const isDateDisabled = (y: number, m: number, d: number) => {
  const currentMs = toMs(y, m, d);
  if (props.minValue) {
    const minMs = toMs(props.minValue.year, props.minValue.month, props.minValue.day);
    if (currentMs < minMs) return true;
  }
  if (props.maxValue) {
    const maxMs = toMs(props.maxValue.year, props.maxValue.month, props.maxValue.day);
    if (currentMs > maxMs) return true;
  }
  return false;
};

const getDateClass = (y: number, m: number, d: number) => {
  const currentMs = toMs(y, m, d);
  
  if (props.range && props.modelValue && typeof props.modelValue === "object" && "start" in props.modelValue) {
    const startVal = props.modelValue.start;
    const endVal = props.modelValue.end;
    
    if (startVal) {
      const startMs = toMs(startVal.year, startVal.month, startVal.day);
      
      if (endVal) {
        const endMs = toMs(endVal.year, endVal.month, endVal.day);
        
        if (currentMs === startMs) {
          return "bg-primary-500 text-white rounded-l-lg rounded-r-none";
        }
        if (currentMs === endMs) {
          return "bg-primary-500 text-white rounded-r-lg rounded-l-none";
        }
        if (currentMs > startMs && currentMs < endMs) {
          return "bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-none hover:bg-primary-500/20";
        }
      } else if (currentMs === startMs) {
        return "bg-primary-500 text-white";
      }
    }
  } else if (props.modelValue instanceof CalendarDate) {
    const activeMs = toMs(props.modelValue.year, props.modelValue.month, props.modelValue.day);
    if (currentMs === activeMs) {
      return "bg-primary-500 text-white";
    }
  }
  
  return isDateDisabled(y, m, d)
    ? "text-stone-300 dark:text-stone-700 cursor-not-allowed"
    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800";
};

// Handle day click
const selectDate = (y: number, m: number, d: number) => {
  if (isDateDisabled(y, m, d)) return;
  const newDate = new CalendarDate(y, m, d);
  
  if (props.range) {
    const currentModel = props.modelValue as { start: CalendarDate | null; end: CalendarDate | null } | null;
    
    if (!currentModel || !currentModel.start || (currentModel.start && currentModel.end)) {
      emit("update:modelValue", { start: newDate, end: null });
    } else {
      const startMs = toMs(currentModel.start.year, currentModel.start.month, currentModel.start.day);
      const clickedMs = toMs(y, m, d);
      
      if (clickedMs < startMs) {
        emit("update:modelValue", { start: newDate, end: null });
      } else {
        emit("update:modelValue", { start: currentModel.start, end: newDate });
      }
    }
  } else {
    emit("update:modelValue", newDate);
  }
};
</script>
