<template>
  <AppShell>
    <main class="relative z-10 container mx-auto px-4 max-w-5xl py-16 flex-1">
      <div class="max-w-2xl space-y-4">
        <p class="kicker text-primary-600 dark:text-primary-400">Patterns</p>
        <h1
          class="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white leading-tight"
        >
          What the vocabulary is made of
        </h1>
        <div class="rule-double max-w-[120px]" />
        <p
          class="text-base sm:text-lg leading-relaxed text-stone-600 dark:text-stone-400 font-body-serif"
        >
          The same entries, counted across words instead of read one at a time:
          which layer of the vocabulary they come from, how the JLPT levels
          differ, and which processes keep turning up together.
        </p>
      </div>

      <TrendingFallback
        v-if="error"
        class="mt-10"
        :error="error"
        :loading="loading"
        title="Unable to Load the Patterns"
        @retry="refresh()"
      />

      <template v-else-if="patterns">
        <dl
          data-testid="pattern-totals"
          class="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div
            v-for="stat in totals"
            :key="stat.label"
            class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3"
          >
            <dt class="kicker text-stone-600 dark:text-stone-400">
              {{ stat.label }}
            </dt>
            <dd class="text-3xl font-serif font-bold">{{ stat.value }}</dd>
          </div>
        </dl>

        <ul
          class="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-600 dark:text-stone-400"
          aria-label="Word layers"
        >
          <li
            v-for="key in STRATUM_KEYS"
            :key="key"
            class="flex items-center gap-1.5"
          >
            <span
              :class="['inline-block h-2.5 w-2.5 rounded-sm', STRATUM_DOT[key]]"
            />
            {{ layerName(key) }}
          </li>
        </ul>

        <!-- Layers -->
        <section class="mt-10 space-y-4" aria-labelledby="layers-heading">
          <h2
            id="layers-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Layers
          </h2>
          <ul data-testid="pattern-strata" class="space-y-2">
            <li v-for="s in patterns.strata" :key="s.value">
              <NuxtLink
                :to="explorePath({ stratum: [s.value] })"
                class="group block"
              >
                <span class="flex items-baseline justify-between gap-3 text-sm">
                  <span
                    class="group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    >{{ layerName(s.value) }}</span
                  >
                  <span class="tabular-nums text-stone-600 dark:text-stone-400"
                    >{{ s.count }} ·
                    {{ percent(s.count, patterns.total) }}</span
                  >
                </span>
                <span class="mt-1 block h-3 bg-stone-200/70 dark:bg-stone-800">
                  <span
                    :class="['block h-full', STRATUM_DOT[s.value]]"
                    :style="{ width: width(s.count, maxStratum) }"
                  />
                </span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <!-- Levels × layers -->
        <section class="mt-12 space-y-4" aria-labelledby="levels-heading">
          <h2
            id="levels-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Each JLPT level, by layer
          </h2>
          <p
            class="text-stone-600 dark:text-stone-400 font-body-serif max-w-2xl"
          >
            Every bar is one level scaled to 100%, so you can compare their mix
            rather than their size.
          </p>
          <ul data-testid="pattern-levels" class="space-y-3">
            <li v-for="row in patterns.levels" :key="row.value">
              <NuxtLink
                :to="explorePath({ level: [row.value] })"
                class="group block"
              >
                <span class="flex items-baseline justify-between gap-3 text-sm">
                  <span
                    class="font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    >{{ row.value }}</span
                  >
                  <span class="tabular-nums text-stone-600 dark:text-stone-400"
                    >{{ row.count }} words</span
                  >
                </span>
                <span
                  class="mt-1 flex h-4 bg-stone-200/70 dark:bg-stone-800"
                  role="img"
                  :aria-label="breakdown(row.value, row.byStratum)"
                >
                  <span
                    v-for="seg in segments(row.byStratum, row.count)"
                    :key="seg.key"
                    :class="['h-full', STRATUM_DOT[seg.key]]"
                    :style="{ width: seg.width }"
                    :title="`${layerName(seg.key)}: ${seg.count}`"
                  />
                </span>
                <span
                  class="mt-1 block text-xs text-stone-600 dark:text-stone-400"
                  >{{ shares(row.byStratum, row.count) }}</span
                >
              </NuxtLink>
            </li>
          </ul>
        </section>

        <!-- Processes -->
        <section class="mt-12 space-y-4" aria-labelledby="processes-heading">
          <h2
            id="processes-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Processes
          </h2>
          <p
            class="text-stone-600 dark:text-stone-400 font-body-serif max-w-2xl"
          >
            How many words carry each process tag. A word can carry several, so
            these add up to more than the number of words. The colours show
            which layers the process turns up in.
          </p>
          <ul data-testid="pattern-processes" class="space-y-3">
            <li v-for="row in patterns.processes" :key="row.value">
              <NuxtLink
                :to="explorePath({ process: [row.value] })"
                class="group block"
              >
                <span class="flex items-baseline justify-between gap-3 text-sm">
                  <span
                    class="group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    >{{ WORD_PROCESSES[row.value].label }}</span
                  >
                  <span
                    class="tabular-nums text-stone-600 dark:text-stone-400"
                    >{{ row.count }}</span
                  >
                </span>
                <span
                  class="mt-1 flex h-3"
                  role="img"
                  :aria-label="
                    breakdown(WORD_PROCESSES[row.value].label, row.byStratum)
                  "
                  :style="{ width: width(row.count, maxProcess) }"
                >
                  <span
                    v-for="seg in segments(row.byStratum, row.count)"
                    :key="seg.key"
                    :class="['h-full', STRATUM_DOT[seg.key]]"
                    :style="{ width: seg.width }"
                    :title="`${layerName(seg.key)}: ${seg.count}`"
                  />
                </span>
                <span
                  class="mt-0.5 block text-xs text-stone-600 dark:text-stone-400"
                  >{{ WORD_PROCESSES[row.value].description }}</span
                >
              </NuxtLink>
            </li>
          </ul>
        </section>

        <!-- Pairs -->
        <section
          v-if="patterns.pairs.length"
          class="mt-12 space-y-4"
          aria-labelledby="pairs-heading"
        >
          <h2
            id="pairs-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Processes that travel together
          </h2>
          <ul
            data-testid="pattern-pairs"
            class="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <li
              v-for="pair in patterns.pairs"
              :key="`${pair.a}-${pair.b}`"
              class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3"
            >
              <p class="flex items-baseline justify-between gap-3">
                <span class="font-semibold"
                  >{{ WORD_PROCESSES[pair.a].label }} +
                  {{ WORD_PROCESSES[pair.b].label }}</span
                >
                <span
                  class="tabular-nums text-sm text-stone-600 dark:text-stone-400"
                  >{{ pair.count }} words</span
                >
              </p>
              <p class="mt-1 text-sm font-serif">
                <NuxtLink
                  v-for="(ex, i) in pair.examples"
                  :key="ex.date"
                  :to="`/words/${ex.date}`"
                  class="text-primary-600 dark:text-primary-400 hover:underline"
                  >{{ ex.term
                  }}<span v-if="i < pair.examples.length - 1"
                    >、</span
                  ></NuxtLink
                >
              </p>
            </li>
          </ul>
        </section>

        <!-- Larger combinations -->
        <section
          v-if="patterns.combinations.length"
          class="mt-12 space-y-4"
          aria-labelledby="combinations-heading"
        >
          <h2
            id="combinations-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Three or more together
          </h2>
          <p
            class="text-stone-600 dark:text-stone-400 font-body-serif max-w-2xl"
          >
            Sets of three or four tags, counting a word's layer as one, that the
            same words carry. A word that also has other tags is counted too.
            Each set opens in Explore with “All of them” on.
          </p>
          <ul
            data-testid="pattern-combinations"
            class="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <li
              v-for="combo in patterns.combinations"
              :key="combinationKey(combo)"
              class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3"
            >
              <p class="flex items-baseline justify-between gap-3">
                <NuxtLink
                  :to="combinationPath(combo)"
                  class="font-semibold hover:text-primary-600 dark:hover:text-primary-400"
                  >{{ combinationLabel(combo) }}</NuxtLink
                >
                <span
                  class="tabular-nums text-sm text-stone-600 dark:text-stone-400"
                  >{{ combo.count }} words</span
                >
              </p>
              <p class="mt-1 text-sm font-serif">
                <NuxtLink
                  v-for="(ex, i) in combo.examples"
                  :key="ex.date"
                  :to="`/words/${ex.date}`"
                  class="text-primary-600 dark:text-primary-400 hover:underline"
                  >{{ ex.term
                  }}<span v-if="i < combo.examples.length - 1"
                    >、</span
                  ></NuxtLink
                >
              </p>
            </li>
          </ul>
        </section>

        <!-- Rendaku -->
        <section
          v-if="patterns.rendaku.words"
          class="mt-12 space-y-4"
          aria-labelledby="rendaku-heading"
        >
          <h2
            id="rendaku-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Readings that change inside a word
          </h2>
          <p
            class="text-stone-600 dark:text-stone-400 font-body-serif max-w-2xl"
          >
            In {{ patterns.rendaku.words }} of the {{ patterns.total }} words,
            the “Taken apart” row records a part whose reading differs from its
            own — 日 is ひ alone but び in 日曜日. This is what these entries
            show, not a rule of the language: it is a small sample, and the
            parts come from parsing Wiktionary's text.
            <NuxtLink
              :to="explorePath({ process: ['rendaku'] })"
              class="text-primary-600 dark:text-primary-400 hover:underline"
              >Browse the rendaku words</NuxtLink
            >.
          </p>

          <ul data-testid="rendaku-voiced" class="space-y-5">
            <li v-for="sound in patterns.rendaku.voiced" :key="sound.from">
              <p class="flex items-baseline justify-between gap-3">
                <span class="font-serif text-xl font-bold"
                  >{{ sound.from }} → {{ sound.to }}</span
                >
                <span
                  class="tabular-nums text-sm text-stone-600 dark:text-stone-400"
                  >{{ sound.count }}
                  {{ sound.count === 1 ? "word" : "words" }}</span
                >
              </p>
              <span class="mt-1 block h-2 bg-stone-200/70 dark:bg-stone-800">
                <span
                  class="block h-full bg-primary-500"
                  :style="{ width: width(sound.count, maxVoiced) }"
                />
              </span>
              <ul class="mt-2 space-y-1 text-sm">
                <li
                  v-for="r in sound.readings"
                  :key="`${r.part}-${r.base}-${r.reading}-${r.position}`"
                  data-testid="rendaku-reading"
                >
                  <NuxtLink
                    :to="partPath(r.part)"
                    class="font-serif font-bold text-primary-600 dark:text-primary-400 hover:underline"
                    >{{ r.part }}</NuxtLink
                  >
                  {{ r.base }} → {{ r.reading }}
                  <span
                    v-if="r.position === 'first'"
                    class="text-stone-600 dark:text-stone-400"
                    >(the first part)</span
                  >
                  ·
                  <template v-for="(ex, i) in r.examples" :key="ex.date"
                    ><NuxtLink
                      :to="`/words/${ex.date}`"
                      class="font-serif hover:underline"
                      >{{ ex.term }}</NuxtLink
                    ><span v-if="i < r.examples.length - 1">、</span></template
                  ><span
                    v-if="moreCount(r) > 0"
                    class="text-stone-600 dark:text-stone-400"
                  >
                    and {{ moreCount(r) }} more</span
                  >
                </li>
              </ul>
            </li>
          </ul>

          <div
            v-for="group in otherChanges"
            :key="group.id"
            :data-testid="`rendaku-${group.id}`"
            class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3"
          >
            <p class="font-semibold">{{ group.title }}</p>
            <p class="text-sm text-stone-600 dark:text-stone-400">
              {{ group.note }}
            </p>
            <ul class="mt-2 space-y-1 text-sm">
              <li v-for="r in group.readings" :key="`${r.part}-${r.reading}`">
                <NuxtLink
                  :to="partPath(r.part)"
                  class="font-serif font-bold text-primary-600 dark:text-primary-400 hover:underline"
                  >{{ r.part }}</NuxtLink
                >
                {{ r.base }} → {{ r.reading }} ·
                <template v-for="(ex, i) in r.examples" :key="ex.date"
                  ><NuxtLink
                    :to="`/words/${ex.date}`"
                    class="font-serif hover:underline"
                    >{{ ex.term }}</NuxtLink
                  ><span v-if="i < r.examples.length - 1">、</span></template
                ><span
                  v-if="moreCount(r) > 0"
                  class="text-stone-600 dark:text-stone-400"
                >
                  and {{ moreCount(r) }} more</span
                >
              </li>
            </ul>
          </div>
        </section>

        <!-- Pitch accent by layer -->
        <section
          v-if="patterns.pitch.length"
          class="mt-12 space-y-4"
          aria-labelledby="pitch-heading"
        >
          <h2
            id="pitch-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            How the pitch falls, by layer
          </h2>
          <p
            class="text-stone-600 dark:text-stone-400 font-body-serif max-w-2xl"
          >
            Every accent the entries show, sorted by where it falls and grouped
            by the word's layer. Each bar is one layer scaled to 100%. A word
            with two accents counts in both, and a word with none shown is left
            out.
          </p>
          <ul
            class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-600 dark:text-stone-400"
            aria-label="Accent patterns"
          >
            <li
              v-for="p in PITCH_IDS"
              :key="p"
              class="flex items-center gap-1.5"
            >
              <span
                :class="['inline-block h-2.5 w-2.5 rounded-sm', PITCH_DOT[p]]"
              />
              <NuxtLink
                :to="explorePath({ pitch: [p] })"
                class="underline hover:text-primary-600 dark:hover:text-primary-400"
                >{{ PITCH_TYPES[p].label }}</NuxtLink
              >
            </li>
          </ul>
          <ul data-testid="pattern-pitch" class="space-y-3">
            <li v-for="row in patterns.pitch" :key="row.value">
              <span class="flex items-baseline justify-between gap-3 text-sm">
                <span>{{ layerName(row.value) }}</span>
                <span class="tabular-nums text-stone-600 dark:text-stone-400"
                  >{{ row.words }} words</span
                >
              </span>
              <span
                class="mt-1 flex h-4 bg-stone-200/70 dark:bg-stone-800"
                role="img"
                :aria-label="pitchBreakdown(row)"
              >
                <span
                  v-for="p in PITCH_IDS.filter((id) => row.accents[id] > 0)"
                  :key="p"
                  :class="['h-full', PITCH_DOT[p]]"
                  :style="{ width: pitchWidth(row, p) }"
                  :title="`${PITCH_TYPES[p].label}: ${row.accents[p]}`"
                />
              </span>
              <span
                class="mt-1 block text-xs text-stone-600 dark:text-stone-400"
                >{{ pitchBreakdown(row) }}</span
              >
            </li>
          </ul>
        </section>

        <!-- How long the words are -->
        <section
          v-if="patterns.lengths.length"
          class="mt-12 space-y-4"
          aria-labelledby="lengths-heading"
        >
          <h2
            id="lengths-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            How long the words are, by level
          </h2>
          <p
            class="text-stone-600 dark:text-stone-400 font-body-serif max-w-2xl"
          >
            The mean length of each level's words so far: the beats (morae) in
            the reading and the kanji in the spelling.
          </p>
          <div class="table-wrap">
            <table data-testid="pattern-lengths">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Words</th>
                  <th>Morae per word</th>
                  <th>Kanji per word</th>
                  <th>Written without kanji</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in patterns.lengths" :key="row.value">
                  <td>
                    <NuxtLink :to="explorePath({ level: [row.value] })">{{
                      row.value
                    }}</NuxtLink>
                  </td>
                  <td>{{ row.words }}</td>
                  <td>{{ row.meanMorae }}</td>
                  <td>{{ row.meanKanji }}</td>
                  <td>
                    {{ row.kanaOnly }} ({{ percent(row.kanaOnly, row.words) }})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Words that sound the same -->
        <section
          v-if="patterns.soundAlikes?.readings"
          class="mt-12 space-y-4"
          aria-labelledby="sound-alikes-heading"
        >
          <h2
            id="sound-alikes-heading"
            class="text-2xl font-serif font-bold text-stone-900 dark:text-white"
          >
            Words that sound the same
          </h2>
          <p
            data-testid="pattern-sound-alikes-summary"
            class="text-stone-600 dark:text-stone-400 font-body-serif max-w-2xl"
          >
            {{ patterns.soundAlikes.readings }} readings are each shared by two
            or more words so far, {{ patterns.soundAlikes.words }} words in all.
            In {{ patterns.soundAlikes.withAccents }} of them every word shows a
            pitch accent, and in {{ patterns.soundAlikes.toldApart }} of those
            no two words share one, so the pitch alone tells them apart. The
            readings with the most words are below; only the readings are
            compared, not how the words are related.
          </p>
          <ul
            data-testid="pattern-sound-alikes"
            class="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <li
              v-for="g in patterns.soundAlikes.groups"
              :key="g.reading"
              class="season-box border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/50 px-4 py-3 space-y-2"
            >
              <p class="flex flex-wrap items-baseline justify-between gap-2">
                <span
                  class="text-xl font-serif font-bold text-primary-600 dark:text-primary-400"
                  >{{ g.reading }}</span
                >
                <span
                  v-if="g.toldApart"
                  class="kicker text-stone-600 dark:text-stone-400"
                  >Told apart by pitch</span
                >
              </p>
              <ul class="space-y-1 text-sm">
                <li
                  v-for="w in g.words"
                  :key="w.date"
                  class="flex flex-wrap items-baseline gap-x-3"
                >
                  <NuxtLink
                    :to="`/words/${w.date}`"
                    class="font-serif text-lg text-stone-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                    >{{ w.term }}</NuxtLink
                  >
                  <span class="text-stone-600 dark:text-stone-400">{{
                    w.pitch
                      ? w.pitch.map((a) => markFall(g.reading, a)).join(", ")
                      : "no accent shown"
                  }}</span>
                </li>
              </ul>
            </li>
          </ul>
        </section>

        <p class="mt-12 text-xs text-stone-600 dark:text-stone-400 max-w-2xl">
          These count the tags on the entries so far — what KANJIDIC2 and the
          quoted Wiktionary text establish for each word — not the Japanese
          language as a whole. The words are drawn from the JLPT N5–N1 lists,
          and a layer or process is counted only where a source establishes it,
          so the mix reflects what the sources hold. A layer is left unstated
          where neither source settles it.
        </p>
      </template>

      <div v-else class="mt-10 space-y-3" aria-busy="true">
        <USkeleton class="h-8 w-64" />
        <USkeleton class="h-48 w-full" />
      </div>
    </main>
  </AppShell>
