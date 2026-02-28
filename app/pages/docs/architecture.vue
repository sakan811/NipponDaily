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
            <h4 class="font-bold">Frontend (Nuxt 3)</h4>
          </template>
          <p class="text-sm">Built with Nuxt 3, using Nuxt UI for components and Tailwind CSS for styling. It provides a responsive and fast user interface.</p>
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
          <p class="text-sm">Google Gemini Pro handles categorization, translation, summarization, and credibility scoring of news articles.</p>
        </UCard>
        
        <UCard>
          <template #header>
            <h4 class="font-bold">Rate Limiting (Upstash)</h4>
          </template>
          <p class="text-sm">Redis-based rate limiting via Upstash ensures fair usage and prevents API abuse.</p>
        </UCard>
      </div>
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
