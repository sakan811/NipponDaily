<template>
  <div class="min-h-screen bg-[#FCFBF7] dark:bg-[#0B0E14] text-[#1F2022] dark:text-[#E2E4E9] selection:bg-primary-500/20">
    <!-- Fine grid decoration to resemble shoji paper screens -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />

    <!-- Header -->
    <UHeader class="border-b border-stone-200 dark:border-stone-800 bg-[#FCFBF7]/90 dark:bg-[#0B0E14]/90 backdrop-blur-md">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-3">
          <img src="/favicon.ico" alt="NipponDaily" class="w-8 h-8" >
          <div class="flex flex-col">
            <span class="font-serif font-bold text-lg tracking-wide leading-none">NIPPON DAILY</span>
            <span class="text-[9px] text-stone-500 dark:text-stone-400 font-serif tracking-widest mt-0.5">日本日報</span>
          </div>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-4">
          <UColorModeButton class="hover:text-primary-500 transition-colors" />
        </div>
      </template>
    </UHeader>

    <!-- Hero Section -->
    <main class="relative z-10 container mx-auto px-4 max-w-6xl py-16 sm:py-24">
      <div class="text-center max-w-3xl mx-auto space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-600 dark:text-primary-400 text-xs font-medium tracking-wide">
          <span class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
          Intelligence Portal Dedicated Solely to Japan
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
          Japan, Synthesized.<br class="hidden sm:inline" >
          <span class="text-primary-500 italic font-normal">Deep Cultural & Regional</span> Intelligence.
        </h1>

        <p class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-sans">
          Bypassing the generic noise. NipponDaily collects, synthesizes, and translates domestic Japanese sources across six authentic, highly-specialized news channels using advanced AI.
        </p>

        <div class="flex flex-wrap gap-4 justify-center pt-4">
          <UButton
            label="Enter Intelligence Hub"
            to="/news"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
            class="px-6 py-3 font-medium tracking-wide shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          />
        </div>
      </div>

      <div class="border-t border-stone-200 dark:border-stone-800/80 my-16 sm:my-24" />

      <!-- Specialty Channels Grid -->
      <section class="space-y-12">
        <div class="text-center max-w-lg mx-auto">
          <h2 class="text-3xl font-serif font-bold text-stone-900 dark:text-white">Six Specialty Channels</h2>
          <p class="text-sm text-stone-500 dark:text-stone-400 mt-2 font-sans">
            Curated streams capturing the true multi-faceted heart and pulse of modern Japan.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="(channel, idx) in channels"
            :key="idx"
            class="group hover:shadow-xl hover:border-primary-500/30 border border-stone-200/60 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm transition-all duration-300 rounded-xl"
            :ui="{ body: 'p-6' }"
          >
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                  <UIcon :name="channel.icon" class="w-5 h-5" />
                </div>
                <span class="text-[10px] tracking-widest uppercase font-serif text-stone-400 dark:text-stone-500 font-bold">
                  {{ channel.jpLabel }}
                </span>
              </div>
              <div class="space-y-1.5">
                <h3 class="text-lg font-serif font-bold text-stone-900 dark:text-white group-hover:text-primary-500 transition-colors duration-200">
                  {{ channel.title }}
                </h3>
                <p class="text-xs leading-relaxed text-stone-500 dark:text-stone-400 font-sans">
                  {{ channel.description }}
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <div class="border-t border-stone-200 dark:border-stone-800/80 my-16 sm:my-24" />

      <!-- Poetic Pigment System Section -->
      <section class="max-w-4xl mx-auto rounded-2xl bg-stone-100/50 dark:bg-stone-900/30 border border-stone-200/50 dark:border-stone-800 p-8 sm:p-12 space-y-6 text-center backdrop-blur-sm">
        <h2 class="text-2xl font-serif font-bold text-stone-900 dark:text-white">Aesthetic Philosophy</h2>
        <p class="text-sm leading-relaxed text-stone-600 dark:text-stone-400 max-w-2xl mx-auto font-sans">
          NipponDaily's interface is built on modern simplicity, utilizing premium design tokens inspired by traditional Japanese pigment systems. Experience a serene, ink-print editorial that respects content and reader focus.
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div v-for="(color, idx) in paletteColors" :key="idx" class="flex flex-col items-center p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40 shadow-sm">
            <div class="w-8 h-8 rounded-full mb-2" :class="color.bgClass" />
            <span class="text-xs font-serif font-bold">{{ color.name }}</span>
            <span class="text-[9px] text-stone-400 dark:text-stone-500 font-serif mt-0.5">{{ color.kanji }}</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <UFooter class="border-t border-stone-200 dark:border-stone-800 bg-[#FCFBF7] dark:bg-[#0B0E14]">
      <template #left>
        <p class="text-xs text-stone-500 dark:text-stone-400 font-sans">
          &copy; 2025 - {{ new Date().getFullYear() }} NIPPON DAILY (日本日報). All rights reserved. Released under the Apache-2.0 License.
        </p>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const channels = ref([
  {
    title: "Society & Prefectures",
    jpLabel: "地方・社会",
    description: "Deep insights into demographic shifts, rural revitalization efforts, prefectural policies, and local Japanese daily life.",
    icon: "i-heroicons-user-group",
  },
  {
    title: "Tech & Mobility",
    jpLabel: "技術・産業",
    description: "The cutting edge: Japanese robotics, microchip foundries, Shinkansen expansions, aerospace development, and automotive giants.",
    icon: "i-heroicons-cpu-chip",
  },
  {
    title: "Pop Culture & Gaming",
    jpLabel: "ポップカルチャー",
    description: "Global releases and movements in anime, manga publishing houses, iconic gaming studios (Nintendo, Sony), J-Pop, and Tokyo youth trends.",
    icon: "i-heroicons-play-circle",
  },
  {
    title: "Travel & Heritage",
    jpLabel: "観光・遺産",
    description: "Curated guides to hidden hot spring (onsen) villages, regional festivals (matsuri), historical preservation, and structural tourism.",
    icon: "i-heroicons-map",
  },
  {
    title: "Food & Gastronomy",
    jpLabel: "和食・食文化",
    description: "Washoku culinary arts, Michelin guides, traditional sake/whisky craft distilleries, agricultural techniques, and regional delicacies.",
    icon: "i-heroicons-cake",
  },
  {
    title: "Nature & Resilience",
    jpLabel: "自然・防災",
    description: "Seismic and meteorological developments, structural disaster preparation, environmental stewardship, and geographical surveys.",
    icon: "i-heroicons-shield-exclamation",
  },
]);

const paletteColors = ref([
  { name: "Torii Vermilion", kanji: "朱色 - Shu-iro", bgClass: "bg-primary-500" },
  { name: "Serene Sky", kanji: "空色 - Sora-iro", bgClass: "bg-secondary-500" },
  { name: "Amber Gold", kanji: "黄金 - Kogane", bgClass: "bg-success-500" },
  { name: "Zen Stone", kanji: "灰白 - Kaibaku", bgClass: "bg-stone-300 dark:bg-stone-700" },
]);
</script>