</template>

<script setup lang="ts">
import AppShell from "../components/AppShell.vue";
import { computed } from "vue";
import TrendingFallback from "../components/TrendingFallback.vue";
import { usePatterns } from "../composables/useExplore";
import { usePageSeo } from "../composables/usePageSeo";
import { explorePath, partPath } from "../utils/seo";
import { STRATUM_DOT } from "../utils/stratum";
import { WORD_PROCESSES, WORD_STRATA } from "~~/shared/word-labels";
import { PITCH_TYPES, markFall } from "../utils/pitch";
import type { PitchType } from "../utils/pitch";
import type {
  PitchByLayer,
  RendakuReading,
  StratumKey,
  TagCombination,
} from "~~/types/index";

const { patterns, loading, error, refresh } = usePatterns();

usePageSeo({
  title: "What the vocabulary is made of",
  description:
    "NipponDaily's words counted across the whole set: layers of the vocabulary, JLPT levels, the processes that shaped them and which ones turn up together.",
  path: "/patterns",
});

const STRATUM_KEYS: StratumKey[] = [
  "wago",
  "kango",
  "gairaigo",
  "hybrid",
  "unstated",
];

const layerName = (key: StratumKey): string =>
  key === "unstated"
    ? "Not stated"
    : `${WORD_STRATA[key].native} ${WORD_STRATA[key].label}`;

