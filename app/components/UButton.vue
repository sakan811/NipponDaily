<template>
  <NuxtLink v-if="to" :to="to" :class="computedClasses">
    <UIcon v-if="icon && !trailing" :name="icon" class="w-4 h-4 shrink-0" />
    <span v-if="label">{{ label }}</span>
    <slot />
    <UIcon v-if="icon && trailing" :name="icon" class="w-4 h-4 shrink-0" />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="disabled"
    :class="computedClasses"
    @click="handleClick"
  >
    <UIcon v-if="icon && !trailing" :name="icon" class="w-4 h-4 shrink-0" />
    <span v-if="label">{{ label }}</span>
    <slot />
    <UIcon v-if="icon && trailing" :name="icon" class="w-4 h-4 shrink-0" />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    to?: string;
    color?: "primary" | "secondary" | "success" | "error" | "gray" | string;
    size?: "xs" | "sm" | "md" | "lg";
    icon?: string;
    trailing?: boolean;
    variant?: "solid" | "outline" | "ghost" | "soft";
    disabled?: boolean;
    block?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    label: undefined,
    to: undefined,
    color: "primary",
    size: "sm",
    icon: undefined,
    variant: "solid",
    trailing: false,
    disabled: false,
    block: false,
    type: "button",
  },
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit("click", event);
  }
};

const computedClasses = computed(() => {
  const base =
    "u-button inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500";
  const disabledStyles = props.disabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "active:scale-[0.98]";
  const width = props.block ? "w-full" : "";

  // Size styles
  const sizes = {
    xs: "px-2 py-1 text-xs rounded-md gap-1",
    sm: "px-3 py-1.5 text-xs sm:text-sm rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-lg gap-2",
    lg: "px-5 py-2.5 text-base rounded-xl gap-2",
  };
  const sizeStyle = sizes[props.size] || sizes.sm;

  // Color & Variant styles
  let colorVariantStyle = "";
  const variant = props.variant;
  const color = props.color;

  if (variant === "solid") {
    if (color === "primary") {
      colorVariantStyle =
        "bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-500/10";
    } else if (color === "secondary") {
      colorVariantStyle =
        "bg-secondary-500 hover:bg-secondary-600 text-white shadow-sm shadow-secondary-500/10";
    } else if (color === "success") {
      colorVariantStyle =
        "bg-success-500 hover:bg-success-600 text-white shadow-sm shadow-success-500/10";
    } else if (color === "error") {
      colorVariantStyle =
        "bg-error-500 hover:bg-error-600 text-white shadow-sm shadow-error-500/10";
    } else {
      // gray/default
      colorVariantStyle =
        "bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-white text-white dark:text-stone-950";
    }
  } else if (variant === "outline") {
    if (color === "primary") {
      colorVariantStyle =
        "border border-primary-500 text-primary-500 hover:bg-primary-500/10";
    } else if (color === "secondary") {
      colorVariantStyle =
        "border border-secondary-500 text-secondary-500 hover:bg-secondary-500/10";
    } else if (color === "success") {
      colorVariantStyle =
        "border border-success-500 text-success-500 hover:bg-success-500/10";
    } else if (color === "error") {
      colorVariantStyle =
        "border border-error-500 text-error-500 hover:bg-error-500/10";
    } else {
      colorVariantStyle =
        "border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900/50";
    }
  } else if (variant === "ghost") {
    if (color === "primary") {
      colorVariantStyle = "text-primary-500 hover:bg-primary-500/10";
    } else if (color === "secondary") {
      colorVariantStyle = "text-secondary-500 hover:bg-secondary-500/10";
    } else if (color === "success") {
      colorVariantStyle = "text-success-500 hover:bg-success-500/10";
    } else if (color === "error") {
      colorVariantStyle = "text-error-500 hover:bg-error-500/10";
    } else {
      colorVariantStyle =
        "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900/50";
    }
  } else if (variant === "soft") {
    if (color === "primary") {
      colorVariantStyle =
        "bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20";
    } else if (color === "secondary") {
      colorVariantStyle =
        "bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-500/20";
    } else if (color === "success") {
      colorVariantStyle =
        "bg-success-500/10 text-success-600 dark:text-success-400 hover:bg-success-500/20";
    } else if (color === "error") {
      colorVariantStyle =
        "bg-error-500/10 text-error-600 dark:text-error-400 hover:bg-error-500/20";
    } else {
      colorVariantStyle =
        "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700/60";
    }
  }

  return [base, disabledStyles, width, sizeStyle, colorVariantStyle].join(" ");
});
</script>
