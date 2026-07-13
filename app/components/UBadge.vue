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

const badgeClasses = computed(() => {
  const base =
    "u-badge inline-flex items-center font-medium rounded-full select-none";

  // Sizes
  const sizes = {
    xs: "px-1.5 py-0.5 text-[9px] sm:text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs sm:text-sm",
    lg: "px-3 py-1 text-sm",
  };
  const sizeStyle = sizes[props.size] || sizes.sm;

  // Variants & Colors
  let colorVariantStyle = "";
  const variant = props.variant;
  const color = props.color;

  if (variant === "soft") {
    if (color === "primary") {
      colorVariantStyle =
        "bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20";
    } else if (color === "secondary") {
      colorVariantStyle =
        "bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 border border-secondary-500/20";
    } else if (color === "success") {
      colorVariantStyle =
        "bg-success-500/10 text-success-600 dark:text-success-400 border border-success-500/20";
    } else if (color === "warning") {
      colorVariantStyle =
        "bg-warning-500/10 text-warning-600 dark:text-warning-400 border border-warning-500/20";
    } else if (color === "error") {
      colorVariantStyle =
        "bg-error-500/10 text-error-600 dark:text-error-400 border border-error-500/20";
    } else {
      colorVariantStyle =
        "bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20";
    }
  } else if (variant === "outline") {
    if (color === "primary") {
      colorVariantStyle = "border border-primary-500/50 text-primary-500";
    } else if (color === "secondary") {
      colorVariantStyle = "border border-secondary-500/50 text-secondary-500";
    } else if (color === "success") {
      colorVariantStyle = "border border-success-500/50 text-success-500";
    } else if (color === "error") {
      colorVariantStyle = "border border-error-500/50 text-error-500";
    } else {
      colorVariantStyle =
        "border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400";
    }
  } else {
    // solid
    if (color === "primary") {
      colorVariantStyle = "bg-primary-500 text-white";
    } else if (color === "secondary") {
      colorVariantStyle = "bg-secondary-500 text-white";
    } else if (color === "success") {
      colorVariantStyle = "bg-success-500 text-white";
    } else if (color === "error") {
      colorVariantStyle = "bg-error-500 text-white";
    } else {
      colorVariantStyle =
        "bg-stone-850 dark:bg-stone-150 text-white dark:text-stone-950";
    }
  }

  return [base, sizeStyle, colorVariantStyle].join(" ");
});
</script>