/** "Compound + Rendaku + 和語 Native Japanese" */
const combinationLabel = (c: TagCombination): string =>
  [
    ...c.processes.map((p) => WORD_PROCESSES[p].label),
    ...(c.stratum ? [layerName(c.stratum)] : []),
  ].join(" + ");

const combinationKey = (c: TagCombination): string =>
  [...c.processes, c.stratum ?? ""].join("|");

const combinationPath = (c: TagCombination): string =>
  explorePath({
    process: c.processes,
    stratum: c.stratum ? [c.stratum] : undefined,
    match: "all",
  });

const totals = computed(() =>
  patterns.value
    ? [
        { label: "Words open", value: patterns.value.total },
        { label: "Taken into parts", value: patterns.value.withParts },
        { label: "With a changed reading", value: patterns.value.withBase },
      ]
    : [],
);

const maxStratum = computed(() =>
  Math.max(1, ...(patterns.value?.strata.map((s) => s.count) ?? [])),
);
const maxProcess = computed(() =>
  Math.max(1, ...(patterns.value?.processes.map((p) => p.count) ?? [])),
);

const width = (count: number, max: number): string =>
  `${Math.max(count > 0 ? 2 : 0, (count / max) * 100)}%`;

const percent = (count: number, total: number): string =>
  total ? `${Math.round((count / total) * 100)}%` : "0%";

