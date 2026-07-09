<template>
  <div
    class="relative bg-white/40 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/60 dark:border-stone-800 rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden select-none"
  >
    <!-- Shoji grid decorative background inside the card -->
    <div
      class="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"
    />

    <div class="relative flex flex-col items-center">
      <!-- Title & Controls -->
      <div
        class="w-full flex items-center justify-between mb-4 border-b border-stone-200/50 dark:border-stone-800/80 pb-3"
      >
        <div>
          <h3
            class="font-serif font-bold text-base text-stone-900 dark:text-white flex items-center gap-2"
          >
            <UIcon name="i-heroicons-map" class="text-primary-500 w-5 h-5" />
            {{ language === "ja" ? "日本ニュースマップ" : "Japan News Map" }}
          </h3>
          <p
            class="text-[10px] text-stone-400 dark:text-stone-500 font-sans tracking-wide mt-0.5"
          >
            {{
              language === "ja"
                ? "地域を選択してブリーフィングを絞り込みます"
                : "Select a region to filter the news briefings"
            }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div
            v-if="isNationwide && !selectedRegion"
            class="flex items-center gap-1 bg-primary-500/10 dark:bg-primary-500/5 px-2 py-0.5 rounded-full border border-primary-500/20 dark:border-primary-500/10 text-[9px] text-primary-600 dark:text-primary-400"
          >
            <span
              class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"
            />
            <span>{{
              language === "ja" ? "全国共通ニュース" : "Nationwide news"
            }}</span>
          </div>
          <UButton
            v-if="selectedRegion"
            size="xs"
            variant="ghost"
            color="primary"
            icon="i-heroicons-arrow-left"
            @click="clearSelection"
          >
            {{ language === "ja" ? "全体に戻る" : "Back to All" }}
          </UButton>
        </div>
      </div>

      <!-- SVG Map Wrapper -->
      <div
        class="relative w-full max-w-[420px] aspect-square flex items-center justify-center"
      >
        <svg
          viewBox="0 0 500 500"
          class="w-full h-full drop-shadow-sm transition-all"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Grid Background (Shoji visual cue) -->
          <defs>
            <pattern
              id="mapGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(128, 128, 128, 0.05)"
                stroke-width="1"
              />
            </pattern>
          </defs>
          <rect
            width="500"
            height="500"
            fill="url(#mapGrid)"
            pointer-events="none"
          />

          <!-- Okinawa Inset Box Border -->
          <rect
            x="15"
            y="410"
            width="80"
            height="80"
            fill="none"
            stroke="currentColor"
            class="text-stone-200 dark:text-stone-800"
            stroke-width="1"
            stroke-dasharray="3 3"
          />
          <text
            x="22"
            y="423"
            class="fill-stone-400 dark:fill-stone-600 text-[8px] font-mono tracking-widest uppercase pointer-events-none"
          >
            Okinawa
          </text>

          <!-- SVG Paths for Regions -->
          <g class="transition-all duration-300">
            <path
              v-for="region in regions"
              :key="region.id"
              :d="region.path"
              class="cursor-pointer transition-all duration-300 stroke-2"
              :class="[
                selectedRegion === region.id
                  ? 'fill-primary-500/25 dark:fill-primary-500/20 stroke-primary-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                  : isRegionActive(region.id)
                    ? 'fill-primary-500/12 dark:fill-primary-500/6 stroke-primary-500/70 hover:fill-primary-500/15 hover:stroke-primary-500 hover:drop-shadow-[0_0_6px_rgba(249,115,22,0.2)]'
                    : isNationwide
                      ? 'fill-primary-500/5 dark:fill-primary-500/3 stroke-primary-500/30 hover:fill-primary-500/15 hover:stroke-primary-500 hover:drop-shadow-[0_0_6px_rgba(249,115,22,0.2)]'
                      : 'fill-stone-100/40 dark:fill-stone-900/20 stroke-stone-300 dark:stroke-stone-800 hover:fill-stone-200/40 dark:hover:fill-stone-800/40 hover:stroke-stone-400 dark:hover:stroke-stone-700',
              ]"
              @click="onRegionClick(region.id)"
              @mouseenter="hoveredRegion = region"
              @mouseleave="hoveredRegion = null"
            />
          </g>

          <!-- SVG Text Labels for Regions -->
          <g class="pointer-events-none select-none">
            <template v-for="region in regions" :key="`label-${region.id}`">
              <!-- Label Text -->
              <text
                :x="region.labelX"
                :y="region.labelY"
                class="font-serif text-[9px] font-bold text-center transition-colors duration-300"
                :class="[
                  selectedRegion === region.id
                    ? 'fill-primary-600 dark:fill-primary-400 font-bold'
                    : isRegionActive(region.id)
                      ? 'fill-stone-800 dark:fill-stone-200 font-semibold'
                      : isNationwide
                        ? 'fill-stone-500 dark:fill-stone-400'
                        : 'fill-stone-400 dark:fill-stone-600',
                ]"
                text-anchor="middle"
              >
                {{ language === "ja" ? region.jaName : region.name }}
              </text>

              <!-- Optional Count Indicator / Active Dot -->
              <circle
                v-if="isRegionActive(region.id)"
                :cx="region.labelX"
                :cy="region.labelY - 12"
                r="3"
                class="fill-primary-500 animate-pulse"
              />
            </template>
          </g>
        </svg>

        <!-- Map Floating Interactive Tooltip -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <div
            v-if="hoveredRegion"
            class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-stone-900/95 dark:bg-stone-950/95 backdrop-blur-md border border-stone-800 dark:border-stone-700 text-white rounded-lg px-3 py-2 text-xs shadow-lg flex flex-col gap-1 min-w-[130px] z-20 pointer-events-none"
          >
            <div
              class="flex items-center justify-between gap-3 border-b border-stone-800 pb-1"
            >
              <span class="font-serif font-bold text-primary-400">
                {{ hoveredRegion.name }} ({{ hoveredRegion.jaName }})
              </span>
              <span
                v-if="isRegionActive(hoveredRegion.id)"
                class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"
              />
            </div>
            <div class="text-[10px] text-stone-300 font-sans space-y-0.5">
              <div class="flex justify-between gap-4">
                <span>{{ language === "ja" ? "アクティブ" : "Status" }}:</span>
                <span
                  class="font-semibold"
                  :class="
                    isRegionActive(hoveredRegion.id)
                      ? 'text-primary-400'
                      : 'text-stone-500'
                  "
                >
                  {{
                    isRegionActive(hoveredRegion.id)
                      ? language === "ja"
                        ? "ニュースあり"
                        : "Active News"
                      : isNationwide
                        ? language === "ja"
                          ? "全国共通ニュース"
                          : "Nationwide news"
                        : language === "ja"
                          ? "ニュースなし"
                          : "No News"
                  }}
                </span>
              </div>
              <div
                v-if="
                  isRegionActive(hoveredRegion.id) &&
                  getRegionNewsCount(hoveredRegion.id) > 0
                "
                class="flex justify-between gap-4"
              >
                <span>{{ language === "ja" ? "記事数" : "Articles" }}:</span>
                <span class="font-bold text-white"
                  >{{ getRegionNewsCount(hoveredRegion.id) }}
                  {{ language === "ja" ? "件" : "" }}</span
                >
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Quick Legend Indicators -->
      <div
        class="w-full grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-200/50 dark:border-stone-800/80 text-[10px] text-stone-500 dark:text-stone-400 font-sans"
      >
        <div class="flex items-center gap-1.5 justify-center">
          <span
            class="w-2.5 h-2.5 rounded border border-stone-300 dark:border-stone-800 bg-stone-100/40 dark:bg-stone-900/20"
          />
          <span>{{ language === "ja" ? "対象外" : "Inactive" }}</span>
        </div>
        <div class="flex items-center gap-1.5 justify-center">
          <span
            class="w-2.5 h-2.5 rounded border border-primary-500/70 bg-primary-500/10"
          />
          <span>{{ language === "ja" ? "ニュースあり" : "Active News" }}</span>
        </div>
        <div class="flex items-center gap-1.5 justify-center">
          <span
            class="w-2.5 h-2.5 rounded border border-primary-500 bg-primary-500/20 shadow-[0_0_4px_rgba(249,115,22,0.3)]"
          />
          <span>{{ language === "ja" ? "選択中" : "Selected" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  activeRegions: string[];
  selectedRegion?: string | null;
  regionCounts?: Record<string, number>;
  language?: string;
  isNationwide?: boolean;
}>();

const emit = defineEmits<{
  (e: "select-region", region: string): void;
  (e: "clear-region"): void;
}>();

interface RegionData {
  id: string;
  name: string;
  jaName: string;
  path: string;
  labelX: number;
  labelY: number;
}

const hoveredRegion = ref<RegionData | null>(null);

// Simplified visual map of the 8 traditional regions of Japan + Okinawa Inset
const regions: RegionData[] = [
  {
    id: "hokkaido",
    name: "Hokkaido",
    jaName: "北海道",
    path: "M 330,40 L 450,40 L 430,130 L 340,120 L 310,90 Z",
    labelX: 375,
    labelY: 85,
  },
  {
    id: "tohoku",
    name: "Tohoku",
    jaName: "東北",
    path: "M 300,125 L 340,125 L 340,230 L 290,250 L 280,180 Z",
    labelX: 315,
    labelY: 180,
  },
  {
    id: "kanto",
    name: "Kanto",
    jaName: "関東",
    path: "M 290,255 L 340,235 L 345,300 L 305,320 L 290,300 Z",
    labelX: 320,
    labelY: 275,
  },
  {
    id: "chubu",
    name: "Chubu",
    jaName: "中部",
    path: "M 220,240 L 285,255 L 285,315 L 245,335 L 205,290 Z",
    labelX: 245,
    labelY: 285,
  },
  {
    id: "kansai",
    name: "Kansai",
    jaName: "関西",
    path: "M 170,285 L 200,285 L 240,335 L 200,375 L 160,350 Z",
    labelX: 195,
    labelY: 330,
  },
  {
    id: "chugoku",
    name: "Chugoku",
    jaName: "中国",
    path: "M 90,300 L 165,285 L 155,340 L 80,350 Z",
    labelX: 120,
    labelY: 315,
  },
  {
    id: "shikoku",
    name: "Shikoku",
    jaName: "四国",
    path: "M 100,365 L 155,355 L 145,395 L 90,390 Z",
    labelX: 120,
    labelY: 380,
  },
  {
    id: "kyushu",
    name: "Kyushu",
    jaName: "九州",
    path: "M 30,355 L 75,355 L 75,445 L 20,435 Z",
    labelX: 48,
    labelY: 405,
  },
  {
    id: "okinawa",
    name: "Okinawa",
    jaName: "沖縄",
    path: "M 25,465 L 45,460 L 55,470 L 35,475 Z",
    labelX: 45,
    labelY: 450,
  },
];

const isRegionActive = (id: string): boolean => {
  return props.activeRegions.includes(id);
};

const getRegionNewsCount = (id: string): number => {
  if (!props.regionCounts) return 0;
  return props.regionCounts[id] || 0;
};

const onRegionClick = (id: string) => {
  emit("select-region", id);
};

const clearSelection = () => {
  emit("clear-region");
};
</script>

<script lang="ts">
/**
 * Utility mapping function to resolve dynamic prefecture names
 * or regions returned by Gemini into standard map ID regions.
 */
export const mapPrefectureToRegion = (name: string): string => {
  if (!name) return "";
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/(prefecture|ken|fu|to|ko|region|\s)/g, "");

  const mapping: Record<string, string> = {
    // Hokkaido
    hokkaido: "hokkaido",

    // Tohoku
    aomori: "tohoku",
    iwate: "tohoku",
    miyagi: "tohoku",
    akita: "tohoku",
    yamagata: "tohoku",
    fukushima: "tohoku",
    tohoku: "tohoku",

    // Kanto
    ibaraki: "kanto",
    tochigi: "kanto",
    gunma: "kanto",
    saitama: "kanto",
    chiba: "kanto",
    tokyo: "kanto",
    kanagawa: "kanto",
    kanto: "kanto",

    // Chubu
    niigata: "chubu",
    toyama: "chubu",
    ishikawa: "chubu",
    fukui: "chubu",
    yamanashi: "chubu",
    nagano: "chubu",
    gifu: "chubu",
    shizuoka: "chubu",
    aichi: "chubu",
    chubu: "chubu",

    // Kansai
    mie: "kansai",
    shiga: "kansai",
    kyoto: "kansai",
    osaka: "kansai",
    hyogo: "kansai",
    nara: "kansai",
    wakayama: "kansai",
    kansai: "kansai",

    // Chugoku
    tottori: "chugoku",
    shimane: "chugoku",
    okayama: "chugoku",
    hiroshima: "chugoku",
    yamaguchi: "chugoku",
    chugoku: "chugoku",

    // Shikoku
    tokushima: "shikoku",
    kagawa: "shikoku",
    ehime: "shikoku",
    kochi: "shikoku",
    shikoku: "shikoku",

    // Kyushu & Okinawa
    fukuoka: "kyushu",
    saga: "kyushu",
    nagasaki: "kyushu",
    kumamoto: "kyushu",
    oita: "kyushu",
    miyazaki: "kyushu",
    kagoshima: "kyushu",
    okinawa: "okinawa",
    kyushu: "kyushu",
  };

  return mapping[normalized] || "";
};
</script>
