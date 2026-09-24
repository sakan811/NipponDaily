<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    color?:
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "error"
      | "gray"
      | string;
    variant?: "solid" | "outline" | "soft";
    size?: "xs" | "sm" | "md" | "lg";
  }>(),
  {
    color: "primary",
    variant: "solid",
    size: "sm",
  },
);

type Variant = "solid" | "outline" | "soft";
type Tone = "primary" | "secondary" | "success" | "warning" | "error" | "gray";

// Corner shape comes from the season's --shape-badge token (winter also
// clips it to a hexagon — see .u-badge in tailwind.css).
const BASE =
  "u-badge inline-flex items-center font-semibold uppercase tracking-wide rounded-(--shape-badge) select-none";

const SIZES: Record<NonNullable<typeof props.size>, string> = {
  xs: "px-1.5 py-0.5 text-[9px] sm:text-[10px]",
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-xs sm:text-sm",
  lg: "px-3 py-1 text-sm",
};

const GRAY_SOLID =
  "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-950";

// Full literal class strings so Tailwind's source scanner sees every
// utility. There is no --on-warning token (warning is never a solid fill),
// so solid warning falls back to the neutral tone.
const VARIANTS: Record<Variant, Record<Tone, string>> = {
  soft: {
    primary:
      "bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20",
    secondary:
      "bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 border border-secondary-500/20",
    success:
      "bg-success-500/10 text-success-600 dark:text-success-400 border border-success-500/20",
    warning:
      "bg-warning-500/10 text-warning-600 dark:text-warning-400 border border-warning-500/20",
    error:
      "bg-error-500/10 text-error-600 dark:text-error-400 border border-error-500/20",
    gray: "bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20",
  },
  outline: {
    primary: "border border-primary-500/50 text-primary-500",
    secondary: "border border-secondary-500/50 text-secondary-500",
    success: "border border-success-500/50 text-success-500",
    warning: "border border-warning-500/50 text-warning-500",
    error: "border border-error-500/50 text-error-500",
    gray: "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400",
  },
  solid: {
    primary: "bg-primary-500 text-on-primary",
    secondary: "bg-secondary-500 text-on-secondary",
    success: "bg-success-500 text-on-success",
    warning: GRAY_SOLID,
    error: "bg-error-500 text-on-error",
    gray: GRAY_SOLID,
  },
};

const badgeClasses = computed(() => {
  // Unknown colors (e.g. "green" on the docs pages) use the neutral tone.
  const tone = (props.color in VARIANTS.soft ? props.color : "gray") as Tone;
  return [
    BASE,
    SIZES[props.size] ?? SIZES.sm,
    (VARIANTS[props.variant] ?? VARIANTS.solid)[tone],
  ].join(" ");
});
</script>