/** The layer segments of one bar, in a fixed order, empty ones dropped. */
const segments = (by: Record<StratumKey, number>, total: number) =>
  STRATUM_KEYS.filter((key) => by[key] > 0).map((key) => ({
    key,
    count: by[key],
    width: `${(by[key] / (total || 1)) * 100}%`,
  }));

const shares = (by: Record<StratumKey, number>, total: number): string =>
  STRATUM_KEYS.filter((key) => by[key] > 0)
    .map((key) => `${layerName(key)} ${percent(by[key], total)}`)
    .join(" · ");

const breakdown = (label: string, by: Record<StratumKey, number>): string =>
  `${label}: ${STRATUM_KEYS.filter((k) => by[k] > 0)
    .map((k) => `${layerName(k)} ${by[k]}`)
    .join(", ")}`;

const PITCH_IDS = Object.keys(PITCH_TYPES) as PitchType[];

/** Four tones of the accent colour, so a bar still reads in one hue. */
const PITCH_DOT: Record<PitchType, string> = {
  heiban: "bg-primary-700",
  atamadaka: "bg-primary-500",
  nakadaka: "bg-primary-300",
  odaka: "bg-stone-400",
};

const pitchTotal = (row: PitchByLayer): number =>
  PITCH_IDS.reduce((sum, id) => sum + row.accents[id], 0);

