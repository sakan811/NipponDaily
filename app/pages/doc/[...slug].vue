<template>
  <main class="max-w-4xl mx-auto py-8 px-4 prose dark:prose-invert max-w-none">
    <ContentDoc />
  </main>
</template>

<style>
/* Basic markdown styling for standard elements */
h1 {
  @apply text-3xl font-bold mb-6 text-primary;
}
h2 {
  @apply text-2xl font-semibold mb-4 text-primary;
}
p {
  @apply mb-4 text-gray-700 dark:text-gray-300;
}
ul {
  @apply list-disc list-inside mb-4;
}
li {
  @apply mb-2;
}
strong {
  @apply font-bold text-gray-900 dark:text-gray-100;
}
pre {
  @apply bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto;
}
code {
  @apply font-mono text-sm;
}
</style>
