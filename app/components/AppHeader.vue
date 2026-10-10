<template>
  <UHeader v-model:open="menuOpen">
    <template #top>
      <div
        class="min-h-8 flex items-center justify-between text-stone-500 dark:text-stone-400"
      >
        <span class="kicker"
          ><span class="season-glyph" aria-hidden="true" /> {{ dateline }}</span
        >
        <span class="hidden sm:inline"
          ><span class="kicker">One Word, Taken Apart, Every Day</span></span
        >
      </div>
    </template>

    <template #left>
      <NuxtLink
        to="/"
        class="flex items-center gap-2 text-lg min-[360px]:text-xl min-[400px]:gap-2.5 min-[400px]:text-2xl sm:text-3xl"
      >
        <span
          class="relative flex items-center justify-center w-[1.35em] h-[1.35em] rounded-full bg-primary-500/10 ring-1 ring-primary-500/30 shrink-0"
        >
          <img
            src="/favicon-light.ico"
            alt="NipponDaily"
            class="w-[0.8em] h-[0.8em] dark:hidden rounded-full"
          />
          <img
            src="/favicon-dark.ico"
            alt="NipponDaily"
            class="w-[0.8em] h-[0.8em] hidden dark:block rounded-full"
          />
        </span>
        <span
          class="font-serif font-bold text-[1em] leading-none text-stone-900 dark:text-white"
          >NipponDaily</span
        >
      </NuxtLink>
    </template>

    <template #right>
      <div class="flex items-center gap-2 md:gap-4">
        <nav
          class="hidden md:flex items-center gap-4 text-sm font-medium text-stone-600 dark:text-stone-300"
        >
          <NuxtLink
            v-for="link in NAV_LINKS"
            :key="link.to"
            :to="link.to"
            class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >{{ link.label }}</NuxtLink
          >
        </nav>
        <div class="flex items-center gap-1">
          <BgmControl />
          <SeasonButton />
          <UColorModeButton
            class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          />
        </div>
      </div>
    </template>

    <template #body>
      <nav
        class="flex flex-col text-base font-medium text-stone-700 dark:text-stone-200"
        aria-label="Main"
      >
        <NuxtLink
          v-for="link in NAV_LINKS"
          :key="link.to"
          :to="link.to"
          class="py-2.5 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          @click="menuOpen = false"
          >{{ link.label }}</NuxtLink
        >
      </nav>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute } from "#app";

const NAV_LINKS = [
  { to: "/words", label: "Calendar" },
  { to: "/explore", label: "Explore" },
  { to: "/patterns", label: "Patterns" },
  { to: "/parts", label: "Parts" },
  { to: "/kanji", label: "Kanji" },
  { to: "/kana", label: "Kana" },
  { to: "/docs", label: "Docs" },
];

const menuOpen = ref(false);
const route = useRoute();
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);

const dateline = ref("");

onMounted(() => {
  dateline.value = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});
</script>
