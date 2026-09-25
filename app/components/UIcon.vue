<!-- eslint-disable vue/no-v-html -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="isSolid ? '0 0 20 20' : '0 0 24 24'"
    :fill="isSolid ? 'currentColor' : 'none'"
    :stroke="isSolid ? 'none' : 'currentColor'"
    :stroke-width="isSolid ? undefined : '2'"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="['u-icon inline-block select-none shrink-0', $attrs.class]"
    v-html="iconSvg"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FALLBACK_ICON, ICON_PATHS } from "../data/icons";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  name: string;
}>();

const isSolid = computed(
  () => props.name.includes("-solid") || props.name.endsWith("-20-solid"),
);

const iconSvg = computed(() => {
  const name = props.name.replace(/^i-/, "").replace(/^[a-z]+-/, ""); // strip prefixes like i-heroicons- or i-lucide-
  const key = name.toLowerCase();
  return ICON_PATHS[key] ?? FALLBACK_ICON;
});
</script>
