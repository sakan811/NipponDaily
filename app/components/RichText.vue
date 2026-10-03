<template>
  <span
    ><template v-for="(part, i) in parts" :key="i"
      ><a
        v-if="part.href"
        :href="part.href"
        target="_blank"
        rel="noopener"
        class="underline hover:text-primary-500"
        >{{ part.text }}</a
      ><code v-else-if="part.code">{{ part.text }}</code
      ><template v-else>{{ part.text }}</template></template
    ></span
  >
</template>

<script setup lang="ts">
import { computed } from "vue";

/**
 * Renders the "markdown-light" strings kept in `shared/sources.ts` and
 * `shared/endpoints.ts`: `[text](url)` links and `code` spans, nothing else.
 * Those strings are the single source, and the docs table cells use the same
 * form so a command or path in them is still set as code.
 */
const props = defineProps<{ text: string }>();

interface Part {
  text: string;
  href?: string;
  code?: boolean;
}

const parts = computed<Part[]>(() => {
  const out: Part[] = [];
  const token = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g;
  let last = 0;
  for (const m of props.text.matchAll(token)) {
    if (m.index > last) out.push({ text: props.text.slice(last, m.index) });
    if (m[3] !== undefined) out.push({ text: m[3], code: true });
    else out.push({ text: m[1]!, href: m[2]! });
    last = m.index + m[0].length;
  }
  if (last < props.text.length) out.push({ text: props.text.slice(last) });
  return out;
});
</script>
