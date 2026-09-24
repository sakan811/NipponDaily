<template>
  <div
    class="omamori"
    :class="[`omamori--${size}`, { 'omamori--idle': idle }]"
    :style="index !== undefined ? { '--charm-i': index } : undefined"
    @mouseenter="swing"
    @focusin="swing"
  >
    <div
      class="omamori__swing"
      :class="{ 'is-swinging': swinging }"
      @animationend.self="swinging = false"
    >
      <!-- Hanging loop + agemaki knot, drawn in the season's cord colour -->
      <svg class="omamori__cord" viewBox="0 0 24 30" aria-hidden="true">
        <path
          d="M12 17C4.5 13 4.5 2 12 2s7.5 11 0 15"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
        />
        <path d="M12 14.5l-4.5 5 4.5 4.5 4.5-4.5z" fill="currentColor" />
        <path
          d="M10.5 23l-1.5 6.5M13.5 23l1.5 6.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
      <div class="omamori__pouch">
        <div class="omamori__face">
          <span v-if="mark" class="omamori__mark" aria-hidden="true">{{
            mark
          }}</span>
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// An omamori (御守) — specifically the 学業守 academic-success charm students
// carry into exams. The brocade, cord colour and weave pattern all come from
// the season's --charm-* tokens (see "Education charms" in tailwind.css), so
// the charm re-dresses itself with the rest of the theme.
withDefaults(
  defineProps<{
    /** Faint embroidered kanji in the charm's corner, e.g. 学 or 守. */
    mark?: string;
    size?: "sm" | "md" | "lg";
    /** Stagger slot for the hang-in entrance animation. */
    index?: number;
    /** Sway continuously (for a lone, featured charm) instead of on hover. */
    idle?: boolean;
  }>(),
  { mark: undefined, size: "md", index: undefined, idle: false },
);

// Hover/focus plays one damped swing; the class is dropped on animationend
// so the next hover can replay it (and leaving mid-swing doesn't snap).
const swinging = ref(false);
function swing(): void {
  swinging.value = true;
}

defineOptions({ name: "OmamoriCharm" });
</script>