const pitchWidth = (row: PitchByLayer, id: PitchType): string =>
  `${(row.accents[id] / (pitchTotal(row) || 1)) * 100}%`;

const pitchBreakdown = (row: PitchByLayer): string =>
  PITCH_IDS.filter((id) => row.accents[id] > 0)
    .map(
      (id) =>
        `${PITCH_TYPES[id].label} ${percent(row.accents[id], pitchTotal(row))}`,
    )
    .join(" · ");

const maxVoiced = computed(() =>
  Math.max(1, ...(patterns.value?.rendaku.voiced.map((s) => s.count) ?? [])),
);

/** The recorded changes that are not a first kana voicing, each with a plain note. */
const otherChanges = computed(() => {
  const r = patterns.value?.rendaku;
  if (!r) return [];
  return [
    {
      id: "sokuon",
      title: "Ending in っ",
      note: "The part's last kana became っ in the word.",
      readings: r.sokuon,
    },
    {
      id: "other",
      title: "Other changes",
      note: "Recorded in the entries, but not a voiced first kana or an ending in っ.",
      readings: r.other,
    },
  ].filter((group) => group.readings.length);
});

/** "手袋、手紙 and 1 more" — a change's examples, linked, with how many words it covers. */
const moreCount = (r: RendakuReading): number => r.count - r.examples.length;
</script>
