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

type Variant = "solid" | "outline" | "ghost" | "soft";
type Tone = "primary" | "secondary" | "success" | "error" | "gray";

const BASE =
  "u-button rounded-(--shape-button) inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:-translate-y-px active:translate-y-0";

// Corner shape comes from the season's --shape-button token, not the size.
const SIZES: Record<NonNullable<typeof props.size>, string> = {
  xs: "px-2 py-1 text-xs gap-1",
  sm: "px-3 py-1.5 text-xs sm:text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

const SOLID_SHADOW = "shadow-sm hover:shadow-md";

// Full literal class strings (not built from `${color}` fragments) so
// Tailwind's source scanner can see every utility.
const VARIANTS: Record<Variant, Record<Tone, string>> = {
  solid: {
    primary: `bg-primary-500 hover:bg-primary-600 text-on-primary ${SOLID_SHADOW}`,
    secondary: `bg-secondary-500 hover:bg-secondary-600 text-on-secondary ${SOLID_SHADOW}`,
    success: `bg-success-500 hover:bg-success-600 text-on-success ${SOLID_SHADOW}`,
    error: `bg-error-500 hover:bg-error-600 text-on-error ${SOLID_SHADOW}`,
    gray: `bg-stone-800 dark:bg-stone-200 hover:bg-stone-900 dark:hover:bg-white text-white dark:text-stone-950 ${SOLID_SHADOW}`,
  },
  outline: {
    primary:
      "border border-primary-500 text-primary-500 hover:bg-primary-500/10",
    secondary:
      "border border-secondary-500 text-secondary-500 hover:bg-secondary-500/10",
    success:
      "border border-success-500 text-success-500 hover:bg-success-500/10",
    error: "border border-error-500 text-error-500 hover:bg-error-500/10",
    gray: "border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900/50",
  },
  ghost: {
    primary: "text-primary-500 hover:bg-primary-500/10",
    secondary: "text-secondary-500 hover:bg-secondary-500/10",
    success: "text-success-500 hover:bg-success-500/10",
    error: "text-error-500 hover:bg-error-500/10",
    gray: "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900/50",
  },
  soft: {
    primary:
      "bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-500/20",
    secondary:
      "bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-500/20",
    success:
      "bg-success-500/10 text-success-600 dark:text-success-400 hover:bg-success-500/20",
    error:
      "bg-error-500/10 text-error-600 dark:text-error-400 hover:bg-error-500/20",
    gray: "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700/60",
  },
};

const computedClasses = computed(() => {
  // Unknown colors fall back to the neutral "gray" tone.
  const tone = (props.color in VARIANTS.solid ? props.color : "gray") as Tone;
  return [
    BASE,
    props.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
    props.block ? "w-full" : "",
    SIZES[props.size] ?? SIZES.sm,
    VARIANTS[props.variant]?.[tone] ?? "",
  ].join(" ");
});
</script>
