<template>
  <div
    class="ema"
    :class="{ 'ema--shake': shake }"
    :style="index !== undefined ? { '--charm-i': index } : undefined"
    @mouseenter="swing"
    @focusin="swing"
  >
    <div
      class="ema__swing"
      :class="{ 'is-swinging': swinging }"
      @animationend.self="swinging = false"
    >
      <!-- Cord from the shrine rail down to the plaque's hanging hole -->
      <svg class="ema__cord" viewBox="0 0 40 22" aria-hidden="true">
        <path
          d="M6 21L20 2l14 19"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linejoin="round"
        />
        <circle cx="20" cy="3" r="2.6" fill="currentColor" />
      </svg>
      <div class="ema__board">
        <div class="ema__content">
          <slot />
        </div>
      </div>
      <slot name="stamp" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// An ema (絵馬) — the wooden prayer plaque students hang at Tenmangu shrines
// (dedicated to Tenjin, the kami of learning) asking to pass their exams.
// Roof paint, cord and grain follow the season's --ema-*/--charm-* tokens.
withDefaults(
  defineProps<{
    /** Stagger slot for the hang-in entrance animation. */
    index?: number;
    /** Rattle on its cord — used for a wrong answer in the daily game. */
    shake?: boolean;
  }>(),
  { index: undefined, shake: false },
);

const swinging = ref(false);
function swing(): void {
  swinging.value = true;
}

defineOptions({ name: "EmaPlaque" });
</script>
