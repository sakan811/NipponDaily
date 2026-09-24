<template>
  <div class="seasonal-effects" aria-hidden="true">
    <span
      v-for="particle in sakuraParticles"
      :key="`sakura-${particle.id}`"
      class="seasonal-particle seasonal-particle--sakura"
      :style="particle.style"
      >🌸</span
    >
    <span
      v-for="particle in summerParticles"
      :key="`summer-${particle.id}`"
      class="seasonal-particle seasonal-particle--summer"
      :style="particle.style"
    />
    <span
      v-for="particle in autumnParticles"
      :key="`autumn-${particle.id}`"
      class="seasonal-particle seasonal-particle--autumn"
      :style="particle.style"
    />
    <span
      v-for="particle in winterParticles"
      :key="`winter-${particle.id}`"
      class="seasonal-particle seasonal-particle--winter"
      :style="particle.style"
    />
    <span class="seasonal-corner-glyph" />
  </div>
</template>

<script setup lang="ts">
/**
 * Purely decorative, season-matched ambient graphic layered over every
 * page: falling sakura petals (spring); rising bubbles by day / blinking
 * fireflies by night plus a furin/hanabi corner glyph (summer); falling
 * momiji (day) / susuki (night) plus a leaf/tsukimi-moon corner glyph
 * (autumn); falling snow (winter). Only sakura's particles carry text —
 * every other group renders empty spans whose look (emoji via CSS
 * `content`, or pure CSS dots) is set in app/assets/css/tailwind.css,
 * keyed off [data-season] and .dark, so light/dark mode can swap them
 * without any JS theme-branching or hydration mismatch.
 *
 * Per-particle placement is a fixed function of its index rather than
 * Math.random(), so server and client render byte-identical inline styles.
 */

const PARTICLE_COUNT = 18;

interface Particle {
  id: number;
  style: Record<string, string>;
}

/**
 * Three fixed "depth" layers (far/mid/near) give the effect parallax-like
 * variety — smaller, dimmer, blurrier, slower particles read as further
 * away, so the layer doesn't look like one repeating sprite. Layer is a
 * pure function of index, so server/client output stays byte-identical.
 */
const DEPTH_LAYERS = [
  { scale: 0.7, opacity: 0.45, opacityEnd: 0.3, blur: 1.2, durationBoost: 6 },
  { scale: 0.9, opacity: 0.65, opacityEnd: 0.45, blur: 0.4, durationBoost: 2 },
  { scale: 1.15, opacity: 0.9, opacityEnd: 0.65, blur: 0, durationBoost: 0 },
];

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const left = (i * 37) % 100;
    const delay = ((i * 1.7) % 12).toFixed(1);
    const duration = (9 + ((i * 2.3) % 7)).toFixed(1);
    const driftSign = i % 2 === 0 ? 1 : -1;
    const drift = driftSign * (50 + ((i * 13) % 70));
    const size = 14 + ((i * 5) % 10);
    const layer = DEPTH_LAYERS[i % DEPTH_LAYERS.length];

    return {
      id: i,
      style: {
        left: `${left}%`,
        fontSize: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${(Number(duration) + layer.durationBoost).toFixed(1)}s`,
        "--seasonal-drift": `${drift}px`,
        "--seasonal-scale": `${layer.scale}`,
        "--seasonal-opacity": `${layer.opacity}`,
        "--seasonal-opacity-end": `${layer.opacityEnd}`,
        "--seasonal-blur": `${layer.blur}px`,
      },
    };
  });
}

const sakuraParticles = buildParticles(PARTICLE_COUNT);
const summerParticles = buildParticles(PARTICLE_COUNT);
const autumnParticles = buildParticles(PARTICLE_COUNT);
const winterParticles = buildParticles(PARTICLE_COUNT);
</script>
