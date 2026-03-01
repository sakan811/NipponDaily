<template>
  <UPage>
    <UHeader v-model:open="mobileMenuOpen">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" >
          <span>NipponDaily</span>
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
          <UButton
            to="/news"
            label="Get News"
            variant="ghost"
            color="primary"
            icon="i-heroicons-newspaper"
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
            @click="mobileMenuOpen = false"
          />
          <UButton
            to="/news"
            label="Get News"
            variant="ghost"
            color="primary"
            icon="i-heroicons-newspaper"
            block
            @click="mobileMenuOpen = false"
          />
        </div>
      </template>
    </UHeader>

    <main class="max-w-4xl mx-auto py-8 px-4 prose dark:prose-invert">
      <h1 class="text-3xl font-bold mb-6 text-primary-500">System Architecture</h1>
      
      <p class="mb-8 text-gray-700 dark:text-gray-300">
        NipponDaily is built with a modern stack focusing on performance, scalability, and AI integration. The following diagram illustrates the high-level architecture of the application.
      </p>

      <div class="my-10">
        <h3 class="text-center mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200">High-Level Flow (Zoomable)</h3>
        <MermaidDiagram id="arch-diag" :code="architectureDiagram" />
        <p class="text-center text-xs text-gray-500 mt-2 italic">Tip: Use your mouse wheel to zoom and drag to pan the diagram.</p>
      </div>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">Core Components</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <UCard>
          <template #header>
            <h4 class="font-bold">Frontend (Nuxt 4)</h4>
          </template>
          <p class="text-sm">Built with Nuxt 4, using Nuxt UI v4 for components and Tailwind CSS v4 for styling. It provides a responsive and fast user interface.</p>
        </UCard>
        
        <UCard>
          <template #header>
            <h4 class="font-bold">API Engine (Nitro)</h4>
          </template>
          <p class="text-sm">The server-side logic runs on Nitro, providing high-performance API routes and seamless integration with external services.</p>
        </UCard>
        
        <UCard>
          <template #header>
            <h4 class="font-bold">Search (Tavily)</h4>
          </template>
          <p class="text-sm">We use the Tavily Search API specifically optimized for LLMs to find the most relevant and up-to-date Japanese news.</p>
        </UCard>
        
        <UCard>
          <template #header>
            <h4 class="font-bold">AI (Google Gemini)</h4>
          </template>
          <p class="text-sm">Google Gemini Flash 2.5 handles categorization, translation, summarization, and credibility scoring of news articles.</p>
        </UCard>
        
        <UCard>
          <template #header>
            <h4 class="font-bold">Rate Limiting (Upstash)</h4>
          </template>
          <p class="text-sm">Redis-based rate limiting via Upstash ensures fair usage and prevents API abuse.</p>
        </UCard>
      </div>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">Color Palette</h2>
      
      <p>
        The app uses Nuxt UI v4's semantic color system with Tailwind v4's native palette:
      </p>

      <div class="overflow-x-auto my-6">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-4 text-left font-bold">Semantic Color</th>
              <th class="py-2 px-4 text-left font-bold">Tailwind Color</th>
              <th class="py-2 px-4 text-left font-bold">Usage</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr><td class="py-2 px-4">Primary</td><td class="py-2 px-4"><code>orange</code></td><td class="py-2 px-4">Main CTAs, selected buttons</td></tr>
            <tr><td class="py-2 px-4">Secondary</td><td class="py-2 px-4"><code>sky</code></td><td class="py-2 px-4">Secondary buttons, outline buttons, muted text</td></tr>
            <tr><td class="py-2 px-4">Success</td><td class="py-2 px-4"><code>amber</code></td><td class="py-2 px-4">Success messages, sports category</td></tr>
            <tr><td class="py-2 px-4">Info</td><td class="py-2 px-4"><code>sky</code></td><td class="py-2 px-4">Info alerts, technology category</td></tr>
            <tr><td class="py-2 px-4">Warning</td><td class="py-2 px-4"><code>amber</code></td><td class="py-2 px-4">Warning messages, culture category</td></tr>
            <tr><td class="py-2 px-4">Error</td><td class="py-2 px-4"><code>orange</code></td><td class="py-2 px-4">Error messages, politics category</td></tr>
            <tr><td class="py-2 px-4">Neutral</td><td class="py-2 px-4"><code>stone</code></td><td class="py-2 px-4">Fallback category, disabled states</td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">Category Color Mappings</h3>
      
      <div class="overflow-x-auto my-6">
        <table class="min-w-full border-collapse">
          <thead>
            <tr class="border-b border-gray-300 dark:border-gray-700">
              <th class="py-2 px-4 text-left font-bold">Category</th>
              <th class="py-2 px-4 text-left font-bold">Semantic Color</th>
              <th class="py-2 px-4 text-left font-bold">Tailwind Base</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
            <tr><td class="py-2 px-4">Politics</td><td class="py-2 px-4">Error</td><td class="py-2 px-4">orange</td></tr>
            <tr><td class="py-2 px-4">Business</td><td class="py-2 px-4">Primary</td><td class="py-2 px-4">orange</td></tr>
            <tr><td class="py-2 px-4">Technology</td><td class="py-2 px-4">Info</td><td class="py-2 px-4">sky</td></tr>
            <tr><td class="py-2 px-4">Culture</td><td class="py-2 px-4">Warning</td><td class="py-2 px-4">amber</td></tr>
            <tr><td class="py-2 px-4">Sports</td><td class="py-2 px-4">Success</td><td class="py-2 px-4">amber</td></tr>
            <tr><td class="py-2 px-4">Other</td><td class="py-2 px-4">Neutral</td><td class="py-2 px-4">stone</td></tr>
          </tbody>
        </table>
      </div>

      <blockquote class="border-l-4 border-primary-500 pl-4 italic my-6 text-gray-600 dark:text-gray-400">
        <strong>Note</strong>: Dark mode is supported via the UColorModeButton component, which leverages Nuxt UI's built-in color mode support. Color values are dynamically adjusted by Nuxt UI for dark mode.
      </blockquote>

      <h2 class="text-2xl font-bold mt-12 mb-4 text-primary-500">Credibility Score</h2>
      <p>
        The credibility score is computed as a weighted average of four metrics:
      </p>
      <ul class="list-disc pl-6 mb-6 space-y-1">
        <li>Source Reputation: 30%</li>
        <li>Domain Trust: 30%</li>
        <li>Content Quality: 20%</li>
        <li>AI Confidence: 20%</li>
      </ul>

      <h3 class="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-200">Credibility Score Badge Color Gradient</h3>
      <ul class="list-disc pl-6 mb-6 space-y-1">
        <li>100%: <code class="text-green-600 dark:text-green-400">hsl(120, 70%, 45%)</code> - Green</li>
        <li>75%: <code class="text-lime-600 dark:text-lime-400">hsl(90, 70%, 45%)</code> - Yellow-Green</li>
        <li>50%: <code class="text-yellow-600 dark:text-yellow-400">hsl(60, 70%, 45%)</code> - Yellow</li>
        <li>25%: <code class="text-orange-600 dark:text-orange-400">hsl(30, 70%, 45%)</code> - Orange-Red</li>
        <li>0%: <code class="text-red-600 dark:text-red-400">hsl(0, 70%, 45%)</code> - Red</li>
      </ul>
      <p>
        The credibility score uses a dynamic gradient computed as <code>hue = score × 120</code> (score 0-1).
      </p>
    </main>

    <UFooter>
      <template #left>
        <p class="text-sm text-secondary-500">
          &copy; 2025 - {{ new Date().getFullYear() }} NipponDaily. All rights reserved.
        </p>
      </template>
    </UFooter>
  </UPage>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)
const architectureDiagram = `
graph TD
    User([User]) <--> Frontend[Nuxt.js Frontend]
    Frontend <--> API[Nitro API Engine]
    
    subgraph "Server Side"
        API <--> Services[Services Layer]
        Services <--> Tavily[Tavily Search API]
        Services <--> Gemini[Google Gemini AI]
        API <--> Redis[(Upstash Redis Cache)]
    end
    
    Tavily -- Raw News --> Services
    Gemini -- AI Analysis --> Services
    Services -- Processed News --> API
    API -- Response --> Frontend
`

useHead({
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js',
      defer: true,
      onload: () => {
        // @ts-expect-error: mermaid is loaded from CDN
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: 'neutral',
          securityLevel: 'loose',
        })
        window.dispatchEvent(new Event('mermaid-ready'))
      }
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js',
      defer: true,
      onload: () => {
        window.dispatchEvent(new Event('svg-pan-zoom-ready'))
      }
    }
  ]
})
</script>

<style>
@reference "../../assets/css/tailwind.css";

/* Basic markdown styling for standard elements */
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
