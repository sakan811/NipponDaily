<template>
  <UPage>
    <UHeader v-model:open="mobileMenuOpen">
      <template #left>
        <NuxtLink to="/docs" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" >
          <span>NipponDaily Docs</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2">
          <UButton
            to="/docs"
            label="Docs Overview"
            variant="ghost"
            color="secondary"
            icon="i-heroicons-arrow-left"
            class="hidden sm:flex"
          />
          <UColorModeButton />
        </div>
      </template>

      <template #body>
        <div class="flex flex-col gap-4">
          <UButton
            to="/docs"
            label="Docs Overview"
            variant="ghost"
            color="secondary"
            icon="i-heroicons-arrow-left"
            block
            @click="
              () => {
                mobileMenuOpen = false;
              }
            "
          />
        </div>
      </template>
    </UHeader>

    <main class="max-w-4xl mx-auto py-8 px-4 prose dark:prose-invert">
      <h1 class="text-3xl font-bold mb-6 text-primary-500">
        System Architecture
      </h1>

      <p class="mb-8 text-gray-700 dark:text-gray-300">
        NipponDaily is built with a modern stack focusing on performance,
        scalability, and AI integration. The system aggregates raw news and
        transforms it into synthesized intelligence using Google Gemini.
      </p>

      <div class="my-10">
        <h3
          class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
        >
          Intelligence Pipeline (Zoomable)
        </h3>
        <MermaidDiagram id="arch-diag" :code="architectureDiagram" />
        <p class="text-center text-xs text-gray-500 mt-2 italic">
          Tip: Use your mouse wheel to zoom and drag to pan the diagram.
        </p>
      </div>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        Core Components
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UCard>
          <template #header>
            <h4 class="font-bold">Frontend (Nuxt 4)</h4>
          </template>
          <p class="text-sm">
            Built with Nuxt 4 and Vue 3, utilizing Nuxt UI v4 and Tailwind CSS
            v4. The UI is designed for "Synthesized Reading," prioritizing
            briefings over raw lists.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold">API Engine (Nitro)</h4>
          </template>
          <p class="text-sm">
            The Nitro-powered backend handles request validation, search
            orchestration, and secure communication with AI services and Redis.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold">Search (Tavily)</h4>
          </template>
          <p class="text-sm">
            Optimized news discovery via Tavily API, specifically filtered for
            Japan-related context and high-quality journalistic sources.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold">AI (Google Gemini)</h4>
          </template>
          <p class="text-sm">
            Handles <strong>Executive Briefing</strong> generation,
            <strong>Cross-Source Analysis</strong>, and
            <strong>Trust Scoring</strong>. Features automatic fallback to
            preserve accessibility.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h4 class="font-bold">Database & Cache (Upstash)</h4>
          </template>
          <p class="text-sm">
            Powered by Upstash Redis and Vector database, storing clustered
            story articles, daily briefings, and ingestion caching metadata.
          </p>
        </UCard>
      </div>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        Developer Debug Mode
      </h2>

      <p class="mb-4">
        Setting <code>DEBUG_ERROR_UI=true</code> enables a specialized UI panel
        to simulate API failures, rate limit resets, and AI fallback states,
        allowing for exhaustive layout testing without consuming real quotas.
      </p>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        Color System
      </h2>

      <p>
        The application leverages Nuxt UI v4's semantic system, mapped to
        Tailwind v4's native colors as defined in
        <code>app.config.ts</code>:
      </p>

      <div class="overflow-x-auto my-6">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-4 text-left font-bold">Traditional Pigment</th>
              <th class="py-2 px-4 text-left font-bold">Semantic Mappings</th>
              <th class="py-2 px-4 text-left font-bold">Application</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr>
              <td class="py-2 px-4">
                <strong>Torii Vermilion (朱色 - Shu-iro)</strong>
              </td>
              <td class="py-2 px-4">
                Primary (<code>orange</code>) / Error (<code>orange</code>)
              </td>
              <td class="py-2 px-4">
                Main actions, briefing headers, active highlights
              </td>
            </tr>
            <tr>
              <td class="py-2 px-4">
                <strong>Serene Sky (空色 - Sora-iro)</strong>
              </td>
              <td class="py-2 px-4">
                Secondary (<code>sky</code>) / Info (<code>sky</code>)
              </td>
              <td class="py-2 px-4">Muted UI elements, secondary filters</td>
            </tr>
            <tr>
              <td class="py-2 px-4">
                <strong>Amber Gold (黄金色 - Kogane-iro)</strong>
              </td>
              <td class="py-2 px-4">
                Success (<code>amber</code>) / Warning (<code>amber</code>)
              </td>
              <td class="py-2 px-4">Trust scores, warnings, alerts</td>
            </tr>
            <tr>
              <td class="py-2 px-4">
                <strong>Zen Stone (灰白色 - Kaibakushoku)</strong>
              </td>
              <td class="py-2 px-4">Neutral (<code>stone</code>)</td>
              <td class="py-2 px-4">
                Zen stone slate elements, grids, card borders, backgrounds
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">
        Trust & Credibility
      </h2>
      <p>
        Every briefing includes an AI-computed <strong>Trust Score</strong>.
        This score is a weighted assessment of source reputation, content
        verifiability, and publisher history.
      </p>

      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">
        Trust Gradient
      </h3>
      <p>
        The trust score badge uses a dynamic HSL gradient:
        <code>hsl(score × 120, 70%, 45%)</code>, ranging from:
      </p>
      <ul class="list-disc pl-6 mb-6 space-y-1">
        <li>
          100% (High Trust):
          <span class="text-green-600 font-bold">Green</span>
        </li>
        <li>
          50% (Moderate):
          <span class="text-yellow-600 font-bold">Yellow</span>
        </li>
        <li>
          0% (Low Trust):
          <span class="text-red-600 font-bold">Red</span>
        </li>
      </ul>
    </main>

    <UFooter>
      <template #left>
        <p class="text-sm text-secondary-500">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. Released
          under the Apache-2.0 License.
        </p>
      </template>
    </UFooter>
  </UPage>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false);
const architectureDiagram = `
graph TD
    User([User]) <--> Frontend[Nuxt 4 App]
    Frontend <--> API[Nitro Engine]
    
    subgraph "Storage & Cache Layer"
        API <--> Redis[(Upstash Redis Cache)]
        API <--> Vector[(Upstash Vector DB)]
        Ingest[Ingest Task] --> Vector
        Ingest --> Redis
    end
    
    subgraph "Processing Layer"
        Ingest <--> Tavily[Tavily Search]
        Ingest <--> Gemini[Gemini AI]
    end
`;
</script>

<style>
@reference "../../assets/css/tailwind.css";

h1 {
  @apply text-3xl font-bold mb-6 text-primary-500;
}
h2 {
  @apply text-2xl font-bold mt-12 mb-4 text-primary-500;
}
p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}
</style>
