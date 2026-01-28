<template>
  <div class="min-h-screen">
    <!-- Header -->
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
          <img src="/favicon.ico" alt="NipponDaily" class="w-6 h-6" />
          <span>NipponDaily</span>
        </NuxtLink>
      </template>

      <template #right>
        <div class="flex items-center gap-2 hidden lg:flex">
          <UColorModeButton />
        </div>
      </template>

      <template #body>
        <UColorModeButton block />
      </template>
    </UHeader>

    <!-- Hero Section -->
    <main
      class="container mx-auto px-3 sm:px-4 py-12 sm:py-16 max-w-5xl"
    >
      <div class="text-center space-y-6 mb-12 sm:mb-16">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium">
          <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
          AI-Powered News Aggregator
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Japan News,
          <span class="text-primary-500">Smartly Delivered</span>
        </h1>

        <p class="text-lg sm:text-xl text-secondary-500 max-w-2xl mx-auto">
          Discover, translate, and verify Japanese news articles with AI-powered categorization and credibility scoring.
        </p>

        <div class="flex justify-center pt-4">
          <UButton
            to="/news"
            color="primary"
            size="lg"
            icon="i-heroicons-arrow-right"
            trailing
          >
            Start Reading
          </UButton>
        </div>
      </div>

      <!-- Features Section -->
      <section id="features" class="space-y-8">
        <div class="text-center">
          <h2 class="text-2xl sm:text-3xl font-bold mb-2">Key Features</h2>
          <p class="text-secondary-500">Everything you need to stay informed about Japan</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Feature 1 -->
          <UCard
            :ui="{
              base: 'hover:shadow-lg transition-shadow duration-200',
              body: { padding: 'p-6' },
            }"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-info-100 dark:bg-info-900/30 flex items-center justify-center">
                <svg class="w-6 h-6 text-info-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">Smart Discovery</h3>
                <p class="text-sm text-secondary-500">Fetches the latest Japan-related news from trusted sources across the web.</p>
              </div>
            </div>
          </UCard>

          <!-- Feature 2 -->
          <UCard
            :ui="{
              base: 'hover:shadow-lg transition-shadow duration-200',
              body: { padding: 'p-6' },
            }"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">AI Categorization</h3>
                <p class="text-sm text-secondary-500">Automatically categorizes articles into Politics, Business, Tech, Culture, and Sports.</p>
              </div>
            </div>
          </UCard>

          <!-- Feature 3 -->
          <UCard
            :ui="{
              base: 'hover:shadow-lg transition-shadow duration-200',
              body: { padding: 'p-6' },
            }"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                <svg class="w-6 h-6 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">Multilingual Translation</h3>
                <p class="text-sm text-secondary-500">Read news in your preferred language with AI-powered translation.</p>
              </div>
            </div>
          </UCard>

          <!-- Feature 4 -->
          <UCard
            :ui="{
              base: 'hover:shadow-lg transition-shadow duration-200',
              body: { padding: 'p-6' },
            }"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">
                <svg class="w-6 h-6 text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">Credibility Scoring</h3>
                <p class="text-sm text-secondary-500">Multi-factor AI assessment rates source reliability and content quality.</p>
              </div>
            </div>
          </UCard>

          <!-- Feature 5 -->
          <UCard
            :ui="{
              base: 'hover:shadow-lg transition-shadow duration-200',
              body: { padding: 'p-6' },
            }"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                <svg class="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">Smart Filtering</h3>
                <p class="text-sm text-secondary-500">Filter by category, time range, or custom dates to find exactly what you need.</p>
              </div>
            </div>
          </UCard>

          <!-- Feature 6 -->
          <UCard
            :ui="{
              base: 'hover:shadow-lg transition-shadow duration-200',
              body: { padding: 'p-6' },
            }"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-error-100 dark:bg-error-900/30 flex items-center justify-center">
                <svg class="w-6 h-6 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">Real-Time Updates</h3>
                <p class="text-sm text-secondary-500">Fetch articles from today, this week, this month, or any custom range.</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="mt-16 space-y-6">
        <div class="text-center">
          <h2 class="text-2xl sm:text-3xl font-bold mb-2">News Categories</h2>
          <p class="text-secondary-500">Filter by topics that matter to you</p>
        </div>

        <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
          <UBadge
            v-for="cat in categoryList"
            :key="cat.id"
            :color="cat.color"
            variant="subtle"
            size="lg"
            :ui="{ rounded: 'rounded-full' }"
          >
            {{ cat.name }}
          </UBadge>
        </div>
      </section>

      <!-- Footer -->
      <footer class="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-secondary-500">
        <p>Built with Nuxt 4, Vue 3, and Google Gemini AI</p>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
const categoryList = [
  { id: 'politics', name: 'Politics', color: 'error' },
  { id: 'business', name: 'Business', color: 'primary' },
  { id: 'technology', name: 'Technology', color: 'info' },
  { id: 'culture', name: 'Culture', color: 'warning' },
  { id: 'sports', name: 'Sports', color: 'success' },
  { id: 'other', name: 'Other', color: 'neutral' },
];
</script>
