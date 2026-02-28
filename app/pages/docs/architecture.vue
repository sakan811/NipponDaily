<template>
  <UPage>
    <UHeader :toggle="false">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" />
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
          />
          <UButton
            to="/news"
            label="Get News"
            variant="ghost"
            color="primary"
            icon="i-heroicons-newspaper"
          />
          <UColorModeButton />
        </div>
      </template>
    </UHeader>

    <main class="max-w-4xl mx-auto py-8 px-4 prose dark:prose-invert max-w-none">
      <h1 class="text-3xl font-bold mb-6 text-primary-500">System Architecture</h1>
      
      <p class="mb-8 text-gray-700 dark:text-gray-300">
        NipponDaily is built with a modern stack focusing on performance, scalability, and AI integration. The following diagram illustrates the high-level architecture of the application.
      </p>

      <div class="my-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="text-center mb-6 text-xl font-semibold">High-Level Flow</h3>
        <div class="mermaid flex justify-center">
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
        </div>
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
import { onMounted } from 'vue'

useHead({
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js',
      defer: true,
      onload: () => {
        // @ts-ignore
        mermaid.initialize({ startOnLoad: true, theme: 'neutral' })
      }
    }
  ]
})

onMounted(() => {
  // If mermaid is already loaded, we might need to re-run it
  // @ts-ignore
  if (typeof mermaid !== 'undefined') {
    // @ts-ignore
    mermaid.contentLoaded()
  }
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
