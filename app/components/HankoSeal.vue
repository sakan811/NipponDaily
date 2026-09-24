<template>
  <span class="hanko" role="img" :aria-label="label">
    <span class="hanko__text" aria-hidden="true">
      <span v-for="(char, i) in Array.from(text)" :key="i">{{ char }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
// A vermilion hanko (判子) seal that thumps down onto an ema/charm — 合格
// ("passed") for a correct answer, the stamp every exam-taker hopes for.
withDefaults(defineProps<{ text?: string; label?: string }>(), {
  text: "合格",
  label: "Passed",
});

defineOptions({ name: "HankoSeal" });
</script>
